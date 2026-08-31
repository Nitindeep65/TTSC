# 🚀 1-Click Universal AI Setup — QueryCraft

Connect QueryCraft to **Claude Desktop**, **Cursor IDE**, **Antigravity**, or query directly from your terminal in **1 command**.

---

## ⚡ Method 1: The 1-Click Automatic Setup (Zero Config)

Run this single command in your terminal:
```bash
querycraft setup
```

**Output:**
```
  ⚡ 1-Click Universal AI Setup

  ✓ Claude Desktop App        → Configured
  ✓ Cursor IDE (Global)       → Configured
  ✓ Google Antigravity & Gemini → Configured

  🎉 All AI tools configured successfully!
```
*That's it! Just open Claude Desktop, Cursor, or Antigravity and start querying your databases.*

---

## 🧠 Method 2: Ask Directly in Terminal (No AI App Needed)

You can ask questions about your databases directly from your CLI:
```bash
querycraft ask "show all registered users by signup date"
```

---

## 💬 Method 3: ChatGPT Web (Custom Action)

1. Open [chatgpt.com/create](https://chatgpt.com/create) $\rightarrow$ **Configure** $\rightarrow$ **Create new action**.
2. Click **Import from URL** and paste:
   ```
   http://localhost:8000/api/gpt-action/openapi.json
   ```
3. Click **Save**.
   - If deployed: use your backend domain (e.g., `https://api.querycraft.ai`).
5. **Authentication**: Set to `None` (or `API Key` / `Bearer Token` if using `QUERYCRAFT_API_KEY`).
6. Click **Save** and test by asking:
   > *"Show me my QueryCraft database workspaces and inspect table schemas."*

### Method B: Local Plugin Developer Mode (Legacy Manifest)
1. Ensure QueryCraft FastAPI backend is running on `http://localhost:8000`.
2. QueryCraft automatically serves the manifest at `http://localhost:8000/.well-known/ai-plugin.json`.
3. In ChatGPT plugin store, select **Develop your own plugin** $\rightarrow$ enter `localhost:8000`.
4. Click **Find manifest file** $\rightarrow$ **Install unverified plugin**.

---

## 3. Cursor IDE

Cursor uses MCP for autonomous codebase and database agent workflows.

Config location: `~/.cursor/mcp.json` or `.cursor/mcp.json` in your workspace root:
```json
{
  "mcpServers": {
    "querycraft-cost-guard": {
      "command": "/Users/nitindeep/Developer/TTS/backend/.venv/bin/python",
      "args": ["-m", "app.mcp_server"],
      "cwd": "/Users/nitindeep/Developer/TTS/backend",
      "env": {
        "PYTHONPATH": "/Users/nitindeep/Developer/TTS/backend"
      }
    }
  }
}
```

---

## 4. Google Antigravity & Gemini IDE

Config location: `~/.gemini/config/mcp_config.json`
*(Already active and verified!)*
