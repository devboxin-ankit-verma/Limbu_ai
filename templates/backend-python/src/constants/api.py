"""
API-related constants.

All API endpoints, status codes, and API-related constants go here.
"""

from http import HTTPStatus

# API Version
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# HTTP Status Codes (use these instead of magic numbers)
class StatusCodes:
    """HTTP status codes."""
    OK = HTTPStatus.OK.value  # 200
    CREATED = HTTPStatus.CREATED.value  # 201
    NO_CONTENT = HTTPStatus.NO_CONTENT.value  # 204
    BAD_REQUEST = HTTPStatus.BAD_REQUEST.value  # 400
    UNAUTHORIZED = HTTPStatus.UNAUTHORIZED.value  # 401
    FORBIDDEN = HTTPStatus.FORBIDDEN.value  # 403
    NOT_FOUND = HTTPStatus.NOT_FOUND.value  # 404
    CONFLICT = HTTPStatus.CONFLICT.value  # 409
    INTERNAL_SERVER_ERROR = HTTPStatus.INTERNAL_SERVER_ERROR.value  # 500
