from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
def rank_resumes():
    # TODO: accept resumes + job description, run parsing -> embedding -> similarity -> ranking
    return {"message": "ranking endpoint placeholder"}
