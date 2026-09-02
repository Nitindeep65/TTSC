# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Project Context & Architecture Summary for AI Agents (`agent.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.6.0` (Production Hardened · Autonomous Dashboard Architect · Canvas Studio · Pre-Flight Cost Guard · Universal MCP Server · QueryCraft CLI · Global Command Palette · Multi-Workspace · Interactive Docs Copilot · ChatGPT Custom Action)  
> **Primary Interfaces**: 
>   1. **Next.js 16 Web Dashboard & Studio**: Direct Compiler, Clarification Chat, Canvas Architect, Pre-Flight Cost Guard, Interactive CLI Docs.
>   2. **Model Context Protocol (MCP) Server**: Native `stdio` JSON-RPC 2.0 server for Cursor, Claude Desktop, Google Antigravity / Gemini, Windsurf, and custom agent swarms.
>   3. **QueryCraft CLI (`querycraft`)**: Terminal-native natural language query runner, raw SQL executor, schema inspector, 1-click AI configurator, and browser OAuth login.
>   4. **Manifest V3 Chrome Extension**: Spotlight Copilot (`Cmd+Shift+K`) with In-Situ Shadow DOM overlay.
>   5. **ChatGPT Custom Action / GPT**: OpenAPI 3.1.0 specification endpoint (`/api/gpt-action/openapi.json`) and legacy plugin manifest.
> **Dual AI Backend Support**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver (zero Python server required for Vercel deployment).
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Supervisor Orchestration + `psycopg2` / `pymongo`.  
> **Supported Engines**: PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB), MySQL, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Architecture Highlights

QueryCraft is an enterprise-grade AI database platform and natural language query engine bridging database schemas and business analytics through structured multi-agent workflows:

* **Dual AI Execution Architecture**:
  - **Serverless Direct Mode (Vercel & Node.js)**: Runs inside Next.js Route Handlers (`/api/clarification`, `/api/database/*`, `/api/dashboard/*`) powered by NVIDIA NIM Llama 3.1 70B Instruct and native `pg` driver. Zero Python server required for deployment.
  - **LangGraph Microservice Mode (FastAPI)**: Python multi-agent StateGraph orchestrating supervisor planning, parallel worker generation, critic self-healing loops, and memory RAG.
* **Autonomous Dashboard Architect & Canvas Mode (`/Dashboard/canvas`)**:
  - Supervisor Planner decomposes high-level business goals into 4 parallel query streams (*Primary Trend*, *Cohort Distribution*, *Leaderboard*, *Status Breakdown*).
  - Multi-Agent Pipeline DAG Flow (`PipelineExecutionFlow.jsx`) with live visual execution telemetry.
  - Handcrafted SVG charts (Bar, Line, Pie, Area, Table), inline metric sparklines, independent widget controls, and CSV export.
* **Interactive Clarification Chat Studio (`/Dashboard/chat`)**:
  - Evaluates ambiguity and pauses for **1-tap reply chips** before compilation on multi-dimensional requests, while executing direct queries immediately.
  - Multi-chip selection with confirmation badge.
  - Self-Healing **SQL Doctor Critic** diagnosing SQLSTATE codes (`42703`, `42P01`, `22P02`, `42803`) with auto-remediation.
* **Query Execution Sandbox (`/Dashboard`)**:
  - 1-tap `[ Compile & Execute ]` (`⌘Enter`) workflow.
  - JetBrains Mono monospace editor with syntax contrast and inline EXPLAIN cost planner.
  - Tabular numeral data grids with column drag-resize handles and 1-click CSV download.
* **Global Command Palette (`⌘K` / `Ctrl+K`)**:
  - Linear/Raycast-inspired modal navigation across views (`G C`, `G V`, `G X`), live schema tables (`⌘D`), recent queries, workspaces, and engine settings (`⌘,`, `⌘G`).
* **Universal Database Connectors & Safety Rails**:
  - Fast Single URI mode + Structured Parameter Builder with password auto-encoder (`#`, `@`, `/`, `?`).
  - Strict read-only enforcement (`SET TRANSACTION READ ONLY`), 8000ms statement timeouts, and default `LIMIT 50` clamps.
  - Pre-configured RFC `.internal` sandboxes (E-Commerce, SaaS Billing, MongoDB IoT).
* **Pre-Flight Cost Guard & AI Firewall (`/Dashboard/guard` & `/api/v1/guard`)**:
  - Stateful 3-node LangGraph workflow (`execute_explain` $\rightarrow$ `evaluate_cost` $\rightarrow$ `auto_heal_query`).
  - AST plan evaluator flagging runaway computational costs and sequential scans.
  - LLM auto-healer with DDL/DML separation (`rewritten` vs `blocked_needs_index`).
* **Model Context Protocol (MCP) Server — Universal Agent & IDE Connectivity (`stdio`)**:
  - Exposes `login_querycraft`, `list_workspaces`, `switch_workspace`, and `evaluate_and_heal_sql` tools over standard JSON-RPC 2.0 I/O for native IDE agent tool calls.
  - User session binding with CLI auto-login via `~/.querycraft/auth.json`.
  - Universal client compatibility: **Cursor**, **Claude Desktop**, **Google Antigravity / Gemini**, and custom **LangGraph** swarms.
