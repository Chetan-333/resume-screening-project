"""
AI-generated resume feedback (summary + strengths + improvement
suggestions) using LangChain with a Groq-hosted LLM.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# Load GROQ_API_KEY (and friends) from the project root .env, regardless
# of the working directory the server was started from.
# backend/src/ai/feedback.py -> parents[2] = backend/ -> parents[3] = project root
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a precise, encouraging resume reviewer helping a "
            "candidate improve their resume for a specific job. Respond "
            "with ONLY valid JSON, no markdown code fences, matching this "
            "shape exactly:\n"
            '{{"summary": string, "strengths": [string, ...], '
            '"improvements": [string, ...]}}\n\n'
            "Rules:\n"
            "- summary: 2-3 sentences on how well this resume fits the role.\n"
            "- strengths: 2-4 short bullet points, specific to this resume "
            "(not generic advice).\n"
            "- improvements: 3-5 short, concrete, actionable bullet points "
            "the candidate can act on today (skills to add or emphasize, "
            "missing sections, vague phrasing to tighten, impact to "
            "quantify, keywords from the job description that are "
            "missing). Be specific to this resume and this job, not "
            "generic resume-writing tips.",
        ),
        (
            "human",
            "Job description:\n{job_description}\n\n"
            "Resume:\n{resume_text}\n\n"
            "Similarity score (0-1 cosine similarity to the job "
            "description): {score}",
        ),
    ]
)


def _get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to the project's .env file."
        )
    return ChatGroq(
        model="openai/gpt-oss-20b",
        temperature=0.3,
        api_key=api_key,
    )


def get_resume_feedback(resume_text: str, job_description: str, score: float) -> dict:
    """
    Uses an LLM (via LangChain + Groq) to produce a short summary,
    strengths, and improvement suggestions for a single resume against
    a job description.
    """
    llm = _get_llm()
    parser = JsonOutputParser()
    chain = _PROMPT | llm | parser

    try:
        result = chain.invoke(
            {
                "job_description": job_description,
                "resume_text": resume_text[:6000],  # keep the prompt a reasonable size
                "score": round(score, 4),
            }
        )
    except Exception as exc:
        # Surface a clear, catchable error instead of a raw LangChain
        # traceback; the endpoint turns this into a clean 502.
        raise RuntimeError(f"AI feedback generation failed: {exc}") from exc

    # Basic shape guard in case the model wanders from the requested schema
    if not isinstance(result, dict):
        raise RuntimeError("AI feedback response was not in the expected format")

    return {
        "summary": result.get("summary", ""),
        "strengths": result.get("strengths") or [],
        "improvements": result.get("improvements") or [],
    }
