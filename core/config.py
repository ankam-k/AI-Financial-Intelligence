"""Application configuration.

Settings are read from the environment with the ``AFI_`` prefix, falling back
to values that let a fresh clone run with no setup at all — a deliberate MVP
choice, since Sprint 1 has no secrets to protect and a zero-config start is
worth more than ceremony.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

#: Repository root — this file is `<root>/backend/app/core/config.py`.
_REPO_ROOT = Path(__file__).resolve().parents[3]

#: The default database, as an **absolute** path.
#:
#: A relative `sqlite:///./…` resolves against the working directory, so
#: running the server from the repository root and the seeder from `backend/`
#: silently creates two separate databases — the seeder reports 629 expenses
#: and the dashboard shows none. Anchoring it means every command touches the
#: same file whatever directory it was typed in.
DEFAULT_DATABASE_URL = f"sqlite:///{(_REPO_ROOT / 'financial_intelligence.db').as_posix()}"


class Settings(BaseSettings):
    """Runtime configuration for the API."""

    model_config = SettingsConfigDict(
        env_prefix="AFI_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AI Financial Intelligence API"

    # SQLite for V1 (ADR-014). PostgreSQL is a URL change plus a migration
    # pass, not a rewrite — nothing below depends on SQLite specifics except
    # the foreign-key pragma in `database.py`.
    database_url: str = DEFAULT_DATABASE_URL

    # Emit SQL to stdout. Useful when demoing what the ORM actually does.
    database_echo: bool = False

    # SRS-5.6/5.7: how far back a check-in may be backfilled. Enforced in the
    # service layer against the injected clock, never as a DB constraint —
    # "today" is not a deterministic value for a CHECK.
    checkin_backfill_days: int = 30

    # CORS origins for the React client. Empty by default.
    cors_origins: list[str] = []

    # ── Narration (Sprint 3) ────────────────────────────────────────────────
    # Default "none": a fresh clone serves template narration with no model
    # installed. Set to "ollama" to enable generated prose (ADR-008).
    llm_provider: str = "none"
    llm_model: str = "qwen2.5:7b-instruct"
    llm_base_url: str = "http://127.0.0.1:11434"

    # A 7B model on CPU can take tens of seconds for a few hundred tokens.
    # Exceeding this is not an error — it falls back to a template.
    llm_timeout_seconds: float = 60.0

    # Low but non-zero. Sampling affects prose only; every claim and every
    # number is fixed before generation begins (07_AI_Architecture §7).
    llm_temperature: float = 0.2

    # Narration is sequential and slow. A full analysis run can produce a
    # dozen insights; narrating all of them would make one request take
    # minutes, so the highest-tier ones are narrated first and the rest are
    # returned with template prose.
    llm_max_generated: int = 5

    # ── Demo mode (Sprint 6) ────────────────────────────────────────────────
    # Permits the destructive seed/clear endpoints. On by default because the
    # V1 deployment is a single local profile with no authentication and no
    # network exposure (ADR-014) — but it is a switch rather than an
    # assumption, and it is the first thing to turn off if either changes.
    demo_mode: bool = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the process-wide settings, constructed once."""
    return Settings()


settings = get_settings()
