"""
Tests for contact routes.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock


class TestContactRoutesSubmit:
    """Test contact form submission endpoint."""

    @pytest.mark.asyncio
    async def test_submit_contact_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that submitting contact form returns 200 on success."""
        # Arrange
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        response = await client.post(
            "/contact/",
            json={
                "name": "John Doe",
                "email": "john@example.com",
                "message": "Test message"
            }
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_submit_contact_returns_400_when_name_missing(self, client: AsyncClient):
        """Test that submitting contact form returns 400 when name is missing."""
        # Arrange
        # Act
        response = await client.post(
            "/contact/",
            json={
                "email": "john@example.com",
                "message": "Test message"
            }
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_submit_contact_returns_400_when_email_missing(self, client: AsyncClient):
        """Test that submitting contact form returns 400 when email is missing."""
        # Arrange
        # Act
        response = await client.post(
            "/contact/",
            json={
                "name": "John Doe",
                "message": "Test message"
            }
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_submit_contact_returns_400_when_message_missing(self, client: AsyncClient):
        """Test that submitting contact form returns 400 when message is missing."""
        # Arrange
        # Act
        response = await client.post(
            "/contact/",
            json={
                "name": "John Doe",
                "email": "john@example.com"
            }
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
