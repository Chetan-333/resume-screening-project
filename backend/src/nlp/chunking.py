"""
Splits resume text into chunks that fit the embedding model's 512-token
limit (longer text is silently cut off), starting a new chunk at each
section heading.
"""

from src.nlp.sections import is_heading

MAX_CHUNK_WORDS = 180
MIN_CHUNK_WORDS = 10


def split_into_chunks(
    text: str,
    max_words: int = MAX_CHUNK_WORDS,
    min_words: int = MIN_CHUNK_WORDS,
) -> list[str]:
    chunks: list[str] = []
    current: list[str] = []
    count = 0

    def flush():
        nonlocal current, count
        chunk = "\n".join(current).strip()
        if len(chunk.split()) >= min_words:
            chunks.append(chunk)
        current, count = [], 0

    for line in (text or "").splitlines():
        line = line.strip()
        if not line:
            continue
        if is_heading(line):
            flush()

        # A single very long line (common in DOCX paragraphs) is cut into word windows.
        words = line.split()
        for start in range(0, len(words), max_words):
            piece = words[start:start + max_words]
            if count + len(piece) > max_words and current:
                flush()
            current.append(" ".join(piece))
            count += len(piece)

    flush()
    return chunks
