"""
config.py - Centralized configuration using environment variables.
All settings are loaded from .env via python-dotenv.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # ── Database ──────────────────────────────────────────────────────────────
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "inventory")
    DB_USER: str = os.getenv("DB_USER", "ims_readonly")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    # Connection pool settings
    DB_MIN_CONN: int = int(os.getenv("DB_MIN_CONN", "1"))
    DB_MAX_CONN: int = int(os.getenv("DB_MAX_CONN", "10"))
    DB_TIMEOUT: int = int(os.getenv("DB_TIMEOUT", "10"))         # seconds

    # ── External AI API ───────────────────────────────────────────────────────
    AI_API_ENDPOINT: str = os.getenv("AI_API_ENDPOINT", "")
    AI_API_TOKEN: str = os.getenv("AI_API_TOKEN", "")
    AI_USERNAME: str = os.getenv("AI_USERNAME", "")
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))

    # ── SQL Agent behaviour ───────────────────────────────────────────────────
    MAX_RESULT_ROWS: int = int(os.getenv("MAX_RESULT_ROWS", "50"))
    # Truncate result rows sent to AI for explanation (avoid huge payloads)
    MAX_AI_EXPLAIN_ROWS: int = int(os.getenv("MAX_AI_EXPLAIN_ROWS", "20"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "1"))

    # ── App ───────────────────────────────────────────────────────────────────
    APP_TITLE: str = "IMS SQL Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    def validate(self) -> None:
        """Raise at startup if critical env vars are missing."""
        missing = []
        if not self.DB_HOST:
            missing.append("DB_HOST")
        if not self.DB_NAME:
            missing.append("DB_NAME")
        if not self.DB_USER:
            missing.append("DB_USER")
        if not self.DB_PASSWORD:
            missing.append("DB_PASSWORD")
        if not self.AI_API_ENDPOINT:
            missing.append("AI_API_ENDPOINT")
        if not self.AI_API_TOKEN:
            missing.append("AI_API_TOKEN")
        if missing:
            raise EnvironmentError(
                f"Missing required environment variables: {', '.join(missing)}"
            )


settings = Settings()
