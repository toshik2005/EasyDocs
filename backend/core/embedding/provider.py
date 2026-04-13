from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from dataclasses import dataclass
from typing import Any, Optional

import numpy as np
import requests

from backend.config import get_settings

logger = logging.getLogger(__name__)


class EmbeddingError(RuntimeError):
    pass


@dataclass
class ProviderState:
    failures: int = 0
    disabled_until_ts: float = 0.0


_STATE: dict[str, ProviderState] = {
    "gemini": ProviderState(),
    "openai": ProviderState(),
    "local": ProviderState(),
}


def _backoff_sleep(attempt: int) -> None:
    time.sleep(min(8.0, 0.5 * (2 ** max(0, attempt - 1))))


def _note_failure(provider: str) -> None:
    st = _STATE[provider]
    st.failures += 1
    if st.failures >= 5:
        st.disabled_until_ts = time.time() + 120.0
        logger.warning("Embedding provider disabled (circuit breaker)", extra={"provider": provider})


def _note_success(provider: str) -> None:
    st = _STATE[provider]
    st.failures = 0
    st.disabled_until_ts = 0.0


def _provider_available(provider: str) -> bool:
    return time.time() >= _STATE[provider].disabled_until_ts


def _embed_local(texts: list[str], dim: int) -> np.ndarray:
    vecs: list[np.ndarray] = []
    for t in texts:
        h = hashlib.sha256(t.encode("utf-8", errors="ignore")).digest()
        seed = int.from_bytes(h[:8], "little", signed=False)
        rng = np.random.default_rng(seed)
        v = rng.normal(size=(dim,)).astype("float32")
        # normalize for cosine similarity
        v /= (np.linalg.norm(v) + 1e-8)
        vecs.append(v)
    return np.vstack(vecs).astype("float32")


def _embed_openai(texts: list[str]) -> np.ndarray:
    settings = get_settings()
    if not settings.openai_api_key:
        raise EmbeddingError("OPENAI_API_KEY not configured")

    url = "https://api.openai.com/v1/embeddings"
    headers = {"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"}
    body = {"model": os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small"), "input": texts}
    resp = requests.post(url, headers=headers, data=json.dumps(body), timeout=settings.request_timeout_s)
    if resp.status_code >= 400:
        raise EmbeddingError(f"OpenAI embedding error {resp.status_code}: {resp.text[:500]}")
    data: dict[str, Any] = resp.json()
    embeds = [row["embedding"] for row in data.get("data", [])]
    arr = np.asarray(embeds, dtype="float32")
    return arr


def _gemini_headers(settings) -> dict[str, str]:
    # Prefer header auth (documented); avoids query-string key issues.
    return {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.gemini_api_key or "",
    }


def _parse_gemini_embed_response(data: dict[str, Any]) -> list[float]:
    emb = data.get("embedding") or {}
    vec = emb.get("values")
    if isinstance(vec, list) and vec:
        return vec
    raise EmbeddingError("Gemini returned empty embedding")


def _embed_gemini(texts: list[str]) -> np.ndarray:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise EmbeddingError("GEMINI_API_KEY not configured")

    # Gemini REST: request body must include `model` (see Google AI embed docs).
    # Note: `text-embedding-004` may not be available for `embedContent` on v1beta; `gemini-embedding-001` is the current documented default.
    model = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001").strip()
    if model.startswith("models/"):
        model = model.split("/", 1)[1]
    model_resource = f"models/{model}"
    headers = _gemini_headers(settings)
    out_dim = int(settings.embedding_dim)

    # Batch when possible: one HTTP call reduces rate-limit failures vs per-text loops.
    if len(texts) > 1:
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_resource}:batchEmbedContents"
        body: dict[str, Any] = {
            "requests": [
                {
                    "model": model_resource,
                    "content": {"parts": [{"text": t}]},
                    **({"outputDimensionality": out_dim} if out_dim > 0 else {}),
                }
                for t in texts
            ]
        }

        resp = requests.post(url, data=json.dumps(body), headers=headers, timeout=settings.request_timeout_s)
        if resp.status_code >= 400:
            # Some projects/models may reject batch; fall back to sequential embedContent calls.
            logger.warning(
                "Gemini batchEmbedContents failed; retrying per-text embedContent",
                extra={"status": resp.status_code, "detail": resp.text[:300]},
            )
            out_seq: list[list[float]] = []
            for t in texts:
                out_seq.append(_embed_gemini_single(settings, model_resource, headers, t))
            return np.asarray(out_seq, dtype="float32")
        payload: dict[str, Any] = resp.json()
        embs = payload.get("embeddings") or []
        if not isinstance(embs, list) or len(embs) != len(texts):
            raise EmbeddingError(f"Gemini batch embedding shape mismatch: {resp.text[:500]}")
        out: list[list[float]] = []
        for item in embs:
            vec = (item or {}).get("values")
            if not isinstance(vec, list) or not vec:
                raise EmbeddingError("Gemini returned empty embedding in batch")
            out.append(vec)
        return np.asarray(out, dtype="float32")

    vec0 = _embed_gemini_single(settings, model_resource, headers, texts[0])
    return np.asarray([vec0], dtype="float32")


def _embed_gemini_single(settings, model_resource: str, headers: dict[str, str], text: str) -> list[float]:
    url = f"https://generativelanguage.googleapis.com/v1beta/{model_resource}:embedContent"
    body_single: dict[str, Any] = {
        "model": model_resource,
        "content": {"parts": [{"text": text}]},
    }
    out_dim = int(settings.embedding_dim)
    if out_dim > 0:
        body_single["outputDimensionality"] = out_dim
    resp = requests.post(url, data=json.dumps(body_single), headers=headers, timeout=settings.request_timeout_s)
    if resp.status_code >= 400:
        raise EmbeddingError(f"Gemini embedding error {resp.status_code}: {resp.text[:800]}")
    data: dict[str, Any] = resp.json()
    return _parse_gemini_embed_response(data)


def embed_texts(texts: list[str], *, expected_dim: Optional[int] = None) -> tuple[np.ndarray, str]:
    """
    Provider priority:
      1) Gemini
      2) OpenAI
      3) Local fallback

    Ensures the returned embedding matrix matches expected_dim (or Settings.embedding_dim).
    """
    settings = get_settings()
    dim = expected_dim or settings.embedding_dim
    providers = ["gemini", "openai", "local"]
    last_err: Optional[Exception] = None

    for provider in providers:
        if not _provider_available(provider):
            continue

        for attempt in range(1, 4):
            try:
                if provider == "gemini":
                    arr = _embed_gemini(texts)
                elif provider == "openai":
                    arr = _embed_openai(texts)
                else:
                    arr = _embed_local(texts, dim)

                if arr.ndim != 2 or arr.shape[0] != len(texts):
                    raise EmbeddingError("Invalid embedding response shape")

                if arr.shape[1] != dim:
                    raise EmbeddingError(f"Embedding dim mismatch: got {arr.shape[1]} expected {dim}")

                # normalize vectors for cosine similarity
                norms = np.linalg.norm(arr, axis=1, keepdims=True) + 1e-8
                arr = (arr / norms).astype("float32")

                _note_success(provider)
                return arr, provider
            except Exception as e:
                last_err = e
                _note_failure(provider)
                logger.warning(
                    "Embedding provider failed",
                    extra={"provider": provider, "attempt": attempt, "err": str(e)[:300]},
                )
                _backoff_sleep(attempt)

    raise EmbeddingError(f"All embedding providers failed: {last_err}")

