"""Unit tests for password hashing utility."""
import pytest
from core.utils.encryption.password import password_handler


def test_hash_password_returns_string():
    hashed = password_handler.hash_password("secret123")
    assert isinstance(hashed, str)
    assert hashed != "secret123"


def test_verify_password_correct():
    hashed = password_handler.hash_password("mypassword")
    assert password_handler.verify_password("mypassword", hashed) is True


def test_verify_password_wrong():
    hashed = password_handler.hash_password("mypassword")
    assert password_handler.verify_password("wrongpassword", hashed) is False


def test_different_hashes_for_same_password():
    h1 = password_handler.hash_password("same")
    h2 = password_handler.hash_password("same")
    # bcrypt salts are random — hashes differ but both verify
    assert h1 != h2
    assert password_handler.verify_password("same", h1)
    assert password_handler.verify_password("same", h2)
