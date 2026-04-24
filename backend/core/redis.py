import redis.asyncio as redis
from core.config import settings
from core.utils.logger import success, error, info


class RedisClient:
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_client(self):
        """Get or create Redis client instance."""
        if self._client is None:
            self._client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        return self._client

    async def init(self):
        """Initialize Redis connection."""
        try:
            client = await self.get_client()
            await client.ping()
            success("✅ Redis connected successfully")
            return True
        except Exception as e:
            error(f"❌ Redis connection failed: {e}")
            return False

    async def close(self):
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None
            info("Redis connection closed")


# Global instance
redis_client = RedisClient()
