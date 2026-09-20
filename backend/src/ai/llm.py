"""
Shared Groq chat-model factory for the screening pipeline.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq

# backend/src/ai/llm.py -> parents[3] = project root
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

MODEL_NAME = "openai/gpt-oss-20b"


def get_llm(temperature: float = 0.0) -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to the project's .env file."
        )
    return ChatGroq(
        model=MODEL_NAME,
        temperature=temperature,
        api_key=api_key,
        max_retries=2,
        timeout=40,
    )
