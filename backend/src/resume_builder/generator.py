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
            "- Never invent facts: no specific company names, technologies, "
            "tools, metrics, numbers, or achievements that are not stated "
            "or clearly implied somewhere in the candidate's own answers. "
            "You may rephrase and add generic connective language, but "
            "every concrete claim must be traceable to something the "
            "candidate actually wrote.\n"
            "- If an answer is empty, a single dash, or unintelligible "
            "keyboard mashing with no real words (e.g. 'gvdsacjjas dsca'), "
            "treat that field as not provided: leave the corresponding "
            "output empty/generic rather than fabricating content for it. "
            "Do not let the target role alone justify inventing specific "
            "skills or experience.\n"
            "- summary: 2-4 polished sentences built only from what the "
            "candidate actually provided (their real skills, real "
            "experience, target role). If too little was provided for a "
            "real summary, write a short, honest, generic one instead of "
            "padding it with invented specifics.\n"
            "- Each experience bullet must start with an action verb and be "
            "achievement-oriented, and must be grounded in what the "
            "candidate wrote for that role — do not add outcomes, metrics, "
            "or tools they didn't mention.\n"
            "- skills: a clean, deduplicated list (split any comma or "
            "newline separated input). Only include skills the candidate "
            "actually listed.\n"
            "- If the candidate provided no projects, certifications, "
            "LinkedIn/portfolio URL, or work experience (e.g. the answer is "
            "blank, '-', or says 'none'/'no experience'), return an empty "
            "list/string for those fields — do not invent placeholder "
            "entries.\n"
            "- Use only plain ASCII punctuation: a regular hyphen '-', "
            "straight quotes, and '...' for an ellipsis. Never use Unicode "
            "dashes, smart quotes, or other special punctuation.\n"
            "- This resume will be laid out using a '{template_id}' visual "
            "style; keep the content itself style-neutral, that only "
            "affects layout.",
        ),
        (
            "human",
            "Here are the candidate's raw notes, one field per line. A "
            "field with multiple entries (like work experience, education, "
            "or projects) lists one entry per line, prefixed with '-', "
            "with that entry's own pieces of information separated by "
            "semicolons:\n"
            "{answers_text}",
        ),
    ]
)


# xhtml2pdf's default fonts have no glyph for these and render them as a
# black box, so any Unicode punctuation the LLM writes anyway is normalized
# to plain ASCII before the content is used.
_CHAR_REPLACEMENTS = {
    "‐": "-", "‑": "-", "‒": "-", "–": "-",
    "—": "-", "―": "-",
    "‘": "'", "’": "'",
    "“": '"', "”": '"',
    "•": "-",
    "…": "...",
    " ": " ",
}

_PLACEHOLDER_VALUES = {"", "-", "--", "n/a", "na", "none", "nil", "not applicable"}


def _sanitize(value):
    """Recursively normalizes punctuation and whitespace in all strings."""
    if isinstance(value, str):
        for bad, good in _CHAR_REPLACEMENTS.items():
            value = value.replace(bad, good)
        return " ".join(value.split())
    if isinstance(value, list):
        return [_sanitize(v) for v in value]
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    return value


def _is_placeholder(text) -> bool:
    return str(text or "").strip().lower() in _PLACEHOLDER_VALUES


def _drop_placeholder_entries(items: list, *fields: str) -> list:
    """Drops list entries where every one of the given fields is a placeholder
    (e.g. an LLM-invented {"title": "-", "company": ""} for "no experience")."""
    cleaned = []
    for item in items or []:
        if isinstance(item, dict) and all(_is_placeholder(item.get(f)) for f in fields):
            continue
        cleaned.append(item)
    return cleaned


def _format_value(value) -> str:
    """
    Turns one answer's value into readable text for the prompt. Plain
    text/textarea answers are strings already; "entries" fields (work
    experience, education, projects) arrive as a list of dicts, one per
    entry; "tags" fields (skills) arrive as a list of strings.
    """
    if isinstance(value, list):
        if not value:
            return ""
        if value and isinstance(value[0], dict):
            lines = []
            for entry in value:
                parts = [
                    f"{key}: {entry_value}"
                    for key, entry_value in entry.items()
                    if str(entry_value or "").strip()
                ]
                if parts:
                    lines.append("- " + "; ".join(parts))
            return "\n" + "\n".join(lines) if lines else ""
        return ", ".join(str(v) for v in value if str(v or "").strip())
    return str(value or "")


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
        f"{key}: {formatted}"
        for key, value in answers.items()
        if (formatted := _format_value(value)).strip()
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
    experience = _drop_placeholder_entries(result.get("experience") or [], "title", "company")
    education = _drop_placeholder_entries(result.get("education") or [], "school", "degree")
    projects = _drop_placeholder_entries(result.get("projects") or [], "name", "description")
    certifications = [c for c in (result.get("certifications") or []) if not _is_placeholder(c)]

    return _sanitize({
        "name": result.get("name", ""),
        "target_role": result.get("target_role", ""),
        "contact": {
            "email": contact.get("email", ""),
            "phone": contact.get("phone", ""),
            "linkedin": contact.get("linkedin", ""),
        },
        "summary": result.get("summary", ""),
        "experience": experience,
        "education": education,
        "skills": result.get("skills") or [],
        "projects": projects,
        "certifications": certifications,
    })
