"""Shared test fixtures.

Each test gets its own in-memory SQLite database and a **frozen clock**. The
frozen clock is not a nicety: the check-in backfill window is defined relative
to "today", so a test asserting the boundary would otherwise pass all day and
fail at midnight.
"""

from __future__ import annotations

import os
from collections.abc import Callable, Iterator
from datetime import date, datetime, timedelta

import pytest

# Point the application at an in-memory database *before* importing it, so
# module-level engine construction and the startup `create_all` never touch a
# file on disk.
os.environ.setdefault("AFI_DATABASE_URL", "sqlite://")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from app.api.deps import get_clock  # noqa: E402
from app.core.clock import IST, FixedClock  # noqa: E402
from app.core.database import build_engine, get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402

#: The instant every test runs at. A Tuesday, so weekday-sensitive assertions
#: added later have a stable reference.
FROZEN_NOW = datetime(2026, 7, 28, 10, 30, tzinfo=IST)
TODAY: date = FROZEN_NOW.date()


@pytest.fixture
def clock() -> FixedClock:
    """A clock frozen at :data:`FROZEN_NOW`."""
    return FixedClock(FROZEN_NOW)


@pytest.fixture
def today() -> date:
    """The frozen clock's date. Exposed as a fixture rather than imported,
    because a conftest is not reliably importable as a module."""
    return TODAY


@pytest.fixture
def days_ago() -> Callable[[int], str]:
    """Return an ISO date N days before the frozen today."""

    def _days_ago(n: int) -> str:
        return (TODAY - timedelta(days=n)).isoformat()

    return _days_ago


@pytest.fixture
def session_factory() -> Iterator[sessionmaker[Session]]:
    """A fresh in-memory database with the full schema, per test."""
    engine = build_engine("sqlite://")
    Base.metadata.create_all(bind=engine)
    yield sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db(session_factory: sessionmaker[Session]) -> Iterator[Session]:
    """A session against the per-test database, for direct assertions."""
    with session_factory() as session:
        yield session


@pytest.fixture
def client(
    session_factory: sessionmaker[Session], clock: FixedClock
) -> Iterator[TestClient]:
    """An API client wired to the per-test database and frozen clock."""

    def override_session() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_clock] = lambda: clock

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def profile_id(client: TestClient) -> str:
    """Ensure the local profile exists and return its id."""
    return client.get("/api/profile").json()["id"]
