"""
Tests for contact routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock, patch


class TestContactRoutesSubmit:
    """Test contact form submission endpoint."""

    @pytest.mark.asyncio
    async def test_submit_contact_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that submitting contact form returns 200 on success."""
        # Arrange
        mock_message = MagicMock()
        mock_message.id = uuid.uuid4()
        mock_message.to_dict = MagicMock(return_value={"id": str(mock_message.id)})
        
        # Create a mock ContactService instance
        mock_contact_service = MagicMock()
        mock_contact_service.create = AsyncMock(return_value=mock_message)
        
        # Patch ContactService in routes module
        with patch('routes.contact.ContactService', return_value=mock_contact_service):
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
        assert response.status_code == 201
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
