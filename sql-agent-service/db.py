"""
db.py - PostgreSQL connection pool management using psycopg2.
Uses a SimpleConnectionPool (thread-safe pool for sync FastAPI workers).
"""
import logging
from contextlib import contextmanager
from typing import Generator

import psycopg2
import psycopg2.pool
import psycopg2.extras

from config import settings

logger = logging.getLogger(__name__)

_pool: psycopg2.pool.SimpleConnectionPool | None = None


def init_pool() -> None:
    """Initialize the connection pool. Called once at application startup."""
    global _pool
    if _pool is not None:
        return

    dsn = (
        f"host={settings.DB_HOST} "
        f"port={settings.DB_PORT} "
        f"dbname={settings.DB_NAME} "
        f"user={settings.DB_USER} "
        f"password={settings.DB_PASSWORD} "
        f"connect_timeout={settings.DB_TIMEOUT} "
        f"options='-c statement_timeout=30000'"   # 30 s query hard limit
    )

    _pool = psycopg2.pool.SimpleConnectionPool(
        minconn=settings.DB_MIN_CONN,
        maxconn=settings.DB_MAX_CONN,
        dsn=dsn,
    )
    logger.info(
        "DB pool initialised  min=%d  max=%d",
        settings.DB_MIN_CONN,
        settings.DB_MAX_CONN,
    )


def close_pool() -> None:
    """Close all connections – called at application shutdown."""
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None
        logger.info("DB pool closed.")


@contextmanager
def get_conn() -> Generator[psycopg2.extensions.connection, None, None]:
    """Context manager that yields a pooled connection and returns it when done."""
    if _pool is None:
        raise RuntimeError("Connection pool has not been initialised. Call init_pool() first.")

    conn = _pool.getconn()
    try:
        # Enforce read-only at the session level as an extra safety net.
        conn.set_session(readonly=True, autocommit=True)
        yield conn
    except Exception:
        # psycopg2 connections don't need explicit rollback in readonly mode,
        # but reset any dirty state just in case.
        try:
            conn.reset()
        except Exception:
            pass
        raise
    finally:
        _pool.putconn(conn)


def execute_query(sql: str) -> list[dict]:
    """
    Execute a SELECT query and return results as a list of dicts.
    Limits rows to MAX_RESULT_ROWS.
    """
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchmany(settings.MAX_RESULT_ROWS)
            return [dict(row) for row in rows]


def ping_db() -> bool:
    """Simple connectivity check used by /health endpoint."""
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return True
    except Exception as exc:
        logger.error("DB ping failed: %s", exc)
        return False
