from fastapi import Request
from core.utils.rate_limit import check_rate_limit


async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to all requests."""
    # Skip rate limiting for health check
    if request.url.path == "/health":
        return await call_next(request)

    # Apply rate limiting (100 requests per 60 seconds)
    await check_rate_limit(request, requests=100, window=60, key_prefix="global")

    response = await call_next(request)
    return response
