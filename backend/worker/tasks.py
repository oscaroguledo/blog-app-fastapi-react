"""
Celery tasks for background processing.

cache_latest_posts — fetches the N most recent published posts from
Postgres and writes them to Redis so GET /posts/latest is served
from cache without hitting the DB.
"""
import asyncio
import json
import logging

from worker.celery_app import celery_app
from core.config import settings

logger = logging.getLogger(__name__)

LATEST_POSTS_KEY = "latest_posts"
LATEST_POSTS_TTL = 300  # 5 minutes


@celery_app.task(
    name="worker.tasks.cache_latest_posts",
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def cache_latest_posts(self, limit: int = 10):
    """
    Fetch the latest `limit` published posts from Postgres and cache
    them in Redis under the key `latest_posts`.

    Triggered automatically after every new post is created.
    """
    try:
        asyncio.run(_cache_latest_posts_async(limit))
        logger.info("cache_latest_posts: cached %d posts", limit)
    except Exception as exc:
        logger.error("cache_latest_posts failed: %s", exc)
        raise self.retry(exc=exc)


async def _cache_latest_posts_async(limit: int):
    """Async implementation — runs inside asyncio.run() from the Celery task."""
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from sqlalchemy.pool import NullPool
    from sqlalchemy import select
    from models.post import Post
    import redis.asyncio as aioredis

    # Build a fresh DB engine (NullPool — no connection reuse across event loops)
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")

    engine = create_async_engine(db_url, poolclass=NullPool, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with session_factory() as session:
            result = await session.execute(
                select(Post)
                .where(Post.isPublished == True)  # noqa: E712
                .order_by(Post.created_at.desc())
                .limit(limit)
            )
            posts = result.scalars().all()
            posts_data = [p.to_dict() for p in posts]

        # Write to Redis
        redis = aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        try:
            await redis.setex(LATEST_POSTS_KEY, LATEST_POSTS_TTL, json.dumps(posts_data))
        finally:
            await redis.aclose()

    finally:
        await engine.dispose()
