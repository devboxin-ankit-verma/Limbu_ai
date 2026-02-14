"""
User routes - HTTP request/response handling only.

This module contains ONLY HTTP handling.
NO business logic (use Service), NO database queries (use Repository).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from src.services.user_service import UserService, UserNotFoundError, UserAlreadyExistsError
from src.dependencies.dependencies import get_user_service
from src.constants.api import StatusCodes
from src.constants.errors import ErrorMessages

# Create router
router = APIRouter()


@router.get("/users", response_model=List[dict], status_code=StatusCodes.OK)
async def get_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends(get_user_service)
):
    """
    Get all users.
    
    This route delegates ALL business logic to the service.
    It only handles HTTP request/response.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        service: UserService instance (injected via dependency)
        
    Returns:
        List of users
    """
    users = await service.get_all_users(skip=skip, limit=limit)
    return [{"id": user.id, "email": user.email, "username": user.username} for user in users]


@router.get("/users/{user_id}", response_model=dict, status_code=StatusCodes.OK)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """
    Get user by ID.
    
    This route delegates ALL business logic to the service.
    It only handles HTTP request/response and error translation.
    
    Args:
        user_id: User ID to retrieve
        service: UserService instance (injected via dependency)
        
    Returns:
        User data
        
    Raises:
        HTTPException: If user not found
    """
    try:
        user = await service.get_user_by_id(user_id)
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active
        }
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=StatusCodes.NOT_FOUND,
            detail=ErrorMessages.USER_NOT_FOUND
        )


@router.post("/users", response_model=dict, status_code=StatusCodes.CREATED)
async def create_user(
    user_data: dict,
    service: UserService = Depends(get_user_service)
):
    """
    Create a new user.
    
    This route delegates ALL business logic to the service.
    It only handles HTTP request/response and error translation.
    
    Args:
        user_data: User data from request body
        service: UserService instance (injected via dependency)
        
    Returns:
        Created user data
        
    Raises:
        HTTPException: If user already exists or validation fails
    """
    try:
        user = await service.create_user(user_data)
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active
        }
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=StatusCodes.CONFLICT,
            detail=ErrorMessages.USER_ALREADY_EXISTS
        )


@router.put("/users/{user_id}", response_model=dict, status_code=StatusCodes.OK)
async def update_user(
    user_id: int,
    user_data: dict,
    service: UserService = Depends(get_user_service)
):
    """
    Update user.
    
    This route delegates ALL business logic to the service.
    It only handles HTTP request/response and error translation.
    
    Args:
        user_id: User ID to update
        user_data: Updated user data from request body
        service: UserService instance (injected via dependency)
        
    Returns:
        Updated user data
        
    Raises:
        HTTPException: If user not found or validation fails
    """
    try:
        user = await service.update_user(user_id, user_data)
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active
        }
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=StatusCodes.NOT_FOUND,
            detail=ErrorMessages.USER_NOT_FOUND
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=StatusCodes.CONFLICT,
            detail=ErrorMessages.USER_ALREADY_EXISTS
        )


@router.delete("/users/{user_id}", status_code=StatusCodes.NO_CONTENT)
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """
    Delete user.
    
    This route delegates ALL business logic to the service.
    It only handles HTTP request/response and error translation.
    
    Args:
        user_id: User ID to delete
        service: UserService instance (injected via dependency)
        
    Raises:
        HTTPException: If user not found
    """
    try:
        await service.delete_user(user_id)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=StatusCodes.NOT_FOUND,
            detail=ErrorMessages.USER_NOT_FOUND
        )
