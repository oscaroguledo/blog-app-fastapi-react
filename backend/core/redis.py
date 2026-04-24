import redis.asyncio as redis
from core.config import settings

redis_client = None


async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client


async def init_redis():
    """Initialize Redis connection."""
    try:
        client = await get_redis()
        await client.ping()
        print("✅ Redis connected successfully")
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False


async def close_redis():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
        print("Redis connection closed")
