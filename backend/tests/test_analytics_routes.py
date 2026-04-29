"""
Tests for analytics routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock


class TestAnalyticsRoutesTrackPageView:
    """Test track page view endpoint."""

    @pytest.mark.asyncio
    async def test_track_page_view_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that tracking a page view returns 200 on success."""
        # Arrange
        mock_page_view = MagicMock()
        mock_page_view.id = uuid.uuid4()
        mock_page_view.to_dict = MagicMock(return_value={"id": str(mock_page_view.id)})
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.post(
            "/analytics/track",
            json={
                "post_id": str(uuid.uuid4()),
                "visitor_id": "visitor123",
                "path": "/test-path"
            }
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_track_page_view_returns_400_when_visitor_id_missing(self, client: AsyncClient):
        """Test that tracking a page view returns 400 when visitor_id is missing."""
        # Arrange
        # Act
        response = await client.post(
            "/analytics/track",
            json={
                "post_id": str(uuid.uuid4()),
                "path": "/test-path"
            }
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_track_page_view_returns_400_when_path_missing(self, client: AsyncClient):
        """Test that tracking a page view returns 400 when path is missing."""
        # Arrange
        # Act
        response = await client.post(
            "/analytics/track",
            json={
                "post_id": str(uuid.uuid4()),
                "visitor_id": "visitor123"
            }
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False


class TestAnalyticsRoutesGetTrafficOverview:
    """Test get traffic overview endpoint (admin only)."""

    @pytest.mark.asyncio
    async def test_get_traffic_overview_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that getting traffic overview returns 200 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_user.role = "Admin"
        
        mock_stat = MagicMock()
        mock_stat.date = MagicMock()
        mock_stat.date.isoformat = MagicMock(return_value="2024-01-01")
        mock_stat.date.strftime = MagicMock(return_value="Mon")
        mock_stat.total_views = 100
        mock_stat.unique_visitors = 50
        
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=mock_result)
        mock_result.all = MagicMock(return_value=[mock_stat])
        mock_result.scalar = MagicMock(return_value=100)
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(
            "/analytics/overview",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_traffic_overview_returns_401_without_auth(self, client: AsyncClient):
        """Test that getting traffic overview returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.get("/analytics/overview")
        
        # Assert
        assert response.status_code == 401


class TestAnalyticsRoutesGetTopPosts:
    """Test get top posts endpoint (admin only)."""

    @pytest.mark.asyncio
    async def test_get_top_posts_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that getting top posts returns 200 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_user.role = "Admin"
        
        mock_post = MagicMock()
        mock_post.id = uuid.uuid4()
        mock_post.title = "Test Post"
        mock_post.views = 100
        mock_post.likes = 10
        
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=mock_result)
        mock_result.all = MagicMock(return_value=[mock_post])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(
            "/analytics/top-posts",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_top_posts_returns_401_without_auth(self, client: AsyncClient):
        """Test that getting top posts returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.get("/analytics/top-posts")
        
        # Assert
        assert response.status_code == 401


class TestAnalyticsRoutesGetTopReferrers:
    """Test get top referrers endpoint (admin only)."""

    @pytest.mark.asyncio
    async def test_get_top_referrers_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that getting top referrers returns 200 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_user.role = "Admin"
        
        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[("google.com", 10), ("twitter.com", 5)])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(
            "/analytics/top-referrers",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_top_referrers_returns_401_without_auth(self, client: AsyncClient):
        """Test that getting top referrers returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.get("/analytics/top-referrers")
        
        # Assert
        assert response.status_code == 401


class TestAnalyticsRoutesGetPostsByCategory:
    """Test get posts by category endpoint (admin only)."""

    @pytest.mark.asyncio
    async def test_get_posts_by_category_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that getting posts by category returns 200 on success."""
        # Arrange
        mock_user = override_get_current_user
        mock_user.role = "Admin"
        
        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[("Technology", 10), ("Health", 5)])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        response = await client.get(
            "/analytics/posts-by-category",
            headers={"Authorization": "Bearer test_token"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_posts_by_category_returns_401_without_auth(self, client: AsyncClient):
        """Test that getting posts by category returns 401 without authentication."""
        # Arrange
        # Act
        response = await client.get("/analytics/posts-by-category")
        
        # Assert
        assert response.status_code == 401
