"""Database engine and session lifecycle.

SQLite for V1 (ADR-014), with two non-obvious details that matter:

1. **Foreign keys are OFF by default in SQLite.** Without the pragma below,
   every ``ON DELETE CASCADE`` in the schema is silently inert and deleting a
   profile would leave orphaned expenses behind. The design docs treat cascade
   as a correctness property (05_Database_Design.md §8), so it is enabled per
   connection rather than trusted.

2. **In-memory databases need ``StaticPool``.** Each new connection to
   ``sqlite://`` gets its own blank database; pooling one connection is what
   makes an in-memory test database usable across requests.
"""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings


def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")


def _is_memory_sqlite(url: str) -> bool:
    return _is_sqlite(url) and (":memory:" in url or url in {"sqlite://", "sqlite:///"})


def build_engine(url: str, *, echo: bool = False) -> Engine:
    """Create an engine configured for the given URL."""
    kwargs: dict[str, object] = {"echo": echo, "future": True}

    if _is_sqlite(url):
        # FastAPI serves sync endpoints from a thread pool, so a connection
        # can legitimately be used from a thread other than the one that
        # created it. SQLAlchemy's pool still serialises access.
        kwargs["connect_args"] = {"check_same_thread": False}
        if _is_memory_sqlite(url):
            kwargs["poolclass"] = StaticPool

    engine = create_engine(url, **kwargs)

    if _is_sqlite(url):
        event.listen(engine, "connect", _enable_sqlite_foreign_keys)

    return engine


def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
    """Turn on foreign-key enforcement for every SQLite connection."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


engine = build_engine(settings.database_url, echo=settings.database_echo)

SessionFactory = sessionmaker(
    bind=engine,
    autoflush=False,
    # Responses are serialised after commit; without this every attribute
    # access would trigger a refresh query against a closed session.
    expire_on_commit=False,
)


def get_session() -> Iterator[Session]:
    """FastAPI dependency yielding a request-scoped session.

    Tests override this to bind a per-test engine.
    """
    with SessionFactory() as session:
        yield session
