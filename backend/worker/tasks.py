"""
Celery tasks:

  Post caching
  ─────────────
  cache_latest_posts        — refresh Redis cache after a new post is created

  Auth / transactional email
  ──────────────────────────
  send_welcome_email        — fired on registration
  send_email_verification   — fired on /verify-email request
  send_password_reset_email — fired on /reset-password request
  send_login_notification   — fired on successful login

  Periodic
  ────────
  send_weekly_digest        — every Monday 08:00 UTC via Celery Beat
"""
import asyncio
import json
import logging

from worker.celery_app import celery_app
from core.config import settings

logger = logging.getLogger(__name__)

LATEST_POSTS_KEY = "latest_posts"
LATEST_POSTS_TTL = 300  # 5 minutes

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _make_db_engine():
    """Return a fresh async engine with NullPool (safe across event loops)."""
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.pool import NullPool

    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    return create_async_engine(db_url, poolclass=NullPool, echo=False)


def _make_session(engine):
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ─────────────────────────────────────────────────────────────────────────────
# Post cache
# ─────────────────────────────────────────────────────────────────────────────

@celery_app.task(
    name="worker.tasks.cache_latest_posts",
    bind=True, max_retries=3, default_retry_delay=5,
)
def cache_latest_posts(self, limit: int = 10):
    """Fetch latest published posts and write to Redis."""
    try:
        asyncio.run(_cache_latest_posts_async(limit))
        logger.info("cache_latest_posts: cached %d posts", limit)
    except Exception as exc:
        logger.error("cache_latest_posts failed: %s", exc)
        raise self.retry(exc=exc)


async def _cache_latest_posts_async(limit: int):
    import redis.asyncio as aioredis
    from sqlalchemy import select
    from models.post import Post

    engine = _make_db_engine()
    try:
        async with _make_session(engine)() as session:
            result = await session.execute(
                select(Post)
                .where(Post.isPublished == True)  # noqa: E712
                .order_by(Post.created_at.desc())
                .limit(limit)
            )
            posts_data = [p.to_dict() for p in result.scalars().all()]

        redis = aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        try:
            await redis.setex(LATEST_POSTS_KEY, LATEST_POSTS_TTL, json.dumps(posts_data))
        finally:
            await redis.aclose()
    finally:
        await engine.dispose()


# ─────────────────────────────────────────────────────────────────────────────
# Auth / transactional emails
# ─────────────────────────────────────────────────────────────────────────────

@celery_app.task(
    name="worker.tasks.send_welcome_email",
    bind=True, max_retries=3, default_retry_delay=10,
)
def send_welcome_email(self, email: str, first_name: str, verification_token: str):
    """
    Send a welcome + email-verification email after registration.
    Fired by: POST /users/register
    """
    try:
        asyncio.run(_send_welcome_email_async(email, first_name, verification_token))
    except Exception as exc:
        logger.error("send_welcome_email failed for %s: %s", email, exc)
        raise self.retry(exc=exc)


async def _send_welcome_email_async(email: str, first_name: str, token: str):
    from worker.email import send_email
    from worker.templates import welcome_email

    verify_url = f"{settings.APP_URL}/verify-email?token={token}"
    subject, html = welcome_email(first_name, verify_url)
    await send_email(email, subject, html)


@celery_app.task(
    name="worker.tasks.send_email_verification",
    bind=True, max_retries=3, default_retry_delay=10,
)
def send_email_verification(self, email: str, first_name: str, verification_token: str):
    """
    Send (or resend) an email-verification link.
    Fired by: POST /users/verify-email
    """
    try:
        asyncio.run(_send_email_verification_async(email, first_name, verification_token))
    except Exception as exc:
        logger.error("send_email_verification failed for %s: %s", email, exc)
        raise self.retry(exc=exc)


async def _send_email_verification_async(email: str, first_name: str, token: str):
    from worker.email import send_email
    from worker.templates import email_verification

    verify_url = f"{settings.APP_URL}/verify-email?token={token}"
    subject, html = email_verification(first_name, verify_url)
    await send_email(email, subject, html)


@celery_app.task(
    name="worker.tasks.send_password_reset_email",
    bind=True, max_retries=3, default_retry_delay=10,
)
def send_password_reset_email(self, email: str, first_name: str, reset_token: str):
    """
    Send a password-reset link.
    Fired by: POST /users/reset-password
    """
    try:
        asyncio.run(_send_password_reset_async(email, first_name, reset_token))
    except Exception as exc:
        logger.error("send_password_reset_email failed for %s: %s", email, exc)
        raise self.retry(exc=exc)


async def _send_password_reset_async(email: str, first_name: str, token: str):
    from worker.email import send_email
    from worker.templates import password_reset_email

    reset_url = f"{settings.APP_URL}/reset-password?token={token}"
    subject, html = password_reset_email(first_name, reset_url)
    await send_email(email, subject, html)


@celery_app.task(
    name="worker.tasks.send_login_notification",
    bind=True, max_retries=2, default_retry_delay=5,
)
def send_login_notification(self, email: str, first_name: str):
    """
    Notify the user of a new login.
    Fired by: POST /users/login
    """
    try:
        asyncio.run(_send_login_notification_async(email, first_name))
    except Exception as exc:
        logger.error("send_login_notification failed for %s: %s", email, exc)
        raise self.retry(exc=exc)


async def _send_login_notification_async(email: str, first_name: str):
    from worker.email import send_email
    from worker.templates import login_notification_email

    subject, html = login_notification_email(first_name)
    await send_email(email, subject, html)


# ─────────────────────────────────────────────────────────────────────────────
# Weekly digest (Celery Beat periodic task)
# ─────────────────────────────────────────────────────────────────────────────

@celery_app.task(
    name="worker.tasks.send_weekly_digest",
    bind=True, max_retries=2, default_retry_delay=30,
)
def send_weekly_digest(self):
    """
    Send a weekly digest of the latest published posts to all active users.
    Scheduled: every Monday at 08:00 UTC via Celery Beat.
    """
    try:
        asyncio.run(_send_weekly_digest_async())
        logger.info("send_weekly_digest: completed")
    except Exception as exc:
        logger.error("send_weekly_digest failed: %s", exc)
        raise self.retry(exc=exc)


async def _send_weekly_digest_async():
    from sqlalchemy import select
    from models.user import User
    from models.post import Post
    from worker.email import send_email
    from worker.templates import weekly_digest_email
    from datetime import datetime, timezone, timedelta

    engine = _make_db_engine()
    try:
        async with _make_session(engine)() as session:
            # Fetch posts published in the last 7 days
            since = datetime.now(timezone.utc) - timedelta(days=7)
            posts_result = await session.execute(
                select(Post)
                .where(Post.isPublished == True, Post.created_at >= since)  # noqa: E712
                .order_by(Post.created_at.desc())
                .limit(5)
            )
            posts = [p.to_dict() for p in posts_result.scalars().all()]

            # Fetch all active users
            users_result = await session.execute(
                select(User).where(User.active == True)  # noqa: E712
            )
            users = users_result.scalars().all()

        # Send one email per user (fire-and-forget, log failures)
        for user in users:
            try:
                subject, html = weekly_digest_email(user.firstName, posts)
                await send_email(user.email, subject, html)
            except Exception as e:
                logger.error("Weekly digest failed for %s: %s", user.email, e)
    finally:
        await engine.dispose()
