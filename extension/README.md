# QueryCraft - Manifest V3 Chrome Extension (SQL & NoSQL Studio)

**QueryCraft** is an AI-powered Multi-Database Text-to-SQL & NoSQL Clarification Engine and Live Query Client built as a modern Manifest V3 Chrome Extension.

---

## Features

- **Multi-Engine Switching**: Connect and manage cloud SQL (Supabase, Neon, AWS RDS, MySQL, PostgreSQL) and NoSQL (MongoDB Atlas, Redis, DynamoDB) right from the popup.
- **Zero-Hallucination Grounding**: Live introspection of relational schemas and NoSQL collections, BSON/JSONB types, and constraints.
- **Conversational Clarification**: Pauses and asks targeted questions when date windows, metrics, or aggregation parameters are ambiguous.
- **1-Click SQL & MQL Copy & Live Execution**: Copy production-ready SQL or MongoDB aggregation pipelines, or execute queries directly in seconds.
- **Floating Spotlight Copilot**: Press `Cmd + Shift + K` (or `Ctrl + Shift + K`) anywhere on any webpage to open the floating AI assistant for instant SQL/NoSQL query generation, explain plan, and self-healing.
- **Keyboard-Friendly**:
  - `Enter`: Submit query
  - `Shift + Enter`: New line
  - `Cmd / Ctrl + K`: Toggle database profile switcher
  - `Cmd / Ctrl + Shift + K`: Toggle in-page Spotlight Copilot
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

### 2. Load Extension in Chrome / Brave / Edge / Arc
1. Open your Chromium browser and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** (in the top-left corner).
4. Select the `extension/` directory from this project (`/Users/nitindeep/Developer/TTS/extension`).
5. Click the **QueryCraft** icon in your browser extensions bar to open the studio!

---

## Architecture & API Endpoints Used

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `http://127.0.0.1:8000/api/clarification/` | `POST` | Multi-turn conversational SQL & NoSQL clarification and compilation |
| `http://127.0.0.1:8000/api/database/connect` | `POST` | Connect and introspect live table schema / database catalogs |
| `http://127.0.0.1:8000/api/database/execute` | `POST` | Read-only query execution with automatic LIMIT 50 safeguards |
| `http://127.0.0.1:8000/api/database/explain` | `POST` | Query performance execution plan & index suggestions |
| `http://127.0.0.1:8000/api/database/diagnose` | `POST` | Self-healing Critic Doctor for repairing runtime errors |
