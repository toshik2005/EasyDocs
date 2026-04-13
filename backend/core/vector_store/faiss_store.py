from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Iterable

import faiss
import numpy as np

from backend.config import FAISS_DIR, get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SearchHit:
    embedding_id: int
    score: float


class FaissStore:
    """
    Single global FAISS index for all documents.
    We store per-vector metadata in Mongo (`chunks` collection) keyed by `embedding_id`.
    """

    def __init__(self, index_path: Path):
        self._index_path = index_path
        self._lock = Lock()
        self._dim = get_settings().embedding_dim
        self._index = self._load_or_create()

    def _load_or_create(self) -> faiss.Index:
        if self._index_path.exists():
            idx = faiss.read_index(str(self._index_path))
            if idx.d != self._dim:
                logger.warning(
                    "FAISS dim mismatch; recreating index",
                    extra={"on_disk_dim": idx.d, "expected_dim": self._dim},
                )
                return faiss.IndexIDMap2(faiss.IndexFlatIP(self._dim))
            return idx
        return faiss.IndexIDMap2(faiss.IndexFlatIP(self._dim))

    def _persist(self) -> None:
        tmp = self._index_path.with_suffix(".tmp")
        faiss.write_index(self._index, str(tmp))
        tmp.replace(self._index_path)

    def add(self, vectors: np.ndarray, ids: Iterable[int]) -> None:
        vectors = np.asarray(vectors, dtype="float32")
        ids_arr = np.asarray(list(ids), dtype="int64")
        if vectors.ndim != 2 or vectors.shape[1] != self._dim:
            raise ValueError("Invalid vectors shape")
        if ids_arr.ndim != 1 or ids_arr.shape[0] != vectors.shape[0]:
            raise ValueError("Invalid ids")

        with self._lock:
            self._index.add_with_ids(vectors, ids_arr)
            self._persist()

    def search(self, query_vec: np.ndarray, top_k: int) -> list[SearchHit]:
        q = np.asarray(query_vec, dtype="float32")
        if q.ndim == 1:
            q = q.reshape(1, -1)
        if q.shape[1] != self._dim:
            raise ValueError("Query dim mismatch")

        with self._lock:
            scores, ids = self._index.search(q, top_k)
        out: list[SearchHit] = []
        for emb_id, score in zip(ids[0].tolist(), scores[0].tolist()):
            if emb_id == -1:
                continue
            out.append(SearchHit(embedding_id=int(emb_id), score=float(score)))
        return out


_STORE: FaissStore | None = None


_STORES: dict[str, FaissStore] = {}


def get_faiss_store(name: str = "easydocs") -> FaissStore:
    """
    Named FAISS indices to support multiple retrieval layers:
      - easydocs: document chunk vectors (RAG)
      - qa_cached: user Q&A cache question vectors
      - qa_precomputed: precomputed Q&A question vectors
      - summary: summary segment vectors (for summary-first extraction)
    """
    store = _STORES.get(name)
    if store is not None:
        return store
    FAISS_DIR.mkdir(parents=True, exist_ok=True)
    index_path = FAISS_DIR / f"{name}.index"
    store = FaissStore(index_path=index_path)
    _STORES[name] = store
    return store

