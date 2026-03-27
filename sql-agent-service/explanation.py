"""
explanation.py - Build the explanation prompt and post-process the AI response.
"""
import json
import logging
from typing import Any

from config import settings

logger = logging.getLogger(__name__)


def build_explanation_prompt(question: str, sql: str, result: list[dict[str, Any]]) -> str:
    """
    Construct the natural-language explanation prompt sent to the AI API.
    Truncates result to avoid overwhelming the AI with huge payloads.
    """
    # Truncate rows if result is large
    truncated = result[: settings.MAX_AI_EXPLAIN_ROWS]
    truncation_note = ""
    if len(result) > settings.MAX_AI_EXPLAIN_ROWS:
        truncation_note = (
            f"\n(Note: Only the first {settings.MAX_AI_EXPLAIN_ROWS} of "
            f"{len(result)} rows are shown.)"
        )

    result_str = json.dumps(truncated, indent=2, default=str)

    prompt = f"""You are a data analyst assistant.

Convert the SQL query result into a clear, concise natural language answer for a business user.

User Question:
{question}

SQL Query:
{sql}

Result:
{result_str}{truncation_note}

Instructions:
- Answer in simple, plain English.
- Be concise and clear — avoid verbosity.
- Include key numbers and metrics.
- If there are multiple rows, format them as bullet points.
- If the result is empty or contains no meaningful rows, say "No data found for this query."
- Do NOT mention SQL, database, or any technical details.
- Do NOT use phrases like "The query returned…" or "Based on the SQL…".
- Start your answer directly, e.g. "The top-selling product is…" or "Total revenue today is…"

Examples:
Input: [{{"name": "Oreo", "total_sold": 320}}]
Output: Oreo is the top-selling product with 320 units sold.

Input: [{{"todays_revenue": 45230.50}}]
Output: Today's total revenue is ₹45,230.50.

Input: []
Output: No data found for this query.

Answer:"""

    return prompt


def post_process_explanation(raw: str) -> str:
    """
    Clean up the AI explanation response.
    """
    if not raw:
        return "No explanation available."

    text = raw.strip()

    # Remove any accidental markdown headers
    text = text.lstrip("#").strip()

    # Remove leading "Answer:" if model echoed it
    if text.lower().startswith("answer:"):
        text = text[7:].strip()

    return text
