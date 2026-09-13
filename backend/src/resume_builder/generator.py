"""
Expands a user's short, informal answers into polished, structured resume
content using an LLM (via LangChain + Groq), following the same pattern as
src/ai/feedback.py.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# backend/src/resume_builder/generator.py -> parents[3] = project root
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert resume writer. Given raw, informal notes "
            "from a candidate, produce polished resume content. Respond "
            "with ONLY valid JSON, no markdown code fences, matching this "
            "shape exactly:\n"
            '{{"name": string, "target_role": string, '
            '"contact": {{"email": string, "phone": string, "linkedin": string}}, '
            '"summary": string, '
            '"experience": [{{"title": string, "company": string, "dates": string, '
            '"bullets": [string, ...]}}], '
            '"education": [{{"school": string, "degree": string, "year": string}}], '
            '"skills": [string, ...], '
            '"projects": [{{"name": string, "description": string}}], '
            '"certifications": [string, ...]}}\n\n'
            "Rules:\n"
            "- Expand short or informal answers into professional language; "
            "do not just copy the input verbatim.\n"
            "- summary: 2-4 polished sentences.\n"
            "- Each experience bullet must start with an action verb and be "
            "achievement-oriented.\n"
            "- skills: a clean, deduplicated list (split any comma or "
            "newline separated input).\n"
            "- If the candidate provided no projects, certifications, or "
            "LinkedIn/portfolio URL, return an empty list/string for those "
            "fields — do not invent fake ones.\n"
            "- This resume will be laid out using a '{template_id}' visual "
            "style; keep the content itself style-neutral, that only "
            "affects layout.",
        ),
        (
            "human",
            "Here are the candidate's raw notes, one field per line:\n"
            "{answers_text}",
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


def generate_resume_content(template_id: str, answers: dict) -> dict:
    """
    Uses an LLM (via LangChain + Groq) to expand a candidate's raw answers
    into structured, polished resume content ready to slot into any of the
    resume HTML templates.
    """
    llm = _get_llm()
    parser = JsonOutputParser()
    chain = _PROMPT | llm | parser

    answers_text = "\n".join(
        f"{key}: {value}" for key, value in answers.items() if value
    )

    try:
        result = chain.invoke(
            {
                "template_id": template_id,
                "answers_text": answers_text,
            }
        )
    except Exception as exc:
        raise RuntimeError(f"Resume content generation failed: {exc}") from exc

    if not isinstance(result, dict) or not result.get("name") or not result.get("summary"):
        raise RuntimeError("Resume content response was not in the expected format")

    contact = result.get("contact") or {}

    return {
        "name": result.get("name", ""),
        "target_role": result.get("target_role", ""),
        "contact": {
            "email": contact.get("email", ""),
            "phone": contact.get("phone", ""),
            "linkedin": contact.get("linkedin", ""),
        },
        "summary": result.get("summary", ""),
        "experience": result.get("experience") or [],
        "education": result.get("education") or [],
        "skills": result.get("skills") or [],
        "projects": result.get("projects") or [],
        "certifications": result.get("certifications") or [],
    }
