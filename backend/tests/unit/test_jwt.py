"""Unit tests for JWT utility."""
import pytest
from core.utils.encryption.jwt import jwt_handler


def test_create_and_verify_access_token():
    data = {"id": "abc123", "email": "user@test.com", "role": "Reader"}
    token = jwt_handler.create_access_token(data)
    payload = jwt_handler.verify_token(token)
    assert payload is not None
    assert payload["id"] == "abc123"
    assert payload["email"] == "user@test.com"
    assert payload["type"] == "access"


def test_create_and_verify_refresh_token():
    data = {"id": "abc123", "email": "user@test.com"}
    token = jwt_handler.create_refresh_token(data)
    payload = jwt_handler.verify_token(token)
    assert payload is not None
    assert payload["type"] == "refresh"


def test_invalid_token_returns_none():
    result = jwt_handler.verify_token("not.a.valid.token")
    assert result is None


def test_tampered_token_returns_none():
    data = {"id": "abc123"}
    token = jwt_handler.create_access_token(data)
    tampered = token[:-5] + "XXXXX"
    assert jwt_handler.verify_token(tampered) is None
