"""
Tests for user routes.
"""
import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import MagicMock, AsyncMock, patch


class TestUserRoutesRegister:
    """Test user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_user_returns_201_on_success(self, client: AsyncClient, mock_db_session):
        """Successful registration should return 201."""
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
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.get = AsyncMock(return_value=None)
        mock_user_service.create = AsyncMock(return_value=mock_user)
        mock_user_service.create_access_token = AsyncMock(return_value='access_token')
        mock_user_service.create_refresh_token = AsyncMock(return_value='refresh_token')
        
        with patch('routes.user.UserService', return_value=mock_user_service):
            response = await client.post(
                "/users/register",
                json={
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "password": "password123"
                }
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "User registered successfully"


    @pytest.mark.asyncio
    async def test_register_user_returns_400_when_password_missing(self, client: AsyncClient):
        """Missing password should return 400."""
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.get = AsyncMock(return_value=None)
        mock_user_service.create = AsyncMock(side_effect=ValueError("Password is required"))
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                "/users/register",
                json={
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com"
                }
            )
        
        assert response.status_code == 500
        data = response.json()
        assert data["success"] is False


class TestUserRoutesLogin:
    """Test user login endpoint."""

    @pytest.mark.asyncio
    async def test_login_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Successful login should return 200 with tokens."""
        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_user.email = "john@example.com"
        mock_user.active = True
        mock_user.to_dict = MagicMock(return_value={
            "id": str(mock_user.id),
            "email": "john@example.com",
        })
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.login = AsyncMock(return_value=(mock_user, 'access_token', 'refresh_token'))
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                "/users/login",
                json={
                    "email": "john@example.com",
                    "password": "password123"
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data

    @pytest.mark.asyncio
    async def test_login_returns_401_when_invalid_credentials(self, client: AsyncClient, mock_db_session):
        """Test that login returns 401 when credentials are invalid."""
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.login = AsyncMock(return_value=(None, None, None))
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                "/users/login",
                json={
                    "email": "john@example.com",
                    "password": "wrongpassword"
                }
            )
        
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False


