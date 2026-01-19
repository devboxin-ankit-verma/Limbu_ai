"""
Application settings and configuration.

This module loads and validates all environment variables using Pydantic.
NEVER access environment variables directly - always use this config.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All environment variables must be defined in .env.example
    and loaded through this class.
    """
    
    # Application
    APP_NAME: str = "Backend API"
    APP_VERSION: str = "1.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
