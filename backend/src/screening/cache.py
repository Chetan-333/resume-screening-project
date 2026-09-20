"""
Small JSON key-value cache for the screening pipeline.

Uses Redis when REDIS_URL is set. If it isn't set, or Redis can't be
reached, it silently falls back to an in-process dict so screening never
fails because of the cache (the dict just resets when the server restarts).
"""

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv

# backend/src/screening/cache.py -> parents[3] = project root
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

logger = logging.getLogger(__name__)

_memory: dict[str, tuple[Optional[float], str]] = {}
_redis_client = None
_redis_checked = False


def _get_redis():
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client
    _redis_checked = True

    url = os.getenv("REDIS_URL")
    if not url:
        return None
    try:
        import redis

        client = redis.Redis.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        client.ping()
        _redis_client = client
        logger.info("Screening cache: using Redis")
    except Exception as exc:
        logger.warning("Redis unavailable, using in-memory cache: %s", exc)
    return _redis_client


def cache_get(key: str) -> Optional[Any]:
    client = _get_redis()
    if client is not None:
        try:
            raw = client.get(key)
            return json.loads(raw) if raw is not None else None
        except Exception as exc:
            logger.warning("Redis get failed, falling back to memory: %s", exc)

    entry = _memory.get(key)
    if entry is None:
        return None
    expires_at, raw = entry
    if expires_at is not None and expires_at < time.time():
        _memory.pop(key, None)
        return None
    return json.loads(raw)


def cache_set(key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
    raw = json.dumps(value)

    client = _get_redis()
    if client is not None:
        try:
            client.set(key, raw, ex=ttl_seconds)
            return
        except Exception as exc:
            logger.warning("Redis set failed, falling back to memory: %s", exc)

    expires_at = time.time() + ttl_seconds if ttl_seconds else None
    _memory[key] = (expires_at, raw)
