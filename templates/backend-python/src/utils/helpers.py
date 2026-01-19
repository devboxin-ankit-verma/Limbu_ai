"""
Utility helper functions.

General utility functions that don't belong to any specific layer.
"""

from typing import Any, Dict


def format_response(data: Any, message: str = None) -> Dict:
    """
    Format API response in a consistent structure.
    
    Args:
        data: Response data
        message: Optional message
        
    Returns:
        Formatted response dictionary
    """
    response = {"data": data}
    if message:
        response["message"] = message
    return response
