"""
Tests for category routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock


class TestCategoryRoutesCreate:
    """Test category creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_category_returns_201_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that creating a category returns 201 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_category = MagicMock()
        mock_category.id = uuid.uuid4()
        mock_category.name = "Test Category"
        mock_category.to_dict = MagicMock(return_value={"id": str(mock_category.id), "name": "Test Category"})
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(
            "/categories/",
            json={
                "name": "Test Category",
                "slug": "test-category"
            },
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_create_category_returns_401_without_auth(self, client: AsyncClient):
        """Test that creating a category returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.post(
            "/categories/",
            json={
                "name": "Test Category",
                "slug": "test-category"
            }
        )
        
        # Assert
        assert response.status_code == 401


class TestCategoryRoutesList:
    """Test list categories endpoint."""

    @pytest.mark.asyncio
    async def test_list_categories_returns_200_with_data(self, client: AsyncClient, mock_db_session):
        """Test that listing categories returns 200 with category list."""
        # Arrange
        mock_category = MagicMock()
        mock_category.id = uuid.uuid4()
        mock_category.to_dict = MagicMock(return_value={"id": str(mock_category.id)})
        
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=mock_result)
        mock_result.all = MagicMock(return_value=[mock_category])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get("/categories/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data


class TestCategoryRoutesGetById:
    """Test get category by ID endpoint."""

    @pytest.mark.asyncio
    async def test_get_category_by_id_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that getting a category by ID returns 200 on success."""
        # Arrange
        category_id = uuid.uuid4()
        mock_category = MagicMock()
        mock_category.id = category_id
        mock_category.to_dict = MagicMock(return_value={"id": str(category_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(f"/categories/{category_id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_category_by_id_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that getting a category by ID returns 404 when not found."""
        # Arrange
        category_id = uuid.uuid4()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(f"/categories/{category_id}")
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_get_category_by_id_returns_400_for_invalid_id(self, client: AsyncClient):
        """Test that getting a category by ID returns 400 for invalid ID format."""
        # Arrange
        # Act
        response = await client.get("/categories/invalid-uuid")
        
        # Assert
        assert response.status_code == 400


class TestCategoryRoutesUpdate:
    """Test update category endpoint."""

    @pytest.mark.asyncio
    async def test_update_category_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a category returns 200 on success."""
        # Arrange
        category_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_category = MagicMock()
        mock_category.id = category_id
        mock_category.to_dict = MagicMock(return_value={"id": str(category_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.patch(
            f"/categories/{category_id}",
            json={"name": "Updated Name"},
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_category_returns_401_without_auth(self, client: AsyncClient):
        """Test that updating a category returns 401 without authentication."""
        # Arrange
        category_id = uuid.uuid4()
        
        # Act
        response = await client.patch(f"/categories/{category_id}", json={"name": "Updated Name"})
        
        # Assert
        assert response.status_code == 401


class TestCategoryRoutesDelete:
    """Test delete category endpoint."""

    @pytest.mark.asyncio
    async def test_delete_category_returns_204_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a category returns 204 on success."""
        # Arrange
        category_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_category = MagicMock()
        mock_category.id = category_id
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_category)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.delete = MagicMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        response = await client.delete(
            f"/categories/{category_id}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_category_returns_401_without_auth(self, client: AsyncClient):
        """Test that deleting a category returns 401 without authentication."""
        # Arrange
        category_id = uuid.uuid4()
        
        # Act
        response = await client.delete(f"/categories/{category_id}")
        
        # Assert
        assert response.status_code == 401
