"""
Tests for TagService.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock
from models.tag import Tag
from services.tag import TagService


class TestTagServiceCreate:
    """Test TagService.create method."""

    @pytest.mark.asyncio
    async def test_create_tag_returns_tag_object(self, mock_db_session):
        """Test that creating a tag returns a Tag object."""
        # Arrange
        tag_service = TagService(mock_db_session)
        
        mock_tag = MagicMock()
        mock_tag.id = uuid.uuid4()
        mock_tag.name = "Test Tag"
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await tag_service.create(
            name="Test Tag",
            slug="test-tag"
        )
        
        # Assert
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_tag_raises_error_when_name_missing(self, mock_db_session):
        """Test that creating a tag without name raises ValueError."""
        # Arrange
        tag_service = TagService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Name is required"):
            await tag_service.create(
                name="",
                slug="test-tag"
            )

    @pytest.mark.asyncio
    async def test_create_tag_raises_error_when_slug_missing(self, mock_db_session):
        """Test that creating a tag without slug raises ValueError."""
        # Arrange
        tag_service = TagService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Slug is required"):
            await tag_service.create(
                name="Test Tag",
                slug=""
            )


class TestTagServiceGet:
    """Test TagService.get method."""

    @pytest.mark.asyncio
    async def test_get_tag_by_id_returns_tag(self, mock_db_session):
        """Test that getting a tag by ID returns the tag."""
        # Arrange
        tag_service = TagService(mock_db_session)
        tag_id = uuid.uuid4()
        
        mock_tag = MagicMock()
        mock_tag.id = tag_id
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_tag)
        
        # Act
        result = await tag_service.get(tag_id=tag_id)
        
        # Assert
        assert result == mock_tag
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_tag_by_slug_returns_tag(self, mock_db_session):
        """Test that getting a tag by slug returns the tag."""
        # Arrange
        tag_service = TagService(mock_db_session)
        
        mock_tag = MagicMock()
        mock_tag.slug = "test-tag"
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_tag)
        
        # Act
        result = await tag_service.get(slug="test-tag")
        
        # Assert
        assert result == mock_tag
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_tag_by_name_returns_tag(self, mock_db_session):
        """Test that getting a tag by name returns the tag."""
        # Arrange
        tag_service = TagService(mock_db_session)
        
        mock_tag = MagicMock()
        mock_tag.name = "Test Tag"
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_tag)
        
        # Act
        result = await tag_service.get(name="Test Tag")
        
        # Assert
        assert result == mock_tag
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_tag_raises_error_when_no_params(self, mock_db_session):
        """Test that getting a tag without ID, slug, or name raises ValueError."""
        # Arrange
        tag_service = TagService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="At least one of tag_id, slug, or name must be provided"):
            await tag_service.get()


class TestTagServiceUpdate:
    """Test TagService.update method."""

    @pytest.mark.asyncio
    async def test_update_tag_returns_updated_tag(self, mock_db_session):
        """Test that updating a tag returns the updated tag."""
        # Arrange
        tag_service = TagService(mock_db_session)
        tag_id = uuid.uuid4()
        
        mock_tag = MagicMock()
        mock_tag.id = tag_id
        mock_tag.name = "Old Name"
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_tag)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await tag_service.update(tag_id, name="New Name")
        
        # Assert
        assert result == mock_tag
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_tag_returns_none_when_not_found(self, mock_db_session):
        """Test that updating a non-existent tag returns None."""
        # Arrange
        tag_service = TagService(mock_db_session)
        tag_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await tag_service.update(tag_id, name="New Name")
        
        # Assert
        assert result is None


class TestTagServiceDelete:
    """Test TagService.delete method."""

    @pytest.mark.asyncio
    async def test_delete_tag_returns_true_on_success(self, mock_db_session):
        """Test that deleting a tag returns True on success."""
        # Arrange
        tag_service = TagService(mock_db_session)
        tag_id = uuid.uuid4()
        
        mock_tag = MagicMock()
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_tag)
        mock_db_session.delete = AsyncMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        result = await tag_service.delete(tag_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_tag_returns_false_when_not_found(self, mock_db_session):
        """Test that deleting a non-existent tag returns False."""
        # Arrange
        tag_service = TagService(mock_db_session)
        tag_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await tag_service.delete(tag_id)
        
        # Assert
        assert result is False
