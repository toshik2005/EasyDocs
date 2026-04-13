from __future__ import annotations

import logging
import os
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.embedding.provider import embed_texts
from backend.core.llm.router import generate_text
from backend.core.security.sanitize import sanitize_user_text
from backend.core.vector_store.faiss_store import get_faiss_store
from backend.db.collections import Collections

logger = logging.getLogger(__name__)


def _faiss_candidate_pool_k(top_k: int) -> int:
    """How many global neighbors to pull from FAISS before filtering by doc_id."""
    try:
        v = int(os.getenv("RAG_FAISS_POOL_K", "0"))
        if v > 0:
            return v
    except ValueError:
        pass
    return max(200, top_k * 40)


def _build_prompt(question: str, chunks: list[dict[str, Any]]) -> str:
    ctx_parts: list[str] = []
    for c in chunks:
        page = c.get("page")
        prefix = f"[chunk={c.get('chunk_id')} page={page}]" if page is not None else f"[chunk={c.get('chunk_id')}]"
        ctx_parts.append(f"{prefix}\n{c.get('text','')}")

    context = "\n\n---\n\n".join(ctx_parts)
    return (
        "You are EasyDocs, a document Q&A assistant. "
        "Answer ONLY using the provided context. If the answer is not in the context, say you don't know.\n\n"
        f"QUESTION:\n{question}\n\n"
        f"CONTEXT:\n{context}"
    )


async def rag_chat(db: AsyncIOMotorDatabase, *, doc_id: str, question: str, top_k: int = 5) -> tuple[str, str, list[dict[str, Any]]]:
    question = sanitize_user_text(question, max_len=2000)
    if not question:
        return "Please provide a non-empty question.", "local", []

    q_vecs, embed_provider = embed_texts([question])
    q_vec = q_vecs[0]

    store = get_faiss_store("easydocs")
    pool_k = _faiss_candidate_pool_k(top_k)
    hits = store.search(q_vec, top_k=pool_k)
    if not hits:
        # If the FAISS index was recreated (e.g., embedding dim changed), we may have chunks
        # in Mongo but not in FAISS. Best-effort reindex for this document.
        try:
            coll = db[Collections().chunks]
            existing = await coll.find({"doc_id": doc_id}).to_list(length=5000)
            if existing:
                texts = [c.get("text", "") for c in existing if c.get("text")]
                ids = [int(c.get("embedding_id")) for c in existing if c.get("embedding_id") is not None]
                if texts and ids and len(texts) == len(ids):
                    vecs, _prov = embed_texts(texts)
                    store.add(vecs, ids)
                    hits = store.search(q_vec, top_k=pool_k)
        except Exception:
            logger.warning("Reindex attempt failed", extra={"doc_id": doc_id})
        if not hits:
            return "No indexed chunks found for this document yet.", "local", []

    # Global index contains all docs; top neighbors may belong to other documents.
    score_by_id: dict[int, float] = {}
    for h in hits:
        eid = int(h.embedding_id)
        sc = float(h.score or 0.0)
        if eid not in score_by_id or sc > score_by_id[eid]:
            score_by_id[eid] = sc
    emb_ids = list(score_by_id.keys())

    coll = db[Collections().chunks]
    cursor = coll.find({"doc_id": doc_id, "embedding_id": {"$in": emb_ids}}, {"_id": 0})
    matched = await cursor.to_list(length=len(emb_ids))
    matched.sort(
        key=lambda c: score_by_id.get(int(c.get("embedding_id", 0)), float("-inf")),
        reverse=True,
    )
    found = matched[:top_k]

    if not found:
        # Document has chunks but none landed in the global top-K neighbors (rare after large pool).
        if await coll.find_one({"doc_id": doc_id}, {"_id": 1}):
            fallback = (
                await coll.find({"doc_id": doc_id}, {"_id": 0})
                .sort([("page", 1), ("chunk_id", 1)])
                .to_list(length=max(top_k, 12))
            )
            found = fallback[: max(top_k, 8)]
            logger.info(
                "RAG fell back to in-doc chunk window (no FAISS hits for this doc in pool)",
                extra={"doc_id": doc_id, "pool_k": pool_k, "used": len(found)},
            )
        else:
            return "No relevant chunks found for this document.", "local", []

    prompt = _build_prompt(question, found)
    answer, llm_provider = generate_text(prompt)
    return answer, llm_provider, found

