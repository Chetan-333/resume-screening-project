"""
Ranking logic.
Scores each resume's similarity to the job description and returns
them sorted from most to least relevant.

A resume is split into chunks, each chunk is compared to the job
description, and the resume's score is the average of its best few chunks.
This avoids the embedding model's 512-token cutoff, and rewards resumes that
have several relevant sections rather than one keyword-heavy paragraph.
"""

from sklearn.metrics.pairwise import cosine_similarity

from src.nlp.chunking import split_into_chunks
from src.nlp.embeddings import get_embedding, get_embeddings

TOP_CHUNKS = 3

# A resume with fewer than TOP_CHUNKS sections has the missing ones counted as
# unrelated text. This is about what unrelated text scores with our embedding
# model (measured ~0.40-0.50), so re-check it if the model is changed.
MISSING_CHUNK_SCORE = 0.45


def _chunk_score(chunk_embeddings, job_description_embedding) -> float:
    if len(chunk_embeddings) == 0:
        return 0.0
    sims = cosine_similarity(chunk_embeddings, [job_description_embedding]).flatten()
    best = sorted(sims, reverse=True)[:TOP_CHUNKS]
    best += [MISSING_CHUNK_SCORE] * (TOP_CHUNKS - len(best))
    return float(sum(best) / TOP_CHUNKS)


def score_resume(resume_text: str, job_description_embedding) -> float:
    """
    Compute a similarity score (0-1) between a single resume and the
    job description embedding.
    """
    chunks = split_into_chunks(resume_text)
    if not chunks:
        return 0.0
    return _chunk_score(get_embeddings(chunks), job_description_embedding)


def rank_resumes(resumes: list[dict], job_description: str) -> list[dict]:
    """
    Rank a list of resumes against a job description.

    resumes: list of dicts like {"filename": "john.pdf", "text": "..."}
    job_description: plain text of the job description

    Returns the same list, each dict with an added "score" field,
    sorted from highest to lowest score.
    """
    if not resumes:
        return []

    job_embedding = get_embedding(job_description)

    # Embed every chunk of every resume in one batch (much faster than one at a time)
    chunk_lists = [split_into_chunks(r["text"]) for r in resumes]
    all_chunks = [chunk for chunks in chunk_lists for chunk in chunks]
    all_embeddings = get_embeddings(all_chunks) if all_chunks else []

    ranked = []
    offset = 0
    for resume, chunks in zip(resumes, chunk_lists):
        embeddings = all_embeddings[offset:offset + len(chunks)]
        offset += len(chunks)
        ranked.append({
            **resume,
            "score": round(_chunk_score(embeddings, job_embedding), 4),
        })

    ranked.sort(key=lambda r: r["score"], reverse=True)
    return ranked
