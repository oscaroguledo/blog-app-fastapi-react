"""API tests for /categories endpoints."""
import pytest
from tests.conftest import create_test_user, get_auth_token


async def test_create_category(client):
    resp = await client.post("/categories/", params={"name": "Tech", "slug": "tech"})
    assert resp.status_code == 201
    assert resp.json()["data"]["name"] == "Tech"


async def test_create_category_duplicate_slug(client):
    await client.post("/categories/", params={"name": "Tech", "slug": "tech-dup"})
    resp = await client.post("/categories/", params={"name": "Tech2", "slug": "tech-dup"})
    # DB unique constraint — route returns 500 with error message
    assert resp.status_code in (400, 500)
    assert resp.json()["success"] is False


async def test_list_categories(client):
    await client.post("/categories/", params={"name": "Science", "slug": "science"})
    resp = await client.get("/categories/")
    assert resp.status_code == 200
    assert isinstance(resp.json()["data"], list)
    assert len(resp.json()["data"]) >= 1


async def test_list_categories_search(client):
    await client.post("/categories/", params={"name": "Python Dev", "slug": "python-dev"})
    resp = await client.get("/categories/", params={"search_query": "python"})
    assert resp.status_code == 200
    results = resp.json()["data"]
    assert any("python" in c["name"].lower() or "python" in c["slug"].lower() for c in results)


async def test_get_category_by_id(client):
    create = await client.post("/categories/", params={"name": "Art", "slug": "art"})
    cat_id = create.json()["data"]["id"]
    resp = await client.get(f"/categories/{cat_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["slug"] == "art"


async def test_get_category_not_found(client):
    import uuid
    resp = await client.get(f"/categories/{uuid.uuid4()}")
    assert resp.status_code == 404


async def test_update_category(client):
    create = await client.post("/categories/", params={"name": "OldCat", "slug": "old-cat"})
    cat_id = create.json()["data"]["id"]
    resp = await client.patch(f"/categories/{cat_id}", params={"name": "NewCat"})
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "NewCat"


async def test_delete_category(client):
    create = await client.post("/categories/", params={"name": "DelCat", "slug": "del-cat"})
    cat_id = create.json()["data"]["id"]
    resp = await client.delete(f"/categories/{cat_id}")
    assert resp.status_code == 204
