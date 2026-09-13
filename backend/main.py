import os
import shutil
import tempfile
from typing import List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.parser.resume_parser import parse_resume
from src.nlp.embeddings import get_embedding
from src.ranking.ranker import rank_resumes, score_resume
from src.ai.feedback import get_resume_feedback
from src.resume_builder.templates import TEMPLATES, get_template
from src.resume_builder.generator import generate_resume_content
from src.resume_builder.renderer import render_resume_html, render_pdf

app = FastAPI(title="Resume Screening API")


class ResumeGenerateRequest(BaseModel):
    template_id: str
    answers: dict[str, str]

# Allow the frontend (Next.js dev server, and the older Vite one) to call
# this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
):
    """
    Accepts a job description and multiple resume files (PDF/DOCX),
    parses each resume, scores it against the job description, and
    returns them ranked from most to least relevant.
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

    ranked = rank_resumes(parsed_resumes, job_description)

    # Don't send the full raw text back to the frontend, just filename + score
    results = [{"filename": r["filename"], "score": r["score"]} for r in ranked]

    return {"results": results}


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


@app.post("/api/resume/generate")
def generate_resume_endpoint(payload: ResumeGenerateRequest):
    """
    Accepts a template id and the user's answers to that template's
    predefined questions. Expands the answers into polished resume
    content via an LLM, renders it into the chosen template, and returns
    a downloadable PDF.
    """
    template = get_template(payload.template_id)
    if not template:
        raise HTTPException(status_code=400, detail=f"Unknown template_id: {payload.template_id}")

    missing = [
        question["label"]
        for question in template["questions"]
        if question.get("required") and not (payload.answers.get(question["key"]) or "").strip()
    ]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

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
