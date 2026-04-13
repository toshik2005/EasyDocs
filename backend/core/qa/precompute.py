from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any

from backend.core.llm.router import generate_text

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class PrecomputeResult:
    summary_detailed: str
    key_points: list[str]
    qa_pairs: list[dict[str, str]]
    provider_used: str


def _prompt(input_text: str) -> str:
    return (
        "You are EasyDocs. Given the document content below, produce:\n"
        "1) A detailed, structured summary (multiple paragraphs; include key entities, dates, decisions).\n"
        "2) Key bullet points (5-12 items).\n"
        "3) A list of potential user questions and answers (8-15 pairs) that can be answered from the document.\n\n"
        "Return STRICT JSON only with this schema:\n"
        "{\n"
        '  "summary_detailed": "string",\n'
        '  "key_points": ["string", ...],\n'
        '  "precomputed_qa": [{"question": "string", "answer": "string"}, ...]\n'
        "}\n\n"
        "DOCUMENT:\n"
        f"{input_text}"
    )


def precompute_from_text(text: str) -> PrecomputeResult:
    # Keep bounded for latency/cost; upstream already chunks.
    bounded = (text or "").strip()
    if len(bounded) > 20000:
        bounded = bounded[:20000]

    raw, provider = generate_text(_prompt(bounded))
    raw = (raw or "").strip()

    # Best-effort JSON extraction (models sometimes wrap in ```json).
    start = raw.find("{")
    end = raw.rfind("}")
    payload = raw[start : end + 1] if start != -1 and end != -1 and end > start else raw

    try:
        data: dict[str, Any] = json.loads(payload)
    except Exception:
        logger.warning("Failed to parse precompute JSON; falling back", extra={"provider": provider})
        return PrecomputeResult(summary_detailed=raw, key_points=[], qa_pairs=[], provider_used=provider)

    summary = str(data.get("summary_detailed") or "").strip()
    key_points = [str(x).strip() for x in (data.get("key_points") or []) if str(x).strip()]
    qa_pairs_in = data.get("precomputed_qa") or []
    qa_pairs: list[dict[str, str]] = []
    for item in qa_pairs_in if isinstance(qa_pairs_in, list) else []:
        if not isinstance(item, dict):
            continue
        q = str(item.get("question") or "").strip()
        a = str(item.get("answer") or "").strip()
        if q and a:
            qa_pairs.append({"question": q, "answer": a})

    return PrecomputeResult(
        summary_detailed=summary or raw,
        key_points=key_points[:12],
        qa_pairs=qa_pairs[:20],
        provider_used=provider,
    )

