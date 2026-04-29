"""
Tests for AnalyticsService.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock
from models.analytics import PageView, DailyViewStat
from services.analytics import AnalyticsService


class TestAnalyticsServiceTrackPageView:
    """Test AnalyticsService.track_page_view method."""

    @pytest.mark.asyncio
    async def test_track_page_view_returns_page_view(self, mock_db_session):
        """Test that tracking a page view returns a PageView object."""
        # Arrange
        analytics_service = AnalyticsService(mock_db_session)
        post_id = uuid.uuid4()
        
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
        result = await analytics_service.track_page_view(
            post_id=post_id,
            visitor_id="visitor123",
            path="/test-path"
        )
        
        # Assert
        mock_db_session.add.assert_called()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()


class TestAnalyticsServiceGetTrafficOverview:
    """Test AnalyticsService.get_traffic_overview method."""

    @pytest.mark.asyncio
    async def test_get_traffic_overview_returns_dict(self, mock_db_session):
        """Test that getting traffic overview returns a dict with stats."""
        # Arrange
        analytics_service = AnalyticsService(mock_db_session)
        
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
        result = await analytics_service.get_traffic_overview(days=7)
        
        # Assert
        assert "total_views" in result
        assert "unique_visitors" in result
        assert "daily_stats" in result


class TestAnalyticsServiceGetTopPosts:
    """Test AnalyticsService.get_top_posts method."""

    @pytest.mark.asyncio
    async def test_get_top_posts_returns_list(self, mock_db_session):
        """Test that getting top posts returns a list of post dicts."""
        # Arrange
        analytics_service = AnalyticsService(mock_db_session)
        
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
        result = await analytics_service.get_top_posts(limit=5)
        
        # Assert
        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["title"] == "Test Post"
        assert result[0]["views"] == 100


class TestAnalyticsServiceGetTopReferrers:
    """Test AnalyticsService.get_top_referrers method."""

    @pytest.mark.asyncio
    async def test_get_top_referrers_returns_list(self, mock_db_session):
        """Test that getting top referrers returns a list of referrer dicts."""
        # Arrange
        analytics_service = AnalyticsService(mock_db_session)
        
        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[("google.com", 10), ("twitter.com", 5)])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await analytics_service.get_top_referrers(days=7, limit=5)
        
        # Assert
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["referrer"] == "google.com"
        assert result[0]["count"] == 10


class TestAnalyticsServiceGetPostsByCategory:
    """Test AnalyticsService.get_posts_by_category method."""

    @pytest.mark.asyncio
    async def test_get_posts_by_category_returns_list(self, mock_db_session):
        """Test that getting posts by category returns a list of category dicts."""
        # Arrange
        analytics_service = AnalyticsService(mock_db_session)
        
        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[("Technology", 10), ("Health", 5)])
        mock_db_session.execute = MagicMock(return_value=mock_result)
        
        # Act
        result = await analytics_service.get_posts_by_category()
        
        # Assert
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Technology"
        assert result[0]["count"] == 10
