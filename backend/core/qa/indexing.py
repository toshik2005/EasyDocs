from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Iterable, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.embedding.provider import embed_texts
from backend.core.vector_store.faiss_store import get_faiss_store
from backend.db.collections import Collections


def _now() -> datetime:
    return datetime.utcnow()


def _stable_id(*parts: str) -> int:
    h = hashlib.sha256(":".join(parts).encode("utf-8")).digest()
    return int.from_bytes(h[:8], "little", signed=False) & ((1 << 63) - 1)


def qa_embedding_id(doc_id: str, qa_id: str) -> int:
    return _stable_id("qa", doc_id, qa_id)


def summary_embedding_id(doc_id: str, seg_id: str) -> int:
    return _stable_id("summary", doc_id, seg_id)


async def index_cached_qa(
    db: AsyncIOMotorDatabase,
    *,
    doc_id: str,
    user_id: Optional[str],
    question: str,
    answer: str,
) -> None:
    cols = Collections()
    qa_id = hashlib.sha256(f"{doc_id}:{user_id or ''}:{question}".encode("utf-8")).hexdigest()[:16]
    emb_id = qa_embedding_id(doc_id, qa_id)

    vecs, provider = embed_texts([question])
    get_faiss_store("qa_cached").add(vecs, [emb_id])

    await db[cols.qa_cached].update_one(
        {"doc_id": doc_id, "qa_id": qa_id},
        {
            "$set": {
                "doc_id": doc_id,
                "user_id": user_id,
                "qa_id": qa_id,
                "question": question,
                "answer": answer,
                "embedding_id": emb_id,
                "embedding_provider": provider,
                "created_at": _now(),
                "updated_at": _now(),
            }
        },
        upsert=True,
    )


async def index_precomputed_qa(
    db: AsyncIOMotorDatabase,
    *,
    doc_id: str,
    qa_pairs: list[dict[str, str]],
) -> None:
    cols = Collections()
    if not qa_pairs:
        return

    questions: list[str] = []
    docs: list[dict] = []
    ids: list[int] = []

    for i, pair in enumerate(qa_pairs):
        q = (pair.get("question") or "").strip()
        a = (pair.get("answer") or "").strip()
        if not q or not a:
            continue
        qa_id = f"pre_{i:03d}"
        emb_id = qa_embedding_id(doc_id, qa_id)
        questions.append(q)
        ids.append(emb_id)
        docs.append(
            {
                "doc_id": doc_id,
                "qa_id": qa_id,
                "question": q,
                "answer": a,
                "embedding_id": emb_id,
                "created_at": _now(),
            }
        )

    if not docs:
        return

    vecs, provider = embed_texts(questions)
    get_faiss_store("qa_precomputed").add(vecs, ids)
    for d in docs:
        d["embedding_provider"] = provider

    await db[cols.qa_precomputed].delete_many({"doc_id": doc_id})
    await db[cols.qa_precomputed].insert_many(docs)


async def index_summary_segments(
    db: AsyncIOMotorDatabase,
    *,
    doc_id: str,
    summary_text: str,
    max_segments: int = 12,
) -> None:
    cols = Collections()
    text = (summary_text or "").strip()
    if not text:
        return

    # Cheap segmentation: split by blank lines, then fall back to sentence-ish chunks.
    parts = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(parts) < 2:
        parts = [p.strip() for p in text.replace("\n", " ").split(". ") if p.strip()]

    parts = parts[:max_segments]
    if not parts:
        return

    seg_docs: list[dict] = []
    seg_ids: list[int] = []
    seg_texts: list[str] = []
    for i, seg in enumerate(parts):
        seg_id = f"seg_{i:03d}"
        emb_id = summary_embedding_id(doc_id, seg_id)
        seg_ids.append(emb_id)
        seg_texts.append(seg)
        seg_docs.append(
            {
                "doc_id": doc_id,
                "seg_id": seg_id,
                "text": seg,
                "embedding_id": emb_id,
                "created_at": _now(),
            }
        )

    vecs, provider = embed_texts(seg_texts)
    get_faiss_store("summary").add(vecs, seg_ids)
    for d in seg_docs:
        d["embedding_provider"] = provider

    await db[cols.summary_segments].delete_many({"doc_id": doc_id})
    await db[cols.summary_segments].insert_many(seg_docs)

