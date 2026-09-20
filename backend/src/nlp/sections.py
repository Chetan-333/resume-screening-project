"""
Common resume section headings, used to split resumes into sections.
"""

import re

EXPERIENCE_HEADINGS = {
    "experience", "work experience", "professional experience",
    "work history", "employment", "employment history", "internships",
    "internship", "internship experience", "industrial experience",
    "industry experience", "career history", "relevant experience",
}

OTHER_HEADINGS = {
    "education", "projects", "academic projects", "personal projects",
    "skills", "technical skills", "certifications", "achievements", "awards",
    "publications", "summary", "objective", "profile", "interests",
    "languages", "references", "extracurricular", "activities",
    "positions of responsibility", "courses", "training", "hobbies",
    "additional information", "personal details", "declaration",
}

ALL_HEADINGS = EXPERIENCE_HEADINGS | OTHER_HEADINGS

MAX_HEADING_LENGTH = 40


def heading_key(line: str) -> str:
    return re.sub(r"[^a-z ]", "", line.lower()).strip()


def is_heading(line: str) -> bool:
    return len(line) <= MAX_HEADING_LENGTH and heading_key(line) in ALL_HEADINGS
