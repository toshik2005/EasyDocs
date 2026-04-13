from __future__ import annotations

import logging

from backend.core.llm.router import generate_text

logger = logging.getLogger(__name__)


def _map_prompt(text: str) -> str:
    return (
        "Summarize the following text in bullet points. "
        "Focus on key facts, entities, dates, and decisions.\n\n"
        f"TEXT:\n{text}"
    )


def _reduce_prompt(summaries: list[str]) -> str:
    joined = "\n\n".join(f"- {s.strip()}" for s in summaries if s and s.strip())
    return (
        "You are combining partial summaries into one final summary. "
        "Produce a concise executive summary and a short list of key points.\n\n"
        f"PARTIAL SUMMARIES:\n{joined}"
    )


def map_reduce_summarize(chunks: list[str]) -> tuple[str, str]:
    """
    Multi-provider summarization is handled inside `generate_text`:
      Groq -> OpenRouter -> Local.
    """
    if not chunks:
        return "", "local"

    partials: list[str] = []
    provider_used = "local"
    for c in chunks[:12]:
        txt, prov = generate_text(_map_prompt(c[:6000]))
        provider_used = prov
        partials.append(txt)

    final, prov = generate_text(_reduce_prompt(partials))
    provider_used = prov or provider_used
    return final, provider_used

