"""API tests for /users endpoints."""
import pytest
from tests.conftest import create_test_user, get_auth_token


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------
async def test_register_success(client):
    resp = await client.post("/users/register", params={
        "firstName": "Alice", "lastName": "Smith",
        "email": "alice@test.com", "password": "Pass123!"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "alice@test.com"


async def test_register_duplicate_email(client):
    params = {"firstName": "Bob", "lastName": "Jones",
               "email": "bob@test.com", "password": "Pass123!"}
    await client.post("/users/register", params=params)
    resp = await client.post("/users/register", params=params)
    assert resp.status_code == 400
    assert resp.json()["success"] is False


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------
async def test_login_success(client, db_session):
    await create_test_user(db_session, email="login@test.com", password="Pass123!")
    resp = await client.post("/users/login", params={
        "email": "login@test.com", "password": "Pass123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


async def test_login_wrong_password(client, db_session):
    await create_test_user(db_session, email="wrongpass@test.com", password="correct")
    resp = await client.post("/users/login", params={
        "email": "wrongpass@test.com", "password": "wrong"
    })
    assert resp.status_code == 401
    assert resp.json()["success"] is False


async def test_login_nonexistent_user(client):
    resp = await client.post("/users/login", params={
        "email": "ghost@test.com", "password": "pass"
    })
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Token refresh
# ---------------------------------------------------------------------------
async def test_refresh_token(client, db_session):
    await create_test_user(db_session, email="refresh@test.com", password="Pass123!")
    login = await client.post("/users/login", params={
        "email": "refresh@test.com", "password": "Pass123!"
    })
    refresh_token = login.json()["data"]["refresh_token"]
    resp = await client.post("/users/refresh", params={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()["data"]


async def test_refresh_invalid_token(client):
    resp = await client.post("/users/refresh", params={"refresh_token": "bad.token.here"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# /me endpoints
# ---------------------------------------------------------------------------
async def test_get_me(client, db_session):
    await create_test_user(db_session, email="me@test.com", password="Pass123!")
    token = await get_auth_token(client, "me@test.com", "Pass123!")
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["data"]["email"] == "me@test.com"


async def test_get_me_no_token(client):
    resp = await client.get("/users/me")
    assert resp.status_code == 403


async def test_update_me(client, db_session):
    await create_test_user(db_session, email="update@test.com", password="Pass123!")
    token = await get_auth_token(client, "update@test.com", "Pass123!")
    resp = await client.patch(
        "/users/me",
        params={"firstName": "Updated"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["firstName"] == "Updated"


async def test_deactivate_me(client, db_session):
    await create_test_user(db_session, email="deact@test.com", password="Pass123!")
    token = await get_auth_token(client, "deact@test.com", "Pass123!")
    resp = await client.post(
        "/users/me/deactivate",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["active"] is False


# ---------------------------------------------------------------------------
# List / Get by ID
# ---------------------------------------------------------------------------
async def test_list_users(client, db_session):
    await create_test_user(db_session, email="list1@test.com", password="pass")
    resp = await client.get("/users/")
    assert resp.status_code == 200
    assert isinstance(resp.json()["data"], list)


async def test_get_user_by_id(client, db_session):
    user = await create_test_user(db_session, email="byid@test.com", password="pass")
    resp = await client.get(f"/users/{user.id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["email"] == "byid@test.com"


async def test_get_user_invalid_id(client):
    resp = await client.get("/users/not-a-uuid")
    assert resp.status_code == 400
