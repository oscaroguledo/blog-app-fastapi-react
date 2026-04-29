"""
Tests for Celery tasks.
"""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from worker.tasks import cache_latest_posts, send_welcome_email, send_email_verification, send_password_reset_email, send_login_notification, send_weekly_digest


class TestCacheLatestPosts:
    """Test cache_latest_posts Celery task."""

    @pytest.mark.asyncio
    @patch('worker.tasks._cache_latest_posts_async')
    async def test_cache_latest_posts_calls_async_function(self, mock_cache_async):
        """Test that cache_latest_posts calls the async function."""
        # Arrange
        mock_cache_async.return_value = None
        
        # Act
        result = cache_latest_posts.apply(args=(10,))
        
        # Assert - may be called multiple times due to retries
        mock_cache_async.assert_called_with(10)


class TestSendWelcomeEmail:
    """Test send_welcome_email Celery task."""

    @pytest.mark.asyncio
    @patch('worker.tasks._send_welcome_email_async')
    async def test_send_welcome_email_calls_async_function(self, mock_send_async):
        """Test that send_welcome_email calls the async function."""
        # Arrange
        mock_send_async.return_value = None
        
        # Act
        result = send_welcome_email.apply(args=("john@example.com", "John", "token123"))
        
        # Assert - may be called multiple times due to retries
        mock_send_async.assert_called_with("john@example.com", "John", "token123")


class TestSendEmailVerification:
    """Test send_email_verification Celery task."""

    @pytest.mark.asyncio
    @patch('worker.tasks._send_email_verification_async')
    async def test_send_email_verification_calls_async_function(self, mock_send_async):
        """Test that send_email_verification calls the async function."""
        # Arrange
        mock_send_async.return_value = None
        
        # Act
        result = send_email_verification.apply(args=("john@example.com", "John", "token123"))
        
        # Assert - may be called multiple times due to retries
        mock_send_async.assert_called_with("john@example.com", "John", "token123")


class TestSendPasswordResetEmail:
    """Test send_password_reset_email Celery task."""

    @pytest.mark.asyncio
    @patch('worker.tasks._send_password_reset_async')
    async def test_send_password_reset_email_calls_async_function(self, mock_send_async):
        """Test that send_password_reset_email calls the async function."""
        # Arrange
        mock_send_async.return_value = None
        
        # Act
        result = send_password_reset_email.apply(args=("john@example.com", "John", "token123"))
        
        # Assert - may be called multiple times due to retries
        mock_send_async.assert_called_with("john@example.com", "John", "token123")


class TestSendLoginNotification:
    """Test send_login_notification Celery task."""

    @pytest.mark.asyncio
    @patch('worker.tasks._send_login_notification_async')
    async def test_send_login_notification_calls_async_function(self, mock_send_async):
        """Test that send_login_notification calls the async function."""
        # Arrange
        mock_send_async.return_value = None
        
        # Act
        result = send_login_notification.apply(args=("john@example.com", "John"))
        
        # Assert - may be called multiple times due to retries
        mock_send_async.assert_called_with("john@example.com", "John")


class TestSendWeeklyDigest:
    """Test send_weekly_digest Celery task."""

    @pytest.mark.asyncio
    @patch('worker.tasks._send_weekly_digest_async')
    async def test_send_weekly_digest_calls_async_function(self, mock_send_async):
        """Test that send_weekly_digest calls the async function."""
        # Arrange
        mock_send_async.return_value = None
        
        # Act
        result = send_weekly_digest.apply()
        
        # Assert - may be called multiple times due to retries
        mock_send_async.assert_called()


class TestSendWelcomeEmailAsync:
    """Test _send_welcome_email_async helper function."""

    @pytest.mark.asyncio
    @patch('worker.email.send_email')
    @patch('worker.templates.welcome_email')
    async def test_send_welcome_email_async_sends_email(self, mock_template, mock_send_email):
        """Test that _send_welcome_email_async sends email with correct data."""
        # Arrange
        mock_template.return_value = ("Welcome", "<html>...</html>")
        mock_send_email.return_value = None
        
        # Act
        from worker.tasks import _send_welcome_email_async
        await _send_welcome_email_async("john@example.com", "John", "token123")
        
        # Assert
        mock_template.assert_called_once()
        mock_send_email.assert_called_once_with("john@example.com", "Welcome", "<html>...</html>")


class TestSendEmailVerificationAsync:
    """Test _send_email_verification_async helper function."""

    @pytest.mark.asyncio
    @patch('worker.email.send_email')
    @patch('worker.templates.email_verification')
    async def test_send_email_verification_async_sends_email(self, mock_template, mock_send_email):
        """Test that _send_email_verification_async sends email with correct data."""
        # Arrange
        mock_template.return_value = ("Verify Email", "<html>...</html>")
        mock_send_email.return_value = None
        
        # Act
        from worker.tasks import _send_email_verification_async
        await _send_email_verification_async("john@example.com", "John", "token123")
        
        # Assert
        mock_template.assert_called_once()
        mock_send_email.assert_called_once_with("john@example.com", "Verify Email", "<html>...</html>")


class TestSendPasswordResetAsync:
    """Test _send_password_reset_async helper function."""

    @pytest.mark.asyncio
    @patch('worker.email.send_email')
    @patch('worker.templates.password_reset_email')
    async def test_send_password_reset_async_sends_email(self, mock_template, mock_send_email):
        """Test that _send_password_reset_async sends email with correct data."""
        # Arrange
        mock_template.return_value = ("Reset Password", "<html>...</html>")
        mock_send_email.return_value = None
        
        # Act
        from worker.tasks import _send_password_reset_async
        await _send_password_reset_async("john@example.com", "John", "token123")
        
        # Assert
        mock_template.assert_called_once()
        mock_send_email.assert_called_once_with("john@example.com", "Reset Password", "<html>...</html>")


class TestSendLoginNotificationAsync:
    """Test _send_login_notification_async helper function."""

    @pytest.mark.asyncio
    @patch('worker.email.send_email')
    @patch('worker.templates.login_notification_email')
    async def test_send_login_notification_async_sends_email(self, mock_template, mock_send_email):
        """Test that _send_login_notification_async sends email with correct data."""
        # Arrange
        mock_template.return_value = ("Login Notification", "<html>...</html>")
        mock_send_email.return_value = None
        
        # Act
        from worker.tasks import _send_login_notification_async
        await _send_login_notification_async("john@example.com", "John")
        
        # Assert
        mock_template.assert_called_once()
        mock_send_email.assert_called_once_with("john@example.com", "Login Notification", "<html>...</html>")