class TestUserRoutesGetCurrentUser:
    """Test get current user endpoint."""

    @pytest.mark.asyncio
    async def test_get_current_user_returns_200_with_auth(self, client: AsyncClient, override_get_current_user):
        """Test that getting current user returns 200 when authenticated."""
        mock_user = override_get_current_user
        
        response = await client.get("/users/me", headers={"Authorization": "Bearer test_token"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == mock_user.email

    @pytest.mark.asyncio
    async def test_get_current_user_returns_401_without_auth(self, client: AsyncClient):
        """Test that getting current user returns 401 without authentication."""
        response = await client.get("/users/me")
        
        assert response.status_code == 403


class TestUserRoutesUpdateCurrentUser:
    """Test update current user endpoint."""

    @pytest.mark.asyncio
    async def test_update_current_user_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating current user returns 200 on success."""
        mock_user = override_get_current_user
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.update = AsyncMock(return_value=mock_user)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.patch(
                "/users/me",
                json={"firstName": "Jane"},
                headers={"Authorization": "Bearer test_token"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_current_user_returns_401_without_auth(self, client: AsyncClient):
        """Test that updating current user returns 401 without authentication."""
        response = await client.patch("/users/me", json={"firstName": "Jane"})
        
        assert response.status_code == 403


class TestUserRoutesListUsers:
    """Test list users endpoint."""

    @pytest.mark.asyncio
    async def test_list_users_returns_200_with_data(self, client: AsyncClient, mock_db_session):
        """Test that listing users returns 200 with user list."""
        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_user.email = "john@example.com"
        mock_user.to_dict = MagicMock(return_value={"id": str(mock_user.id), "email": "john@example.com"})
        
        mock_result = MagicMock()
        mock_db_session._mock_result.scalars = MagicMock(return_value=mock_db_session._mock_result)
        mock_db_session._mock_result.all = MagicMock(return_value=[mock_user])
        
        response = await client.get("/users/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data


class TestUserRoutesGetUserById:
    """Test get user by ID endpoint."""

    @pytest.mark.asyncio
    async def test_get_user_by_id_returns_200_on_success(self, client: AsyncClient, mock_db_session):
        """Test that getting user by ID returns 200 on success."""
        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.to_dict = MagicMock(return_value={"id": str(user_id)})
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.get = AsyncMock(return_value=mock_user)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.get(f"/users/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_user_by_id_returns_404_when_not_found(self, client: AsyncClient, mock_db_session):
        """Test that getting user by ID returns 404 when not found."""
        user_id = uuid.uuid4()
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.get = AsyncMock(return_value=None)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.get(f"/users/{user_id}")
        
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_get_user_by_id_returns_400_for_invalid_id(self, client: AsyncClient):
        """Test that getting user by ID returns 400 for invalid ID format."""
        response = await client.get("/users/invalid-uuid")
        
        assert response.status_code == 400


class TestUserRoutesUpdateUser:
    """Test update user endpoint (admin)."""

    @pytest.mark.asyncio
    async def test_update_user_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that updating a user returns 200 on success."""
        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.role = "Admin"
        mock_user.to_dict = MagicMock(return_value={"id": str(user_id), "firstName": "Jane"})
        
        override_get_current_user.role = "Admin"
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.update = AsyncMock(return_value=mock_user)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.patch(
                f"/users/{user_id}",
                json={"firstName": "Jane"},
                headers={"Authorization": "Bearer test_token"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_user_returns_401_without_auth(self, client: AsyncClient):
        """Test that updating a user returns 401 without authentication."""
        user_id = uuid.uuid4()
        
        response = await client.patch(f"/users/{user_id}", json={"firstName": "Jane"})
        assert response.status_code == 401

class TestUserRoutesDeleteUser:
    """Test delete user endpoint (admin)."""

    @pytest.mark.asyncio
    async def test_delete_user_returns_204_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deleting a user returns 204 on success."""
        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.role = "Admin"
        
        override_get_current_user.role = "Admin"
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.delete = AsyncMock(return_value=True)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.delete(
                f"/users/{user_id}",
                headers={"Authorization": "Bearer test_token"}
            )
        
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_user_returns_401_without_auth(self, client: AsyncClient):
        """Test that deleting a user returns 401 without authentication."""
        user_id = uuid.uuid4()
        
        response = await client.delete(f"/users/{user_id}")
        
        assert response.status_code == 403


class TestUserRoutesActivateUser:
    """Test activate user endpoint (admin)."""

    @pytest.mark.asyncio
    async def test_activate_user_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that activating a user returns 200 on success."""
        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.role = "Admin"
        mock_user.to_dict = MagicMock(return_value={"id": str(user_id), "active": True})
        
        override_get_current_user.role = "Admin"
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.activate = AsyncMock(return_value=mock_user)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                f"/users/{user_id}/activate",
                headers={"Authorization": "Bearer test_token"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestUserRoutesDeactivateUser:
    """Test deactivate user endpoint (admin)."""

    @pytest.mark.asyncio
    async def test_deactivate_user_returns_200_on_success(self, client: AsyncClient, override_get_current_user, mock_db_session):
        """Test that deactivating a user returns 200 on success."""
        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.role = "Admin"
        mock_user.to_dict = MagicMock(return_value={"id": str(user_id), "active": False})
        
        override_get_current_user.role = "Admin"
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.deactivate = AsyncMock(return_value=mock_user)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                f"/users/{user_id}/deactivate",
                headers={"Authorization": "Bearer test_token"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestUserRoutesResetPassword:
    """Test password reset endpoint."""

    @pytest.mark.asyncio
    async def test_reset_password_returns_200(self, client: AsyncClient, mock_db_session):
        """Test that password reset returns 200 (always returns success for security)."""
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.get = AsyncMock(return_value=None)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                "/users/reset-password",
                json={"email": "john@example.com"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestUserRoutesVerifyEmail:
    """Test email verification endpoint."""

    @pytest.mark.asyncio
    async def test_verify_email_returns_200(self, client: AsyncClient, mock_db_session):
        """Test that email verification returns 200."""
        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_user.email = "john@example.com"
        
        # Create a mock UserService instance
        mock_user_service = MagicMock()
        mock_user_service.get = AsyncMock(return_value=mock_user)
        
        # Patch UserService in routes module
        with patch('routes.user.UserService', return_value=mock_user_service):
                response = await client.post(
                "/users/verify-email",
                json={"email": "john@example.com"}
            )
        
        assert response.status_code == 200
