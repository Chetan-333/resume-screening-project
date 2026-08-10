"""
Text embedding generation using sentence-transformers.
Converts resume/job description text into vector embeddings that can be
compared for semantic similarity.
"""

from sentence_transformers import SentenceTransformer

# Loaded once at import time (loading the model is slow, so we don't want
# to reload it on every request).
_model = SentenceTransformer("all-MiniLM-L6-v2")


def get_embedding(text: str):
    """
    Convert a piece of text into a vector embedding.
    Returns a numpy array.
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")
    return _model.encode(text)


def get_embeddings(texts: list[str]):
    """
    Convert multiple texts into embeddings in one batch call (more
    efficient than calling get_embedding() in a loop for many resumes).
    """
    return _model.encode(texts)
