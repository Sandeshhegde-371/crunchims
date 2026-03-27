"""
prompt_builder.py - Build AI prompts for SQL generation.
Includes schema, rules, and few-shot examples to maximise accuracy.
"""
from schema_extractor import get_schema_text

# ── Few-shot examples baked into the SQL generation prompt ───────────────────

_FEW_SHOT_EXAMPLES = """
-- Example 1 --
Question: What is today's revenue?
SQL:
SELECT SUM(total_amount) AS todays_revenue
FROM orders
WHERE order_date = CURRENT_DATE;

-- Example 2 --
Question: What is the top selling product?
SQL:
SELECT p.name, SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.name
ORDER BY total_sold DESC
LIMIT 1;

-- Example 3 --
Question: Which products are low in stock?
SQL:
SELECT name, stock
FROM products
ORDER BY stock ASC
LIMIT 5;

-- Example 4 --
Question: How many orders were placed this month?
SQL:
SELECT COUNT(*) AS order_count
FROM orders
WHERE DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE);

-- Example 5 --
Question: Who are the top 5 customers by total spend?
SQL:
SELECT c.name, SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 5;

-- Example 6 --
Question: What is the total inventory value?
SQL:
SELECT SUM(p.price * p.stock) AS inventory_value
FROM products p;
"""

_SQL_RULES = """
Rules (MUST follow — no exceptions):
1. Output ONLY valid PostgreSQL SELECT SQL. Nothing else.
2. ONLY SELECT queries are permitted. Never use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, GRANT, REVOKE, or any DDL/DML.
3. Always use proper JOINs based on the foreign keys shown in the schema.
4. Do NOT hallucinate tables or columns that are not in the schema.
5. Add LIMIT 50 automatically if the query could return many rows and no LIMIT is present.
6. Do NOT wrap the SQL in markdown code fences or backticks.
7. Do NOT add any explanatory text — output SQL only.
8. Use aliases for readability (e.g. AS todays_revenue).
9. For date filtering use CURRENT_DATE or NOW() rather than hard-coded dates.
10. Double-quote identifiers that are reserved words if needed.
"""


def build_sql_prompt(question: str) -> str:
    """
    Assemble the full prompt sent to the AI API for SQL generation.
    """
    schema_text = get_schema_text()

    prompt = f"""You are an expert PostgreSQL data analyst working with an Inventory Management System (IMS).

{schema_text}

{_SQL_RULES}

Few-Shot Examples:
{_FEW_SHOT_EXAMPLES}

Now, generate the SQL for the following question.

Question: {question}
SQL:"""

    return prompt


def build_retry_prompt(question: str, failed_sql: str, error_message: str) -> str:
    """
    Prompt used when the first SQL attempt raised a database error.
    Asks the AI to correct the query.
    """
    schema_text = get_schema_text()

    prompt = f"""You are an expert PostgreSQL data analyst working with an Inventory Management System (IMS).

{schema_text}

{_SQL_RULES}

The previous SQL query failed. Correct it.

Original Question: {question}

Failed SQL:
{failed_sql}

Database Error:
{error_message}

Instructions:
- Fix the SQL so it runs without errors.
- Output ONLY the corrected SQL — no explanations, no markdown.

Corrected SQL:"""

    return prompt
