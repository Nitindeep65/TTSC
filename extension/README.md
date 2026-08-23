# QueryCraft - Manifest V3 Chrome Extension

**QueryCraft** is an AI-powered Multi-Database Text-to-SQL Clarification Engine & Live Query Client built as a modern Manifest V3 Chrome Extension.

---

## Features

- **Multi-Database Switching**: Connect and manage multiple cloud/local PostgreSQL databases (Supabase, Neon Serverless, AWS RDS, Localhost) right from the popup.
- **Zero-Hallucination Schema Grounding**: Live introspection of table schemas, column types (`UUID`, `TIMESTAMPTZ`, `JSONB`, `NUMERIC`), and constraints.
- **Conversational Clarification**: Pauses and asks targeted questions when date windows, metrics, or filters are ambiguous.
- **1-Click SQL Copy & Live Execution**: Copy production-ready SQL or execute read-only queries with live tabular results in seconds.
- **Keyboard-Friendly**:
  - `Enter`: Submit query
  - `Shift + Enter`: New line
  - `Cmd / Ctrl + K`: Toggle database profile switcher
  - `Esc`: Close modals / schema drawers

---

## Installation & Setup

### 1. Start the FastAPI Backend
Ensure your backend server is running on port 8000:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### 2. Load Extension in Chrome / Brave / Edge
1. Open Google Chrome (or Brave / Edge) and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** (in the top-left corner).
4. Select the `extension/` directory from this project (`/Users/nitindeep/Developer/TTS/extension`).
5. Click the **QueryCraft** icon in your Chrome extensions bar to open the studio!

---

## Architecture & API Endpoints Used

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `http://127.0.0.1:8000/api/clarification/` | `POST` | Multi-turn conversational SQL clarification and generation |
| `http://127.0.0.1:8000/api/database/connect` | `POST` | Test connection and introspect live table schema |
| `http://127.0.0.1:8000/api/database/execute` | `POST` | Read-only SELECT query execution with row limits |
