"""Profile endpoints."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, ProfileServiceDep
from app.schemas.profile import ProfileRead, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileRead, summary="Get the local profile")
def read_profile(user: CurrentUser) -> ProfileRead:
    """Return the local profile, creating it on first call."""
    return ProfileRead.from_model(user)


@router.patch("", response_model=ProfileRead, summary="Update the local profile")
def update_profile(
    payload: ProfileUpdate, user: CurrentUser, profiles: ProfileServiceDep
) -> ProfileRead:
    """Update the display name or timezone. Omitted fields are unchanged."""
    updated = profiles.update(user, payload.to_column_updates())
    return ProfileRead.from_model(updated)


@router.delete(
    "/data",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete the profile and all data it owns",
)
def delete_all_data(user: CurrentUser, profiles: ProfileServiceDep) -> None:
    """Hard-delete the profile and every expense, check-in and event it owns.

    Deletion is real and cascading — there is no soft-delete flag on user data
    (05_Database_Design.md §8). The next request creates a fresh empty profile.
    """
    profiles.delete_all_data(user)
