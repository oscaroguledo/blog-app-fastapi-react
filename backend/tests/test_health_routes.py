"""
Tests for health check routes.
"""
import pytest
from httpx import AsyncClient


class TestHealthRoutes:
    """Test health check endpoints."""

    @pytest.mark.asyncio
    async def test_root_endpoint_returns_success(self, client: AsyncClient):
        """Test that root endpoint returns success response."""
        # Arrange
        # Act
        response = await client.get("/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Blog API is running"
        assert data["data"]["version"] == "1.0.0"

    @pytest.mark.asyncio
    async def test_health_check_endpoint_returns_healthy(self, client: AsyncClient):
        """Test that health check endpoint returns healthy status."""
        # Arrange
        # Act
        response = await client.get("/health")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Service is healthy"
        assert data["data"]["status"] == "healthy"
