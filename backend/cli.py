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
# Entry Point & Argument Parser
# ─────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="querycraft",
        description="QueryCraft CLI — Authenticate and manage your database workspaces.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  querycraft auth login              # Browser-based login (recommended)
  querycraft auth login --force      # Force re-authentication
  querycraft auth logout             # Sign out and clear credentials
  querycraft auth whoami             # Show current logged-in user
  querycraft workspaces list         # List all your database workspaces
        """
    )

    subparsers = parser.add_subparsers(dest="command", metavar="<command>")

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

    # Parse and dispatch
    args = parser.parse_args()

    if hasattr(args, "func"):
        args.func(args)
    else:
        # No subcommand given
        print(LOGO)
        print(f"  {BOLD}QueryCraft CLI{RESET} — The AI-powered SQL & NoSQL query engine\n")
        print(f"  {DIM}Get started:{RESET}")
        print(f"    {CYAN}querycraft auth login{RESET}      # Authenticate via browser")
        print(f"    {CYAN}querycraft workspaces list{RESET} # See your database connections\n")
        parser.print_help()
        print()


if __name__ == "__main__":
    main()
