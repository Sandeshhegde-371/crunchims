"""
validator.py - SQL safety layer.
Strips markdown formatting and ensures only SELECT queries pass through.
"""
import logging
import re

logger = logging.getLogger(__name__)

# Dangerous statement-level keywords that must never appear.
_BLOCKED_KEYWORDS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE"
    r"|EXECUTE|EXEC|CALL|COPY|MERGE|REPLACE|LOAD)\b",
    re.IGNORECASE,
)

# Matches markdown code fences like ```sql … ``` or ``` … ```
_CODE_FENCE = re.compile(r"```[\w]*\n?", re.IGNORECASE)


def clean_sql(raw: str) -> str:
    """
    Remove markdown code fences and strip leading/trailing whitespace.
    Also trims any trailing semicolons for consistency (we add them safely).
    """
    # Remove code fences
    cleaned = _CODE_FENCE.sub("", raw)
    cleaned = cleaned.replace("```", "")

    # Strip whitespace
    cleaned = cleaned.strip()

    # Some models add "SQL:" prefix
    if cleaned.upper().startswith("SQL:"):
        cleaned = cleaned[4:].strip()

    # Collapse multiple blank lines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    return cleaned


def validate_sql(sql: str) -> str:
    """
    Validate and sanitise a SQL string.

    - Cleans markdown / surrounding text.
    - Ensures the first real statement is SELECT.
    - Blocks any forbidden keywords.

    Returns the cleaned SQL string.
    Raises ValueError with a human-readable message on any violation.
    """
    if not sql or not sql.strip():
        raise ValueError("AI returned an empty response.")

    cleaned = clean_sql(sql)

    if not cleaned:
        raise ValueError("SQL is empty after cleaning.")

    # Check for blocked keywords
    match = _BLOCKED_KEYWORDS.search(cleaned)
    if match:
        raise ValueError(
            f"Blocked SQL keyword detected: '{match.group().upper()}'. "
            "Only SELECT queries are permitted."
        )

    # Must start with SELECT (ignoring comments)
    first_token = _first_token(cleaned)
    if first_token.upper() != "SELECT":
        raise ValueError(
            f"SQL must be a SELECT statement — got '{first_token}' instead."
        )

    logger.debug("SQL validated successfully.")
    return cleaned


def _first_token(sql: str) -> str:
    """Extract the first non-comment SQL keyword."""
    # Remove single-line comments
    no_comments = re.sub(r"--[^\n]*", "", sql)
    # Remove block comments
    no_comments = re.sub(r"/\*.*?\*/", "", no_comments, flags=re.DOTALL)
    tokens = no_comments.strip().split()
    return tokens[0] if tokens else ""
