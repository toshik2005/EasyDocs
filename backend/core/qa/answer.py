from __future__ import annotations

import logging
from typing import Any, Optional

import numpy as np
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.embedding.provider import embed_texts
from backend.core.qa.indexing import index_cached_qa
from backend.core.qa.types import AnswerResult
from backend.core.rag.chat import rag_chat
from backend.core.security.sanitize import sanitize_user_text
from backend.core.vector_store.faiss_store import get_faiss_store
from backend.db.collections import Collections

logger = logging.getLogger(__name__)


def _wants_stored_document_summary(question: str) -> bool:
    q = question.lower()
    keys = (
        "summarize",
        "summary",
        "tl;dr",
        "tldr",
        "overview",
        "brief overview",
        "in short",
        "synopsis",
        "give me the gist",
        "main points",
    )
    return any(k in q for k in keys)


def _env_float(name: str, default: float) -> float:
    try:
        import os

        v = os.getenv(name)
        return float(v) if v is not None and str(v).strip() else default
    except Exception:
        return default


def _best_hit(hits: list, ids: list[int], scores: list[float]) -> tuple[Optional[int], float]:
    best_id: Optional[int] = None
    best_score = -1.0
    for emb_id, score in zip(ids, scores):
        if emb_id == -1:
            continue
        if score > best_score:
            best_score = float(score)
            best_id = int(emb_id)
    return best_id, best_score


async def _semantic_lookup(
    db: AsyncIOMotorDatabase,
    *,
    index_name: str,
    collection_name: str,
    doc_id: str,
    q_vec: np.ndarray,
    threshold: float,
    top_k: int = 10,
) -> tuple[Optional[dict[str, Any]], float]:
    store = get_faiss_store(index_name)
    hits = store.search(q_vec, top_k=top_k)
    if not hits:
        return None, 0.0
    # highest score first; pick the best embedding_id and fetch that exact record
    hits = sorted(hits, key=lambda h: h.score, reverse=True)
    best_emb_id = hits[0].embedding_id
    best_score = float(hits[0].score or 0.0)
    if best_score < threshold:
        return None, float(best_score)
    doc = await db[collection_name].find_one({"doc_id": doc_id, "embedding_id": int(best_emb_id)}, {"_id": 0})
    return doc, float(best_score or 0.0)


async def answer_question(
    db: AsyncIOMotorDatabase,
    *,
    doc_id: str,
    user_id: Optional[str],
    question: str,
    top_k: int = 5,
) -> AnswerResult:
    question = sanitize_user_text(question, max_len=2000)
    if not question:
        return AnswerResult(answer="Please provide a non-empty question.", answer_source="summary", provider_used="local", sources=[])

    cols = Collections()
    q_vecs, _emb_provider = embed_texts([question])
    q_vec = q_vecs[0]

    qa_threshold = _env_float("QA_CACHE_SIM_THRESHOLD", 0.90)
    summary_threshold = _env_float("SUMMARY_SIM_THRESHOLD", 0.82)

    # 1) Cached user Q&A (semantic match)
    cached_doc, score = await _semantic_lookup(
        db,
        index_name="qa_cached",
        collection_name=cols.qa_cached,
        doc_id=doc_id,
        q_vec=q_vec,
        threshold=qa_threshold,
        top_k=15,
    )
    if cached_doc and (user_id is None or cached_doc.get("user_id") in (None, user_id)):
        cached_answer = str(cached_doc.get("answer") or "").strip()
        # Do not serve cached transient pipeline errors; allow the pipeline to retry/reindex.
        transient_prefixes = (
            "No indexed chunks found",
            "No relevant chunks found",
            "Please provide a non-empty question",
        )
        if cached_answer and not cached_answer.startswith(transient_prefixes):
            return AnswerResult(
                answer=cached_answer,
                answer_source="cache",
                provider_used="cache",
                sources=[],
            )

    # 2) Precomputed Q&A (from upload)
    pre_doc, _score2 = await _semantic_lookup(
        db,
        index_name="qa_precomputed",
        collection_name=cols.qa_precomputed,
        doc_id=doc_id,
        q_vec=q_vec,
        threshold=qa_threshold - 0.03,
        top_k=15,
    )
    if pre_doc:
        return AnswerResult(
            answer=str(pre_doc.get("answer") or ""),
            answer_source="precomputed",
            provider_used=str(pre_doc.get("precompute_provider") or "precomputed"),
            sources=[],
        )

    # 3) Summary-based extraction
    seg_doc, _score3 = await _semantic_lookup(
        db,
        index_name="summary",
        collection_name=cols.summary_segments,
        doc_id=doc_id,
        q_vec=q_vec,
        threshold=summary_threshold,
        top_k=10,
    )
    if seg_doc:
        # Extractive: return the most relevant segment.
        text = str(seg_doc.get("text") or "").strip()
        if text:
            return AnswerResult(
                answer=text,
                answer_source="summary",
                provider_used="summary",
                sources=[],
            )

    # 3b) Broad "summarize this document" requests often miss segment similarity thresholds;
    # use full stored summary / key points from ingestion when available.
    if _wants_stored_document_summary(question):
        doc_row = await db[cols.documents].find_one(
            {"doc_id": doc_id},
            {"summary_detailed": 1, "summary": 1, "key_points": 1},
        )
        if doc_row:
            body = (doc_row.get("summary_detailed") or doc_row.get("summary") or "").strip()
            if body:
                return AnswerResult(
                    answer=body,
                    answer_source="summary",
                    provider_used="summary",
                    sources=[],
                )
            kps = doc_row.get("key_points") or []
            if isinstance(kps, list) and kps:
                bullets = "\n".join(f"- {str(x).strip()}" for x in kps[:20] if str(x).strip())
                if bullets:
                    return AnswerResult(
                        answer=bullets,
                        answer_source="summary",
                        provider_used="summary",
                        sources=[],
                    )

    # 4) External API call (RAG + LLM), then cache it
    answer, provider_used, chunks = await rag_chat(db, doc_id=doc_id, question=question, top_k=top_k)
    # Only cache if we got a real answer backed by retrieved chunks (avoid caching transient errors).
    if provider_used not in ("local", "") and chunks:
        try:
            await index_cached_qa(db, doc_id=doc_id, user_id=user_id, question=question, answer=answer)
        except Exception:
            logger.warning("Failed to cache Q&A", extra={"doc_id": doc_id})

    return AnswerResult(answer=answer, answer_source="llm", provider_used=provider_used, sources=chunks)

