"""API tests for /tags endpoints."""
import uuid


async def test_create_tag(client):
    resp = await client.post("/tags/", params={"name": "FastAPI", "slug": "fastapi"})
    assert resp.status_code == 201
    assert resp.json()["data"]["name"] == "FastAPI"


async def test_list_tags(client):
    await client.post("/tags/", params={"name": "Docker", "slug": "docker"})
    resp = await client.get("/tags/")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) >= 1


async def test_list_tags_search(client):
    await client.post("/tags/", params={"name": "SQLAlchemy", "slug": "sqlalchemy"})
    resp = await client.get("/tags/", params={"search_query": "sqlalchemy"})
    assert resp.status_code == 200
    assert any(t["slug"] == "sqlalchemy" for t in resp.json()["data"])


async def test_get_tag_by_id(client):
    create = await client.post("/tags/", params={"name": "Redis", "slug": "redis"})
    tag_id = create.json()["data"]["id"]
    resp = await client.get(f"/tags/{tag_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "Redis"


async def test_get_tag_not_found(client):
    resp = await client.get(f"/tags/{uuid.uuid4()}")
    assert resp.status_code == 404


async def test_update_tag(client):
    create = await client.post("/tags/", params={"name": "OldTag", "slug": "old-tag"})
    tag_id = create.json()["data"]["id"]
    resp = await client.patch(f"/tags/{tag_id}", params={"name": "NewTag"})
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "NewTag"


async def test_delete_tag(client):
    create = await client.post("/tags/", params={"name": "DelTag", "slug": "del-tag"})
    tag_id = create.json()["data"]["id"]
    resp = await client.delete(f"/tags/{tag_id}")
    assert resp.status_code == 204
