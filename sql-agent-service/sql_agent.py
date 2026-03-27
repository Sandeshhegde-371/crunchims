"""
sql_agent.py - Core orchestration logic.

Flow:
  1. Build SQL-generation prompt  (prompt_builder)
  2. Call AI API                  (ai_client)
  3. Validate SQL                 (validator)
  4. Execute query                (db)
  5. On DB error → retry once     (prompt_builder + ai_client + validator)
  6. Build explanation prompt     (explanation)
  7. Call AI API for explanation  (ai_client)
  8. Return structured result
"""
import logging
from typing import Any

import psycopg2

from ai_client import generate_explanation, generate_sql
from config import settings
from db import execute_query
from explanation import build_explanation_prompt, post_process_explanation
from prompt_builder import build_retry_prompt, build_sql_prompt
from validator import validate_sql

logger = logging.getLogger(__name__)


class AgentError(Exception):
    """Raised when the agent cannot produce a safe, valid result."""


# ── Main entry point ──────────────────────────────────────────────────────────

def run_agent(question: str) -> dict[str, Any]:
    """
    Execute the full SQL-agent pipeline and return a structured result dict.

    Returns:
        {
            "question": str,
            "sql": str,
            "result": list[dict],
            "explanation": str,
            "row_count": int,
        }

    Raises:
        AgentError: on unrecoverable failures (bad validation, repeated DB error, etc.)
    """
    logger.info("Agent started for question: %s", question)

    # ── Step 1: Build prompt ──────────────────────────────────────────────────
    prompt = build_sql_prompt(question)

    # ── Step 2: Generate SQL ──────────────────────────────────────────────────
    raw_sql = generate_sql(prompt)

    # ── Step 3: Validate ──────────────────────────────────────────────────────
    try:
        sql = validate_sql(raw_sql)
    except ValueError as exc:
        raise AgentError(f"SQL validation failed: {exc}") from exc

    # ── Step 4: Execute (with one retry on DB error) ──────────────────────────
    result = _execute_with_retry(question, sql)

    # ── Step 5: Generate explanation ─────────────────────────────────────────
    explanation = _generate_explanation_safe(question, sql, result)

    return {
        "question": question,
        "sql": sql,
        "result": result,
        "explanation": explanation,
        "row_count": len(result),
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _execute_with_retry(
    question: str, sql: str
) -> list[dict[str, Any]]:
    """
    Try to execute *sql*. If PostgreSQL raises an error, ask the AI to fix the
    query and retry once. Raises AgentError if both attempts fail.
    """
    try:
        logger.info("Executing SQL: %s", sql[:200])
        return execute_query(sql)
    except (psycopg2.Error, Exception) as first_error:
        logger.warning("First SQL attempt failed: %s", first_error)

        if settings.MAX_RETRIES < 1:
            raise AgentError(f"Query execution failed: {first_error}") from first_error

        # ── Retry: ask AI to fix the query ────────────────────────────────────
        logger.info("Retrying with error-correction prompt…")
        retry_prompt = build_retry_prompt(question, sql, str(first_error))

        try:
            raw_retry_sql = generate_sql(retry_prompt)
            retry_sql = validate_sql(raw_retry_sql)
        except (ValueError, Exception) as validation_err:
            raise AgentError(
                f"Retry SQL validation failed: {validation_err}"
            ) from validation_err

        try:
            logger.info("Executing corrected SQL: %s", retry_sql[:200])
            return execute_query(retry_sql)
        except (psycopg2.Error, Exception) as second_error:
            raise AgentError(
                f"Query failed after retry.\n"
                f"Original error: {first_error}\n"
                f"Retry error: {second_error}"
            ) from second_error


def _generate_explanation_safe(
    question: str, sql: str, result: list[dict[str, Any]]
) -> str:
    """
    Generate a natural-language explanation. If the AI call fails, return a
    graceful fallback rather than crashing the whole response.
    """
    try:
        exp_prompt = build_explanation_prompt(question, sql, result)
        raw_explanation = generate_explanation(exp_prompt)
        return post_process_explanation(raw_explanation)
    except Exception as exc:
        logger.warning("Explanation generation failed: %s", exc)
        if not result:
            return "No data found for this query."
        return f"{len(result)} row(s) returned. (Explanation unavailable.)"
