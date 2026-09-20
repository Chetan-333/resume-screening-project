"""
Screening pipeline as a LangGraph graph:

  embed_and_rank -> extract_signals -> score_company_tier -> combine_and_rank

embed_and_rank is the original cosine-similarity ranking. The other three
add a work-experience factor. If the caller turns experience off, the graph
stops after the first node and returns the similarity-only ranking.
"""

import os
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, TypedDict

from langgraph.graph import END, START, StateGraph

from src.ranking.ranker import rank_resumes
from src.screening.companies import normalize_company
from src.screening.company_scoring import score_company
from src.screening.extraction import extract_experience

DEFAULT_EXPERIENCE_WEIGHT = 0.25
_MAX_EXPERIENCE_WEIGHT = 0.5
_MAX_WORKERS = 5


class ScreeningState(TypedDict, total=False):
    job_description: str
    resumes: list[dict]
    include_experience: bool
    ranked: list[dict]
    extractions: dict[int, dict]
    company_scores: dict[str, Optional[dict]]
    results: list[dict]


def experience_weight() -> float:
    """Share of the final score given to experience (kept at or below 0.5)."""
    try:
        weight = float(os.getenv("EXPERIENCE_WEIGHT", DEFAULT_EXPERIENCE_WEIGHT))
    except ValueError:
        weight = DEFAULT_EXPERIENCE_WEIGHT
    return min(max(weight, 0.0), _MAX_EXPERIENCE_WEIGHT)


def embed_and_rank(state: ScreeningState) -> dict:
    resumes = [{**r, "idx": i} for i, r in enumerate(state["resumes"])]
    ranked = rank_resumes(resumes, state["job_description"])
    results = [
        {
            "filename": r["filename"],
            "score": r["score"],
            "similarity": r["score"],
            "experience": None,
        }
        for r in ranked
    ]
    return {"ranked": ranked, "results": results}


def route_after_ranking(state: ScreeningState) -> str:
    return "extract_signals" if state.get("include_experience") else END


def extract_signals(state: ScreeningState) -> dict:
    ranked = state["ranked"]
    with ThreadPoolExecutor(max_workers=_MAX_WORKERS) as pool:
        outputs = list(pool.map(lambda r: extract_experience(r["text"]), ranked))
    return {"extractions": {r["idx"]: out for r, out in zip(ranked, outputs)}}


def score_company_tier(state: ScreeningState) -> dict:
    # Each distinct company is scored once, even if many resumes list it.
    companies: dict[str, str] = {}
    for extraction in state["extractions"].values():
        if extraction.get("status") != "ok":
            continue
        for item in extraction["experiences"]:
            key = normalize_company(item["company"])
            if key:
                companies.setdefault(key, item["company"])

    with ThreadPoolExecutor(max_workers=_MAX_WORKERS) as pool:
        scored = list(pool.map(score_company, companies.values()))
    return {"company_scores": dict(zip(companies.keys(), scored))}


def _unavailable() -> dict:
    return {"status": "unavailable", "score": None, "best": None, "items": []}


def _resume_experience(extraction: dict, company_scores: dict) -> dict:
    if extraction.get("status") != "ok":
        return _unavailable()

    items = extraction["experiences"]
    if not items:
        return {"status": "none", "score": 0, "best": None, "items": []}

    scored = []
    for item in items:
        company_score = company_scores.get(normalize_company(item["company"]))
        if company_score is None:
            continue
        scored.append({
            **item,
            "tier": company_score["tier"],
            "score": company_score["score"],
            "reason": company_score["reason"],
        })
    if not scored:
        return _unavailable()

    scored.sort(key=lambda i: i["score"], reverse=True)
    return {"status": "scored", "score": scored[0]["score"], "best": scored[0], "items": scored}


def combine_and_rank(state: ScreeningState) -> dict:
    exp_weight = experience_weight()
    sim_weight = 1 - exp_weight

    results = []
    for resume in state["ranked"]:
        similarity = resume["score"]
        experience = _resume_experience(
            state["extractions"][resume["idx"]], state["company_scores"]
        )
        if experience["status"] in ("scored", "none"):
            final = sim_weight * similarity + exp_weight * experience["score"] / 10
        else:
            # Experience couldn't be read, so rank this resume on similarity alone.
            final = similarity
        results.append({
            "filename": resume["filename"],
            "score": round(final, 4),
            "similarity": similarity,
            "experience": experience,
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    return {"results": results}


def build_graph():
    graph = StateGraph(ScreeningState)
    graph.add_node("embed_and_rank", embed_and_rank)
    graph.add_node("extract_signals", extract_signals)
    graph.add_node("score_company_tier", score_company_tier)
    graph.add_node("combine_and_rank", combine_and_rank)

    graph.add_edge(START, "embed_and_rank")
    graph.add_conditional_edges(
        "embed_and_rank",
        route_after_ranking,
        {"extract_signals": "extract_signals", END: END},
    )
    graph.add_edge("extract_signals", "score_company_tier")
    graph.add_edge("score_company_tier", "combine_and_rank")
    graph.add_edge("combine_and_rank", END)
    return graph.compile()


_screening_graph = build_graph()


def run_screening(job_description: str, resumes: list[dict], include_experience: bool) -> dict:
    state = _screening_graph.invoke(
        {
            "job_description": job_description,
            "resumes": resumes,
            "include_experience": include_experience,
        }
    )
    exp_weight = experience_weight() if include_experience else 0.0
    return {
        "results": state["results"],
        "weights": {"similarity": round(1 - exp_weight, 2), "experience": round(exp_weight, 2)},
    }
