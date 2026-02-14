"""
Central dependency wiring.

This module is the single place that knows how to build Services and
Repositories. Routes/Controllers depend on get_*_service only; they
must not import or construct Repositories directly.
"""

from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session

from src.repositories.user_repository import UserRepository
from src.services.user_service import UserService


def get_db() -> Generator[Session, None, None]:
    """
    Provide a database session per request.
    Placeholder: replace with real session (e.g. SessionLocal) in production.
    """
    # In real implementation: yield SessionLocal() with try/finally close
    yield None  # type: ignore[misc]


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """
    Provide a UserService instance per request.
    Builds Repository and Service from the request-scoped db session.
    """
    user_repository = UserRepository(db)
    return UserService(user_repository)
