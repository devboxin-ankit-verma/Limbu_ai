"""
User repository - database access only.

This module contains ONLY database operations.
NO business logic, NO business rules.
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from src.models.user import User


class UserRepository:
    """
    User repository - handles all database operations for users.
    
    This class contains ONLY data access operations.
    Business logic belongs in Services.
    """
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        """
        Find user by ID.
        
        Args:
            user_id: User ID to search for
            
        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.id == user_id).first()
    
    def find_by_email(self, email: str) -> Optional[User]:
        """
        Find user by email.
        
        Args:
            email: Email to search for
            
        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.email == email).first()
    
    def find_by_username(self, username: str) -> Optional[User]:
        """
        Find user by username.
        
        Args:
            username: Username to search for
            
        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.username == username).first()
    
    def find_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Find all users with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of users
        """
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def create(self, user_data: dict) -> User:
        """
        Create a new user.
        
        Args:
            user_data: Dictionary containing user data
            
        Returns:
            Created user
        """
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update(self, user: User, user_data: dict) -> User:
        """
        Update an existing user.
        
        Args:
            user: User instance to update
            user_data: Dictionary containing updated user data
            
        Returns:
            Updated user
        """
        for key, value in user_data.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def delete(self, user: User) -> None:
        """
        Delete a user.
        
        Args:
            user: User instance to delete
        """
        self.db.delete(user)
        self.db.commit()
