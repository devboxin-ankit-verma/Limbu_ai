"""
User roles and permissions.

All role-related constants go here.
"""

class UserRoles:
    """User role constants."""
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"


class Permissions:
    """Permission constants."""
    READ_USERS = "read:users"
    WRITE_USERS = "write:users"
    DELETE_USERS = "delete:users"
    ADMIN_ACCESS = "admin:access"
