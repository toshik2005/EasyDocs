import re


_INJECTION_PATTERNS = [
    r"(?i)ignore\s+all\s+previous\s+instructions",
    r"(?i)system\s*prompt",
    r"(?i)developer\s*message",
    r"(?i)reveal\s+.*(key|token|secret|password)",
]


def sanitize_user_text(text: str, max_len: int = 4000) -> str:
    text = (text or "").strip()
    if not text:
        return ""
    text = text[:max_len]

    for pat in _INJECTION_PATTERNS:
        text = re.sub(pat, "[redacted]", text)
    return text

