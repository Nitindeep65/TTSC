#!/usr/bin/env python3
"""
querycraft — QueryCraft CLI
Browser-based OAuth Login Flow (gh auth login style)

Usage:
    querycraft auth login          # Opens browser → logs in → saves token
    querycraft auth logout         # Clears stored credentials
    querycraft auth whoami         # Shows current logged-in user
    querycraft workspaces list     # Lists all workspaces for current user
"""

import argparse
import json
import os
import sys
import uuid
import time
import socket
import webbrowser
import threading
import urllib.parse
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer

# ─────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────

QUERYCRAFT_DIR = os.path.join(os.path.expanduser("~"), ".querycraft")
AUTH_FILE = os.path.join(QUERYCRAFT_DIR, "auth.json")
BACKEND_BASE = os.getenv("QUERYCRAFT_BACKEND_URL", "http://localhost:8000")
FRONTEND_BASE = os.getenv("QUERYCRAFT_FRONTEND_URL", "http://localhost:3000")
CALLBACK_PORT_DEFAULT = 9876
TOKEN_EXPIRY_DAYS = 30

# ANSI colors
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
CYAN    = "\033[96m"
RED     = "\033[91m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
RESET   = "\033[0m"

LOGO = f"""{CYAN}{BOLD}
   ___                      ____            __ _   
  / _ \\ _   _  ___ _ __ _   _  / ___|_ __ __ _/ _| |_ 
 | | | | | | |/ _ \\ '__| | | || |   | '__/ _` | |_| __|
 | |_| | |_| |  __/ |  | |_| || |___| | | (_| |  _| |_ 
  \\___/ \\__,_|\\___|_|   \\__, | \\____|_|  \\__,_|_|  \\__|
                        |___/                           
{RESET}"""


# ─────────────────────────────────────────────────
# Credential Storage
# ─────────────────────────────────────────────────

def ensure_querycraft_dir():
    """Creates ~/.querycraft directory with secure permissions."""
    os.makedirs(QUERYCRAFT_DIR, exist_ok=True)
    os.chmod(QUERYCRAFT_DIR, 0o700)


def save_credentials(email: str, cli_token: str):
    """Saves CLI session credentials to ~/.querycraft/auth.json."""
    ensure_querycraft_dir()
    data = {
        "email": email,
        "cli_token": cli_token,
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(days=TOKEN_EXPIRY_DAYS)).isoformat(),
        "backend_url": BACKEND_BASE,
        "frontend_url": FRONTEND_BASE,
    }
    with open(AUTH_FILE, "w") as f:
        json.dump(data, f, indent=2)
    os.chmod(AUTH_FILE, 0o600)  # Owner read/write only
    return data


def load_credentials() -> dict | None:
    """Loads stored credentials from ~/.querycraft/auth.json."""
    if not os.path.exists(AUTH_FILE):
        return None
    try:
        with open(AUTH_FILE, "r") as f:
            data = json.load(f)
        # Check expiry
        expires_at = datetime.fromisoformat(data.get("expires_at", "2000-01-01"))
        if datetime.utcnow() > expires_at:
            return None
        return data
    except Exception:
        return None


def clear_credentials():
    """Removes stored credentials."""
    if os.path.exists(AUTH_FILE):
        os.remove(AUTH_FILE)


# ─────────────────────────────────────────────────
# Local Callback HTTP Server
# ─────────────────────────────────────────────────

class _CallbackResult:
    """Thread-safe container for the OAuth callback result."""
    token: str | None = None
    email: str | None = None
    error: str | None = None
    received = threading.Event()


