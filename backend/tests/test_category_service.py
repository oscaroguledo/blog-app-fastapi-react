"""
Tests for CategoryService.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock
from models.category import Category
from services.category import CategoryService


class TestCategoryServiceCreate:
    """Test CategoryService.create method."""

    @pytest.mark.asyncio
    async def test_create_category_returns_category_object(self, mock_db_session):
        """Test that creating a category returns a Category object."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        
        mock_category = MagicMock()
        mock_category.id = uuid.uuid4()
        mock_category.name = "Test Category"
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await category_service.create(
            name="Test Category",
            slug="test-category"
        )
        
        # Assert
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_category_raises_error_when_name_missing(self, mock_db_session):
        """Test that creating a category without name raises ValueError."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Name is required"):
            await category_service.create(
                name="",
                slug="test-category"
            )

    @pytest.mark.asyncio
    async def test_create_category_raises_error_when_slug_missing(self, mock_db_session):
        """Test that creating a category without slug raises ValueError."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Slug is required"):
            await category_service.create(
                name="Test Category",
                slug=""
            )


class TestCategoryServiceGet:
    """Test CategoryService.get method."""

    @pytest.mark.asyncio
    async def test_get_category_by_id_returns_category(self, mock_db_session):
        """Test that getting a category by ID returns the category."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        category_id = uuid.uuid4()
        
        mock_category = MagicMock()
        mock_category.id = category_id
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        
        # Act
        result = await category_service.get(category_id=category_id)
        
        # Assert
        assert result == mock_category
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_category_by_slug_returns_category(self, mock_db_session):
        """Test that getting a category by slug returns the category."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        
        mock_category = MagicMock()
        mock_category.slug = "test-category"
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        
        # Act
        result = await category_service.get(slug="test-category")
        
        # Assert
        assert result == mock_category
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_category_by_name_returns_category(self, mock_db_session):
        """Test that getting a category by name returns the category."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        
        mock_category = MagicMock()
        mock_category.name = "Test Category"
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        
        # Act
        result = await category_service.get(name="Test Category")
        
        # Assert
        assert result == mock_category
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_category_raises_error_when_no_params(self, mock_db_session):
        """Test that getting a category without ID, slug, or name raises ValueError."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="At least one of category_id, slug, or name must be provided"):
            await category_service.get()


class TestCategoryServiceUpdate:
    """Test CategoryService.update method."""

    @pytest.mark.asyncio
    async def test_update_category_returns_updated_category(self, mock_db_session):
        """Test that updating a category returns the updated category."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        category_id = uuid.uuid4()
        
        mock_category = MagicMock()
        mock_category.id = category_id
        mock_category.name = "Old Name"
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await category_service.update(category_id, name="New Name")
        
        # Assert
        assert result == mock_category
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_category_returns_none_when_not_found(self, mock_db_session):
        """Test that updating a non-existent category returns None."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        category_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await category_service.update(category_id, name="New Name")
        
        # Assert
        assert result is None


class TestCategoryServiceDelete:
    """Test CategoryService.delete method."""

    @pytest.mark.asyncio
    async def test_delete_category_returns_true_on_success(self, mock_db_session):
        """Test that deleting a category returns True on success."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        category_id = uuid.uuid4()
        
        mock_category = MagicMock()
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        mock_db_session.delete = MagicMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        result = await category_service.delete(category_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_category_returns_false_when_not_found(self, mock_db_session):
        """Test that deleting a non-existent category returns False."""
        # Arrange
        category_service = CategoryService(mock_db_session)
        category_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await category_service.delete(category_id)
        
        # Assert
        assert result is False
