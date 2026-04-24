"""
Shared test fixtures.
Uses a dedicated Postgres test database (blog_test_db).
Requires the Postgres container to be running:
  docker-compose up -d postgres

Each test gets a fresh engine + session to avoid asyncpg event-loop binding issues.
"""
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from unittest.mock import AsyncMock

# ---------------------------------------------------------------------------
# Point at the test DB before any app module loads
# ---------------------------------------------------------------------------
os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/blog_test_db",
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
os.environ.setdefault("CORS_ALLOW_CREDENTIALS", "true")
os.environ.setdefault("CORS_ALLOW_METHODS", "*")
os.environ.setdefault("CORS_ALLOW_HEADERS", "*")

# Now safe to import app modules
from core.database import Base
import models  # noqa: F401 — registers all models with Base.metadata

TEST_DB_URL = os.environ["DATABASE_URL"]

# Ordered list of tables for truncation (leaf → root to respect FKs)
_TRUNCATE_ORDER = [
    "public.comments",
    "public.post_tag",
    "public.post_category",
    "public.posts",
    "public.tags",
    "public.categories",
    "public.users",
]


def _make_engine():
    """Create a fresh async engine with NullPool (no connection reuse across loops)."""
    return create_async_engine(TEST_DB_URL, echo=False, poolclass=NullPool)


# ---------------------------------------------------------------------------
# Session-scoped: create schema + tables once, drop after all tests
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="session", autouse=True)
async def _init_db():
    engine = _make_engine()
    async with engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    yield
    engine = _make_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


# ---------------------------------------------------------------------------
# Per-test: fresh engine + session + truncate tables after each test
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(autouse=True)
async def db_session(_init_db):
    """Yield a fresh DB session per test; truncate all tables after."""
    engine = _make_engine()
    session_factory = async_sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession,
        autocommit=False, autoflush=False,
    )
    async with session_factory() as session:
        yield session

    # Cleanup: truncate all tables
    async with engine.begin() as conn:
        for table in _TRUNCATE_ORDER:
            await conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
    await engine.dispose()


# ---------------------------------------------------------------------------
# HTTP client fixture wired to the FastAPI app + test DB
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def client(db_session):
    mock_redis_client = _make_redis_mock()
    mock_redis = AsyncMock()
    mock_redis.init = AsyncMock(return_value=True)
    mock_redis.close = AsyncMock()
    mock_redis.get_client = AsyncMock(return_value=mock_redis_client)

    import core.redis as redis_module
    redis_module.redis_client = mock_redis

    from core.database import get_db
    from main import app

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


def _make_redis_mock():
    m = AsyncMock()
    m.incr = AsyncMock(return_value=1)
    m.expire = AsyncMock(return_value=True)
    m.get = AsyncMock(return_value=None)
    m.ttl = AsyncMock(return_value=-1)
    m.ping = AsyncMock(return_value=True)
    return m


# ---------------------------------------------------------------------------
# Helpers used across test modules
# ---------------------------------------------------------------------------
async def create_test_user(
    db_session,
    email="test@example.com",
    password="TestPass123!",
    firstName="Test",
    lastName="User",
    role="Reader",
):
    from services.user import UserService
    return await UserService(db_session).create(
        firstName=firstName,
        lastName=lastName,
        email=email,
        password=password,
        role=role,
    )


async def get_auth_token(client, email="test@example.com", password="TestPass123!"):
    resp = await client.post(
        "/users/login", params={"email": email, "password": password}
    )
    return resp.json()["data"]["access_token"]
