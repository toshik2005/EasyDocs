from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional


QAType = Literal["cached", "precomputed"]


@dataclass(frozen=True)
class QAHit:
    qa_type: QAType
    question: str
    answer: str
    score: float
    source_id: str
    page: Optional[int] = None


@dataclass(frozen=True)
class AnswerResult:
    answer: str
    answer_source: Literal["cache", "precomputed", "summary", "llm"]
    provider_used: str
    sources: list[dict]
