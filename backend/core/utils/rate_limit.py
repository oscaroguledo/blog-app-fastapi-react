from fastapi import Request, HTTPException, status
from core.redis import redis_client
from core.utils.logger import warning
from typing import Optional


class RateLimiter:
    def __init__(self, requests: int = 100, window: int = 60):
        """
        Initialize rate limiter.
        
        Args:
            requests: Maximum number of requests allowed
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window

    async def is_allowed(self, key: str) -> bool:
        """
        Check if request is allowed based on rate limit.
        
        Args:
            key: Unique identifier for the client (e.g., IP address)
            
        Returns:
            True if request is allowed, False otherwise
        """
        try:
            client = await redis_client.get_client()
            current = await client.incr(key)
            
            if current == 1:
                # First request, set expiration
                await client.expire(key, self.window)
            
            return current <= self.requests
        except Exception as e:
            # If Redis fails, allow request (fail open)
            warning(f"Rate limiting error: {e}")
            return True

    async def get_remaining(self, key: str) -> int:
        """
        Get remaining requests for a client.
        
        Args:
            key: Unique identifier for the client
            
        Returns:
            Number of remaining requests
        """
        try:
            client = await redis_client.get_client()
            current = await client.get(key)
            if current is None:
                return self.requests
            return max(0, self.requests - int(current))
        except Exception:
            return self.requests

    async def get_reset_time(self, key: str) -> Optional[int]:
        """
        Get time until rate limit resets.
        
        Args:
            key: Unique identifier for the client
            
        Returns:
            Seconds until reset, or None if not rate limited
        """
        try:
            client = await redis_client.get_client()
            ttl = await client.ttl(key)
            return ttl if ttl > 0 else None
        except Exception:
            return None


async def check_rate_limit(
    request: Request,
    requests: int = 100,
    window: int = 60,
    key_prefix: str = "rate_limit"
) -> None:
    """
    Check rate limit for a request.
    
    Args:
        request: FastAPI request object
        requests: Maximum number of requests allowed
        window: Time window in seconds
        key_prefix: Prefix for Redis key
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    # Get client identifier (IP address)
    client_ip = request.client.host if request.client else "unknown"
    key = f"{key_prefix}:{client_ip}"
    
    limiter = RateLimiter(requests=requests, window=window)
    
    if not await limiter.is_allowed(key):
        remaining = await limiter.get_remaining(key)
        reset_time = await limiter.get_reset_time(key)
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "limit": requests,
                "window": window,
                "remaining": remaining,
                "reset": reset_time
            }
        )
