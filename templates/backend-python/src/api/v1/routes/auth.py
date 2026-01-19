"""
Authentication routes - HTTP request/response handling only.

This module contains ONLY HTTP handling.
NO business logic (use Service), NO database queries (use Repository).
"""

from fastapi import APIRouter

# Create router
router = APIRouter()


@router.post("/login")
async def login():
    """
    Login endpoint - placeholder.
    
    This route should delegate to AuthService for business logic.
    """
    # TODO: Implement login logic using AuthService
    pass


@router.post("/register")
async def register():
    """
    Register endpoint - placeholder.
    
    This route should delegate to AuthService for business logic.
    """
    # TODO: Implement register logic using AuthService
    pass
