"""
Error messages and error codes.

All error messages and error-related constants go here.
"""

class ErrorMessages:
    """Error messages used throughout the application."""
    
    # User errors
    USER_NOT_FOUND = "User not found"
    USER_ALREADY_EXISTS = "User already exists"
    INVALID_CREDENTIALS = "Invalid credentials"
    
    # Authentication errors
    UNAUTHORIZED = "Unauthorized access"
    TOKEN_EXPIRED = "Token has expired"
    TOKEN_INVALID = "Invalid token"
    
    # Validation errors
    INVALID_INPUT = "Invalid input provided"
    MISSING_REQUIRED_FIELD = "Missing required field"
    
    # General errors
    INTERNAL_ERROR = "Internal server error"
    DATABASE_ERROR = "Database operation failed"


class ErrorCodes:
    """Error codes for programmatic error handling."""
    USER_NOT_FOUND = "USER_NOT_FOUND"
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    UNAUTHORIZED = "UNAUTHORIZED"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    TOKEN_INVALID = "TOKEN_INVALID"
    INVALID_INPUT = "INVALID_INPUT"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
