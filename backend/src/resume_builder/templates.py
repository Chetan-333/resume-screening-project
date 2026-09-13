"""
Template + question metadata for the resume builder. This is the single
source of truth: the frontend fetches it via GET /api/resume/templates
and renders whatever questions are listed here, rather than hardcoding
question sets on the client.
"""

TEMPLATES = [
    {
        "id": "classic",
        "name": "Classic",
        "description": "Traditional single-column layout with a serif header — a safe, ATS-friendly choice for corporate roles.",
        "questions": [
            {"key": "full_name", "label": "Full name", "type": "text", "placeholder": "", "required": True},
            {"key": "email", "label": "Email address", "type": "text", "placeholder": "", "required": True},
            {"key": "phone", "label": "Phone number", "type": "text", "placeholder": "", "required": True},
            {"key": "target_role", "label": "Target job title", "type": "text", "placeholder": "e.g. Senior Accountant", "required": True},
            {"key": "summary_hint", "label": "In a sentence or two, how would you describe your professional background?", "type": "textarea", "placeholder": "", "required": True},
            {"key": "experience_hint", "label": "List your work history: company, role, dates, and 1-2 things you did at each", "type": "list", "placeholder": "One entry per line", "required": True},
            {"key": "education_hint", "label": "List your education: school, degree, year", "type": "list", "placeholder": "One entry per line", "required": True},
            {"key": "skills_hint", "label": "List your key skills, separated by commas", "type": "text", "placeholder": "", "required": True},
            {"key": "certifications_hint", "label": "Any certifications or licenses? (optional)", "type": "text", "placeholder": "", "required": False},
        ],
    },
    {
        "id": "modern",
        "name": "Modern",
        "description": "Two-column layout with a shaded sidebar for skills and contact info — good for tech and creative roles.",
        "questions": [
            {"key": "full_name", "label": "Full name", "type": "text", "placeholder": "", "required": True},
            {"key": "email", "label": "Email", "type": "text", "placeholder": "", "required": True},
            {"key": "phone", "label": "Phone", "type": "text", "placeholder": "", "required": True},
            {"key": "target_role", "label": "What role are you targeting?", "type": "text", "placeholder": "", "required": True},
            {"key": "summary_hint", "label": "Pitch yourself in 2-3 sentences — what makes you a strong candidate?", "type": "textarea", "placeholder": "", "required": True},
            {"key": "experience_hint", "label": "Your work experience — company, title, dates, and key achievements", "type": "list", "placeholder": "One entry per line", "required": True},
            {"key": "education_hint", "label": "Your education background", "type": "list", "placeholder": "One entry per line", "required": True},
            {"key": "skills_hint", "label": "Technical/professional skills, comma-separated", "type": "text", "placeholder": "", "required": True},
            {"key": "projects_hint", "label": "Notable projects (name + short description, optional)", "type": "list", "placeholder": "One entry per line", "required": False},
        ],
    },
    {
        "id": "minimal",
        "name": "Minimal",
        "description": "Clean, whitespace-heavy layout with understated typography — good for design and product roles.",
        "questions": [
            {"key": "full_name", "label": "Name", "type": "text", "placeholder": "", "required": True},
            {"key": "email", "label": "Email", "type": "text", "placeholder": "", "required": True},
            {"key": "phone", "label": "Phone", "type": "text", "placeholder": "", "required": True},
            {"key": "target_role", "label": "Role you're applying for", "type": "text", "placeholder": "", "required": True},
            {"key": "summary_hint", "label": "Describe yourself professionally in a few words", "type": "textarea", "placeholder": "", "required": True},
            {"key": "experience_hint", "label": "Career highlights: where you've worked and what you did", "type": "list", "placeholder": "One entry per line", "required": True},
            {"key": "education_hint", "label": "Education", "type": "list", "placeholder": "One entry per line", "required": True},
            {"key": "skills_hint", "label": "Skills, comma-separated", "type": "text", "placeholder": "", "required": True},
            {"key": "linkedin_hint", "label": "LinkedIn or portfolio URL (optional)", "type": "text", "placeholder": "", "required": False},
        ],
    },
]


def get_template(template_id: str) -> dict | None:
    for template in TEMPLATES:
        if template["id"] == template_id:
            return template
    return None
