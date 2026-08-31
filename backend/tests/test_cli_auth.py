"""
Tests for the CLI OAuth browser-login flow.
Covers: token creation, verification, expiry, and backend endpoints.
"""

import json
import os
import uuid
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import pytest

# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def tmp_sessions_file(tmp_path, monkeypatch):
    """Redirects CLI session storage to a temp file for each test."""
    sessions_file = tmp_path / "cli_sessions.json"
    monkeypatch.setattr(
        "app.routers.workspaces._CLI_SESSIONS_FILE",
        str(sessions_file),
    )
    return sessions_file


@pytest.fixture(autouse=True)
def tmp_auth_file(tmp_path, monkeypatch):
    """Redirects ~/.querycraft/auth.json to a temp file for each test."""
    auth_file = tmp_path / "auth.json"
    monkeypatch.setattr(
        "app.mcp_server._QUERYCRAFT_AUTH_FILE",
        str(auth_file),
    )
    return auth_file


@pytest.fixture
def fastapi_client():
    """Returns a FastAPI TestClient for integration endpoint tests."""
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)


# ─────────────────────────────────────────────────────────────────────────────
# Unit tests: token helpers in workspaces.py
# ─────────────────────────────────────────────────────────────────────────────

class TestCliTokenHelpers:
    def test_create_cli_token_returns_64_char_token(self):
        from app.routers.workspaces import _create_cli_token
        session = _create_cli_token("test@example.com")
        assert len(session["cli_token"]) == 64
        assert session["email"] == "test@example.com"
        assert "expires_at" in session

    def test_create_cli_token_is_persisted(self, tmp_sessions_file):
        from app.routers.workspaces import _create_cli_token, _load_cli_sessions
        session = _create_cli_token("user@test.com")
        sessions = _load_cli_sessions()
        assert session["cli_token"] in sessions

    def test_verify_valid_token_returns_session(self):
        from app.routers.workspaces import _create_cli_token, _verify_cli_token
        session = _create_cli_token("verify@test.com")
        result = _verify_cli_token(session["cli_token"])
        assert result is not None
        assert result["email"] == "verify@test.com"

    def test_verify_unknown_token_returns_none(self):
        from app.routers.workspaces import _verify_cli_token
        assert _verify_cli_token("nonexistent_token_" + uuid.uuid4().hex) is None

    def test_verify_expired_token_returns_none_and_cleans_up(self, tmp_sessions_file):
        from app.routers.workspaces import (
            _create_cli_token, _verify_cli_token, _load_cli_sessions, _save_cli_sessions
        )
        session = _create_cli_token("expired@test.com")
        token = session["cli_token"]

        # Manually expire the token
        sessions = _load_cli_sessions()
        sessions[token]["expires_at"] = (datetime.utcnow() - timedelta(days=1)).isoformat()
        _save_cli_sessions(sessions)

        result = _verify_cli_token(token)
        assert result is None
        # Expired token should have been removed from storage
        remaining = _load_cli_sessions()
        assert token not in remaining

    def test_two_users_get_different_tokens(self):
        from app.routers.workspaces import _create_cli_token
        s1 = _create_cli_token("alice@test.com")
        s2 = _create_cli_token("bob@test.com")
        assert s1["cli_token"] != s2["cli_token"]

    def test_multiple_tokens_for_same_user_are_all_stored(self):
        from app.routers.workspaces import _create_cli_token, _load_cli_sessions
        s1 = _create_cli_token("multi@test.com")
        s2 = _create_cli_token("multi@test.com")
        sessions = _load_cli_sessions()
        assert s1["cli_token"] in sessions
        assert s2["cli_token"] in sessions


# ─────────────────────────────────────────────────────────────────────────────
# Integration tests: /api/auth/cli-token endpoint
# ─────────────────────────────────────────────────────────────────────────────

