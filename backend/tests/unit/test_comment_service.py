"""Unit tests for CommentService."""
import pytest
import pytest_asyncio
from services.comment import CommentService
from services.user import UserService
from services.post import PostService


@pytest_asyncio.fixture
async def author(db_session):
    return await UserService(db_session).create(
        firstName="Commenter", lastName="User", email="commenter@test.com", password="pass"
    )


@pytest_asyncio.fixture
async def post(db_session, author):
    return await PostService(db_session).create(
        title="Post for Comments", excerpt="x", content="content",
        coverImage="x", authorId=author.id
    )


@pytest_asyncio.fixture
async def svc(db_session):
    return CommentService(db_session)


async def test_create_comment(svc, post, author):
    comment = await svc.create(
        post_id=post.id, author_id=author.id, content="Great post!"
    )
    assert comment.id is not None
    assert comment.content == "Great post!"
    assert comment.likes == 0


async def test_create_comment_missing_content(svc, post, author):
    with pytest.raises(ValueError, match="Content is required"):
        await svc.create(post_id=post.id, author_id=author.id, content="")


async def test_get_comment(svc, post, author):
    comment = await svc.create(post_id=post.id, author_id=author.id, content="Hello")
    fetched = await svc.get(comment.id)
    assert fetched is not None
    assert fetched.content == "Hello"


async def test_list_comments_by_post(svc, post, author):
    await svc.create(post_id=post.id, author_id=author.id, content="Comment 1")
    await svc.create(post_id=post.id, author_id=author.id, content="Comment 2")
    comments = await svc.list(post_id=post.id)
    assert len(comments) >= 2


async def test_update_comment(svc, post, author):
    comment = await svc.create(post_id=post.id, author_id=author.id, content="Old")
    updated = await svc.update(comment.id, content="New")
    assert updated.content == "New"


async def test_delete_comment(svc, post, author):
    comment = await svc.create(post_id=post.id, author_id=author.id, content="Delete me")
    assert await svc.delete(comment.id) is True
    assert await svc.get(comment.id) is None


async def test_increment_likes(svc, post, author):
    comment = await svc.create(post_id=post.id, author_id=author.id, content="Like me")
    updated = await svc.increment_likes(comment.id)
    assert updated.likes == 1


async def test_decrement_likes_no_below_zero(svc, post, author):
    comment = await svc.create(post_id=post.id, author_id=author.id, content="Unlike me")
    updated = await svc.decrement_likes(comment.id)
    assert updated.likes == 0


async def test_threaded_comment(svc, post, author):
    parent = await svc.create(post_id=post.id, author_id=author.id, content="Parent")
    child = await svc.create(
        post_id=post.id, author_id=author.id, content="Reply", parent_id=parent.id
    )
    assert child.parent_id == parent.id
    replies = await svc.list(parent_id=parent.id)
    assert any(c.id == child.id for c in replies)
