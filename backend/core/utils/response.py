from typing import Any, Optional
from fastapi.responses import JSONResponse

class Pagination:
    def __init__(self, limit: int, offset: int, total: int):
        self.limit = limit
        self.offset = offset
        self.total = total

class Response(JSONResponse):
    """
    Standardized API response class that returns JSONResponse.
    """
    
    def __init__(
        self,
        success: Optional[bool] = False,
        message: Optional[str] = "",
        data: Optional[Any] = None,
        pagination: Optional[Pagination] = None,
        status_code: int = 200
    ):
        content = {
            "success": success,
            "message": message,
            "data": data if data is not None else {}
        }
        if pagination:
            content["pagination"] = {
                "limit": pagination.limit,
                "offset": pagination.offset,
                "total": pagination.total
            }
        super().__init__(content=content, status_code=status_code)
    

