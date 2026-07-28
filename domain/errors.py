"""Domain errors.

Services raise these; they know nothing about HTTP. A single exception handler
in the API layer maps them to status codes, which keeps the service layer
callable from a CLI, a test, or a future background job without dragging
FastAPI along.
"""

from __future__ import annotations


class DomainError(Exception):
    """Base class for expected, user-correctable failures."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(DomainError):
    """The requested resource does not exist for this user."""


class ConflictError(DomainError):
    """The request collides with an existing resource or invariant."""


class ValidationError(DomainError):
    """The request is well-formed but violates a business rule."""
