import os
import shutil
import tempfile
from typing import List

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from src.parser.resume_parser import parse_resume
from src.ranking.ranker import rank_resumes

app = FastAPI(title="Resume Screening API")

# Allow the React (Vite) frontend to call this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