* **QueryCraft CLI (`querycraft`)**:
  - Browser-based OAuth login flow (`querycraft auth login`), token management, `querycraft ask`, `querycraft query`, `querycraft connect`, `querycraft schema`, `querycraft setup`, `querycraft ai list`, `querycraft workspaces list`.
* **Interactive CLI Documentation Portal & Craft AI Copilot (`/docs/cli`)**:
  - Searchable CLI reference, interactive browser terminal emulator, quick-copy commands, and intelligent Llama 3.1 70B Docs Copilot.
* **Manifest V3 Chrome Extension Spotlight Copilot (`Cmd+Shift+K`)**:
  - Shadow DOM overlay with bi-directional workspace and settings synchronization.
* **ChatGPT Custom Action & Legacy Plugin Manifest**:
  - Hosted OpenAPI 3.1.0 specification endpoint (`/api/gpt-action/openapi.json`) for custom GPTs.
* **Automated Verification**:
  - **Frontend**: 12/12 passing Jest test suites (76 tests).
  - **Backend**: 120/120 passing Pytest test suites.
  - **Build**: Next.js 16.3 Turbopack compiles all 21 routes cleanly with zero static errors.

---

## 2. Monorepo Quick Reference

```
TTS/
├── frontend/                       # Next.js 16.3 + React 19 + TailwindCSS v4
│   ├── app/
│   │   ├── (auth)/Login, Register  # Centered card auth backdrop
│   │   ├── (website)/Dashboard/
│   │   │   ├── page.jsx            # Compiler Studio & Sandbox
│   │   │   ├── chat/Chatbox.jsx    # Clarification Studio
│   │   │   ├── canvas/page.jsx     # Canvas Studio & Supervisor Orchestration
│   │   │   ├── guard/page.jsx      # Pre-Flight Cost Guard Studio
│   │   │   ├── layout.jsx          # 3-Zone Header, ⌘1/⌘2/⌘3/⌘4 hotkeys, DB status
│   │   │   └── slidebar.jsx        # 2-Tab Sidebar (Nav/Recents vs Schema Explorer)
│   │   ├── (website)/docs/cli/     # Interactive CLI Docs & Playground
│   │   ├── (website)/auth/cli/     # Browser OAuth handshake view for CLI login
│   │   ├── api/                    # Serverless API routes (clarification, database, dashboard, docs-copilot, gpt-action, semantic, settings, guard, workspaces, auth)
│   │   ├── components/
│   │   │   ├── canvas/             # DashboardCanvas & PipelineExecutionFlow
│   │   │   ├── database/           # ConnectDatabaseModal & TableDataProfilerModal
│   │   │   ├── docs/               # DocsAiCopilot
│   │   │   ├── extension/          # ExtensionPromptModal
│   │   │   ├── guard/              # CostGuardDashboard
│   │   │   ├── onboarding/         # OnboardingModal & SpotlightTour
│   │   │   ├── semantic/           # MetricGlossaryModal
│   │   │   ├── settings/           # SettingsPanel (8 tabs, quotas, billing)
│   │   │   ├── shell/              # CommandPalette (⌘K)
│   │   │   └── visualization/      # DataVisualizer (Handcrafted SVG charts)
│   │   └── lib/                    # serverLlm, dbDriver, api, databaseContext, authContext, soundUtils
│   └── __tests__/                  # 12 Jest test suites (76 tests passed)
│
├── backend/                        # FastAPI Python 3.10+ Microservice & CLI
│   ├── app/
│   │   ├── routers/                # clarification, dashboard, database, guard, memory, semantic, settings, workspaces
│   │   ├── services/               # cost_guard_graph, dashboard_service, db_service, explain_service, healing_service, llm_services, memory_service, semantic_service, sql_graph, workspace_service
│   │   ├── mcp_server.py           # Model Context Protocol (MCP) stdio JSON-RPC 2.0 server
│   │   └── Models/schema.py        # Pydantic data schemas
│   ├── cli.py                      # Standalone QueryCraft CLI (`querycraft`)
│   └── tests/                      # 120 Pytest tests passed
│
├── extension/                      # Manifest V3 Chrome Extension (Spotlight Copilot)
└── docs/                           # Architecture specs, guides, & OpenAPI specifications
```

---

## 3. Developer Runbook

### Start Web Application (Vercel Serverless Mode)
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run dev
# Dashboard at http://localhost:3000
```

### Run Test Suites
```bash
# Frontend Jest Suites (76 tests)
cd /Users/nitindeep/Developer/TTS/frontend && npm test

# Backend Pytest Suites (120 tests)
cd /Users/nitindeep/Developer/TTS/backend && uv run pytest
```

### Build Production Bundle
```bash
cd /Users/nitindeep/Developer/TTS/frontend && npm run build
# Compiles all 21 static/dynamic routes with Turbopack
```
