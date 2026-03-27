"""
ai_client.py - Thin HTTP client for the external AI API.
Exposes generate_sql() and generate_explanation() functions.
"""
import json
import logging
from typing import Any

import requests

from config import settings

logger = logging.getLogger(__name__)


# ── Internal helper ───────────────────────────────────────────────────────────

def _call_ai_api(input_text: str) -> str:
    """
    POST to the external AI API endpoint and return the text response.

    Expected request:
        POST {AI_API_ENDPOINT}
        Authorization: Bearer <TOKEN>
        Content-Type: application/json
        Body: {"input": "<prompt>"}

    Expected response (flexible – handles nested structures):
        {"output": "..."} | {"result": "..."} | {"text": "..."} | plain string
    """
    headers = {
        "Authorization": f"Bearer {settings.AI_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload: dict[str, Any] = {"input": input_text}

    # Optional: include username if required by the API
    if settings.AI_USERNAME:
        payload["username"] = settings.AI_USERNAME

    logger.debug("Calling AI API at %s", settings.AI_API_ENDPOINT)

    response = requests.post(
        settings.AI_API_ENDPOINT,
        headers=headers,
        json=payload,
        timeout=settings.REQUEST_TIMEOUT,
    )
    response.raise_for_status()

    body = response.json()

    # Handle various response shapes
    if isinstance(body, str):
        return body.strip()

    # Common field names to look for
    for key in ("output", "result", "text", "answer", "content", "message", "sql"):
        if key in body:
            val = body[key]
            if isinstance(val, str):
                return val.strip()

    # If response is nested list (e.g. Bedrock / OpenAI-like)
    if "choices" in body:
        return body["choices"][0].get("message", {}).get("content", "").strip()

    # Fall back: stringify the whole response
    return json.dumps(body)


# ── Public API ────────────────────────────────────────────────────────────────

def generate_sql(prompt: str) -> str:
    """
    Send a SQL-generation prompt to the AI API and return the raw SQL string.
    All cleaning / validation happens downstream in validator.py.
    """
    logger.info("Requesting SQL from AI API…")
    try:
        result = _call_ai_api(prompt)
        logger.debug("AI SQL response (raw): %s", result[:300])
        return result
    except requests.exceptions.Timeout:
        raise TimeoutError(
            f"AI API did not respond within {settings.REQUEST_TIMEOUT}s (SQL generation)."
        )
    except requests.exceptions.HTTPError as exc:
        raise RuntimeError(f"AI API returned HTTP {exc.response.status_code}: {exc}")
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"AI API request failed: {exc}")


def generate_explanation(prompt: str) -> str:
    """
    Send an explanation prompt to the AI API and return the natural-language answer.
    """
    logger.info("Requesting explanation from AI API…")
    try:
        result = _call_ai_api(prompt)
        logger.debug("AI explanation response (raw): %s", result[:300])
        return result
    except requests.exceptions.Timeout:
        raise TimeoutError(
            f"AI API did not respond within {settings.REQUEST_TIMEOUT}s (explanation)."
        )
    except requests.exceptions.HTTPError as exc:
        raise RuntimeError(f"AI API returned HTTP {exc.response.status_code}: {exc}")
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"AI API request failed: {exc}")
