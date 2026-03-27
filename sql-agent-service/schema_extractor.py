"""
schema_extractor.py - Extract table/column/FK metadata from PostgreSQL
and format it into a compact schema string used in prompts.
Schema is cached in memory and refreshed on demand.
"""
import logging
from dataclasses import dataclass, field
from typing import Optional

from db import get_conn

logger = logging.getLogger(__name__)

# ── Data classes ──────────────────────────────────────────────────────────────

@dataclass
class ColumnInfo:
    name: str
    data_type: str
    nullable: bool
    is_primary_key: bool = False


@dataclass
class ForeignKey:
    column: str
    references_table: str
    references_column: str


@dataclass
class TableInfo:
    name: str
    columns: list[ColumnInfo] = field(default_factory=list)
    foreign_keys: list[ForeignKey] = field(default_factory=list)


# ── Module-level cache ────────────────────────────────────────────────────────

_schema_cache: Optional[str] = None
_tables_cache: Optional[list[TableInfo]] = None


# ── Extraction queries ────────────────────────────────────────────────────────

_COLUMNS_SQL = """
SELECT
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS is_primary_key
FROM information_schema.columns c
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku
        ON tc.constraint_name = ku.constraint_name
        AND tc.table_schema = ku.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE c.table_schema = 'public'
  AND c.table_name NOT LIKE 'pg_%'
ORDER BY c.table_name, c.ordinal_position;
"""

_FK_SQL = """
SELECT
    kcu.table_name,
    kcu.column_name,
    ccu.table_name  AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
"""


# ── Public API ────────────────────────────────────────────────────────────────

def extract_schema() -> list[TableInfo]:
    """Pull schema metadata from the live database."""
    tables: dict[str, TableInfo] = {}

    with get_conn() as conn:
        with conn.cursor() as cur:
            # 1. Columns
            cur.execute(_COLUMNS_SQL)
            for row in cur.fetchall():
                tname, cname, dtype, nullable, is_pk = row
                if tname not in tables:
                    tables[tname] = TableInfo(name=tname)
                tables[tname].columns.append(
                    ColumnInfo(
                        name=cname,
                        data_type=dtype,
                        nullable=(nullable == "YES"),
                        is_primary_key=bool(is_pk),
                    )
                )

            # 2. Foreign keys
            cur.execute(_FK_SQL)
            for row in cur.fetchall():
                tname, col, ref_table, ref_col = row
                if tname in tables:
                    tables[tname].foreign_keys.append(
                        ForeignKey(
                            column=col,
                            references_table=ref_table,
                            references_column=ref_col,
                        )
                    )

    result = list(tables.values())
    logger.info("Schema extracted: %d tables", len(result))
    return result


def format_schema_text(tables: list[TableInfo]) -> str:
    """Render schema as a compact text block for inclusion in prompts."""
    lines: list[str] = ["Database Schema (PostgreSQL):", ""]

    for table in tables:
        lines.append(f"Table: {table.name}")

        col_parts = []
        for col in table.columns:
            pk_marker = " [PK]" if col.is_primary_key else ""
            null_marker = "" if col.nullable else " NOT NULL"
            col_parts.append(f"  - {col.name}: {col.data_type}{pk_marker}{null_marker}")
        lines.extend(col_parts)

        if table.foreign_keys:
            lines.append("  Foreign Keys:")
            for fk in table.foreign_keys:
                lines.append(
                    f"    {fk.column} → {fk.references_table}.{fk.references_column}"
                )

        lines.append("")  # blank line between tables

    return "\n".join(lines)


def refresh_schema() -> str:
    """Force a re-extract and update the in-memory cache. Returns formatted text."""
    global _schema_cache, _tables_cache
    _tables_cache = extract_schema()
    _schema_cache = format_schema_text(_tables_cache)
    logger.info("Schema cache refreshed.")
    return _schema_cache


def get_schema_text() -> str:
    """Return cached schema text, extracting it first if not yet cached."""
    global _schema_cache
    if _schema_cache is None:
        refresh_schema()
    return _schema_cache  # type: ignore[return-value]


def get_tables() -> list[TableInfo]:
    """Return cached table list."""
    global _tables_cache
    if _tables_cache is None:
        refresh_schema()
    return _tables_cache  # type: ignore[return-value]
