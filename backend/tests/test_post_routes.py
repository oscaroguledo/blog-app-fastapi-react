"""
Tests for post routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock


class TestPostRoutesCreate:
    """Test post creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_post_returns_201_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that creating a post returns 201 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_post = MagicMock()
        mock_post.id = uuid.uuid4()
        mock_post.title = "Test Post"
        mock_post.to_dict = MagicMock(return_value={"id": str(mock_post.id), "title": "Test Post"})
        
        mock_db_session.add = MagicMock()
        mock_db_session.flush = AsyncMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(
            "/posts/",
            json={
                "title": "Test Post",
                "excerpt": "Test excerpt",
                "content": "Test content",
                "coverImage": "http://example.com/image.jpg"
            },
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_create_post_returns_401_without_auth(self, client: AsyncClient):
        """Test that creating a post returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.post(
            "/posts/",
            json={
                "title": "Test Post",
                "excerpt": "Test excerpt",
                "content": "Test content",
                "coverImage": "http://example.com/image.jpg"
            }
        )
        
        # Assert
        assert response.status_code == 401


class TestPostRoutesList:
    """Test list posts endpoint."""

    @pytest.mark.asyncio
    async def test_list_posts_returns_200_with_data(self, client: AsyncClient, mock_db_session):
        """Test that listing posts returns 200 with post list."""
        # Arrange
        mock_post = MagicMock()
        mock_post.id = uuid.uuid4()
        mock_post.to_dict = MagicMock(return_value={"id": str(mock_post.id)})
        
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=mock_result)
        mock_result.all = MagicMock(return_value=[mock_post])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get("/posts/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data


class TestPostRoutesGetLatest:
    """Test get latest posts endpoint."""

    @pytest.mark.asyncio
    async def test_get_latest_posts_returns_200(self, client: AsyncClient, mock_db_session):
        """Test that getting latest posts returns 200."""
        # Arrange
        mock_post = MagicMock()
        mock_post.id = uuid.uuid4()
        mock_post.to_dict = MagicMock(return_value={"id": str(mock_post.id)})
        
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=mock_result)
        mock_result.all = MagicMock(return_value=[mock_post])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get("/posts/latest")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestPostRoutesGetById:
    """Test get post by ID endpoint."""

    @pytest.mark.asyncio
    async def test_get_post_by_id_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that getting a post by ID returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(f"/posts/{post_id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_post_by_id_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that getting a post by ID returns 404 when not found."""
        # Arrange
        post_id = uuid.uuid4()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(f"/posts/{post_id}")
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_get_post_by_id_returns_400_for_invalid_id(self, client: AsyncClient):
        """Test that getting a post by ID returns 400 for invalid ID format."""
        # Arrange
        # Act
        response = await client.get("/posts/invalid-uuid")
        
        # Assert
        assert response.status_code == 400


class TestPostRoutesUpdate:
    """Test update post endpoint."""

    @pytest.mark.asyncio
    async def test_update_post_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.authorId = mock_user.id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.patch(
            f"/posts/{post_id}",
            json={"title": "Updated Title"},
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_post_returns_403_when_not_owner(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a post returns 403 when not owner."""
        # Arrange
        post_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.authorId = uuid.uuid4()  # Different user
        mock_post.role = "Reader"
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.patch(
            f"/posts/{post_id}",
            json={"title": "Updated Title"},
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 403
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_update_post_returns_401_without_auth(self, client: AsyncClient):
        """Test that updating a post returns 401 without authentication."""
        # Arrange
        post_id = uuid.uuid4()
        
        # Act
        response = await client.patch(f"/posts/{post_id}", json={"title": "Updated Title"})
        
        # Assert
        assert response.status_code == 401


class TestPostRoutesDelete:
    """Test delete post endpoint."""

    @pytest.mark.asyncio
    async def test_delete_post_returns_204_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a post returns 204 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.authorId = mock_user.id
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.delete = MagicMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        response = await client.delete(
            f"/posts/{post_id}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_post_returns_403_when_not_owner(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a post returns 403 when not owner."""
        # Arrange
        post_id = uuid.uuid4()
        mock_user = override_get_current_user
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.authorId = uuid.uuid4()  # Different user
        mock_post.role = "Reader"
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.delete(
            f"/posts/{post_id}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_delete_post_returns_401_without_auth(self, client: AsyncClient):
        """Test that deleting a post returns 401 without authentication."""
        # Arrange
        post_id = uuid.uuid4()
        
        # Act
        response = await client.delete(f"/posts/{post_id}")
        
        # Assert
        assert response.status_code == 401


class TestPostRoutesLike:
    """Test like post endpoint."""

    @pytest.mark.asyncio
    async def test_like_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that liking a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/like")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_like_post_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that liking a post returns 404 when not found."""
        # Arrange
        post_id = uuid.uuid4()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.post(f"/posts/{post_id}/like")
        
        # Assert
        assert response.status_code == 404


class TestPostRoutesUnlike:
    """Test unlike post endpoint."""

    @pytest.mark.asyncio
    async def test_unlike_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that unliking a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/unlike")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestPostRoutesView:
    """Test view post endpoint."""

    @pytest.mark.asyncio
    async def test_view_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that viewing a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/view")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestPostRoutesPublish:
    """Test publish post endpoint."""

    @pytest.mark.asyncio
    async def test_publish_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that publishing a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/publish")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestPostRoutesUnpublish:
    """Test unpublish post endpoint."""

    @pytest.mark.asyncio
    async def test_unpublish_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that unpublishing a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/unpublish")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestPostRoutesFeature:
    """Test feature post endpoint."""

    @pytest.mark.asyncio
    async def test_feature_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that featuring a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/feature")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestPostRoutesUnfeature:
    """Test unfeature post endpoint."""

    @pytest.mark.asyncio
    async def test_unfeature_post_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that unfeaturing a post returns 200 on success."""
        # Arrange
        post_id = uuid.uuid4()
        mock_post = MagicMock()
        mock_post.id = post_id
        mock_post.to_dict = MagicMock(return_value={"id": str(post_id)})
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_post)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(f"/posts/{post_id}/unfeature")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
