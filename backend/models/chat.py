from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    message: str
    top_k: int = 5


class SourceChunk(BaseModel):
    chunk_id: str
    page: Optional[int] = None
    text: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    provider_used: Optional[str] = None
    answer_source: Optional[Literal["cache", "precomputed", "summary", "llm"]] = None

