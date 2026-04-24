"""Unit tests for UserService."""
import pytest
import pytest_asyncio
from services.user import UserService
from models.user import UserRole


@pytest_asyncio.fixture
async def svc(db_session):
    return UserService(db_session)


async def test_create_user(svc):
    user = await svc.create(
        firstName="Jane",
        lastName="Doe",
        email="jane@example.com",
        password="Password1!",
    )
    assert user.id is not None
    assert user.email == "jane@example.com"
    assert user.firstName == "Jane"
    assert user.role == UserRole.READER.value


async def test_create_user_hashes_password(svc):
    user = await svc.create(
        firstName="A", lastName="B", email="a@b.com", password="plain"
    )
    assert user.password != "plain"


async def test_create_user_missing_email(svc):
    with pytest.raises(ValueError, match="Email is required"):
        await svc.create(firstName="A", lastName="B", email="", password="pass")


async def test_create_user_missing_password(svc):
    with pytest.raises(ValueError, match="Password is required"):
        await svc.create(firstName="A", lastName="B", email="x@x.com", password="")


async def test_get_user_by_email(svc):
    await svc.create(firstName="C", lastName="D", email="c@d.com", password="pass")
    user = await svc.get(email="c@d.com")
    assert user is not None
    assert user.email == "c@d.com"


async def test_get_user_not_found(svc):
    user = await svc.get(email="nobody@nowhere.com")
    assert user is None


async def test_get_user_requires_id_or_email(svc):
    with pytest.raises(ValueError):
        await svc.get()


async def test_login_success(svc):
    await svc.create(
        firstName="E", lastName="F", email="e@f.com", password="correct"
    )
    user, access, refresh = await svc.login("e@f.com", "correct")
    assert user is not None
    assert access is not None
    assert refresh is not None


async def test_login_wrong_password(svc):
    await svc.create(
        firstName="G", lastName="H", email="g@h.com", password="correct"
    )
    user, access, refresh = await svc.login("g@h.com", "wrong")
    assert user is None
    assert access is None


async def test_login_nonexistent_user(svc):
    user, access, refresh = await svc.login("no@one.com", "pass")
    assert user is None


async def test_update_user(svc):
    user = await svc.create(
        firstName="I", lastName="J", email="i@j.com", password="pass"
    )
    updated = await svc.update(user.id, firstName="Updated")
    assert updated.firstName == "Updated"


async def test_delete_user(svc):
    user = await svc.create(
        firstName="K", lastName="L", email="k@l.com", password="pass"
    )
    result = await svc.delete(user.id)
    assert result is True
    assert await svc.get(email="k@l.com") is None


async def test_activate_deactivate(svc):
    user = await svc.create(
        firstName="M", lastName="N", email="m@n.com", password="pass"
    )
    deactivated = await svc.deactivate(user.id)
    assert deactivated.active is False
    activated = await svc.activate(user.id)
    assert activated.active is True


async def test_list_users(svc):
    await svc.create(firstName="P", lastName="Q", email="p@q.com", password="pass")
    await svc.create(firstName="R", lastName="S", email="r@s.com", password="pass")
    users = await svc.list()
    assert len(users) >= 2


async def test_list_users_filter_by_active(svc):
    user = await svc.create(
        firstName="T", lastName="U", email="t@u.com", password="pass"
    )
    await svc.deactivate(user.id)
    active_users = await svc.list(active=True)
    inactive_users = await svc.list(active=False)
    assert all(u.active for u in active_users)
    assert all(not u.active for u in inactive_users)


async def test_refresh_tokens(svc):
    user = await svc.create(
        firstName="V", lastName="W", email="v@w.com", password="pass"
    )
    _, _, refresh = await svc.login("v@w.com", "pass")
    user2, new_access, new_refresh = await svc.refresh_tokens(refresh)
    assert user2 is not None
    assert new_access is not None
    assert new_refresh is not None
