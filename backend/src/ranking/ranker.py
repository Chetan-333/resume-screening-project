"""
Ranking logic.
Scores each resume's similarity to the job description and returns
them sorted from most to least relevant.
"""

from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from src.nlp.embeddings import get_embedding, get_embeddings


def score_resume(resume_text: str, job_description_embedding) -> float:
    """
    Compute a similarity score (0-1) between a single resume and the
    job description embedding.
    """
    resume_embedding = get_embedding(resume_text)
    similarity = cosine_similarity(
        [resume_embedding],
        [job_description_embedding],
    )[0][0]
    return float(similarity)


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

    # Batch-embed all resumes at once (much faster than one at a time)
    resume_texts = [r["text"] for r in resumes]
    resume_embeddings = get_embeddings(resume_texts)

    scores = cosine_similarity(resume_embeddings, [job_embedding]).flatten()

    ranked = []
    for resume, score in zip(resumes, scores):
        ranked.append({
            **resume,
            "score": round(float(score), 4),
        })

    ranked.sort(key=lambda r: r["score"], reverse=True)
    return ranked
