"""
Tests for UserService.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock
from sqlalchemy import select
from models.user import User, UserRole
from services.user import UserService


class TestUserServiceCreate:
    """Test UserService.create method."""

    @pytest.mark.asyncio
    async def test_create_user_returns_user_object(self, mock_db_session):
        """Test that creating a user returns a User object."""
        # Arrange
        user_service = UserService(mock_db_session)
        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_user.firstName = "John"
        mock_user.lastName = "Doe"
        mock_user.email = "john@example.com"
        mock_user.role = "Reader"
        mock_user.to_dict = MagicMock(return_value={
            "id": str(mock_user.id),
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
        })
        
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Mock the flush to set the user
        mock_db_session.flush = AsyncMock()
        
        # Act
        result = await user_service.create(
            firstName="John",
            lastName="Doe",
            email="john@example.com",
            password="password123",
            role=UserRole.READER
        )
        
        # Assert
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_user_raises_error_when_email_missing(self, mock_db_session):
        """Test that creating a user without email raises ValueError."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Email is required"):
            await user_service.create(
                firstName="John",
                lastName="Doe",
                email="",
                password="password123"
            )

    @pytest.mark.asyncio
    async def test_create_user_raises_error_when_password_missing(self, mock_db_session):
        """Test that creating a user without password raises ValueError."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Password is required"):
            await user_service.create(
                firstName="John",
                lastName="Doe",
                email="john@example.com",
                password=""
            )

    @pytest.mark.asyncio
    async def test_create_user_raises_error_when_first_name_missing(self, mock_db_session):
        """Test that creating a user without first name raises ValueError."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="First name is required"):
            await user_service.create(
                firstName="",
                lastName="Doe",
                email="john@example.com",
                password="password123"
            )

    @pytest.mark.asyncio
    async def test_create_user_raises_error_when_last_name_missing(self, mock_db_session):
        """Test that creating a user without last name raises ValueError."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Last name is required"):
            await user_service.create(
                firstName="John",
                lastName="",
                email="john@example.com",
                password="password123"
            )


class TestUserServiceGet:
    """Test UserService.get method."""

    @pytest.mark.asyncio
    async def test_get_user_by_id_returns_user(self, mock_db_session):
        """Test that getting a user by ID returns the user."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        
        # Act
        result = await user_service.get(user_id=user_id)
        
        # Assert
        assert result == mock_user
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_by_email_returns_user(self, mock_db_session):
        """Test that getting a user by email returns the user."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        mock_user = MagicMock()
        mock_user.email = "john@example.com"
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        
        # Act
        result = await user_service.get(email="john@example.com")
        
        # Assert
        assert result == mock_user
        mock_db_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_raises_error_when_no_params(self, mock_db_session):
        """Test that getting a user without ID or email raises ValueError."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        # Act & Assert
        with pytest.raises(ValueError, match="User ID or email is required"):
            await user_service.get()


class TestUserServiceLogin:
    """Test UserService.login method."""

    @pytest.mark.asyncio
    async def test_login_returns_user_and_tokens_on_success(self, mock_db_session):
        """Test that successful login returns user and tokens."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_user.email = "john@example.com"
        mock_user.password = "$2b$12$hashedpassword"
        mock_user.active = True
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        
        # Mock password verification
        from core.utils.encryption.password import password_handler
        password_handler.verify_password = MagicMock(return_value=True)
        
        # Mock token creation
        user_service.create_access_token = AsyncMock(return_value="access_token")
        user_service.create_refresh_token = AsyncMock(return_value="refresh_token")
        
        # Act
        result = await user_service.login(email="john@example.com", password="password123")
        
        # Assert
        assert result == (mock_user, "access_token", "refresh_token")

    @pytest.mark.asyncio
    async def test_login_returns_none_when_user_not_found(self, mock_db_session):
        """Test that login returns None when user not found."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await user_service.login(email="john@example.com", password="password123")
        
        # Assert
        assert result == (None, None, None)

    @pytest.mark.asyncio
    async def test_login_returns_none_when_password_invalid(self, mock_db_session):
        """Test that login returns None when password is invalid."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        mock_user = MagicMock()
        mock_user.email = "john@example.com"
        mock_user.password = "$2b$12$hashedpassword"
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        
        from core.utils.encryption.password import password_handler
        password_handler.verify_password = MagicMock(return_value=False)
        
        # Act
        result = await user_service.login(email="john@example.com", password="wrongpassword")
        
        # Assert
        assert result == (None, None, None)

    @pytest.mark.asyncio
    async def test_login_returns_none_when_user_inactive(self, mock_db_session):
        """Test that login returns None when user is inactive."""
        # Arrange
        user_service = UserService(mock_db_session)
        
        mock_user = MagicMock()
        mock_user.email = "john@example.com"
        mock_user.password = "$2b$12$hashedpassword"
        mock_user.active = False
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        
        from core.utils.encryption.password import password_handler
        password_handler.verify_password = MagicMock(return_value=True)
        
        # Act
        result = await user_service.login(email="john@example.com", password="password123")
        
        # Assert
        assert result == (None, None, None)


class TestUserServiceUpdate:
    """Test UserService.update method."""

    @pytest.mark.asyncio
    async def test_update_user_returns_updated_user(self, mock_db_session):
        """Test that updating a user returns the updated user."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.firstName = "John"
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await user_service.update(user_id, firstName="Jane")
        
        # Assert
        assert result == mock_user
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_user_returns_none_when_not_found(self, mock_db_session):
        """Test that updating a non-existent user returns None."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await user_service.update(user_id, firstName="Jane")
        
        # Assert
        assert result is None


class TestUserServiceDelete:
    """Test UserService.delete method."""

    @pytest.mark.asyncio
    async def test_delete_user_returns_true_on_success(self, mock_db_session):
        """Test that deleting a user returns True on success."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_user = MagicMock()
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        mock_db_session.delete = AsyncMock()
        mock_db_session.commit = AsyncMock()
        
        # Act
        result = await user_service.delete(user_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_user_returns_false_when_not_found(self, mock_db_session):
        """Test that deleting a non-existent user returns False."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await user_service.delete(user_id)
        
        # Assert
        assert result is False


class TestUserServiceActivate:
    """Test UserService.activate method."""

    @pytest.mark.asyncio
    async def test_activate_user_returns_activated_user(self, mock_db_session):
        """Test that activating a user returns the activated user."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_user = MagicMock()
        mock_user.active = False
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await user_service.activate(user_id)
        
        # Assert
        assert result == mock_user
        assert mock_user.active is True
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_activate_user_returns_none_when_not_found(self, mock_db_session):
        """Test that activating a non-existent user returns None."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await user_service.activate(user_id)
        
        # Assert
        assert result is None


class TestUserServiceDeactivate:
    """Test UserService.deactivate method."""

    @pytest.mark.asyncio
    async def test_deactivate_user_returns_deactivated_user(self, mock_db_session):
        """Test that deactivating a user returns the deactivated user."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_user = MagicMock()
        mock_user.active = True
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        # Act
        result = await user_service.deactivate(user_id)
        
        # Assert
        assert result == mock_user
        assert mock_user.active is False
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_deactivate_user_returns_none_when_not_found(self, mock_db_session):
        """Test that deactivating a non-existent user returns None."""
        # Arrange
        user_service = UserService(mock_db_session)
        user_id = uuid.uuid4()
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalar_one_or_none = MagicMock(return_value=None)
        
        # Act
        result = await user_service.deactivate(user_id)
        
        # Assert
        assert result is None
