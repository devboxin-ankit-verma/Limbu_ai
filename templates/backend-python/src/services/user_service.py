"""
User service - business logic only.

This module contains ONLY business logic.
NO database queries (use Repository), NO HTTP handling (use Routes).
"""

from typing import Optional
from src.repositories.user_repository import UserRepository
from src.models.user import User
from src.constants.errors import ErrorMessages, ErrorCodes


class UserNotFoundError(Exception):
    """Exception raised when user is not found."""
    def __init__(self, message: str = ErrorMessages.USER_NOT_FOUND):
        self.message = message
        self.code = ErrorCodes.USER_NOT_FOUND
        super().__init__(self.message)


class UserAlreadyExistsError(Exception):
    """Exception raised when user already exists."""
    def __init__(self, message: str = ErrorMessages.USER_ALREADY_EXISTS):
        self.message = message
        self.code = ErrorCodes.USER_ALREADY_EXISTS
        super().__init__(self.message)


class UserService:
    """
    User service - handles all business logic for users.
    
    This class contains ONLY business logic.
    Database access is delegated to Repository.
    HTTP handling is delegated to Routes/Controllers.
    """
    
    def __init__(self, user_repository: UserRepository):
        """
        Initialize service with repository.
        
        Args:
            user_repository: UserRepository instance for data access
        """
        self.user_repository = user_repository
    
    async def get_user_by_id(self, user_id: int) -> User:
        """
        Get user by ID with business logic.
        
        Args:
            user_id: User ID to retrieve
            
        Returns:
            User instance
            
        Raises:
            UserNotFoundError: If user does not exist
        """
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise UserNotFoundError()
        return user
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email: Email to search for
            
        Returns:
            User if found, None otherwise
        """
        return self.user_repository.find_by_email(email)
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """
        Get all users with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of users
        """
        return self.user_repository.find_all(skip=skip, limit=limit)
    
    async def create_user(self, user_data: dict) -> User:
        """
        Create a new user with business logic validation.
        
        Args:
            user_data: Dictionary containing user data
            
        Returns:
            Created user
            
        Raises:
            UserAlreadyExistsError: If user with email or username already exists
        """
        # Business logic: Check if user already exists
        existing_user = self.user_repository.find_by_email(user_data.get("email"))
        if existing_user:
            raise UserAlreadyExistsError()
        
        existing_user = self.user_repository.find_by_username(user_data.get("username"))
        if existing_user:
            raise UserAlreadyExistsError()
        
        # Business logic: Set defaults
        user_data.setdefault("is_active", True)
        user_data.setdefault("is_admin", False)
        
        return self.user_repository.create(user_data)
    
    async def update_user(self, user_id: int, user_data: dict) -> User:
        """
        Update user with business logic validation.
        
        Args:
            user_id: ID of user to update
            user_data: Dictionary containing updated user data
            
        Returns:
            Updated user
            
        Raises:
            UserNotFoundError: If user does not exist
        """
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise UserNotFoundError()
        
        # Business logic: Prevent email/username conflicts
        if "email" in user_data:
            existing = self.user_repository.find_by_email(user_data["email"])
            if existing and existing.id != user_id:
                raise UserAlreadyExistsError()
        
        if "username" in user_data:
            existing = self.user_repository.find_by_username(user_data["username"])
            if existing and existing.id != user_id:
                raise UserAlreadyExistsError()
        
        return self.user_repository.update(user, user_data)
    
    async def delete_user(self, user_id: int) -> None:
        """
        Delete user with business logic.
        
        Args:
            user_id: ID of user to delete
            
        Raises:
            UserNotFoundError: If user does not exist
        """
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise UserNotFoundError()
        
        self.user_repository.delete(user)
