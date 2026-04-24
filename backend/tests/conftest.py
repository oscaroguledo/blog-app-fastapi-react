"""
Shared fixtures for all tests.
Uses an in-memory SQLite database so no running Postgres is needed.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from unittest.mock import AsyncMock, MagicMock

# ---------------------------------------------------------------------------
# Patch settings BEFORE any app module is imported so the DB URL is SQLite
# ---------------------------------------------------------------------------
import os
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
os.environ.setdefault("CORS_ALLOW_CREDENTIALS", "true")
os.environ.setdefault("CORS_ALLOW_METHODS", "*")
os.environ.setdefault("CORS_ALLOW_HEADERS", "*")

from core.database import Base
import core.database as db_module

# ---------------------------------------------------------------------------
# In-memory SQLite engine (shared across the test session)
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    test_engine,
    expire_on_commit=False,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables():
    """Create all tables once for the test session."""
    # Import models so they register with Base.metadata
    import models  # noqa: F401
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(autouse=True)
async def clean_tables():
    """Truncate all tables between tests for isolation."""
    yield
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())


@pytest_asyncio.fixture
async def db_session():
    """Yield a test database session."""
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    """Yield an AsyncClient wired to the FastAPI app with the test DB."""
    # Patch redis so it doesn't need a real connection
    mock_redis = AsyncMock()
    mock_redis.init = AsyncMock(return_value=True)
    mock_redis.close = AsyncMock()
    mock_redis.get_client = AsyncMock(return_value=_make_redis_mock())

    import core.redis as redis_module
    redis_module.redis_client = mock_redis

    # Override the DB dependency
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
    """Return a mock Redis client that silently handles rate-limit calls."""
    m = AsyncMock()
    m.incr = AsyncMock(return_value=1)
    m.expire = AsyncMock(return_value=True)
    m.get = AsyncMock(return_value=None)
    m.ttl = AsyncMock(return_value=-1)
    m.ping = AsyncMock(return_value=True)
    return m


# ---------------------------------------------------------------------------
# Helpers
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
    svc = UserService(db_session)
    return await svc.create(
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
