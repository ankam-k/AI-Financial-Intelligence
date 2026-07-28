"""The local user profile.

V1 has no authentication (ADR-014): the deployment is a single person running
the app on their own machine. But every owned row still carries ``user_id``
with a cascading foreign key, exactly as 05_Database_Design.md §1 requires.

That is not ceremony. Ownership scoping is the kind of thing that is nearly
free to build in and expensive to retrofit — every query, every service
signature, and every test would need revisiting. Adding real authentication
later means adding a login endpoint and changing one dependency, not
rewriting the data access layer.
"""

from __future__ import annotations

from sqlalchemy import BigInteger, CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, IdentifiedEntity


class User(IdentifiedEntity, Base):
    """A profile. In V1 there is exactly one, created on first request."""

    __tablename__ = "user"

    display_name: Mapped[str] = mapped_column(String(120), nullable=False, default="Local User")

    #: IANA timezone name. Fixed to IST in V1 (ADR-003) but stored as a column
    #: rather than a constant, so a future user outside India is a data change.
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Kolkata")

    #: Reporting currency. A column, never hardcoded (SRS-3.14, PDR-025).
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")

    #: Monthly spending budget in paise. **NULL means the user has not set one**
    #: — budget insights are then suppressed entirely rather than computed
    #: against a figure the engine guessed from average spend. Added in Sprint 2
    #: because budget utilisation has nothing to measure without it.
    monthly_budget_paise: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "monthly_budget_paise IS NULL OR monthly_budget_paise > 0",
            name="ck_user_budget_positive",
        ),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<User id={self.id!r} display_name={self.display_name!r}>"
