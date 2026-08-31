import pytest
import os
from app.services.workspace_service import (
    get_user_workspaces,
    save_user_workspaces,
    add_or_update_user_workspace,
    delete_user_workspace,
    resolve_user_workspace,
    authenticate_user_credentials,
    normalize_user_key,
)


def test_user_workspace_isolation():
    user_a = "alice@company.com"
    user_b = "bob@enterprise.org"

    # User A has their own workspaces
    ws_a = [
        {
            "id": "ws-prod-a",
            "name": "Alice Production",
            "environment": "Production",
            "engine": "postgres",
            "connectionUri": "postgresql://alice:pass@db-a.neon.tech/prod",
            "color": "#3aa363",
            "is_active": True,
        }
    ]
    save_user_workspaces(user_a, ws_a)

    # User B has their own distinct workspaces
    ws_b = [
        {
            "id": "ws-analytics-b",
            "name": "Bob Mongo Analytics",
            "environment": "Analytics",
            "engine": "mongodb",
            "connectionUri": "mongodb+srv://bob:pass@cluster.mongodb.net/analytics",
            "color": "#3b82f6",
            "is_active": True,
        }
    ]
    save_user_workspaces(user_b, ws_b)

    # Verify User A only gets User A's workspaces
    retrieved_a = get_user_workspaces(user_a)
    assert len(retrieved_a) == 1
    assert retrieved_a[0]["name"] == "Alice Production"
    assert "db-a.neon.tech" in retrieved_a[0]["connectionUri"]

    # Verify User B only gets User B's workspaces
    retrieved_b = get_user_workspaces(user_b)
    assert len(retrieved_b) == 1
    assert retrieved_b[0]["name"] == "Bob Mongo Analytics"
    assert "mongodb.net" in retrieved_b[0]["connectionUri"]


def test_workspace_resolution():
    user = "developer@startup.io"
    ws_list = [
        {
            "id": "ws-1",
            "name": "Core Postgres",
            "environment": "Production",
            "engine": "postgres",
            "connectionUri": "postgresql://dev:secret@db.supabase.co:5432/postgres",
            "is_active": True,
        },
        {
            "id": "ws-2",
            "name": "Metrics Staging",
            "environment": "Staging",
            "engine": "postgres",
            "connectionUri": "postgresql://dev:secret@stg.neon.tech/neondb",
            "is_active": False,
        },
    ]
    save_user_workspaces(user, ws_list)

    # Resolve by name
    uri, label, meta = resolve_user_workspace(user, "Metrics Staging")
    assert "stg.neon.tech" in uri
    assert "Metrics Staging" in label

    # Resolve default active workspace
    uri_active, label_active, _ = resolve_user_workspace(user, None)
    assert "supabase.co" in uri_active
    assert "Core Postgres" in label_active


def test_authenticate_user_credentials():
    email = "admin@platform.dev"
    res = authenticate_user_credentials(email, "qc_live_test_token_123")
    assert res["authenticated"] is True
    assert res["user_email"] == "admin@platform.dev"
    assert res["workspaces_count"] >= 1
