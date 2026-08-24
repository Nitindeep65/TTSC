"""
Settings Router — Shared settings synced between Chrome Extension & Web Dashboard
Persists to backend/app/data/settings.json
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json, os

router = APIRouter(prefix="/api/settings", tags=["Settings"])

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "settings.json")

# ── Default shape ─────────────────────────────────────────────────────────────
DEFAULT_SETTINGS: Dict[str, Any] = {
    "account": {
        "displayName": "QueryCraft User",
        "email": "demo@querycraft.dev",
        "plan": "free",
    },
    "preferences": {
        "theme": "dark",
        "fontSize": "12",
        "compactOnStart": False,
        "autoFocus": True,
    },
    "shortcuts": {
        # id -> { mod, key }
    },
    "apiBase": "http://127.0.0.1:8000",
    "usage": {
        "queries": 0,
        "heals": 0,
        "verified": 0,
    },
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def load_settings() -> dict:
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                stored = json.load(f)
            # Deep-merge with defaults so new keys always appear
            merged = {**DEFAULT_SETTINGS}
            for k, v in stored.items():
                if isinstance(v, dict) and isinstance(merged.get(k), dict):
                    merged[k] = {**merged[k], **v}
                else:
                    merged[k] = v
            return merged
        except Exception:
            pass
    return dict(DEFAULT_SETTINGS)


def save_settings(settings: dict):
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)


# ── Models ────────────────────────────────────────────────────────────────────
class SettingsPatch(BaseModel):
    """Partial update — only include keys you want to change."""
    account:     Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    shortcuts:   Optional[Dict[str, Any]] = None
    apiBase:     Optional[str]            = None
    usage:       Optional[Dict[str, Any]] = None


# ── Routes ────────────────────────────────────────────────────────────────────
@router.get("/")
def get_settings():
    """Return the full settings object."""
    return load_settings()


@router.post("/")
def update_settings(patch: SettingsPatch):
    """Merge a partial update and persist. Returns the new full settings."""
    current = load_settings()
    data = patch.model_dump(exclude_none=True)

    for key, value in data.items():
        if isinstance(value, dict) and isinstance(current.get(key), dict):
            current[key] = {**current[key], **value}
        else:
            current[key] = value

    save_settings(current)
    return current


@router.post("/usage/increment")
def increment_usage(field: str):
    """Increment a single usage counter by 1."""
    current = load_settings()
    current["usage"][field] = current["usage"].get(field, 0) + 1
    save_settings(current)
    return current["usage"]


@router.delete("/reset")
def reset_settings():
    """Hard reset to defaults."""
    save_settings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
