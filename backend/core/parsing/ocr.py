from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def ocr_fallback(_path: Path) -> str:
    """
    OCR fallback for scanned PDFs/images.

    Note: Proper OCR for PDFs typically requires rasterizing pages (e.g. pdf2image + poppler).
    We keep this function as a safe placeholder in the minimal synchronous MVP.
    """
    logger.warning("OCR fallback not configured; returning empty text")
    return ""

