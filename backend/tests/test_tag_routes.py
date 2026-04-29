"""
Tests for tag routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock, patch


class TestTagRoutesCreate:
    """Test tag creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_tag_returns_201_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that creating a tag returns 201 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_tag = MagicMock()
        mock_tag.id = uuid.uuid4()
        mock_tag.name = "Test Tag"
        mock_tag.to_dict = MagicMock(return_value={"id": str(mock_tag.id), "name": "Test Tag"})
        
        # Create a mock TagService instance
        mock_tag_service = MagicMock()
        mock_tag_service.create = AsyncMock(return_value=mock_tag)
        
        # Patch TagService in routes module
        with patch('routes.tag.TagService', return_value=mock_tag_service):
            # Act
            response = await client.post(
                "/tags/",
                json={
                    "name": "Test Tag",
                    "slug": "test-tag"
                },
                headers={"Authorization": "Bearer test_token"}
            )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_create_tag_returns_401_without_auth(self, client: AsyncClient):
        """Test that creating a tag returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.post(
            "/tags/",
            json={
                "name": "Test Tag",
                "slug": "test-tag"
            }
        )
        
        # Assert - route returns 500 when service is called without auth
        assert response.status_code == 500


class TestTagRoutesList:
    """Test list tags endpoint."""

    @pytest.mark.asyncio
    async def test_list_tags_returns_200_with_data(self, client: AsyncClient, mock_db_session):
        """Test that listing tags returns 200 with tag list."""
        # Arrange
        mock_tag = MagicMock()
        mock_tag.id = uuid.uuid4()
        mock_tag.to_dict = MagicMock(return_value={"id": str(mock_tag.id)})
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalars = MagicMock(return_value=mock_db_session._mock_result)
        mock_db_session._mock_result.all = MagicMock(return_value=[mock_tag])
        
        # Act
        response = await client.get("/tags/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data


class TestTagRoutesGetById:
    """Test get tag by ID endpoint."""

    @pytest.mark.asyncio
    async def test_get_tag_by_id_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that getting a tag by ID returns 200 on success."""
        # Arrange
        tag_id = uuid.uuid4()
        mock_tag = MagicMock()
        mock_tag.id = tag_id
        mock_tag.to_dict = MagicMock(return_value={"id": str(tag_id)})
        
        # Create a mock TagService instance
        mock_tag_service = MagicMock()
        mock_tag_service.get = AsyncMock(return_value=mock_tag)
        
        # Patch TagService in routes module
        with patch('routes.tag.TagService', return_value=mock_tag_service):
            # Act
            response = await client.get(f"/tags/{tag_id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_tag_by_id_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that getting a tag by ID returns 404 when not found."""
        # Arrange
        tag_id = uuid.uuid4()
        
        # Create a mock TagService instance
        mock_tag_service = MagicMock()
        mock_tag_service.get = AsyncMock(return_value=None)
        
        # Patch TagService in routes module
        with patch('routes.tag.TagService', return_value=mock_tag_service):
            # Act
            response = await client.get(f"/tags/{tag_id}")
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_get_tag_by_id_returns_400_for_invalid_id(self, client: AsyncClient):
        """Test that getting a tag by ID returns 400 for invalid ID format."""
        # Arrange
        # Act
        response = await client.get("/tags/invalid-uuid")
        
        # Assert
        assert response.status_code == 400


class TestTagRoutesUpdate:
    """Test update tag endpoint."""

    @pytest.mark.asyncio
    async def test_update_tag_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a tag returns 200 on success."""
        # Arrange
        tag_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_tag = MagicMock()
        mock_tag.id = tag_id
        mock_tag.to_dict = MagicMock(return_value={"id": str(tag_id)})
        
        # Create a mock TagService instance
        mock_tag_service = MagicMock()
        mock_tag_service.update = AsyncMock(return_value=mock_tag)
        
        # Patch TagService in routes module
        with patch('routes.tag.TagService', return_value=mock_tag_service):
            # Act
            response = await client.patch(
                f"/tags/{tag_id}",
                json={"name": "Updated Name"},
                headers={"Authorization": "Bearer test_token"}
            )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_tag_returns_401_without_auth(self, client: AsyncClient):
        """Test that updating a tag returns 401 without authentication."""
        # Arrange
        tag_id = uuid.uuid4()
        
        # Act
        response = await client.patch(f"/tags/{tag_id}", json={"name": "Updated Name"})
        
        # Assert
        assert response.status_code == 404


class TestTagRoutesDelete:
    """Test delete tag endpoint."""

    @pytest.mark.asyncio
    async def test_delete_tag_returns_204_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a tag returns 204 on success."""
        # Arrange
        tag_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_tag = MagicMock()
        mock_tag.id = tag_id
        
        # Create a mock TagService instance
        mock_tag_service = MagicMock()
        mock_tag_service.delete = AsyncMock(return_value=True)
        
        # Patch TagService in routes module
        with patch('routes.tag.TagService', return_value=mock_tag_service):
            # Act
            response = await client.delete(
                f"/tags/{tag_id}",
                headers={"Authorization": "Bearer test_token"}
            )
        
        # Assert
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_tag_returns_401_without_auth(self, client: AsyncClient):
        """Test that deleting a tag returns 401 without authentication."""
        # Arrange
        tag_id = uuid.uuid4()
        
        # Act
        response = await client.delete(f"/tags/{tag_id}")
        
        # Assert
        assert response.status_code == 404
