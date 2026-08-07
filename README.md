# AI-Based Resume Screening & Ranking System

An automated system that ranks resumes based on their relevance to a given job description, using Natural Language Processing and semantic similarity — built to reduce manual screening effort and improve consistency in candidate shortlisting.

## Abstract

Resume screening is a critical yet time-consuming stage in the recruitment process, where recruiters must manually review a large volume of resumes to identify candidates best suited for a given job description. This manual process is often slow, inconsistent, and susceptible to human bias, making it difficult to scale as the number of applicants increases.

This project proposes an AI-based Resume Screening System that automatically ranks resumes according to their similarity and suitability with respect to a given job description. The system parses resumes (PDF/DOCX), extracts key information such as skills, experience, education, and qualifications, and represents both the resume and job description as structured, comparable data. NLP techniques — including text embeddings and semantic similarity — are used to quantify how closely a candidate's profile matches the job requirements. Resumes are then ranked in order of relevance, allowing recruiters to quickly shortlist suitable candidates.

The system is intended as a decision-support tool for recruiters, not a fully autonomous hiring system — human judgment remains central to final hiring decisions.

## Features

- Resume parsing (PDF/DOCX) — extracts skills, experience, education, qualifications
- Job description parsing and structured representation
- Semantic similarity scoring using sentence embeddings
- Automatic ranking of resumes by relevance
- Web interface (React + Vite frontend, FastAPI backend) for uploading resumes/JDs and viewing ranked results

## Tech Stack

- **Backend:** FastAPI
- **Frontend:** React + Vite
- **NLP/ML:** sentence-transformers (embeddings), scikit-learn (cosine similarity)
- **Parsing:** pdfplumber / PyPDF2 (PDF), python-docx (DOCX)
- **Language:** Python, JavaScript

## Project Structure

```
resume-screening-project/
├── README.md
├── .gitignore
├── backend/
│   ├── main.py           # FastAPI app entrypoint
│   ├── requirements.txt
│   └── src/
│       ├── parser/       # resume & JD parsing
│       ├── nlp/          # embeddings, similarity scoring
│       └── ranking/      # ranking logic
└── frontend/              # React + Vite app
    ├── src/
    ├── package.json
    └── vite.config.js
```

## How It Works

```
Resume(s) + Job Description
        ↓
   Parsing & Extraction
        ↓
  Embedding Generation
        ↓
 Similarity Scoring (Resume ↔ JD)
        ↓
   Ranking & Results
```

1. **Parsing** — resumes and job description are parsed into clean text and structured fields (skills, experience, education).
2. **Embedding** — both resume and JD text are converted into vector embeddings using a sentence-transformer model.
3. **Similarity Scoring** — cosine similarity between resume and JD embeddings produces a relevance score per resume.
4. **Ranking** — resumes are sorted by score and displayed to the recruiter via the web interface.

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs at `http://127.0.0.1:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

## API Endpoints (planned)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/rank` | Accepts resumes + job description, returns ranked results |
| GET | `/api/results/{job_id}` | View ranked results for a submission |

## Team

| Name | Role |
|---|---|
| Chetan Mittal | Team Lead |
| *Add teammates here* | |

## Roadmap

- [ ] Resume parsing (PDF/DOCX)
- [ ] Job description parsing
- [ ] Embedding + similarity scoring pipeline
- [ ] FastAPI backend routes
- [ ] React frontend (upload + results pages)
- [ ] Evaluation against labeled test set
- [ ] Deployment

## Future Improvements

- Bias auditing in ranking outputs
- Multilingual resume support
- Integration with Applicant Tracking Systems (ATS)
- Skill-gap highlighting per candidate
