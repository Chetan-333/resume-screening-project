"""
Resume & job description parsing.
Extracts plain text from PDF and DOCX files so it can be embedded and compared.
"""

import pdfplumber
import docx


def parse_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def parse_docx(file_path: str) -> str:
    """Extract all text from a DOCX file."""
    document = docx.Document(file_path)
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def parse_resume(file_path: str) -> str:
    """
    Parse a resume file based on its extension.
    Supports .pdf and .docx. Raises ValueError for unsupported formats.
    """
    if file_path.lower().endswith(".pdf"):
        return parse_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        return parse_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path}")
