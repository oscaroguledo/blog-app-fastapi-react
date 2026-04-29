"""
Shared test fixtures.
Uses mocks for DB, Redis, and Celery - no real connections or Docker required.
"""
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import MagicMock, AsyncMock, patch
from fakeredis import FakeStrictRedis
import uuid

# ---------------------------------------------------------------------------
# Set environment variables before any app module loads
# ---------------------------------------------------------------------------
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test_db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
os.environ.setdefault("CORS_ALLOW_CREDENTIALS", "true")
os.environ.setdefault("CORS_ALLOW_METHODS", "*")
os.environ.setdefault("CORS_ALLOW_HEADERS", "*")

# Set Celery to eager mode for synchronous task execution
os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "True")

# Now safe to import app modules
from main import app
from core.database import get_db


# ---------------------------------------------------------------------------
# Mock DB session fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
def mock_db_session():
    """Mock SQLAlchemy AsyncSession for testing."""
    session = AsyncMock()
    
    # Mock query chain
    mock_query = MagicMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none = MagicMock(return_value=None)
    mock_result.scalars = MagicMock(return_value=mock_result)
    mock_result.all = MagicMock(return_value=[])
    mock_result.first = MagicMock(return_value=None)
    mock_query.where = MagicMock(return_value=mock_query)
    mock_query.filter = MagicMock(return_value=mock_query)
    mock_query.options = MagicMock(return_value=mock_query)
    mock_query.join = MagicMock(return_value=mock_query)
    mock_query.order_by = MagicMock(return_value=mock_query)
    mock_query.offset = MagicMock(return_value=mock_query)
    mock_query.limit = MagicMock(return_value=mock_query)
    session.execute = MagicMock(return_value=mock_result)
    session.query = MagicMock(return_value=mock_query)
    
    # Mock session methods
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = MagicMock()
    session.rollback = AsyncMock()
    
    return session


# ---------------------------------------------------------------------------
# Fake Redis fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
def fake_redis():
    """Fake Redis client using fakeredis."""
    return FakeStrictRedis(decode_responses=True)


# ---------------------------------------------------------------------------
# Mock Redis client fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
def mock_redis_client(fake_redis):
    """Mock RedisClient singleton."""
    mock_redis = AsyncMock()
    mock_redis.init = AsyncMock(return_value=True)
    mock_redis.close = AsyncMock()
    mock_redis.get_client = AsyncMock(return_value=fake_redis)
    
    # Patch the redis_client singleton
    import core.redis as redis_module
    original_redis_client = redis_module.redis_client
    redis_module.redis_client = mock_redis
    
    yield mock_redis
    
    # Restore original
    redis_module.redis_client = original_redis_client


# ---------------------------------------------------------------------------
# HTTP client fixture with mocked dependencies
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def client(mock_db_session, mock_redis_client):
    """HTTP client with mocked DB and Redis dependencies."""
    
    async def override_get_db():
        yield mock_db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Celery eager mode fixture
# ---------------------------------------------------------------------------
@pytest.fixture
def celery_eager_mode():
    """Set Celery to eager mode for synchronous task execution."""
    from worker import celery_app
    original_mode = celery_app.conf.task_always_eager
    celery_app.conf.task_always_eager = True
    yield
    celery_app.conf.task_always_eager = original_mode


# ---------------------------------------------------------------------------
# Mock user fixture
# ---------------------------------------------------------------------------
@pytest.fixture
def mock_user():
    """Create a mock User object."""
    user = MagicMock()
    user.id = uuid.uuid4()
    user.email = "test@example.com"
    user.firstName = "Test"
    user.lastName = "User"
    user.role = "Reader"
    user.active = True
    user.avatar = None
    user.bio = None
    user.isVerified = False
    user.password = "$2b$12$hashedpassword"
    user.to_dict = MagicMock(return_value={
        "id": str(user.id),
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "avatar": user.avatar,
        "role": user.role,
        "bio": user.bio,
        "active": user.active,
        "isVerified": user.isVerified,
    })
    return user


# ---------------------------------------------------------------------------
# Mock current user dependency override
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
def override_get_current_user(mock_user):
    """Override get_current_user dependency to return mock user."""
    from core.dependencies import get_current_user
    
    async def mock_override():
        return mock_user
    
    app.dependency_overrides[get_current_user] = mock_override
    yield mock_user
    app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# Helper: create mock request with JSON body
# ---------------------------------------------------------------------------
def mock_request(data: dict):
    """Create a mock FastAPI Request object with JSON body."""
    request = MagicMock()
    request.json = AsyncMock(return_value=data)
    return request
