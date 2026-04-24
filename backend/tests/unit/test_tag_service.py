"""Unit tests for TagService."""
import pytest
import pytest_asyncio
from services.tag import TagService


@pytest_asyncio.fixture
async def svc(db_session):
    return TagService(db_session)


async def test_create_tag(svc):
    tag = await svc.create(name="FastAPI", slug="fastapi")
    assert tag.id is not None
    assert tag.name == "FastAPI"


async def test_create_tag_missing_name(svc):
    with pytest.raises(ValueError):
        await svc.create(name="", slug="slug")


async def test_get_by_slug(svc):
    await svc.create(name="Docker", slug="docker")
    tag = await svc.get(slug="docker")
    assert tag is not None


async def test_list_tags(svc):
    await svc.create(name="Python", slug="python")
    await svc.create(name="React", slug="react")
    tags = await svc.list()
    assert len(tags) >= 2


async def test_list_search(svc):
    await svc.create(name="SQLAlchemy", slug="sqlalchemy")
    results = await svc.list(search_query="sqlalchemy")
    assert any(t.slug == "sqlalchemy" for t in results)


async def test_update_tag(svc):
    tag = await svc.create(name="OldTag", slug="old-tag")
    updated = await svc.update(tag.id, name="NewTag")
    assert updated.name == "NewTag"


async def test_delete_tag(svc):
    tag = await svc.create(name="DeleteMe", slug="delete-me")
    assert await svc.delete(tag.id) is True
    assert await svc.get(slug="delete-me") is None
