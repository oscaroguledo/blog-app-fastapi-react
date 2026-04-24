"""Unit tests for PostService."""
import pytest
import pytest_asyncio
from services.post import PostService
from services.user import UserService
from services.category import CategoryService
from services.tag import TagService


@pytest_asyncio.fixture
async def author(db_session):
    svc = UserService(db_session)
    return await svc.create(
        firstName="Author", lastName="One", email="author@post.com", password="pass"
    )


@pytest_asyncio.fixture
async def svc(db_session):
    return PostService(db_session)


async def test_create_post(svc, author):
    post = await svc.create(
        title="Hello World",
        excerpt="A short excerpt",
        content="This is the full content of the post.",
        coverImage="https://example.com/img.jpg",
        authorId=author.id,
    )
    assert post.id is not None
    assert post.title == "Hello World"
    assert post.readingTime >= 1
    assert post.likes == 0
    assert post.views == 0


async def test_create_post_missing_title(svc, author):
    with pytest.raises(ValueError, match="Title is required"):
        await svc.create(
            title="", excerpt="x", content="x", coverImage="x", authorId=author.id
        )


async def test_get_post(svc, author):
    post = await svc.create(
        title="Get Me", excerpt="x", content="content", coverImage="x", authorId=author.id
    )
    fetched = await svc.get(post.id)
    assert fetched is not None
    assert fetched.title == "Get Me"


async def test_get_nonexistent_post(svc):
    import uuid
    assert await svc.get(uuid.uuid4()) is None


async def test_list_posts(svc, author):
    await svc.create(title="Post 1", excerpt="x", content="c", coverImage="x", authorId=author.id)
    await svc.create(title="Post 2", excerpt="x", content="c", coverImage="x", authorId=author.id)
    posts = await svc.list()
    assert len(posts) >= 2


async def test_list_posts_filter_published(svc, author):
    await svc.create(
        title="Published", excerpt="x", content="c", coverImage="x",
        authorId=author.id, isPublished=True
    )
    await svc.create(
        title="Draft", excerpt="x", content="c", coverImage="x",
        authorId=author.id, isPublished=False
    )
    published = await svc.list(is_published=True)
    assert all(p.isPublished for p in published)


async def test_list_posts_search(svc, author):
    await svc.create(
        title="Unique Title XYZ", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    results = await svc.list(search_query="Unique Title XYZ")
    assert any(p.title == "Unique Title XYZ" for p in results)


async def test_update_post(svc, author):
    post = await svc.create(
        title="Original", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    updated = await svc.update(post.id, title="Updated Title")
    assert updated.title == "Updated Title"


async def test_delete_post(svc, author):
    post = await svc.create(
        title="Delete Me", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    assert await svc.delete(post.id) is True
    assert await svc.get(post.id) is None


async def test_increment_likes(svc, author):
    post = await svc.create(
        title="Likeable", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    updated = await svc.increment_likes(post.id)
    assert updated.likes == 1


async def test_decrement_likes_no_below_zero(svc, author):
    post = await svc.create(
        title="Unlike", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    updated = await svc.decrement_likes(post.id)
    assert updated.likes == 0  # already 0, should not go negative


async def test_increment_views(svc, author):
    post = await svc.create(
        title="Viewable", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    updated = await svc.increment_views(post.id)
    assert updated.views == 1


async def test_publish_unpublish(svc, author):
    post = await svc.create(
        title="Publish Me", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    published = await svc.publish(post.id)
    assert published.isPublished is True
    unpublished = await svc.unpublish(post.id)
    assert unpublished.isPublished is False


async def test_feature_unfeature(svc, author):
    post = await svc.create(
        title="Feature Me", excerpt="x", content="c", coverImage="x", authorId=author.id
    )
    featured = await svc.feature(post.id)
    assert featured.featured is True
    unfeatured = await svc.unfeature(post.id)
    assert unfeatured.featured is False


async def test_reading_time_calculation(svc, author):
    # 400 words → ~2 minutes
    content = " ".join(["word"] * 400)
    post = await svc.create(
        title="Long Post", excerpt="x", content=content, coverImage="x", authorId=author.id
    )
    assert post.readingTime == 2


async def test_create_post_with_categories(db_session, author):
    cat_svc = CategoryService(db_session)
    cat = await cat_svc.create(name="PostCat", slug="post-cat")
    post_svc = PostService(db_session)
    post = await post_svc.create(
        title="With Category", excerpt="x", content="c", coverImage="x",
        authorId=author.id, category_ids=[cat.id]
    )
    assert post.id is not None


async def test_create_post_with_tags(db_session, author):
    tag_svc = TagService(db_session)
    tag = await tag_svc.create(name="PostTag", slug="post-tag")
    post_svc = PostService(db_session)
    post = await post_svc.create(
        title="With Tag", excerpt="x", content="c", coverImage="x",
        authorId=author.id, tag_ids=[tag.id]
    )
    assert post.id is not None
