"""
Tests for CommentService.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock
from models.comment import Comment
from services.comment import CommentService


class TestCommentServiceCreate:
    """Test CommentService.create method."""

    @pytest.mark.asyncio
    async def test_create_comment_returns_comment_object(self, mock_db_session):
        """Test that creating a comment returns a Comment object."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        post_id = uuid.uuid4()
        author_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_comment.id = uuid.uuid4()
        mock_comment.content = "Test comment"
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await comment_service.create(
            post_id=post_id,
            author_id=author_id,
            content="Test comment"
        )
        
        # Assert
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_comment_raises_error_when_content_missing(self, mock_db_session):
        """Test that creating a comment without content raises ValueError."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        post_id = uuid.uuid4()
        author_id = uuid.uuid4()
        
        # Act & Assert
        with pytest.raises(ValueError, match="Content is required"):
            await comment_service.create(
                post_id=post_id,
                author_id=author_id,
                content=""
            )

    @pytest.mark.asyncio
    async def test_create_comment_raises_error_when_post_id_missing(self, mock_db_session):
        """Test that creating a comment without post_id raises ValueError."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        author_id = uuid.uuid4()
        
        # Act & Assert
        with pytest.raises(ValueError, match="Post ID is required"):
            await comment_service.create(
                post_id=None,
                author_id=author_id,
                content="Test comment"
            )

    @pytest.mark.asyncio
    async def test_create_comment_raises_error_when_author_id_missing(self, mock_db_session):
        """Test that creating a comment without author_id raises ValueError."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        post_id = uuid.uuid4()
        
        # Act & Assert
        with pytest.raises(ValueError, match="Author ID is required"):
            await comment_service.create(
                post_id=post_id,
                author_id=None,
                content="Test comment"
            )


class TestCommentServiceGet:
    """Test CommentService.get method."""

    @pytest.mark.asyncio
    async def test_get_comment_by_id_returns_comment(self, mock_db_session):
        """Test that getting a comment by ID returns the comment."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await comment_service.get(comment_id)
        
        # Assert
        assert result == mock_comment
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_comment_returns_none_when_not_found(self, mock_db_session):
        """Test that getting a comment returns None when not found."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await comment_service.get(comment_id)
        
        # Assert
        assert result is None


class TestCommentServiceUpdate:
    """Test CommentService.update method."""

    @pytest.mark.asyncio
    async def test_update_comment_returns_updated_comment(self, mock_db_session):
        """Test that updating a comment returns the updated comment."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.content = "Old content"
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await comment_service.update(comment_id, content="New content")
        
        # Assert
        assert result == mock_comment
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_comment_returns_none_when_not_found(self, mock_db_session):
        """Test that updating a non-existent comment returns None."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await comment_service.update(comment_id, content="New content")
        
        # Assert
        assert result is None


class TestCommentServiceDelete:
    """Test CommentService.delete method."""

    @pytest.mark.asyncio
    async def test_delete_comment_returns_true_on_success(self, mock_db_session):
        """Test that deleting a comment returns True on success."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.delete = MagicMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        result = await comment_service.delete(comment_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_comment_returns_false_when_not_found(self, mock_db_session):
        """Test that deleting a non-existent comment returns False."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await comment_service.delete(comment_id)
        
        # Assert
        assert result is False


class TestCommentServiceIncrementLikes:
    """Test CommentService.increment_likes method."""

    @pytest.mark.asyncio
    async def test_increment_likes_returns_comment(self, mock_db_session):
        """Test that incrementing likes returns the comment."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_comment.likes = 5
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await comment_service.increment_likes(comment_id)
        
        # Assert
        assert result == mock_comment
        assert mock_comment.likes == 6
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_increment_likes_returns_none_when_not_found(self, mock_db_session):
        """Test that incrementing likes returns None when comment not found."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await comment_service.increment_likes(comment_id)
        
        # Assert
        assert result is None


class TestCommentServiceDecrementLikes:
    """Test CommentService.decrement_likes method."""

    @pytest.mark.asyncio
    async def test_decrement_likes_returns_comment(self, mock_db_session):
        """Test that decrementing likes returns the comment."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_comment.likes = 5
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await comment_service.decrement_likes(comment_id)
        
        # Assert
        assert result == mock_comment
        assert mock_comment.likes == 4
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_decrement_likes_does_not_go_below_zero(self, mock_db_session):
        """Test that decrementing likes doesn't go below zero."""
        # Arrange
        comment_service = CommentService(mock_db_session)
        comment_id = uuid.uuid4()
        
        mock_comment = MagicMock()
        mock_comment.likes = 0
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await comment_service.decrement_likes(comment_id)
        
        # Assert
        assert result == mock_comment
        assert mock_comment.likes == 0
