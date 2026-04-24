"""Unit tests for CategoryService."""
import pytest
import pytest_asyncio
from services.category import CategoryService


@pytest_asyncio.fixture
async def svc(db_session):
    return CategoryService(db_session)


async def test_create_category(svc):
    cat = await svc.create(name="Tech", slug="tech")
    assert cat.id is not None
    assert cat.name == "Tech"
    assert cat.slug == "tech"


async def test_create_category_missing_name(svc):
    with pytest.raises(ValueError, match="Name is required"):
        await svc.create(name="", slug="slug")


async def test_create_category_missing_slug(svc):
    with pytest.raises(ValueError, match="Slug is required"):
        await svc.create(name="Name", slug="")


async def test_get_by_slug(svc):
    await svc.create(name="Science", slug="science")
    cat = await svc.get(slug="science")
    assert cat is not None
    assert cat.slug == "science"


async def test_get_not_found(svc):
    cat = await svc.get(slug="nonexistent")
    assert cat is None


async def test_list_categories(svc):
    await svc.create(name="Art", slug="art")
    await svc.create(name="Music", slug="music")
    cats = await svc.list()
    assert len(cats) >= 2


async def test_list_search(svc):
    await svc.create(name="Python Programming", slug="python-programming")
    await svc.create(name="JavaScript", slug="javascript")
    results = await svc.list(search_query="python")
    assert any(c.name == "Python Programming" for c in results)
    assert all("python" in c.name.lower() or "python" in c.slug.lower() for c in results)


async def test_update_category(svc):
    cat = await svc.create(name="Old Name", slug="old-slug")
    updated = await svc.update(cat.id, name="New Name")
    assert updated.name == "New Name"
    assert updated.slug == "old-slug"


async def test_delete_category(svc):
    cat = await svc.create(name="ToDelete", slug="to-delete")
    result = await svc.delete(cat.id)
    assert result is True
    assert await svc.get(slug="to-delete") is None


async def test_delete_nonexistent(svc):
    import uuid
    result = await svc.delete(uuid.uuid4())
    assert result is False
