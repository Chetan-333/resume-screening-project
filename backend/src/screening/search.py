"""
Looks a company up on Wikipedia and returns short evidence snippets for the
LLM judge. Wikipedia is free and needs no API key.
"""

import logging
import re
from typing import Optional

import requests

logger = logging.getLogger(__name__)

_WIKI_API = "https://en.wikipedia.org/w/api.php"
_HEADERS = {"User-Agent": "ResumeScreeningProject/1.0 (student project)"}


def search_company(name: str) -> Optional[list[str]]:
    """
    Returns up to 3 "Title: intro text" snippets. An empty list means Wikipedia
    has nothing on it; None means the lookup itself failed (network error).
    """
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"{name} company",
        "gsrlimit": 3,
        "prop": "extracts",
        "exintro": 1,
        "explaintext": 1,
        "exchars": 350,
    }
    try:
        resp = requests.get(_WIKI_API, params=params, headers=_HEADERS, timeout=6)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.warning("Wikipedia lookup failed for %r: %s", name, exc)
        return None

    pages = (data.get("query") or {}).get("pages") or {}
    ordered = sorted(pages.values(), key=lambda p: p.get("index", 0))

    snippets = []
    for page in ordered:
        title = page.get("title", "")
        extract = re.sub(r"\s+", " ", page.get("extract", "")).strip()
        if title and extract:
            snippets.append(f"{title}: {extract}")
    return snippets
