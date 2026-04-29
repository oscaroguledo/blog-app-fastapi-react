"""
Tests for comment routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock


class TestCommentRoutesCreate:
    """Test comment creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_comment_returns_201_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that creating a comment returns 201 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_comment = MagicMock()
        mock_comment.id = uuid.uuid4()
        mock_comment.content = "Test comment"
        mock_comment.to_dict = MagicMock(return_value={"id": str(mock_comment.id), "content": "Test comment"})
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(
            "/comments/",
            json={
                "postId": str(uuid.uuid4()),
                "content": "Test comment"
            },
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_create_comment_returns_401_without_auth(self, client: AsyncClient):
        """Test that creating a comment returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.post(
            "/comments/",
            json={
                "postId": str(uuid.uuid4()),
                "content": "Test comment"
            }
        )
        
        # Assert
        assert response.status_code == 401


class TestCommentRoutesList:
    """Test list comments endpoint."""

    @pytest.mark.asyncio
    async def test_list_comments_returns_200_with_data(self, client: AsyncClient, mock_db_session):
        """Test that listing comments returns 200 with comment list."""
        # Arrange
        mock_comment = MagicMock()
        mock_comment.id = uuid.uuid4()
        mock_comment.to_dict = MagicMock(return_value={"id": str(mock_comment.id)})
        
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=mock_result)
        mock_result.all = MagicMock(return_value=[mock_comment])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get("/comments/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data


class TestCommentRoutesGetById:
    """Test get comment by ID endpoint."""

    @pytest.mark.asyncio
    async def test_get_comment_by_id_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that getting a comment by ID returns 200 on success."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.to_dict = MagicMock(return_value={"id": str(comment_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(f"/comments/{comment_id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_comment_by_id_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that getting a comment by ID returns 404 when not found."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(f"/comments/{comment_id}")
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_get_comment_by_id_returns_400_for_invalid_id(self, client: AsyncClient):
        """Test that getting a comment by ID returns 400 for invalid ID format."""
        # Arrange
        # Act
        response = await client.get("/comments/invalid-uuid")
        
        # Assert
        assert response.status_code == 400


class TestCommentRoutesUpdate:
    """Test update comment endpoint."""

    @pytest.mark.asyncio
    async def test_update_comment_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a comment returns 200 on success."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.author_id = mock_user.id
        mock_comment.to_dict = MagicMock(return_value={"id": str(comment_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.patch(
            f"/comments/{comment_id}",
            json={"content": "Updated content"},
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_comment_returns_403_when_not_owner(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a comment returns 403 when not owner."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.author_id = uuid.uuid4()  # Different user
        mock_comment.role = "Reader"
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.patch(
            f"/comments/{comment_id}",
            json={"content": "Updated content"},
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 403
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_update_comment_returns_401_without_auth(self, client: AsyncClient):
        """Test that updating a comment returns 401 without authentication."""
        # Arrange
        comment_id = uuid.uuid4()
        
        # Act
        response = await client.patch(f"/comments/{comment_id}", json={"content": "Updated content"})
        
        # Assert
        assert response.status_code == 401


class TestCommentRoutesDelete:
    """Test delete comment endpoint."""

    @pytest.mark.asyncio
    async def test_delete_comment_returns_204_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a comment returns 204 on success."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.author_id = mock_user.id
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.delete = MagicMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        response = await client.delete(
            f"/comments/{comment_id}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_comment_returns_403_when_not_owner(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a comment returns 403 when not owner."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.author_id = uuid.uuid4()  # Different user
        mock_comment.role = "Reader"
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.delete(
            f"/comments/{comment_id}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_delete_comment_returns_401_without_auth(self, client: AsyncClient):
        """Test that deleting a comment returns 401 without authentication."""
        # Arrange
        comment_id = uuid.uuid4()
        
        # Act
        response = await client.delete(f"/comments/{comment_id}")
        
        # Assert
        assert response.status_code == 401


class TestCommentRoutesLike:
    """Test like comment endpoint."""

    @pytest.mark.asyncio
    async def test_like_comment_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that liking a comment returns 200 on success."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.to_dict = MagicMock(return_value={"id": str(comment_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/comments/{comment_id}/like")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_like_comment_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that liking a comment returns 404 when not found."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.post(f"/comments/{comment_id}/like")
        
        # Assert
        assert response.status_code == 404


class TestCommentRoutesUnlike:
    """Test unlike comment endpoint."""

    @pytest.mark.asyncio
    async def test_unlike_comment_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that unliking a comment returns 200 on success."""
        # Arrange
        comment_id = uuid.uuid4()
        mock_comment = MagicMock()
        mock_comment.id = comment_id
        mock_comment.to_dict = MagicMock(return_value={"id": str(comment_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_comment)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/comments/{comment_id}/unlike")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
