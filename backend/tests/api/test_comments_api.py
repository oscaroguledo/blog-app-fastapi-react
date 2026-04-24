"""API tests for /comments endpoints."""
import pytest
import uuid
from tests.conftest import create_test_user, get_auth_token


@pytest.fixture
async def auth_headers(client, db_session):
    await create_test_user(db_session, email="commenter@test.com", password="Pass123!")
    token = await get_auth_token(client, "commenter@test.com", "Pass123!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def post_id(client, auth_headers):
    resp = await client.post("/posts/", params={
        "title": "Post for Comments", "excerpt": "x",
        "content": "content", "coverImage": "x"
    }, headers=auth_headers)
    return resp.json()["data"]["id"]


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------
async def test_create_comment(client, auth_headers, post_id):
    resp = await client.post("/comments/", params={
        "post_id": post_id, "content": "Great post!"
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["data"]["content"] == "Great post!"


async def test_create_comment_unauthenticated(client, post_id):
    resp = await client.post("/comments/", params={
        "post_id": post_id, "content": "Sneaky"
    })
    assert resp.status_code == 403


async def test_create_threaded_comment(client, auth_headers, post_id):
    parent = await client.post("/comments/", params={
        "post_id": post_id, "content": "Parent comment"
    }, headers=auth_headers)
    parent_id = parent.json()["data"]["id"]
    resp = await client.post("/comments/", params={
        "post_id": post_id, "content": "Reply", "parent_id": parent_id
    }, headers=auth_headers)
    assert resp.status_code == 201


# ---------------------------------------------------------------------------
# List / Get
# ---------------------------------------------------------------------------
async def test_list_comments(client, auth_headers, post_id):
    await client.post("/comments/", params={"post_id": post_id, "content": "C1"}, headers=auth_headers)
    await client.post("/comments/", params={"post_id": post_id, "content": "C2"}, headers=auth_headers)
    resp = await client.get("/comments/", params={"post_id": post_id})
    assert resp.status_code == 200
    assert len(resp.json()["data"]) >= 2


async def test_get_comment(client, auth_headers, post_id):
    create = await client.post("/comments/", params={
        "post_id": post_id, "content": "Fetch me"
    }, headers=auth_headers)
    comment_id = create.json()["data"]["id"]
    resp = await client.get(f"/comments/{comment_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["content"] == "Fetch me"


async def test_get_comment_not_found(client):
    resp = await client.get(f"/comments/{uuid.uuid4()}")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Update / Delete
# ---------------------------------------------------------------------------
async def test_update_comment(client, auth_headers, post_id):
    create = await client.post("/comments/", params={
        "post_id": post_id, "content": "Old content"
    }, headers=auth_headers)
    comment_id = create.json()["data"]["id"]
    resp = await client.patch(
        f"/comments/{comment_id}", params={"content": "New content"},
        headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["content"] == "New content"


async def test_update_comment_unauthorized(client, db_session, auth_headers, post_id):
    create = await client.post("/comments/", params={
        "post_id": post_id, "content": "Mine"
    }, headers=auth_headers)
    comment_id = create.json()["data"]["id"]
    await create_test_user(db_session, email="other2@test.com", password="Pass123!")
    other_token = await get_auth_token(client, "other2@test.com", "Pass123!")
    resp = await client.patch(
        f"/comments/{comment_id}", params={"content": "Hijacked"},
        headers={"Authorization": f"Bearer {other_token}"}
    )
    assert resp.status_code == 403


async def test_delete_comment(client, auth_headers, post_id):
    create = await client.post("/comments/", params={
        "post_id": post_id, "content": "Delete me"
    }, headers=auth_headers)
    comment_id = create.json()["data"]["id"]
    resp = await client.delete(f"/comments/{comment_id}", headers=auth_headers)
    assert resp.status_code == 204


# ---------------------------------------------------------------------------
# Likes
# ---------------------------------------------------------------------------
async def test_like_comment(client, auth_headers, post_id):
    create = await client.post("/comments/", params={
        "post_id": post_id, "content": "Like me"
    }, headers=auth_headers)
    comment_id = create.json()["data"]["id"]
    resp = await client.post(f"/comments/{comment_id}/like")
    assert resp.status_code == 200
    assert resp.json()["data"]["likes"] == 1


async def test_unlike_comment(client, auth_headers, post_id):
    create = await client.post("/comments/", params={
        "post_id": post_id, "content": "Unlike me"
    }, headers=auth_headers)
    comment_id = create.json()["data"]["id"]
    await client.post(f"/comments/{comment_id}/like")
    resp = await client.post(f"/comments/{comment_id}/unlike")
    assert resp.status_code == 200
    assert resp.json()["data"]["likes"] == 0
