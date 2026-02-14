"""
Dependencies - central place for building and injecting services.

Controllers/Routes import from here instead of constructing services or
repositories themselves. Keeps Controllers → Services → Repositories
layer boundaries enforced.
"""

from src.dependencies.dependencies import get_db, get_user_service

__all__ = ["get_db", "get_user_service"]
