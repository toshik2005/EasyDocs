from dataclasses import dataclass


@dataclass(frozen=True)
class Collections:
    documents: str = "documents"
    chunks: str = "chunks"
    chat_history: str = "chat_history"
    jobs: str = "jobs"
    qa_cached: str = "qa_cached"
    qa_precomputed: str = "qa_precomputed"
    summary_segments: str = "summary_segments"

