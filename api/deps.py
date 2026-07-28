"""FastAPI dependencies.

Everything a router needs is assembled here and injected, so a test can swap
the database or freeze the clock without touching a single route.

``get_current_user`` is the seam where authentication will eventually go. In
V1 it returns the local profile; the day a login exists, it starts reading a
token instead — and no router, service, or query changes, because they were
already written against "the current user" rather than "the only user."
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.clock import Clock, SystemClock
from app.core.config import settings
from app.core.database import get_session
from app.chat.service import ChatEngine
from app.llm.base import LLMClient
from app.llm.factory import build_llm_client
from app.models.user import User
from app.narration.renderer import NarrationRenderer
from app.services.analysis_service import AnalysisService
from app.services.chat_service import ChatService
from app.services.check_in_service import CheckInService
from app.services.expense_service import ExpenseService
from app.services.life_event_service import LifeEventService
from app.services.narration_service import NarrationService
from app.services.profile_service import ProfileService


def get_clock() -> Clock:
    """Return the application clock. Overridden in tests with a fixed clock."""
    return SystemClock()


SessionDep = Annotated[Session, Depends(get_session)]
ClockDep = Annotated[Clock, Depends(get_clock)]


def get_profile_service(session: SessionDep) -> ProfileService:
    return ProfileService(session)


ProfileServiceDep = Annotated[ProfileService, Depends(get_profile_service)]


def get_current_user(profiles: ProfileServiceDep) -> User:
    """Resolve the acting user.

    V1: the single local profile, created on first request.
    """
    return profiles.get_or_create()


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_expense_service(session: SessionDep, clock: ClockDep) -> ExpenseService:
    return ExpenseService(session, clock)


def get_check_in_service(session: SessionDep, clock: ClockDep) -> CheckInService:
    return CheckInService(session, clock, backfill_days=settings.checkin_backfill_days)


def get_life_event_service(session: SessionDep, clock: ClockDep) -> LifeEventService:
    return LifeEventService(session, clock)


def get_analysis_service(session: SessionDep, clock: ClockDep) -> AnalysisService:
    return AnalysisService(session, clock)


ExpenseServiceDep = Annotated[ExpenseService, Depends(get_expense_service)]
CheckInServiceDep = Annotated[CheckInService, Depends(get_check_in_service)]
LifeEventServiceDep = Annotated[LifeEventService, Depends(get_life_event_service)]
AnalysisServiceDep = Annotated[AnalysisService, Depends(get_analysis_service)]


def get_llm_client() -> LLMClient:
    """The configured model client. Overridden in tests with a fake.

    Constructed per request rather than once at import: the adapters hold no
    connection, so there is nothing to reuse, and a per-request client keeps a
    configuration change one restart away rather than one deploy away.
    """
    return build_llm_client(settings)


LLMClientDep = Annotated[LLMClient, Depends(get_llm_client)]


def get_narration_service(
    analysis: AnalysisServiceDep, client: LLMClientDep
) -> NarrationService:
    return NarrationService(
        analysis, NarrationRenderer(client, max_generated=settings.llm_max_generated)
    )


NarrationServiceDep = Annotated[NarrationService, Depends(get_narration_service)]


def get_chat_service(analysis: AnalysisServiceDep, client: LLMClientDep) -> ChatService:
    return ChatService(
        analysis,
        NarrationRenderer(client, max_generated=settings.llm_max_generated),
        ChatEngine(client),
    )


ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
