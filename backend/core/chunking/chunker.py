from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    text: str
    page: Optional[int] = None


def _approx_tokens(text: str) -> list[str]:
    # Simple approximation; avoids extra deps.
    return [t for t in (text or "").split() if t]


def chunk_text(
    text: str,
    *,
    page: Optional[int] = None,
    min_tokens: int = 400,
    max_tokens: int = 600,
    overlap: int = 100,
) -> list[Chunk]:
    toks = _approx_tokens(text)
    if not toks:
        return []

    window = max_tokens
    step = max(1, window - overlap)
    out: list[Chunk] = []

    for start in range(0, len(toks), step):
        end = min(len(toks), start + window)
        if end - start < min_tokens and start != 0:
            break
        chunk_tokens = toks[start:end]
        chunk_text_str = " ".join(chunk_tokens).strip()
        if not chunk_text_str:
            continue

        cid = hashlib.sha256(f"{page}:{start}:{end}:{chunk_text_str[:64]}".encode("utf-8")).hexdigest()[:24]
        out.append(Chunk(chunk_id=cid, text=chunk_text_str, page=page))

        if end >= len(toks):
            break

    return out

