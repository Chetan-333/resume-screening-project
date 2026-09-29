import os
import shutil
import tempfile
from typing import Any, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.parser.resume_parser import parse_resume
from src.nlp.embeddings import get_embedding
from src.ranking.ranker import score_resume
from src.screening.graph import run_screening
from src.ai.feedback import get_resume_feedback
from src.resume_builder.templates import TEMPLATES, get_template
from src.resume_builder.generator import generate_resume_content
from src.resume_builder.renderer import render_resume_html, render_pdf

app = FastAPI(title="Resume Screening API")


class ResumeGenerateRequest(BaseModel):
    template_id: str
    # Plain questions answer with a string; "entries" questions (work
    # experience, education, projects) with a list of dicts; "tags"
    # questions (skills) with a list of strings.
    answers: dict[str, Any]


class ResumePdfRequest(BaseModel):
    template_id: str
    content: dict

# Allow the frontend (Next.js dev server, the older Vite one, and the
# deployed frontend URL from FRONTEND_URL) to call this API.
_allowed_origins = ["http://localhost:3000", "http://localhost:5173"]
if os.getenv("FRONTEND_URL"):
    _allowed_origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Resume Screening API is running"}


@app.post("/api/rank")
async def rank_resumes_endpoint(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    include_experience: bool = Form(True),
):
    """
    Accepts a job description and multiple resume files (PDF/DOCX),
    parses each resume, scores it against the job description, and
    returns them ranked from most to least relevant.

    With include_experience on (default), the final score also weighs the
    quality of each candidate's work experience (company tier, scored by an
    LLM). Turn it off for a pure similarity ranking.
    """
    parsed_resumes = []

    for resume_file in resumes:
        # Save the uploaded file to a temp path so our parser (which
        # reads from disk) can open it
        suffix = os.path.splitext(resume_file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            tmp_path = tmp.name

        try:
            text = parse_resume(tmp_path)
            parsed_resumes.append({
                "filename": resume_file.filename,
                "text": text,
            })
        finally:
            os.remove(tmp_path)

    # The pipeline does blocking model and network calls, so keep it off the event loop.
    # Raw resume text stays on the server; only scores and experience details go back.
    return await run_in_threadpool(
        run_screening, job_description, parsed_resumes, include_experience
    )


@app.post("/api/analyze")
async def analyze_resume_endpoint(
    job_description: str = Form(...),
    resume: UploadFile = File(...),
):
    """
    Accepts a single resume and a job description. Returns a similarity
    score plus AI-generated feedback: a short summary, strengths, and
    concrete improvement suggestions (via LangChain + Groq).
    """
    suffix = os.path.splitext(resume.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(resume.file, tmp)
        tmp_path = tmp.name

    try:
        resume_text = parse_resume(tmp_path)
    finally:
        os.remove(tmp_path)

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Couldn't extract any text from that file. Is it a scanned/image-only PDF?",
        )

    job_embedding = get_embedding(job_description)
    score = score_resume(resume_text, job_embedding)

    try:
        feedback = get_resume_feedback(resume_text, job_description, score)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return {
        "filename": resume.filename,
        "score": round(score, 4),
        **feedback,
    }


@app.get("/api/resume/templates")
def get_resume_templates():
    """
    Returns the resume-builder templates and their predefined questions.
    This is the single source of truth the frontend renders from.
    """
    return {"templates": TEMPLATES}


def _validate_answers(template_id: str, answers: dict[str, Any]) -> dict:
    template = get_template(template_id)
    if not template:
        raise HTTPException(status_code=400, detail=f"Unknown template_id: {template_id}")

    missing = []
    for question in template["questions"]:
        if not question.get("required"):
            continue
        value = answers.get(question["key"])
        qtype = question.get("type")

        if qtype == "entries":
            entries = [
                e for e in (value or [])
                if isinstance(e, dict) and any(str(v or "").strip() for v in e.values())
            ]
            if not entries:
                missing.append(question["label"])
                continue
            for entry in entries:
                for field in question.get("fields", []):
                    if field.get("required") and not str(entry.get(field["key"]) or "").strip():
                        missing.append(f"{question['label']} — {field['label']}")
        elif qtype == "tags":
            tags = [t for t in (value or []) if str(t or "").strip()]
            if not tags:
                missing.append(question["label"])
        else:
            if not str(value or "").strip():
                missing.append(question["label"])

    if missing:
        # dict.fromkeys dedupes while keeping the first-seen order.
        missing = list(dict.fromkeys(missing))
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    return template


@app.post("/api/resume/generate")
def generate_resume_endpoint(payload: ResumeGenerateRequest):
    """
    Accepts a template id and the user's answers to that template's
    predefined questions. Expands the answers into polished resume
    content via an LLM, renders it into the chosen template, and returns
    a downloadable PDF directly. Kept for backward compatibility; the
    builder UI now uses /api/resume/preview + /api/resume/pdf instead, so
    a live preview and the final download always match without paying for
    a second LLM call.
    """
    _validate_answers(payload.template_id, payload.answers)

    try:
        content = generate_resume_content(payload.template_id, payload.answers)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    html = render_resume_html(payload.template_id, content)

    try:
        pdf_bytes = render_pdf(html)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"},
    )


@app.post("/api/resume/preview")
def preview_resume_endpoint(payload: ResumeGenerateRequest):
    """
    Same inputs as /api/resume/generate, but returns the rendered HTML
    (for an on-page preview) plus the structured content the LLM produced,
    instead of a PDF. The frontend sends that same content straight back
    to /api/resume/pdf to download, so the LLM only runs once per preview
    and the preview always matches the downloaded file exactly.
    """
    _validate_answers(payload.template_id, payload.answers)

    try:
        content = generate_resume_content(payload.template_id, payload.answers)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    html = render_resume_html(payload.template_id, content)
    return {"html": html, "content": content}


@app.post("/api/resume/pdf")
def resume_pdf_endpoint(payload: ResumePdfRequest):
    """
    Renders already-generated resume content (from /api/resume/preview)
    into a downloadable PDF. Does not call the LLM, so this is fast and
    produces exactly what was shown in the preview.
    """
    if not get_template(payload.template_id):
        raise HTTPException(status_code=400, detail=f"Unknown template_id: {payload.template_id}")

    try:
        html = render_resume_html(payload.template_id, payload.content)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Couldn't render resume content: {exc}")

    try:
        pdf_bytes = render_pdf(html)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"},
    )
