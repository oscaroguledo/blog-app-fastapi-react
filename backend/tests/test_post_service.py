"""
Tests for PostService.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock, patch
from models.post import Post
from services.post import PostService


class TestPostServiceCreate:
    """Test PostService.create method."""

    @pytest.mark.asyncio
    async def test_create_post_returns_post_object(self, mock_db_session):
        """Test that creating a post returns a Post object."""
        # Arrange
        post_service = PostService(mock_db_session)
        author_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.id = uuid.uuid4()
        mock_post.title = "Test Post"
        
        mock_db_session.add = MagicMock()
        mock_db_session.flush = AsyncMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.create(
            title="Test Post",
            excerpt="Test excerpt",
            content="Test content",
            coverImage="http://example.com/image.jpg",
            authorId=author_id
        )
        
        # Assert
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_post_raises_error_when_title_missing(self, mock_db_session):
        """Test that creating a post without title raises ValueError."""
        # Arrange
        post_service = PostService(mock_db_session)
        author_id = uuid.uuid4()
        
        # Act & Assert
        with pytest.raises(ValueError, match="Title is required"):
            await post_service.create(
                title="",
                excerpt="Test excerpt",
                content="Test content",
                coverImage="http://example.com/image.jpg",
                authorId=author_id
            )

    @pytest.mark.asyncio
    async def test_create_post_raises_error_when_content_missing(self, mock_db_session):
        """Test that creating a post without content raises ValueError."""
        # Arrange
        post_service = PostService(mock_db_session)
        author_id = uuid.uuid4()
        
        # Act & Assert
        with pytest.raises(ValueError, match="Content is required"):
            await post_service.create(
                title="Test Post",
                excerpt="Test excerpt",
                content="",
                coverImage="http://example.com/image.jpg",
                authorId=author_id
            )


class TestPostServiceGet:
    """Test PostService.get method."""

    @pytest.mark.asyncio
    async def test_get_post_by_id_returns_post(self, mock_db_session):
        """Test that getting a post by ID returns the post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        
        # Act
        result = await post_service.get(post_id)
        
        # Assert
        assert result == mock_post
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_post_returns_none_when_not_found(self, mock_db_session):
        """Test that getting a post returns None when not found."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await post_service.get(post_id)
        
        # Assert
        assert result is None


class TestPostServiceUpdate:
    """Test PostService.update method."""

    @pytest.mark.asyncio
    async def test_update_post_returns_updated_post(self, mock_db_session):
        """Test that updating a post returns the updated post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.title = "Old Title"
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.update(post_id, title="New Title")
        
        # Assert
        assert result == mock_post
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_post_returns_none_when_not_found(self, mock_db_session):
        """Test that updating a non-existent post returns None."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await post_service.update(post_id, title="New Title")
        
        # Assert
        assert result is None


class TestPostServiceDelete:
    """Test PostService.delete method."""

    @pytest.mark.asyncio
    async def test_delete_post_returns_true_on_success(self, mock_db_session):
        """Test that deleting a post returns True on success."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.delete = AsyncMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        result = await post_service.delete(post_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_post_returns_false_when_not_found(self, mock_db_session):
        """Test that deleting a non-existent post returns False."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await post_service.delete(post_id)
        
        # Assert
        assert result is False


class TestPostServiceIncrementLikes:
    """Test PostService.increment_likes method."""

    @pytest.mark.asyncio
    async def test_increment_likes_returns_post(self, mock_db_session):
        """Test that incrementing likes returns the post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.likes = 5
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.increment_likes(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.likes == 6
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_increment_likes_returns_none_when_not_found(self, mock_db_session):
        """Test that incrementing likes returns None when post not found."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await post_service.increment_likes(post_id)
        
        # Assert
        assert result is None


class TestPostServiceDecrementLikes:
    """Test PostService.decrement_likes method."""

    @pytest.mark.asyncio
    async def test_decrement_likes_returns_post(self, mock_db_session):
        """Test that decrementing likes returns the post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.likes = 5
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.decrement_likes(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.likes == 4
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_decrement_likes_does_not_go_below_zero(self, mock_db_session):
        """Test that decrementing likes doesn't go below zero."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.likes = 0
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.decrement_likes(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.likes == 0


class TestPostServiceIncrementViews:
    """Test PostService.increment_views method."""

    @pytest.mark.asyncio
    async def test_increment_views_returns_post(self, mock_db_session):
        """Test that incrementing views returns the post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.views = 10
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.increment_views(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.views == 11
        mock_db_session.commit.assert_called_once()


class TestPostServicePublish:
    """Test PostService.publish method."""

    @pytest.mark.asyncio
    async def test_publish_post_returns_published_post(self, mock_db_session):
        """Test that publishing a post returns the published post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.isPublished = False
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.publish(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.isPublished is True
        mock_db_session.commit.assert_called_once()


class TestPostServiceUnpublish:
    """Test PostService.unpublish method."""

    @pytest.mark.asyncio
    async def test_unpublish_post_returns_unpublished_post(self, mock_db_session):
        """Test that unpublishing a post returns the unpublished post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.isPublished = True
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.unpublish(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.isPublished is False
        mock_db_session.commit.assert_called_once()


class TestPostServiceFeature:
    """Test PostService.feature method."""

    @pytest.mark.asyncio
    async def test_feature_post_returns_featured_post(self, mock_db_session):
        """Test that featuring a post returns the featured post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.featured = False
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.feature(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.featured is True
        mock_db_session.commit.assert_called_once()


class TestPostServiceUnfeature:
    """Test PostService.unfeature method."""

    @pytest.mark.asyncio
    async def test_unfeature_post_returns_unfeatured_post(self, mock_db_session):
        """Test that unfeaturing a post returns the unfeatured post."""
        # Arrange
        post_service = PostService(mock_db_session)
        post_id = uuid.uuid4()
        
        mock_post = MagicMock()
        mock_post.featured = True
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await post_service.unfeature(post_id)
        
        # Assert
        assert result == mock_post
        assert mock_post.featured is False
        mock_db_session.commit.assert_called_once()
