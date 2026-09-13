"""
Text embedding generation using fastembed (ONNX Runtime, no PyTorch).
Converts resume/job description text into vector embeddings that can be
compared for semantic similarity. Chosen over sentence-transformers
specifically to avoid PyTorch's memory footprint, which doesn't fit in
free-tier hosting (512MB RAM).
"""

from fastembed import TextEmbedding

# Loaded once at import time (loading the model is slow, so we don't want
# to reload it on every request).
_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")


def get_embedding(text: str):
    """
    Convert a piece of text into a vector embedding.
    Returns a numpy array.
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")
    return next(_model.embed([text]))


def get_embeddings(texts: list[str]):
    """
    Convert multiple texts into embeddings in one batch call (more
    efficient than calling get_embedding() in a loop for many resumes).
    """
    return list(_model.embed(texts))
