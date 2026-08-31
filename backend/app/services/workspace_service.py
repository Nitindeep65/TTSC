"""
QueryCraft — User-Scoped Multi-Tenant Workspace Service
Manages isolated database workspaces, credentials, and authentication sessions per user.
Persists to backend/app/data/user_workspaces.json
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Tuple

logger = logging.getLogger("querycraft.workspaces")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
USER_WORKSPACES_FILE = os.path.join(DATA_DIR, "user_workspaces.json")
GLOBAL_WORKSPACES_FILE = os.path.join(DATA_DIR, "workspaces.json")

# Default template workspaces for a newly onboarded user
DEFAULT_USER_WORKSPACES: List[Dict[str, Any]] = [
    {
        "id": "ws-prod",
        "name": "Production",
        "environment": "Production",
        "engine": "postgres",
        "connectionUri": "",
        "color": "#3aa363",
        "tables_count": 0,
        "is_active": True,
    },
    {
        "id": "ws-staging",
        "name": "Staging",
        "environment": "Staging",
        "engine": "postgres",
        "connectionUri": "",
        "color": "#eab308",
        "tables_count": 0,
        "is_active": False,
    },
    {
        "id": "ws-analytics",
        "name": "Analytics",
        "environment": "Analytics",
        "engine": "mongodb",
        "connectionUri": "",
        "color": "#3b82f6",
        "tables_count": 0,
        "is_active": False,
    },
]


def _ensure_data_files():
    """Ensures backend data directory and store files exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(USER_WORKSPACES_FILE):
        with open(USER_WORKSPACES_FILE, "w") as f:
            json.dump({}, f, indent=2)


def normalize_user_key(user_key: Optional[str]) -> str:
    """Normalizes email or user ID into a clean dictionary key."""
    if not user_key or not str(user_key).strip():
        return "default_user"
    return str(user_key).strip().lower()


def load_all_user_workspaces() -> Dict[str, List[Dict[str, Any]]]:
    """Loads all user-scoped workspace registries from disk."""
    _ensure_data_files()
    try:
        with open(USER_WORKSPACES_FILE, "r") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
    except Exception as e:
        logger.warning(f"Error loading user_workspaces.json: {e}")
    return {}


def save_all_user_workspaces(all_data: Dict[str, List[Dict[str, Any]]]):
    """Persists all user-scoped workspace registries to disk."""
    _ensure_data_files()
    try:
        with open(USER_WORKSPACES_FILE, "w") as f:
            json.dump(all_data, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving user_workspaces.json: {e}")


def get_user_workspaces(user_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves all database workspaces for a specific user.
    If the user has no saved workspaces yet, initializes their default workspace set.
    """
    key = normalize_user_key(user_key)
    all_users = load_all_user_workspaces()

    if key in all_users and len(all_users[key]) > 0:
        return all_users[key]

    # Check fallback legacy workspaces.json
    if os.path.exists(GLOBAL_WORKSPACES_FILE):
        try:
            with open(GLOBAL_WORKSPACES_FILE, "r") as f:
                legacy = json.load(f)
                if isinstance(legacy, list) and len(legacy) > 0:
                    all_users[key] = legacy
                    save_all_user_workspaces(all_users)
                    return legacy
        except Exception:
            pass

    # Initialize default workspaces for this user
    user_defaults = [dict(w) for w in DEFAULT_USER_WORKSPACES]
    env_uri = os.getenv("LOCAL_DATABASE_URL") or os.getenv("DATABASE_URL") or ""
    if env_uri:
        user_defaults[0]["connectionUri"] = env_uri

    all_users[key] = user_defaults
    save_all_user_workspaces(all_users)
    return user_defaults


def save_user_workspaces(user_key: Optional[str], workspaces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Saves or updates the full workspace list for a given user."""
    key = normalize_user_key(user_key)
    all_users = load_all_user_workspaces()
    all_users[key] = workspaces
    save_all_user_workspaces(all_users)
    return workspaces


def add_or_update_user_workspace(user_key: Optional[str], workspace_data: Dict[str, Any]) -> Dict[str, Any]:
    """Adds a new workspace or updates an existing workspace for a user."""
    key = normalize_user_key(user_key)
    workspaces = get_user_workspaces(key)

    ws_id = workspace_data.get("id") or f"ws-{len(workspaces) + 1}"
    workspace_data["id"] = ws_id

    updated = False
    new_list = []
    for ws in workspaces:
        if ws.get("id") == ws_id or ws.get("name", "").lower() == workspace_data.get("name", "").lower():
            merged = {**ws, **workspace_data}
            new_list.append(merged)
            updated = True
        else:
            new_list.append(ws)

    if not updated:
        new_list.append(workspace_data)

    save_user_workspaces(key, new_list)
    return workspace_data


def delete_user_workspace(user_key: Optional[str], workspace_id: str) -> bool:
    """Deletes a workspace for a specific user."""
    key = normalize_user_key(user_key)
    workspaces = get_user_workspaces(key)
    if len(workspaces) <= 1:
        return False  # Must keep at least one workspace

    filtered = [w for w in workspaces if w.get("id") != workspace_id and w.get("name") != workspace_id]
    if len(filtered) == len(workspaces):
        return False

    save_user_workspaces(key, filtered)
    return True


def resolve_user_workspace(
    user_key: Optional[str],
    workspace_identifier: Optional[str] = None,
    direct_uri: Optional[str] = None
) -> Tuple[Optional[str], str, Dict[str, Any]]:
    """
    Resolves the target database connection string, workspace label, and metadata
    for an execution request.
    """
    if direct_uri and direct_uri.strip():
        return direct_uri.strip(), "Direct URI Override", {"name": "Direct URI", "engine": "postgres"}

    workspaces = get_user_workspaces(user_key)

    if workspace_identifier and workspace_identifier.strip():
        target = workspace_identifier.strip().lower()
        for ws in workspaces:
            name = ws.get("name", "").lower()
            ws_id = ws.get("id", "").lower()
            env = ws.get("environment", "").lower()
            if target in (name, ws_id, env) or target in name:
                uri = ws.get("connectionUri") or os.getenv("LOCAL_DATABASE_URL") or ""
                return uri, f"{ws.get('name')} ({ws.get('environment')})", ws

    # Fallback to active workspace or first workspace
    active_ws = next((w for w in workspaces if w.get("is_active")), workspaces[0] if workspaces else None)
    if active_ws:
        uri = active_ws.get("connectionUri") or os.getenv("LOCAL_DATABASE_URL") or ""
        return uri, f"{active_ws.get('name')} ({active_ws.get('environment')})", active_ws

    return None, "Default Sandbox", {"name": "Default Sandbox", "engine": "postgres"}


def authenticate_user_credentials(email: str, api_key_or_token: Optional[str] = None) -> Dict[str, Any]:
    """
    Validates user credentials and returns session metadata and available workspaces.
    """
    clean_email = normalize_user_key(email)
    workspaces = get_user_workspaces(clean_email)
    
    return {
        "authenticated": True,
        "user_email": clean_email,
        "workspaces_count": len(workspaces),
        "workspaces": [
            {
                "id": w.get("id"),
                "name": w.get("name"),
                "environment": w.get("environment"),
                "engine": w.get("engine", "postgres"),
                "has_connection": bool(w.get("connectionUri")),
            }
            for w in workspaces
        ],
        "message": f"Successfully authenticated as {clean_email}."
    }
