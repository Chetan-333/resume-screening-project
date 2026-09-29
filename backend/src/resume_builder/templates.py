"""
Template + question metadata for the resume builder. This is the single
source of truth: the frontend fetches it via GET /api/resume/templates
and renders whatever questions are listed here, rather than hardcoding
question sets on the client.

Question types:
- "text" / "textarea": a single string answer.
- "entries": a repeatable group of structured fields (e.g. one entry per
  job or school). Its value is a list of {field_key: value} dicts. Each
  sub-field can be marked required independently of the group itself.
  `primaryFields` / `dateField` tell the UI which sub-fields to use as an
  entry's title line and date line; `entryLabel` names one entry (e.g.
  "Job") for its "Add ..." button; `sectionLabel` is the heading to show
  once it's rendered into a resume section.
- "tags": a repeatable list of short strings (e.g. skills), entered as
  chips rather than free text.
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
            {"key": "summary_hint", "label": "In a sentence or two, how would you describe your professional background?", "sectionLabel": "Summary", "type": "textarea", "placeholder": "", "required": True},
            {
                "key": "experience_hint",
                "label": "Work experience",
                "sectionLabel": "Experience",
                "type": "entries",
                "required": True,
                "entryLabel": "Job",
                "primaryFields": ["title", "company"],
                "dateField": "dates",
                "fields": [
                    {"key": "company", "label": "Company", "type": "text", "placeholder": "", "required": True},
                    {"key": "title", "label": "Role", "type": "text", "placeholder": "", "required": True},
                    {"key": "dates", "label": "Dates", "type": "text", "placeholder": "e.g. Jan 2023 – Present", "required": False},
                    {"key": "description", "label": "What did you do there?", "type": "textarea", "placeholder": "", "required": True},
                ],
            },
            {
                "key": "education_hint",
                "label": "Education",
                "sectionLabel": "Education",
                "type": "entries",
                "required": True,
                "entryLabel": "School",
                "primaryFields": ["degree", "school"],
                "dateField": "year",
                "fields": [
                    {"key": "school", "label": "School", "type": "text", "placeholder": "", "required": True},
                    {"key": "degree", "label": "Degree", "type": "text", "placeholder": "", "required": True},
                    {"key": "year", "label": "Year", "type": "text", "placeholder": "", "required": False},
                ],
            },
            {"key": "skills_hint", "label": "Key skills", "sectionLabel": "Skills", "type": "tags", "placeholder": "Type a skill and press Enter", "required": True},
            {"key": "certifications_hint", "label": "Any certifications or licenses? (optional)", "sectionLabel": "Certifications", "type": "text", "placeholder": "", "required": False},
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
            {"key": "summary_hint", "label": "Pitch yourself in 2-3 sentences — what makes you a strong candidate?", "sectionLabel": "Summary", "type": "textarea", "placeholder": "", "required": True},
            {
                "key": "experience_hint",
                "label": "Work experience",
                "sectionLabel": "Experience",
                "type": "entries",
                "required": True,
                "entryLabel": "Job",
                "primaryFields": ["title", "company"],
                "dateField": "dates",
                "fields": [
                    {"key": "company", "label": "Company", "type": "text", "placeholder": "", "required": True},
                    {"key": "title", "label": "Title", "type": "text", "placeholder": "", "required": True},
                    {"key": "dates", "label": "Dates", "type": "text", "placeholder": "e.g. Jan 2023 – Present", "required": False},
                    {"key": "description", "label": "Key achievements", "type": "textarea", "placeholder": "", "required": True},
                ],
            },
            {
                "key": "education_hint",
                "label": "Education",
                "sectionLabel": "Education",
                "type": "entries",
                "required": True,
                "entryLabel": "School",
                "primaryFields": ["degree", "school"],
                "dateField": "year",
                "fields": [
                    {"key": "school", "label": "School", "type": "text", "placeholder": "", "required": True},
                    {"key": "degree", "label": "Degree", "type": "text", "placeholder": "", "required": True},
                    {"key": "year", "label": "Year", "type": "text", "placeholder": "", "required": False},
                ],
            },
            {"key": "skills_hint", "label": "Technical/professional skills", "sectionLabel": "Skills", "type": "tags", "placeholder": "Type a skill and press Enter", "required": True},
            {
                "key": "projects_hint",
                "label": "Notable projects (optional)",
                "sectionLabel": "Projects",
                "type": "entries",
                "required": False,
                "entryLabel": "Project",
                "primaryFields": ["name"],
                "dateField": None,
                "fields": [
                    {"key": "name", "label": "Project name", "type": "text", "placeholder": "", "required": True},
                    {"key": "description", "label": "What did you build?", "type": "textarea", "placeholder": "", "required": False},
                ],
            },
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
            {"key": "summary_hint", "label": "Describe yourself professionally in a few words", "sectionLabel": "Summary", "type": "textarea", "placeholder": "", "required": True},
            {
                "key": "experience_hint",
                "label": "Career highlights",
                "sectionLabel": "Experience",
                "type": "entries",
                "required": True,
                "entryLabel": "Job",
                "primaryFields": ["title", "company"],
                "dateField": "dates",
                "fields": [
                    {"key": "company", "label": "Company", "type": "text", "placeholder": "", "required": True},
                    {"key": "title", "label": "Role", "type": "text", "placeholder": "", "required": True},
                    {"key": "dates", "label": "Dates", "type": "text", "placeholder": "e.g. Jan 2023 – Present", "required": False},
                    {"key": "description", "label": "What did you do there?", "type": "textarea", "placeholder": "", "required": True},
                ],
            },
            {
                "key": "education_hint",
                "label": "Education",
                "sectionLabel": "Education",
                "type": "entries",
                "required": True,
                "entryLabel": "School",
                "primaryFields": ["degree", "school"],
                "dateField": "year",
                "fields": [
                    {"key": "school", "label": "School", "type": "text", "placeholder": "", "required": True},
                    {"key": "degree", "label": "Degree", "type": "text", "placeholder": "", "required": True},
                    {"key": "year", "label": "Year", "type": "text", "placeholder": "", "required": False},
                ],
            },
            {"key": "skills_hint", "label": "Skills", "sectionLabel": "Skills", "type": "tags", "placeholder": "Type a skill and press Enter", "required": True},
            {"key": "linkedin_hint", "label": "LinkedIn or portfolio URL (optional)", "type": "text", "placeholder": "", "required": False},
        ],
    },
]


def get_template(template_id: str) -> dict | None:
    for template in TEMPLATES:
        if template["id"] == template_id:
            return template
    return None
