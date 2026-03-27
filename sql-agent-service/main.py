"""
main.py - FastAPI application entry point.

Endpoints:
  POST /chat            - Natural language → SQL → Result → Explanation
  GET  /health          - Liveness + DB connectivity check
  GET  /schema          - View cached schema
  POST /refresh-schema  - Force schema re-extraction
"""
import logging
import sys
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import settings
from db import close_pool, init_pool, ping_db
from schema_extractor import get_schema_text, get_tables, refresh_schema
from sql_agent import AgentError, run_agent

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise shared resources at startup and clean up at shutdown."""
    logger.info("Starting up IMS SQL Agent…")
    settings.validate()        # Fail fast on missing env vars
    init_pool()                # Warm up DB connection pool
    get_schema_text()          # Pre-cache schema so first request is fast
    logger.info("Startup complete.")
    yield
    logger.info("Shutting down…")
    close_pool()


# ── FastAPI application ────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=(
        "AI-powered SQL Agent for the Inventory Management System. "
        "Converts natural language queries to PostgreSQL, executes them, "
        "and explains results in plain English."
    ),
    lifespan=lifespan,
)

# CORS — allow Spring Boot frontend / React frontend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ─────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        example="Which product generated the highest revenue?",
    )


class ChatResponse(BaseModel):
    question: str
    sql: str
    result: list[dict[str, Any]]
    explanation: str
    row_count: int


class HealthResponse(BaseModel):
    status: str
    db_connected: bool
    version: str


class SchemaResponse(BaseModel):
    table_count: int
    schema_text: str


# ── Exception handler ─────────────────────────────────────────────────────────
@app.exception_handler(AgentError)
async def agent_error_handler(request: Request, exc: AgentError) -> JSONResponse:
    logger.error("AgentError: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post(
    "/chat",
    response_model=ChatResponse,
    summary="Natural language → SQL → Result → Explanation",
    tags=["Agent"],
)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Accepts a natural language question, converts it to SQL using AI,
    executes it against the IMS PostgreSQL database, and returns a
    plain-English explanation of the result.
    """
    logger.info("POST /chat — query=%r", request.query)
    try:
        response = run_agent(request.query)
        return ChatResponse(**response)
    except AgentError:
        raise  # handled by exception_handler above
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Unexpected error in /chat")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {exc}",
        )


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    tags=["Meta"],
)
async def health() -> HealthResponse:
    """Returns service status and live database connectivity."""
    db_ok = ping_db()
    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        db_connected=db_ok,
        version=settings.APP_VERSION,
    )


@app.get(
    "/schema",
    response_model=SchemaResponse,
    summary="View cached database schema",
    tags=["Meta"],
)
async def schema() -> SchemaResponse:
    """Returns the currently cached database schema used for prompt building."""
    tables = get_tables()
    schema_text = get_schema_text()
    return SchemaResponse(
        table_count=len(tables),
        schema_text=schema_text,
    )


@app.post(
    "/refresh-schema",
    response_model=SchemaResponse,
    summary="Force schema re-extraction from the database",
    tags=["Meta"],
)
async def refresh() -> SchemaResponse:
    """
    Forces a fresh schema extraction from the PostgreSQL database.
    Use this after schema migrations or DDL changes.
    """
    logger.info("POST /refresh-schema — forcing cache refresh")
    schema_text = refresh_schema()
    tables = get_tables()
    return SchemaResponse(
        table_count=len(tables),
        schema_text=schema_text,
    )


# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
