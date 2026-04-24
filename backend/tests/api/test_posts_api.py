"""API tests for /posts endpoints."""
import pytest
import uuid
from tests.conftest import create_test_user, get_auth_token


@pytest.fixture
async def auth_headers(client, db_session):
    await create_test_user(db_session, email="poster@test.com", password="Pass123!")
    token = await get_auth_token(client, "poster@test.com", "Pass123!")
    return {"Authorization": f"Bearer {token}"}


async def _create_post(client, auth_headers, title="Test Post"):
    return await client.post("/posts/", params={
        "title": title,
        "excerpt": "Short excerpt",
        "content": "Full content of the post goes here.",
        "coverImage": "https://example.com/cover.jpg",
    }, headers=auth_headers)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------
async def test_create_post(client, auth_headers):
    resp = await _create_post(client, auth_headers)
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["title"] == "Test Post"
    assert data["likes"] == 0
    assert data["views"] == 0


async def test_create_post_unauthenticated(client):
    resp = await client.post("/posts/", params={
        "title": "x", "excerpt": "x", "content": "x", "coverImage": "x"
    })
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# List / Get
# ---------------------------------------------------------------------------
async def test_list_posts(client, auth_headers):
    await _create_post(client, auth_headers, "List Post 1")
    await _create_post(client, auth_headers, "List Post 2")
    resp = await client.get("/posts/")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) >= 2


async def test_list_posts_search(client, auth_headers):
    await _create_post(client, auth_headers, "Unique XYZ Post")
    resp = await client.get("/posts/", params={"search_query": "Unique XYZ"})
    assert resp.status_code == 200
    assert any(p["title"] == "Unique XYZ Post" for p in resp.json()["data"])


async def test_list_posts_filter_published(client, auth_headers):
    await client.post("/posts/", params={
        "title": "Published Post", "excerpt": "x", "content": "c",
        "coverImage": "x", "isPublished": "true"
    }, headers=auth_headers)
    resp = await client.get("/posts/", params={"is_published": "true"})
    assert all(p["isPublished"] for p in resp.json()["data"])


async def test_get_post(client, auth_headers):
    create = await _create_post(client, auth_headers, "Get This Post")
    post_id = create.json()["data"]["id"]
    resp = await client.get(f"/posts/{post_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["title"] == "Get This Post"


async def test_get_post_not_found(client):
    resp = await client.get(f"/posts/{uuid.uuid4()}")
    assert resp.status_code == 404


async def test_latest_posts(client, auth_headers):
    await _create_post(client, auth_headers, "Latest 1")
    resp = await client.get("/posts/latest", params={"limit": 5})
    assert resp.status_code == 200
    assert isinstance(resp.json()["data"], list)


# ---------------------------------------------------------------------------
# Update / Delete
# ---------------------------------------------------------------------------
async def test_update_post(client, auth_headers):
    create = await _create_post(client, auth_headers, "Original Title")
    post_id = create.json()["data"]["id"]
    resp = await client.patch(
        f"/posts/{post_id}", params={"title": "Updated Title"}, headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["title"] == "Updated Title"


async def test_update_post_unauthorized(client, db_session, auth_headers):
    create = await _create_post(client, auth_headers, "Someone's Post")
    post_id = create.json()["data"]["id"]
    # Create a different user and try to update
    await create_test_user(db_session, email="other@test.com", password="Pass123!")
    other_token = await get_auth_token(client, "other@test.com", "Pass123!")
    resp = await client.patch(
        f"/posts/{post_id}", params={"title": "Hijacked"},
        headers={"Authorization": f"Bearer {other_token}"}
    )
    assert resp.status_code == 403


async def test_delete_post(client, auth_headers):
    create = await _create_post(client, auth_headers, "Delete This")
    post_id = create.json()["data"]["id"]
    resp = await client.delete(f"/posts/{post_id}", headers=auth_headers)
    assert resp.status_code == 204


# ---------------------------------------------------------------------------
# Actions
# ---------------------------------------------------------------------------
async def test_like_post(client, auth_headers):
    create = await _create_post(client, auth_headers)
    post_id = create.json()["data"]["id"]
    resp = await client.post(f"/posts/{post_id}/like")
    assert resp.status_code == 200
    assert resp.json()["data"]["likes"] == 1


async def test_unlike_post(client, auth_headers):
    create = await _create_post(client, auth_headers)
    post_id = create.json()["data"]["id"]
    await client.post(f"/posts/{post_id}/like")
    resp = await client.post(f"/posts/{post_id}/unlike")
    assert resp.status_code == 200
    assert resp.json()["data"]["likes"] == 0


async def test_view_post(client, auth_headers):
    create = await _create_post(client, auth_headers)
    post_id = create.json()["data"]["id"]
    resp = await client.post(f"/posts/{post_id}/view")
    assert resp.status_code == 200
    assert resp.json()["data"]["views"] == 1


async def test_publish_unpublish_post(client, auth_headers):
    create = await _create_post(client, auth_headers)
    post_id = create.json()["data"]["id"]
    assert (await client.post(f"/posts/{post_id}/publish")).json()["data"]["isPublished"] is True
    assert (await client.post(f"/posts/{post_id}/unpublish")).json()["data"]["isPublished"] is False


async def test_feature_unfeature_post(client, auth_headers):
    create = await _create_post(client, auth_headers)
    post_id = create.json()["data"]["id"]
    assert (await client.post(f"/posts/{post_id}/feature")).json()["data"]["featured"] is True
    assert (await client.post(f"/posts/{post_id}/unfeature")).json()["data"]["featured"] is False
