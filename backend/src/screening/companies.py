"""
Company name cleanup and a starter list of well-known companies.

The seed list is a judgment call, not a fact database: review and edit it.
Anything not on it is looked up and judged by the LLM (see company_scoring.py).
"""

import re
from typing import Optional

# Score inside the tier-1 band (8-10) for each well-known company.
SEED_SCORES: dict[str, int] = {
    # Big tech / top product companies
    "google": 10, "microsoft": 10, "amazon": 10, "apple": 10, "meta": 10,
    "netflix": 10, "nvidia": 10, "openai": 10, "anthropic": 10, "deepmind": 10,
    "adobe": 9, "oracle": 9, "salesforce": 9, "intel": 9, "ibm": 9,
    "cisco": 9, "qualcomm": 9, "uber": 9, "airbnb": 9, "stripe": 9,
    "atlassian": 9, "sap": 9, "amd": 9, "vmware": 9, "linkedin": 9,
    "paypal": 9, "tesla": 9, "spacex": 9, "samsung": 9, "sony": 9,
    "walmart": 9, "twitter": 9, "snap": 9, "databricks": 9, "snowflake": 9,
    "shopify": 9, "spotify": 9, "dropbox": 9, "servicenow": 9, "workday": 9,
    "intuit": 9, "arm": 9, "texas instruments": 9, "broadcom": 9,
    # Finance and consulting
    "goldman sachs": 9, "jpmorgan": 9, "morgan stanley": 9, "mckinsey": 9,
    "bcg": 9, "bain": 9, "deloitte": 9, "pwc": 9, "ey": 9, "kpmg": 9,
    "american express": 9, "visa": 9, "mastercard": 9, "citi": 9,
    "barclays": 9, "deutsche bank": 9, "wells fargo": 9, "blackrock": 9,
    # Large IT services MNCs and well-known Indian companies
    "accenture": 8, "tcs": 8, "infosys": 8, "wipro": 8, "hcl": 8,
    "tech mahindra": 8, "cognizant": 8, "capgemini": 8, "flipkart": 8,
    "swiggy": 8, "zomato": 8, "razorpay": 8, "phonepe": 8, "cred": 8,
    "ola": 8, "paytm": 8, "meesho": 8, "freshworks": 8, "zoho": 8,
    "reliance": 8, "tata": 8, "l and t": 8, "mahindra": 8, "hdfc bank": 8,
    "icici bank": 8, "sbi": 8, "isro": 8, "drdo": 8,
}

ALIASES: dict[str, str] = {
    "amazon web services": "amazon",
    "aws": "amazon",
    "alphabet": "google",
    "facebook": "meta",
    "meta platforms": "meta",
    "microsoft corporation": "microsoft",
    "jp morgan": "jpmorgan",
    "jpmorgan chase": "jpmorgan",
    "jp morgan chase": "jpmorgan",
    "goldman sachs group": "goldman sachs",
    "ernst and young": "ey",
    "tata consultancy services": "tcs",
    "hcl technologies": "hcl",
    "hcltech": "hcl",
    "boston consulting group": "bcg",
    "bain and company": "bain",
    "pricewaterhousecoopers": "pwc",
    "larsen and toubro": "l and t",
    "state bank of india": "sbi",
    "citigroup": "citi",
    "citibank": "citi",
}

_LEGAL_SUFFIXES = {
    "pvt", "private", "limited", "ltd", "inc", "llc", "corp", "corporation",
    "co", "company", "gmbh", "plc", "llp",
}

# Words that may follow a seed name without changing who the company is
# ("Google India" is Google, but "Meta Infotech" is not Meta).
_REGION_WORDS = {
    "india", "usa", "us", "uk", "global", "emea", "apac", "canada",
    "germany", "singapore", "ireland",
}

_GENERIC_NAMES = {
    "freelance", "freelancer", "freelancing", "self employed", "selfemployed",
    "self", "independent", "independent contractor", "personal project",
    "personal projects", "confidential", "na", "n a", "none", "various",
}

MAX_COMPANY_LENGTH = 80


def clean_company_name(raw: str) -> str:
    """Trim, drop control characters and cap length before a name is used anywhere."""
    text = re.sub(r"[\x00-\x1f\x7f]", " ", raw or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text[:MAX_COMPANY_LENGTH]


def normalize_company(name: str) -> str:
    """Lowercase, strip punctuation and legal suffixes so spellings match."""
    text = clean_company_name(name).lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = text.split()
    if tokens and tokens[0] == "the":
        tokens = tokens[1:]
    while tokens and tokens[-1] in _LEGAL_SUFFIXES:
        tokens.pop()
    return " ".join(tokens)


def is_generic_company(normalized: str) -> bool:
    return normalized in _GENERIC_NAMES


_SEED_TOKENS = [(tuple(name.split()), score) for name, score in SEED_SCORES.items()]


def lookup_seed(normalized: str) -> Optional[int]:
    """Return the tier-1 score for a well-known company, or None if not on the list."""
    normalized = ALIASES.get(normalized, normalized)
    tokens = tuple(normalized.split())
    for seed_tokens, score in _SEED_TOKENS:
        if tokens == seed_tokens:
            return score
        n = len(seed_tokens)
        if tokens[:n] == seed_tokens and set(tokens[n:]) <= _REGION_WORDS:
            return score
    return None
