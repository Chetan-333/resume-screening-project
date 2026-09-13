"""
Renders structured resume content into a chosen HTML template, then
converts that HTML into a PDF via xhtml2pdf (pure-Python, no system
dependencies — chosen over WeasyPrint to avoid GTK/Cairo/Pango install
pain on Windows).
"""

import io
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates_html"
_env = Environment(loader=FileSystemLoader(_TEMPLATES_DIR))

_FILENAMES = {
    "classic": "classic.html",
    "modern": "modern.html",
    "minimal": "minimal.html",
}


def render_resume_html(template_id: str, content: dict) -> str:
    filename = _FILENAMES.get(template_id)
    if not filename:
        raise ValueError(f"Unknown template_id: {template_id}")
    template = _env.get_template(filename)
    return template.render(**content)


def render_pdf(html: str) -> bytes:
    from xhtml2pdf import pisa

    buf = io.BytesIO()
    result = pisa.CreatePDF(io.StringIO(html), dest=buf)
    if result.err:
        raise RuntimeError("Failed to render PDF from resume HTML")
    return buf.getvalue()
