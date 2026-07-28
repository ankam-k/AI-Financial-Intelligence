"""Profile schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.user import User
from app.schemas.common import DisplayName, TimezoneName

#: Columns that are NOT NULL. An update may omit them; it may not null them.
_NON_NULLABLE = {"display_name", "timezone"}


class ProfileUpdate(BaseModel):
    """Partial update. Omitted fields are left untouched."""

    model_config = ConfigDict(extra="forbid")

    display_name: DisplayName | None = None
    timezone: TimezoneName | None = None
    #: Sent as null to clear the budget, which suppresses budget insights.
    monthly_budget_paise: int | None = Field(
        default=None, gt=0, description="Monthly budget in paise. Null clears it."
    )

    @model_validator(mode="after")
    def _reject_explicit_nulls(self) -> "ProfileUpdate":
        for name in self.model_fields_set & _NON_NULLABLE:
            if getattr(self, name) is None:
                raise ValueError(f"'{name}' cannot be set to null")
        return self

    def to_column_updates(self) -> dict[str, object]:
        """Return only the fields the client actually sent.

        ``exclude_unset`` rather than ``exclude_none``: clearing the budget
        (sent as null) and leaving it alone (not sent) are different requests,
        and ``exclude_none`` cannot tell them apart.
        """
        return self.model_dump(exclude_unset=True)


class ProfileRead(BaseModel):
    """The local profile as returned to the client."""

    id: str
    display_name: str
    timezone: str
    currency: str
    monthly_budget_paise: int | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, user: User) -> "ProfileRead":
        return cls(
            id=user.id,
            display_name=user.display_name,
            timezone=user.timezone,
            currency=user.currency,
            monthly_budget_paise=user.monthly_budget_paise,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