def _find_free_port(preferred: int = CALLBACK_PORT_DEFAULT) -> int:
    """Finds a free local port, preferring the given port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", preferred))
            return preferred
        except OSError:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]


def _make_callback_handler(result: _CallbackResult):
    """Creates a request handler class that captures the OAuth callback."""

    class _Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Silence default HTTP logs

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            params = dict(urllib.parse.parse_qsl(parsed.query))

            token = params.get("token")
            email = params.get("email")
            error = params.get("error")

            if error:
                result.error = urllib.parse.unquote(error)
                self._send_html(_error_page(result.error))
            elif token and email:
                result.token = token
                result.email = urllib.parse.unquote(email)
                self._send_html(_success_page(result.email))
            else:
                result.error = "Missing token or email in callback."
                self._send_html(_error_page("Authentication callback was incomplete."))

            result.received.set()

        def _send_html(self, html: str):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))

    return _Handler


def _success_page(email: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QueryCraft — Authentication Successful</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      background: #0a0a0f;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .card {{
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 20px;
      padding: 48px 56px;
      text-align: center;
      max-width: 480px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
    }}
    .icon {{ font-size: 64px; margin-bottom: 24px; }}
    h1 {{ font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 12px; }}
    .email {{
      display: inline-block;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 8px;
      padding: 6px 16px;
      color: #a5b4fc;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      font-family: monospace;
    }}
    p {{ color: #94a3b8; line-height: 1.6; font-size: 15px; }}
    .terminal {{
      margin-top: 28px;
      background: #020817;
      border-radius: 10px;
      padding: 16px 20px;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.2);
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Authentication Successful!</h1>
    <div class="email">{email}</div>
    <p>You are now logged in to QueryCraft. You can close this tab and return to your terminal.</p>
    <div class="terminal">
      ✅ Logged in as {email}<br>
      Your MCP session is now active.
    </div>
  </div>
</body>
</html>"""


