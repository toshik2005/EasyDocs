from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass
from typing import Any, Optional

import requests

from backend.config import get_settings

logger = logging.getLogger(__name__)


class LLMError(RuntimeError):
    pass


@dataclass
class ProviderState:
    failures: int = 0
    disabled_until_ts: float = 0.0


_STATE: dict[str, ProviderState] = {
    "groq": ProviderState(),
    "openrouter": ProviderState(),
    "local": ProviderState(),
}


def _is_retryable(status_code: Optional[int], exc: Optional[Exception]) -> bool:
    if exc is not None:
        return True
    if status_code in (408, 409, 425, 429, 500, 502, 503, 504):
        return True
    return False


def _backoff_sleep(attempt: int) -> None:
    # 0.5s, 1s, 2s, 4s ...
    time.sleep(min(8.0, 0.5 * (2 ** max(0, attempt - 1))))


def _note_failure(provider: str) -> None:
    st = _STATE[provider]
    st.failures += 1
    if st.failures >= 5:
        st.disabled_until_ts = time.time() + 120.0
        logger.warning("LLM provider disabled (circuit breaker)", extra={"provider": provider})


def _note_success(provider: str) -> None:
    st = _STATE[provider]
    st.failures = 0
    st.disabled_until_ts = 0.0


def _provider_available(provider: str) -> bool:
    return time.time() >= _STATE[provider].disabled_until_ts


def _call_groq(prompt: str) -> str:
    settings = get_settings()
    if not settings.groq_api_key:
        raise LLMError("GROQ_API_KEY not configured")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
    }
    resp = requests.post(url, headers=headers, data=json.dumps(body), timeout=settings.request_timeout_s)
    if resp.status_code >= 400:
        raise LLMError(f"Groq error {resp.status_code}: {resp.text[:500]}")
    data: dict[str, Any] = resp.json()
    return (data.get("choices", [{}])[0].get("message", {}) or {}).get("content") or ""


def _call_openrouter(prompt: str) -> str:
    settings = get_settings()
    if not settings.openrouter_api_key:
        raise LLMError("OPENROUTER_API_KEY not configured")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
    }
    resp = requests.post(url, headers=headers, data=json.dumps(body), timeout=settings.request_timeout_s)
    if resp.status_code >= 400:
        raise LLMError(f"OpenRouter error {resp.status_code}: {resp.text[:500]}")
    data: dict[str, Any] = resp.json()
    return (data.get("choices", [{}])[0].get("message", {}) or {}).get("content") or ""


def _call_local(prompt: str) -> str:
    # Minimal local fallback: concise extraction-style response
    prompt = (prompt or "").strip()
    if not prompt:
        return ""
    if len(prompt) > 1200:
        prompt = prompt[:1200]
    return (
        "Local fallback (no external LLM configured). "
        "I can’t produce a high-quality generative answer without an LLM key. "
        "Relevant context was provided in the prompt.\n\n"
        f"Prompt excerpt:\n{prompt}"
    )


def generate_text(prompt: str) -> tuple[str, str]:
    """
    Provider priority:
      1) Groq
      2) OpenRouter
      3) Local
    Retries with exponential backoff and basic circuit breaker.
    """
    providers = ["groq", "openrouter", "local"]
    last_err: Optional[Exception] = None

    for provider in providers:
        if not _provider_available(provider):
            continue

        for attempt in range(1, 4):
            try:
                if provider == "groq":
                    text = _call_groq(prompt)
                elif provider == "openrouter":
                    text = _call_openrouter(prompt)
                else:
                    text = _call_local(prompt)

                if not isinstance(text, str) or not text.strip():
                    raise LLMError("Invalid/empty LLM response")

                _note_success(provider)
                return text.strip(), provider
            except Exception as e:
                last_err = e
                status_code = getattr(getattr(e, "response", None), "status_code", None)
                retryable = _is_retryable(status_code, e)
                _note_failure(provider)
                logger.warning(
                    "LLM provider call failed",
                    extra={"provider": provider, "attempt": attempt, "retryable": retryable, "err": str(e)[:300]},
                )
                if not retryable:
                    break
                _backoff_sleep(attempt)

    raise LLMError(f"All LLM providers failed: {last_err}")

