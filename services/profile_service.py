"""Local profile management."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class ProfileService:
    """Reads and updates the single local profile.

    V1 has no sign-up flow. The profile is created on first access so a fresh
    clone is usable immediately — the alternative, a mandatory onboarding
    call before any other endpoint works, buys nothing while there is exactly
    one user.
    """

    DEFAULT_DISPLAY_NAME = "Local User"

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_or_create(self) -> User:
        """Return the local profile, creating it on first call."""
        user = self._session.scalars(select(User).order_by(User.created_at)).first()
        if user is not None:
            return user

        user = User(display_name=self.DEFAULT_DISPLAY_NAME)
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user

    def update(self, user: User, updates: dict[str, object]) -> User:
        """Apply a partial update to the profile."""
        for field, value in updates.items():
            setattr(user, field, value)
        self._session.commit()
        self._session.refresh(user)
        return user

    def delete_all_data(self, user: User) -> None:
        """Delete the profile and everything it owns.

        Relies on ``ON DELETE CASCADE`` at the database level rather than
        ORM-side cascades, so the guarantee holds for any writer — including
        a direct SQL session (05_Database_Design.md §8).
        """
        self._session.delete(user)
        self._session.commit()