def _error_page(error: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QueryCraft — Authentication Failed</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      background: #0a0a0f;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .card {{
      background: linear-gradient(135deg, #1a0a0a 0%, #2a1010 100%);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 20px;
      padding: 48px 56px;
      text-align: center;
      max-width: 480px;
    }}
    .icon {{ font-size: 64px; margin-bottom: 24px; }}
    h1 {{ font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 16px; }}
    p {{ color: #fca5a5; line-height: 1.6; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Authentication Failed</h1>
    <p>{error}</p>
    <p style="margin-top:16px; color:#94a3b8;">Please close this tab and try again in your terminal.</p>
  </div>
</body>
</html>"""


# ─────────────────────────────────────────────────
# Backend API Helpers
# ─────────────────────────────────────────────────

def _verify_token_with_backend(cli_token: str) -> dict | None:
    """Verifies a stored CLI token with the backend and returns session data."""
    try:
        import urllib.request
        payload = json.dumps({"cli_token": cli_token}).encode()
        req = urllib.request.Request(
            f"{BACKEND_BASE}/api/auth/cli-verify",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def _fetch_workspaces_from_backend(email: str) -> list:
    """Fetches workspaces for the authenticated user from backend."""
    try:
        import urllib.request
        req = urllib.request.Request(
            f"{BACKEND_BASE}/api/workspaces/?user_email={urllib.parse.quote(email)}",
            headers={"Content-Type": "application/json"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            return data.get("workspaces", [])
    except Exception:
        return []


# ─────────────────────────────────────────────────
# CLI Commands
# ─────────────────────────────────────────────────

def cmd_auth_login(args):
    """Runs the browser-based OAuth login flow."""
    print(LOGO)
    print(f"{BOLD}🔐 QueryCraft CLI Login{RESET}\n")

    # Check if already logged in
    existing = load_credentials()
    if existing and not getattr(args, "force", False):
        print(f"  {GREEN}✓ Already logged in as{RESET} {BOLD}{existing['email']}{RESET}")
        print(f"  {DIM}Run with --force to re-authenticate.{RESET}\n")
        _print_workspaces(existing["email"])
        return

    # Generate PKCE state token
    state = uuid.uuid4().hex

    # Find a free callback port
    port = _find_free_port(CALLBACK_PORT_DEFAULT)
    callback_url = f"http://127.0.0.1:{port}/callback"

    # Build the browser URL
    params = urllib.parse.urlencode({
        "state": state,
        "callback": callback_url,
        "source": "cli",
    })
    browser_url = f"{FRONTEND_BASE}/auth/cli?{params}"

    # Setup callback result container
    result = _CallbackResult()
    handler_class = _make_callback_handler(result)

    # Start local callback server
    server = HTTPServer(("127.0.0.1", port), handler_class)
    server_thread = threading.Thread(target=server.handle_request, daemon=True)
    server_thread.start()

    print(f"  {CYAN}Opening browser for authentication...{RESET}")
    print(f"  {DIM}Callback listening on {callback_url}{RESET}\n")
    time.sleep(0.5)

    # Open browser
    opened = webbrowser.open(browser_url)
    if not opened:
        print(f"  {YELLOW}⚠ Could not open browser automatically.{RESET}")
        print(f"  Please open this URL manually:\n")
        print(f"  {CYAN}{browser_url}{RESET}\n")

    # Wait for callback (60s timeout)
    print(f"  {DIM}Waiting for browser login...{RESET}", end="", flush=True)
    received = result.received.wait(timeout=120)

    if not received:
        print(f"\n\n  {RED}✗ Login timed out after 120 seconds.{RESET}")
        print(f"  {DIM}Please try again.{RESET}\n")
        server.server_close()
        sys.exit(1)

    server.server_close()
    print()  # newline after dots

    if result.error:
        print(f"\n  {RED}✗ Authentication failed:{RESET} {result.error}\n")
        sys.exit(1)

    # Save credentials
    save_credentials(result.email, result.token)

    print(f"\n  {GREEN}{BOLD}✅ Authenticated as: {result.email}{RESET}")
    print(f"  {GREEN}✅ Credentials saved to {AUTH_FILE}{RESET}\n")

    _print_workspaces(result.email)
    print(f"\n  {DIM}Your MCP session is now active. Restart your IDE if needed.{RESET}\n")


def cmd_auth_logout(args):
    """Clears stored credentials."""
    creds = load_credentials()
    if not creds:
        print(f"\n  {YELLOW}⚠ No active session found.{RESET}\n")
        return
    email = creds.get("email", "unknown")
    clear_credentials()
    print(f"\n  {GREEN}✅ Logged out of {email}{RESET}")
    print(f"  {DIM}Credentials removed from {AUTH_FILE}{RESET}\n")


def cmd_auth_whoami(args):
    """Prints the currently authenticated user."""
    creds = load_credentials()
    if not creds:
        print(f"\n  {YELLOW}⚠ Not logged in.{RESET}")
        print(f"  {DIM}Run: querycraft auth login{RESET}\n")
        sys.exit(1)

    email = creds.get("email")
    created = creds.get("created_at", "")[:10]
    expires = creds.get("expires_at", "")[:10]

    print(f"\n  {GREEN}{BOLD}✅ Logged in as:{RESET} {email}")
    print(f"  {DIM}Session created: {created}  |  Expires: {expires}{RESET}")
    print(f"  {DIM}Backend: {creds.get('backend_url', BACKEND_BASE)}{RESET}\n")


def cmd_workspaces_list(args):
    """Lists workspaces for the current user."""
    creds = load_credentials()
    if not creds:
        print(f"\n  {YELLOW}⚠ Not logged in. Run: querycraft auth login{RESET}\n")
        sys.exit(1)
    _print_workspaces(creds["email"])


def _print_workspaces(email: str):
    """Fetches and prints workspaces in a formatted table."""
    workspaces = _fetch_workspaces_from_backend(email)
    if not workspaces:
        print(f"  {YELLOW}No workspaces found for {email}.{RESET}")
        print(f"  {DIM}Connect a database at {FRONTEND_BASE}/Dashboard{RESET}\n")
        return

    print(f"  {BOLD}{len(workspaces)} workspace(s) found:{RESET}")
    print()
    for i, ws in enumerate(workspaces):
        bullet = "●" if ws.get("is_active") else "○"
        name = ws.get("name", "Unnamed")
        engine = ws.get("engine", "postgres").upper()
        has_conn = bool(ws.get("connectionUri") or ws.get("has_connection"))
        conn_status = f"{GREEN}✅ Live connection configured{RESET}" if has_conn else f"{YELLOW}⚠ No connection URI{RESET}"
        env = ws.get("environment", "")
        env_tag = f" {DIM}[{env}]{RESET}" if env else ""
        print(f"    {bullet} {BOLD}{name}{RESET}{env_tag}  {DIM}[{engine}]{RESET}  {conn_status}")
    print()


# ─────────────────────────────────────────────────
# AI Integrations Management (Claude, ChatGPT, Cursor, Antigravity)
# ─────────────────────────────────────────────────

def cmd_ai_list(args):
    """Checks and displays configuration status for all supported AI tools."""
    print(LOGO)
    print(f"  {BOLD}QueryCraft Universal AI Integrations{RESET}\n")

    home = os.path.expanduser("~")
    configs = [
        {
            "name": "Claude Desktop App",
            "type": "MCP (Model Context Protocol)",
            "path": os.path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
            "doc": "Restart Claude → hammer 🔨 icon shows QueryCraft tools",
        },
        {
            "name": "Cursor IDE",
            "type": "MCP (Model Context Protocol)",
            "path": os.path.join(home, ".cursor", "mcp.json"),
            "doc": "Mention @querycraft-cost-guard in Chat or Composer",
        },
        {
            "name": "Google Antigravity & Gemini",
            "type": "MCP (Model Context Protocol)",
            "path": os.path.join(home, ".gemini", "config", "mcp_config.json"),
            "doc": "Natively loaded via mcp_config.json",
        },
    ]

    for item in configs:
        exists = os.path.exists(item["path"])
        configured = False
        if exists:
            try:
                with open(item["path"], "r") as f:
                    data = json.load(f)
                configured = "querycraft-cost-guard" in data.get("mcpServers", {})
            except Exception:
                configured = False

        status = f"{GREEN}✅ Configured & Active{RESET}" if configured else f"{YELLOW}⚠ Found file, not configured{RESET}" if exists else f"{DIM}○ Not detected{RESET}"
        print(f"  {BOLD}{item['name']}{RESET}  {DIM}[{item['type']}]{RESET}")
        print(f"    Status: {status}")
        print(f"    Path:   {DIM}{item['path']}{RESET}")
        print(f"    Usage:  {DIM}{item['doc']}{RESET}\n")

    print(f"  {BOLD}ChatGPT (Custom GPT Actions & Web Plugins){RESET}")
    print(f"    Status: {GREEN}✅ Ready via OpenAPI 3.1 & Plugin Manifest{RESET}")
    print(f"    Action Schema: {CYAN}{BACKEND_BASE}/api/gpt-action/openapi.json{RESET}")
    print(f"    Plugin Manifest: {CYAN}{BACKEND_BASE}/.well-known/ai-plugin.json{RESET}")
    print(f"    Setup Guide: Run {CYAN}querycraft ai chatgpt{RESET} for 1-click instructions\n")


def cmd_ai_chatgpt(args):
    """Displays exact ChatGPT Custom Action instructions and copy-paste details."""
    print(f"\n  {BOLD}{CYAN}⚡ ChatGPT Custom GPT Action Setup Guide{RESET}\n")
    print(f"  {BOLD}1. Create or Edit your Custom GPT:{RESET}")
    print(f"     Open {CYAN}https://chatgpt.com/create{RESET} → go to {BOLD}Configure{RESET} tab.")
    print(f"  {BOLD}2. Add Action:{RESET}")
    print(f"     Scroll down to {BOLD}Actions{RESET} → click {CYAN}Create new action{RESET}.")
    print(f"  {BOLD}3. Import Schema:{RESET}")
    print(f"     Click {BOLD}Import from URL{RESET} and paste:")
    print(f"     {GREEN}{BACKEND_BASE}/api/gpt-action/openapi.json{RESET}")
    print(f"     {DIM}(Or open docs/chatgpt_custom_action.json and paste raw JSON){RESET}")
    print(f"  {BOLD}4. Authentication:{RESET}")
    print(f"     Set Authentication type to {BOLD}None{RESET} (or API Key if required).")
    print(f"  {BOLD}5. Test QueryCraft in ChatGPT:{RESET}")
    print(f"     Type: {BOLD}\"List my database workspaces and run SELECT * FROM users;\"{RESET}\n")


def cmd_ai_setup(args):
    """Automatically detects and configures all installed AI editors/assistants in 1 click."""
    print(LOGO)
    print(f"  {BOLD}{CYAN}⚡ 1-Click Universal AI Setup{RESET}\n")

    home = os.path.expanduser("~")
    backend_dir = os.path.abspath(os.path.dirname(__file__))
    venv_py = os.path.join(backend_dir, ".venv", "bin", "python")
    py_bin = venv_py if os.path.exists(venv_py) else sys.executable

    targets = [
        ("Claude Desktop App", os.path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json")),
        ("Cursor IDE (Global)", os.path.join(home, ".cursor", "mcp.json")),
        ("Google Antigravity & Gemini", os.path.join(home, ".gemini", "config", "mcp_config.json")),
        ("Windsurf IDE", os.path.join(home, ".codeium", "windsurf", "mcp_config.json")),
    ]

    mcp_entry = {
        "command": py_bin,
        "args": ["-m", "app.mcp_server"],
        "cwd": backend_dir,
        "env": {
            "PYTHONPATH": backend_dir,
            "READ_ONLY_ENFORCED": "true",
            "AUTO_LIMIT": "50"
        }
    }

    configured_count = 0
    for name, config_path in targets:
        dir_path = os.path.dirname(config_path)
        # Create directory if it exists in parent or standard app
        if os.path.exists(os.path.dirname(dir_path)) or os.path.exists(dir_path):
            os.makedirs(dir_path, exist_ok=True)
            data = {}
            if os.path.exists(config_path):
                try:
                    with open(config_path, "r") as f:
                        data = json.load(f)
                except Exception:
                    data = {}
            if "mcpServers" not in data or not isinstance(data["mcpServers"], dict):
                data["mcpServers"] = {}
            data["mcpServers"]["querycraft-cost-guard"] = mcp_entry
            try:
                with open(config_path, "w") as f:
                    json.dump(data, f, indent=2)
                print(f"  {GREEN}✓{RESET} {BOLD}{name}{RESET} → {GREEN}Configured{RESET}")
                configured_count += 1
            except Exception as e:
                print(f"  {YELLOW}⚠{RESET} {name} → {DIM}Skipped ({e}){RESET}")

    print(f"\n  {GREEN}{BOLD}🎉 {configured_count} AI tools configured successfully!{RESET}")
    print(f"  {DIM}Restart Claude, Cursor, or your editor to start querying databases naturally.{RESET}\n")


def render_ascii_table(columns: list, rows: list, max_rows: int = 25):
    """Renders a beautiful, aligned ASCII table in the terminal."""
    if not columns and rows and isinstance(rows[0], dict):
        columns = list(rows[0].keys())

    if not columns:
        print(f"  {DIM}(No columns or empty result set){RESET}\n")
        return

    # Calculate column widths
    col_widths = {c: min(max(len(str(c)), 6), 32) for c in columns}
    for r in rows[:max_rows]:
        if isinstance(r, dict):
            for c in columns:
                val_str = str(r.get(c, "") if r.get(c) is not None else "NULL")
                col_widths[c] = min(max(col_widths[c], len(val_str)), 32)

    # Format header
    header_line = " │ ".join(f"{str(c):<{col_widths[c]}}" for c in columns)
    sep_top     = "─┬─".join("─" * col_widths[c] for c in columns)
    sep_mid     = "─┼─".join("─" * col_widths[c] for c in columns)
    sep_bot     = "─┴─".join("─" * col_widths[c] for c in columns)

    print(f"  ┌─{sep_top}─┐")
    print(f"  │ {BOLD}{header_line}{RESET} │")
    print(f"  ├─{sep_mid}─┤")

    # Format rows
    for r in rows[:max_rows]:
        if isinstance(r, dict):
            row_cells = []
            for c in columns:
                v = r.get(c)
                val_str = "NULL" if v is None else str(v)
                if len(val_str) > col_widths[c]:
                    val_str = val_str[:col_widths[c] - 2] + ".."
                row_cells.append(f"{val_str:<{col_widths[c]}}")
            print(f"  │ {' │ '.join(row_cells)} │")

    print(f"  └─{sep_bot}─┘")
    if len(rows) > max_rows:
        print(f"  {DIM}... showing {max_rows} of {len(rows)} total rows{RESET}")


def _execute_sql_via_api(sql: str, email: str, token: str = "") -> dict:
    """Executes a SQL query against the backend / Next.js API."""
    import urllib.request

    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    payload = json.dumps({
        "sql_query": sql,
        "email": email,
        "limit": 50,
    }).encode("utf-8")

    # Try FastAPI backend first
    for endpoint in [f"{BACKEND_BASE}/api/database/execute", f"{FRONTEND_BASE}/api/database/execute"]:
        try:
            req = urllib.request.Request(endpoint, data=payload, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode())
        except Exception:
            continue

    return {"columns": [], "rows": [], "row_count": 0, "error": "Could not connect to database API."}


def cmd_connect(args):
    """Connects and saves a database connection URI to the user's workspace."""
    uri = args.uri.strip() if hasattr(args, "uri") and args.uri else ""
    if not uri:
        print(f"\n  {YELLOW}Please provide a database connection URI.{RESET}")
        print(f"  {DIM}Example: querycraft connect postgresql://user:pass@db.supabase.co:5432/postgres{RESET}\n")
        return

    workspace = getattr(args, "workspace", "Production") or "Production"
    creds = load_credentials()
    email = creds.get("email") if creds else "default_user"
    token = creds.get("cli_token") if creds else ""

    print(f"\n  {CYAN}🔌 Connecting Database...{RESET}")
    print(f"  {DIM}Target Workspace:{RESET} {BOLD}{workspace}{RESET}")
    print(f"  {DIM}Testing connection and introspecting schema...{RESET}\n")

    try:
        import urllib.request
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        payload = json.dumps({
            "connection_uri": uri,
            "workspace_id": "ws-default" if workspace == "Production" else workspace,
            "email": email,
        }).encode("utf-8")

        req = urllib.request.Request(f"{BACKEND_BASE}/api/workspaces/connect", data=payload, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode())

        tables_count = data.get("tables_count", 0)
        host = data.get("host", "connected")
        db_name = data.get("database", "database")

        print(f"  {GREEN}{BOLD}✓ Database Connected Successfully!{RESET}")
        print(f"  {DIM}Host:{RESET} {host}  │  {DIM}Database:{RESET} {db_name}")
        print(f"  {DIM}Introspected:{RESET} {BOLD}{tables_count} tables{RESET}\n")
        print(f"  {DIM}You can now query with:{RESET}")
        print(f"    {CYAN}querycraft ask \"show all records\"{RESET}")
        print(f"    {CYAN}querycraft query \"SELECT * FROM users LIMIT 10;\"{RESET}\n")

    except Exception as e:
        print(f"  {RED}✖ Connection failed:{RESET} {e}")
        print(f"  {DIM}Verify your connection string, credentials, and network access.{RESET}\n")


def cmd_query(args):
    """Executes a direct read-only SQL query against the connected workspace."""
    sql = " ".join(args.sql) if isinstance(args.sql, list) else args.sql
    if not sql:
        print(f"\n  {YELLOW}Please provide a SQL query to execute.{RESET}")
        print(f"  {DIM}Example: querycraft query \"SELECT * FROM users LIMIT 10;\"{RESET}\n")
        return

    creds = load_credentials()
    email = creds.get("email") if creds else "default_user"
    token = creds.get("cli_token") if creds else ""

    print(f"\n  {CYAN}⚡ QueryCraft SQL Execution{RESET}  {DIM}[Workspace: Production]{RESET}")
    print(f"  {DIM}Executing:{RESET} {CYAN}{sql.strip()}{RESET}\n")

    res = _execute_sql_via_api(sql, email, token)
    rows = res.get("rows", [])
    columns = res.get("columns", [])
    elapsed = res.get("execution_time_ms", 0.0)

    if res.get("error"):
        print(f"  {RED}Execution Error:{RESET} {res['error']}\n")
        return

    print(f"  {GREEN}{BOLD}Results ({len(rows)} rows in {elapsed}ms):{RESET}\n")
    render_ascii_table(columns, rows)
    print()


def cmd_schema(args):
    """Inspects and lists all tables and schemas for the active workspace."""
    creds = load_credentials()
    email = creds.get("email") if creds else "default_user"

    print(f"\n  {CYAN}📋 Introspecting Database Schema...{RESET}  {DIM}[User: {email}]{RESET}\n")

    try:
        import urllib.request
        req = urllib.request.Request(f"{BACKEND_BASE}/api/clarification/schema", headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())

        tables = data.get("tables", [])
        db_type = data.get("database_type", "PostgreSQL")
        print(f"  {BOLD}Database Type:{RESET} {db_type}")
        print(f"  {BOLD}Total Tables:{RESET} {len(tables)}\n")

        for t in tables:
            t_name = t.get("table_name", "")
            t_desc = t.get("description", "")
            cols = t.get("columns", [])
            print(f"  {CYAN}{BOLD}• {t_name}{RESET}  {DIM}({len(cols)} columns){RESET} — {t_desc}")
            for c in cols[:6]:
                pk = f" {YELLOW}[PK]{RESET}" if c.get("is_primary_key") else ""
                fk = f" {GREEN}[FK]{RESET}" if c.get("is_foreign_key") else ""
                print(f"    {DIM}└─{RESET} {c.get('name')}: {CYAN}{c.get('type')}{RESET}{pk}{fk}")
            if len(cols) > 6:
                print(f"    {DIM}└─ ... {len(cols) - 6} more columns{RESET}")
            print()

    except Exception as e:
        print(f"  {YELLOW}⚠ Could not fetch schema: {e}{RESET}\n")


def cmd_ask(args):
    """Translates natural language to SQL, checks cost, and queries the database directly in terminal."""
    prompt = " ".join(args.prompt) if isinstance(args.prompt, list) else args.prompt
    if not prompt:
        print(f"\n  {YELLOW}Please provide a question or query.{RESET}")
        print(f"  {DIM}Example: querycraft ask \"show total orders by month\"{RESET}\n")
        return

    creds = load_credentials()
    email = creds.get("email") if creds else "default_user"
    token = creds.get("cli_token") if creds else ""

    print(f"\n  {CYAN}🧠 QueryCraft AI{RESET}  {DIM}[Workspace: Production | User: {email}]{RESET}")
    print(f"  {BOLD}Question:{RESET} {prompt}")
    print(f"  {DIM}Thinking, grounding schema, evaluating safety...{RESET}\n")

    try:
        import urllib.request
        req_data = json.dumps({
            "user_prompt": prompt,
            "session_history": [],
            "live_schema": None,
        }).encode("utf-8")

        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        req = urllib.request.Request(
            f"{BACKEND_BASE}/api/clarification/",
            data=req_data,
            headers=headers
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())

        # Extract SQL
        extracted = data.get("extracted_data") or {}
        sql = extracted.get("sql_query") or data.get("generated_query") or data.get("sql") or ""
        clarification = data.get("clarification_message") or data.get("message")
        explanation = extracted.get("explanation") or ""

        if not sql and clarification and "complete" not in str(data.get("status", "")).lower():
            print(f"  {YELLOW}{BOLD}Clarification Needed:{RESET}\n")
            print(f"  {clarification}\n")
            return

        if sql:
            print(f"  {GREEN}{BOLD}Generated SQL Query:{RESET}")
            print(f"  {CYAN}{sql.strip()}{RESET}\n")
            if explanation:
                print(f"  {DIM}ℹ {explanation}{RESET}\n")

            # Execute query and print table
            print(f"  {DIM}Executing query on database...{RESET}\n")
            exec_res = _execute_sql_via_api(sql, email, token)
            rows = exec_res.get("rows", [])
            columns = exec_res.get("columns", [])
            elapsed = exec_res.get("execution_time_ms", 0.0)

            if rows:
                print(f"  {GREEN}{BOLD}Results ({len(rows)} rows in {elapsed}ms):{RESET}\n")
                render_ascii_table(columns, rows)
                print()
            else:
                print(f"  {DIM}Query returned 0 rows.{RESET}\n")

    except Exception as e:
        print(f"  {YELLOW}⚠ Error processing query: {e}{RESET}")
        print(f"  {DIM}Ensure backend is running: cd backend && uv run uvicorn app.main:app{RESET}\n")


# ─────────────────────────────────────────────────
# Entry Point & Argument Parser
# ─────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="querycraft",
        description="QueryCraft CLI — Authenticate, query databases, and connect to AI assistants.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  querycraft ask "show top customers by revenue"   # Query database in natural language
  querycraft query "SELECT * FROM users;"          # Execute raw SQL directly
  querycraft connect postgresql://user:pass@db:5432 # Connect database to workspace
  querycraft schema                                # Inspect tables and columns
  querycraft setup                                 # 1-click connect to Claude, Cursor, Antigravity
  querycraft auth login                            # 1-click browser login
  querycraft workspaces list                       # List all database workspaces
        """
    )

    subparsers = parser.add_subparsers(dest="command", metavar="<command>")

    # ask command (direct query in natural language)
    ask_p = subparsers.add_parser("ask", help="Ask a question about your database in plain English")
    ask_p.add_argument("prompt", nargs="+", help="Natural language query or question")
    ask_p.set_defaults(func=cmd_ask)

    # query command (direct SQL execution)
    query_p = subparsers.add_parser("query", help="Execute a raw SQL query against your active database")
    query_p.add_argument("sql", nargs="+", help="SQL query to execute")
    query_p.set_defaults(func=cmd_query)

    # connect command
    conn_p = subparsers.add_parser("connect", help="Connect a live database URI to your workspace")
    conn_p.add_argument("uri", help="Database connection string (postgresql://...)")
    conn_p.add_argument("--workspace", default="Production", help="Workspace name (default: Production)")
    conn_p.set_defaults(func=cmd_connect)

    # schema command
    schema_p = subparsers.add_parser("schema", help="Inspect tables and columns in active workspace")
    schema_p.set_defaults(func=cmd_schema)

    # setup command (1-click AI configuration)
    setup_p = subparsers.add_parser("setup", help="1-Click auto-configure Claude Desktop, Cursor, Antigravity")
    setup_p.set_defaults(func=cmd_ai_setup)

    # auth subcommand
    auth_parser = subparsers.add_parser("auth", help="Authentication commands")
    auth_sub = auth_parser.add_subparsers(dest="auth_command", metavar="<subcommand>")

    login_p = auth_sub.add_parser("login", help="Log in via browser")
    login_p.add_argument("--force", action="store_true", help="Force re-authentication even if already logged in")
    login_p.set_defaults(func=cmd_auth_login)

    logout_p = auth_sub.add_parser("logout", help="Log out and clear credentials")
    logout_p.set_defaults(func=cmd_auth_logout)

    whoami_p = auth_sub.add_parser("whoami", help="Show current logged-in user")
    whoami_p.set_defaults(func=cmd_auth_whoami)

    # workspaces subcommand
    ws_parser = subparsers.add_parser("workspaces", help="Workspace management commands")
    ws_sub = ws_parser.add_subparsers(dest="ws_command", metavar="<subcommand>")

    list_p = ws_sub.add_parser("list", help="List all workspaces for the current user")
    list_p.set_defaults(func=cmd_workspaces_list)

    # ai subcommand
    ai_parser = subparsers.add_parser("ai", help="AI assistants integration (Claude, ChatGPT, Cursor)")
    ai_sub = ai_parser.add_subparsers(dest="ai_command", metavar="<subcommand>")

    ai_setup_p = ai_sub.add_parser("setup", help="1-Click auto-configure Claude Desktop, Cursor, Antigravity")
    ai_setup_p.set_defaults(func=cmd_ai_setup)

    ai_list_p = ai_sub.add_parser("list", help="Check status of all AI assistant integrations")
    ai_list_p.set_defaults(func=cmd_ai_list)

    ai_gpt_p = ai_sub.add_parser("chatgpt", help="Show ChatGPT Custom Action setup instructions")
    ai_gpt_p.set_defaults(func=cmd_ai_chatgpt)

    # Parse and dispatch
    args = parser.parse_args()

    if hasattr(args, "func"):
        args.func(args)
    else:
        print(LOGO)
        print(f"  {BOLD}QueryCraft CLI{RESET} — The AI-powered SQL & NoSQL query engine\n")
        print(f"  {DIM}Quick start:{RESET}")
        print(f"    {CYAN}querycraft connect postgresql://user:pass@host/db{RESET}  # Connect database")
        print(f"    {CYAN}querycraft ask \"show total orders by month\"{RESET}        # Ask in English")
        print(f"    {CYAN}querycraft query \"SELECT * FROM users LIMIT 10;\"{RESET}   # Run raw SQL")
        print(f"    {CYAN}querycraft schema{RESET}                                    # Inspect tables")
        print(f"    {CYAN}querycraft setup{RESET}                                     # Connect to AI tools\n")
        parser.print_help()
        print()


if __name__ == "__main__":
    main()