class TestCliTokenEndpoint:
    def test_exchange_valid_email_returns_token(self, fastapi_client):
        resp = fastapi_client.post("/api/auth/cli-token", json={"email": "nitindeep@test.com"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["email"] == "nitindeep@test.com"
        assert len(data["cli_token"]) == 64
        assert "expires_at" in data

    def test_exchange_empty_email_returns_400(self, fastapi_client):
        resp = fastapi_client.post("/api/auth/cli-token", json={"email": ""})
        assert resp.status_code == 400

    def test_exchange_with_state_succeeds(self, fastapi_client):
        state = uuid.uuid4().hex
        resp = fastapi_client.post(
            "/api/auth/cli-token",
            json={"email": "state@test.com", "state": state}
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    def test_exchange_creates_user_workspace_record(self, fastapi_client):
        """Token exchange should initialize workspace record for new users."""
        resp = fastapi_client.post("/api/auth/cli-token", json={"email": "newuser@company.com"})
        assert resp.status_code == 200
        # Now verify the workspace GET returns something
        ws_resp = fastapi_client.get("/api/workspaces/?email=newuser@company.com")
        assert ws_resp.status_code == 200
        data = ws_resp.json()
        assert data["count"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# Integration tests: /api/auth/cli-verify endpoint
# ─────────────────────────────────────────────────────────────────────────────

class TestCliVerifyEndpoint:
    def test_verify_valid_token_returns_email_and_workspaces(self, fastapi_client):
        # Issue token first
        token_resp = fastapi_client.post("/api/auth/cli-token", json={"email": "verify@company.com"})
        token = token_resp.json()["cli_token"]

        resp = fastapi_client.post("/api/auth/cli-verify", json={"cli_token": token})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "verified"
        assert data["email"] == "verify@company.com"
        assert isinstance(data["workspaces"], list)
        assert data["workspaces_count"] > 0

    def test_verify_invalid_token_returns_401(self, fastapi_client):
        resp = fastapi_client.post("/api/auth/cli-verify", json={"cli_token": "invalid_" + uuid.uuid4().hex})
        assert resp.status_code == 401

    def test_verify_expired_token_returns_401(self, fastapi_client, tmp_sessions_file):
        from app.routers.workspaces import _create_cli_token, _load_cli_sessions, _save_cli_sessions
        session = _create_cli_token("expired-verify@test.com")
        token = session["cli_token"]

        sessions = _load_cli_sessions()
        sessions[token]["expires_at"] = (datetime.utcnow() - timedelta(days=1)).isoformat()
        _save_cli_sessions(sessions)

        resp = fastapi_client.post("/api/auth/cli-verify", json={"cli_token": token})
        assert resp.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# Unit tests: MCP server auto-login (_auto_load_cli_session)
# ─────────────────────────────────────────────────────────────────────────────

class TestMCPAutoLogin:
    def test_no_auth_file_leaves_default_session(self, tmp_auth_file, monkeypatch):
        """If auth.json doesn't exist, CURRENT_SESSION stays as default_user."""
        monkeypatch.delenv("QUERYCRAFT_USER_EMAIL", raising=False)
        # File doesn't exist — no write needed

        from app import mcp_server
        # Reset session
        mcp_server.CURRENT_SESSION["user_email"] = "default_user"
        mcp_server._auto_load_cli_session()
        assert mcp_server.CURRENT_SESSION["user_email"] == "default_user"

    def test_env_var_overrides_file(self, tmp_auth_file, monkeypatch):
        """QUERYCRAFT_USER_EMAIL env var takes priority over auth.json."""
        monkeypatch.setenv("QUERYCRAFT_USER_EMAIL", "env@example.com")
        from app import mcp_server
        mcp_server.CURRENT_SESSION["user_email"] = "default_user"
        mcp_server._auto_load_cli_session()
        assert mcp_server.CURRENT_SESSION["user_email"] == "env@example.com"

    def test_valid_auth_file_with_backend_unreachable_uses_offline_mode(self, tmp_auth_file, monkeypatch):
        """When backend is unreachable, CLI email from auth.json is used in offline mode."""
        monkeypatch.delenv("QUERYCRAFT_USER_EMAIL", raising=False)

        # Write a valid (non-expired) auth file
        auth_data = {
            "email": "offline@test.com",
            "cli_token": "sometoken_" + uuid.uuid4().hex,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "backend_url": "http://localhost:19999",  # unreachable port
        }
        with open(str(tmp_auth_file), "w") as f:
            json.dump(auth_data, f)

        from app import mcp_server
        mcp_server.CURRENT_SESSION["user_email"] = "default_user"
        mcp_server._auto_load_cli_session()
        assert mcp_server.CURRENT_SESSION["user_email"] == "offline@test.com"

    def test_expired_auth_file_leaves_default_session(self, tmp_auth_file, monkeypatch):
        """Expired auth.json should not populate CURRENT_SESSION."""
        monkeypatch.delenv("QUERYCRAFT_USER_EMAIL", raising=False)

        auth_data = {
            "email": "expired@test.com",
            "cli_token": "sometoken",
            "created_at": "2020-01-01T00:00:00",
            "expires_at": "2020-01-31T00:00:00",
            "backend_url": "http://localhost:8000",
        }
        with open(str(tmp_auth_file), "w") as f:
            json.dump(auth_data, f)

        from app import mcp_server
        mcp_server.CURRENT_SESSION["user_email"] = "default_user"
        mcp_server._auto_load_cli_session()
        assert mcp_server.CURRENT_SESSION["user_email"] == "default_user"


# ─────────────────────────────────────────────────────────────────────────────
# CLI module: credential file helpers
# ─────────────────────────────────────────────────────────────────────────────

class TestCLICredentialHelpers:
    def test_save_and_load_credentials(self, tmp_path, monkeypatch):
        import sys
        sys.path.insert(0, str(tmp_path.parent))

        import importlib
        import cli as cli_module

        monkeypatch.setattr(cli_module, "AUTH_FILE", str(tmp_path / "auth.json"))
        monkeypatch.setattr(cli_module, "QUERYCRAFT_DIR", str(tmp_path))

        cli_module.save_credentials("saved@test.com", "tok123")
        creds = cli_module.load_credentials()
        assert creds is not None
        assert creds["email"] == "saved@test.com"
        assert creds["cli_token"] == "tok123"

    def test_load_returns_none_when_no_file(self, tmp_path, monkeypatch):
        import cli as cli_module
        monkeypatch.setattr(cli_module, "AUTH_FILE", str(tmp_path / "nonexistent.json"))
        assert cli_module.load_credentials() is None

    def test_clear_credentials_removes_file(self, tmp_path, monkeypatch):
        import cli as cli_module
        auth_file = tmp_path / "auth.json"
        auth_file.write_text(json.dumps({"email": "x@x.com", "cli_token": "t"}))
        monkeypatch.setattr(cli_module, "AUTH_FILE", str(auth_file))
        cli_module.clear_credentials()
        assert not auth_file.exists()
