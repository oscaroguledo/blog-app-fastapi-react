from fastapi import HTTPException
from typing import Any, Optional

class APIError(HTTPException):
    """
    Custom API error exception that automatically formats error responses.
    """
    def __init__(
        self,
        message: Optional[str] = "An error occurred",
        data: Optional[Any] = None,
        status_code: int = 400
    ):
        self.message = message
        self.data = data
        self.status_code = status_code
        super().__init__(status_code=status_code, detail=message)
