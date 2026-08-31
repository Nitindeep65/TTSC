"""
FastAPI Router for User-Scoped Database Workspaces
Provides CRUD and real-time synchronization between the Web Dashboard and backend.
Also hosts the CLI OAuth browser-login token exchange endpoints.
"""

import os
import json
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.services.workspace_service import (
    get_user_workspaces,
    save_user_workspaces,
    add_or_update_user_workspace,
    delete_user_workspace,
    authenticate_user_credentials,
    normalize_user_key,
)
from app.services.db_service import introspect_cloud_database, parse_connection_info

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])
auth_router = APIRouter(prefix="/api/auth", tags=["CLI Auth"])

# ─────────────────────────────────────────────────
# CLI Session Persistence
# ─────────────────────────────────────────────────

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_CLI_SESSIONS_FILE = os.path.join(_DATA_DIR, "cli_sessions.json")
_CLI_TOKEN_EXPIRY_DAYS = 30


def _load_cli_sessions() -> Dict[str, Any]:
    """Load all active CLI sessions from disk."""
    os.makedirs(_DATA_DIR, exist_ok=True)
    if not os.path.exists(_CLI_SESSIONS_FILE):
        return {}
    try:
        with open(_CLI_SESSIONS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_cli_sessions(sessions: Dict[str, Any]):
    """Persist CLI sessions to disk."""
    os.makedirs(_DATA_DIR, exist_ok=True)
    with open(_CLI_SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=2)


def _create_cli_token(email: str) -> Dict[str, str]:
    """Creates, stores, and returns a new CLI session token for the given email."""
    token = uuid.uuid4().hex + uuid.uuid4().hex  # 64-char opaque token
    now = datetime.utcnow()
    expires = now + timedelta(days=_CLI_TOKEN_EXPIRY_DAYS)
    session = {
        "email": email,
        "cli_token": token,
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
    }
    sessions = _load_cli_sessions()
    sessions[token] = session
    _save_cli_sessions(sessions)
    return session


def _verify_cli_token(cli_token: str) -> Optional[Dict[str, Any]]:
    """Validates a CLI token and returns its session data if valid and not expired."""
    sessions = _load_cli_sessions()
    session = sessions.get(cli_token)
    if not session:
        return None
    try:
        expires = datetime.fromisoformat(session["expires_at"])
        if datetime.utcnow() > expires:
            # Clean up expired token
            del sessions[cli_token]
            _save_cli_sessions(sessions)
            return None
    except Exception:
        return None
    return session


class WorkspaceItem(BaseModel):
    id: str = Field(..., description="Unique workspace ID (e.g. ws-prod)")
    name: str = Field(..., description="Human readable name")
    environment: str = Field(default="Production", description="Environment tier")
    engine: str = Field(default="postgres", description="Database engine")
    connectionUri: str = Field(default="", description="Connection URI")
    color: Optional[str] = Field(default="#3aa363", description="UI accent color")
    tables_count: Optional[int] = Field(default=0, description="Cached tables count")
    is_active: Optional[bool] = Field(default=False, description="Whether this is active")


class WorkspaceSyncRequest(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    workspaces: List[Dict[str, Any]] = Field(..., description="List of user workspaces to synchronize")


class WorkspaceAuthRequest(BaseModel):
    email: str = Field(..., description="User account email")
    api_key: Optional[str] = Field(default=None, description="Optional personal access token / API key")


class WorkspaceConnectRequest(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    workspace_id: str
    connection_uri: str


@router.get("/")
def list_workspaces(
    user_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None)
):
    """Retrieve all database workspaces configured for a specific user."""
    user_key = email or user_id or "default_user"
    workspaces = get_user_workspaces(user_key)
    return {"workspaces": workspaces, "count": len(workspaces)}


# ─────────────────────────────────────────────────
# CLI OAuth Token Exchange Endpoints
# ─────────────────────────────────────────────────

class CliTokenRequest(BaseModel):
    email: str = Field(..., description="Authenticated user email from Firebase")
    state: Optional[str] = Field(default=None, description="PKCE state token for CSRF protection")
    firebase_id_token: Optional[str] = Field(default=None, description="Firebase ID token for server-side verification")


class CliVerifyRequest(BaseModel):
    cli_token: str = Field(..., description="Stored CLI session token to verify")


@auth_router.post("/cli-token")
def exchange_cli_token(request: CliTokenRequest):
    """
    Exchanges a successful Firebase browser login into a durable CLI session token.
    Called by the frontend /auth/cli page after the user logs in.
    Returns a cli_token that the CLI saves to ~/.querycraft/auth.json.
    """
    clean_email = normalize_user_key(request.email)
    if not clean_email or clean_email == "default_user":
        raise HTTPException(status_code=400, detail="Valid email is required.")

    session = _create_cli_token(clean_email)

    # Ensure user workspace record exists
    get_user_workspaces(clean_email)

    return {
        "status": "success",
        "email": clean_email,
        "cli_token": session["cli_token"],
        "expires_at": session["expires_at"],
        "message": f"CLI session token issued for {clean_email}. Valid for {_CLI_TOKEN_EXPIRY_DAYS} days.",
    }


@auth_router.post("/cli-verify")
def verify_cli_token(request: CliVerifyRequest):
    """
    Verifies a stored CLI session token. Used by the MCP server on startup
    to auto-load the user's identity from ~/.querycraft/auth.json.
    """
    session = _verify_cli_token(request.cli_token)
    if not session:
        raise HTTPException(
            status_code=401,
            detail="CLI token is invalid or has expired. Please run: querycraft auth login"
        )

    email = session["email"]
    workspaces = get_user_workspaces(email)

    return {
        "status": "verified",
        "email": email,
        "expires_at": session["expires_at"],
        "workspaces_count": len(workspaces),
        "workspaces": [
            {
                "id": w.get("id"),
                "name": w.get("name"),
                "environment": w.get("environment"),
                "engine": w.get("engine", "postgres"),
                "has_connection": bool(w.get("connectionUri")),
                "is_active": w.get("is_active", False),
            }
            for w in workspaces
        ],
    }


@router.post("/sync")
def sync_workspaces(request: WorkspaceSyncRequest):
    """
    Synchronizes workspaces from the Web Dashboard (localStorage / state)
    to the backend persistent store for this specific user.
    """
    user_key = request.email or request.user_id or "default_user"
    saved = save_user_workspaces(user_key, request.workspaces)
    return {
        "status": "success",
        "user_key": normalize_user_key(user_key),
        "count": len(saved),
        "workspaces": saved
    }


@router.post("/auth")
def authenticate_user(request: WorkspaceAuthRequest):
    """Authenticates a user and retrieves their active workspaces for MCP / CLI."""
    return authenticate_user_credentials(request.email, request.api_key)


@router.post("/connect")
def connect_workspace_database(request: WorkspaceConnectRequest):
    """
    Connects, tests, and saves a live database connection string to a specific user workspace.
    """
    user_key = request.email or request.user_id or "default_user"
    uri = request.connection_uri.strip()

    try:
        tables, schema_sql = introspect_cloud_database(uri)
        conn_info = parse_connection_info(uri)

        updated_ws = add_or_update_user_workspace(
            user_key=user_key,
            workspace_data={
                "id": request.workspace_id,
                "connectionUri": uri,
                "engine": conn_info.get("engine", "postgres"),
                "tables_count": len(tables),
                "is_active": True,
            }
        )

        return {
            "status": "connected",
            "workspace": updated_ws,
            "host": conn_info.get("host"),
            "database": conn_info.get("database"),
            "tables_count": len(tables),
            "schema_sql": schema_sql,
            "message": f"Successfully connected and saved to workspace '{request.workspace_id}'."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect and introspect database: {str(e)}")


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: str,
    user_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None)
):
    """Deletes a workspace for the specified user."""
    user_key = email or user_id or "default_user"
    ok = delete_user_workspace(user_key, workspace_id)
    if not ok:
        raise HTTPException(status_code=400, detail="Cannot delete workspace or minimum workspace limit reached.")
    return {"status": "success", "message": f"Workspace {workspace_id} deleted."}
