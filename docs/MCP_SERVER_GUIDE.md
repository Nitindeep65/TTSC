# QueryCraft Model Context Protocol (MCP) Server Integration Guide
## Universal IDE & AI Agent Connectivity: Cursor, Gemini, Claude Desktop, & LangGraph

The QueryCraft **Pre-Flight Cost Guard** provides an official **Model Context Protocol (MCP)** server over standard input/output (`stdio`). Any MCP-compatible AI agent or IDE can natively invoke QueryCraft to evaluate PostgreSQL queries against live AST compute plans, heal runaway Cartesian joins, and block dangerous sequential scans before they hit production.

---

## 1. Quick Architecture Overview

```
 ┌──────────────────────────────────────────────────────────┐
 │ MCP Client (Cursor, Gemini CLI, Claude Desktop, LangGraph)│
 └────────────────────────────┬─────────────────────────────┘
                              │ JSON-RPC 2.0 via stdio
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │  QueryCraft MCP Server (backend/app/mcp_server.py)       │
 │  Tool: evaluate_and_heal_sql                             │
 └────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │  LangGraph 3-Node Cost Guard Cyclic Workflow             │
 │  [execute_explain] ➔ [evaluate_cost] ➔ [auto_heal_query] │
 └──────────────────────────────────────────────────────────┘
```

---

## 2. Client Setup & Configuration

### 2.1. Cursor IDE Configuration
Place this in `.cursor/mcp.json` at your project root, or in `~/.cursor/mcp.json` globally:

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

### 2.2. Claude Desktop Configuration
Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

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

### 2.3. Google Antigravity & Gemini Configuration
Place this in `~/.gemini/config/mcp_config.json` (macOS):

```json
{
  "mcpServers": {
    "querycraft-cost-guard": {
      "command": "/Users/nitindeep/Developer/TTS/backend/.venv/bin/python",
      "args": ["-m", "app.mcp_server"],
      "cwd": "/Users/nitindeep/Developer/TTS/backend",
      "env": {
        "PYTHONPATH": "/Users/nitindeep/Developer/TTS/backend",
        "READ_ONLY_ENFORCED": "true",
        "AUTO_LIMIT": "50"
      }
    }
  }
}
```

---

## 3. Tool Specifications

### Tool 1: `list_workspaces`
Lists all available database workspaces configured in QueryCraft, their active engines (PostgreSQL, MongoDB), and their environments.

### Tool 2: `evaluate_and_heal_sql`

#### Parameters
| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sql_query` | `string` | **Yes** | The raw SQL query string to inspect and evaluate. |
| `workspace` | `string` | No | Target QueryCraft workspace name (e.g. `"Production"`, `"Analytics"`, `"Staging"`). |
| `cost_threshold` | `number` | No (default `150.0`) | Maximum permissible compute cost before flagging as unsafe. |
| `connection_uri` | `string` | No | Direct database URI override. |
| `execute_if_safe` | `boolean` | No (default `true`) | When verified safe, automatically executes the query and returns a Markdown table of live rows. |

#### Behavior Matrix
| Trigger Condition | `is_error` | Client Action / Response |
| :--- | :--- | :--- |
| **Safe Query** | `false` | Verifies cost under budget, runs read-only query, and returns live Markdown data table with latency telemetry. |
| **Auto-Healed Query** (e.g. Cartesian join trap) | `false` | Auto-heals into explicit ANSI `JOIN`, validates compute reduction (-99.9%), executes the healed query, and renders live data table. |
| **Blocked Query** (e.g. 500k unindexed scan) | `true` | Halts execution, preserves original user query, and prescribes exact `CREATE INDEX` statement. |
| **Mutating Statement** (`DROP`, `DELETE`, etc.) | `true` | Security block rejecting non-read-only queries. |

---

## 4. Verification

Run the verification test script to inspect real-time interaction across all scenarios:
```bash
cd /Users/nitindeep/Developer/TTS/backend
.venv/bin/python test_mcp_client.py
```

