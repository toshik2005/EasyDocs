from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from PyPDF2 import PdfReader
from docx import Document as DocxDocument

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ParsedPage:
    page: Optional[int]
    text: str


def parse_pdf(path: Path) -> list[ParsedPage]:
    reader = PdfReader(str(path))
    pages: list[ParsedPage] = []
    for i, p in enumerate(reader.pages, start=1):
        try:
            txt = p.extract_text() or ""
        except Exception as e:
            logger.warning("PDF page text extraction failed", extra={"page": i, "err": str(e)[:200]})
            txt = ""
        pages.append(ParsedPage(page=i, text=txt))
    return pages


def parse_docx(path: Path) -> list[ParsedPage]:
    doc = DocxDocument(str(path))
    parts = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
    return [ParsedPage(page=None, text="\n".join(parts))]


def parse_file(path: Path, mime_type: str) -> list[ParsedPage]:
    mt = (mime_type or "").lower()
    if mt == "application/pdf" or path.suffix.lower() == ".pdf":
        return parse_pdf(path)
    if mt in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ) or path.suffix.lower() == ".docx":
        return parse_docx(path)
    raise ValueError(f"Unsupported file type: {mime_type}")

