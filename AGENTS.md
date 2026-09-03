# QueryCraft — PostgreSQL Safety & Intelligence Engine
## Comprehensive Project Context, Architecture & Feature Reference for AI Agents (`AGENTS.md`)

> **Repository**: `TTS` (Text-To-SQL / PostgreSQL Safety & Intelligence Layer)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `2.0.0-mvp` (Production Hardened · PostgreSQL Safety Layer · Pre-Flight Cost Guard · SQL Doctor Critic · 6 Native MCP Tools · Standalone CLI · 6-Chapter Page-Wise Docs with Hash Navigation · Multi-Tab Studio Sandbox · Craft AI Docs Copilot)  
> **Primary Interfaces**: 
>   1. **Next.js 16 Web Dashboard & Studios**: 
>      - `⌘1` — **SQL Doctor & Clarification Chat Studio** (`/Dashboard/chat`)
>      - `⌘2` — **Pre-Flight Cost Guard AI Firewall Studio** (`/Dashboard/guard`)
>      - `⌘3` — **SQL Compiler Sandbox** (`/Dashboard`) with multi-tab editor, CSV export, SQL formatter, and live EXPLAIN telemetry
>      - `⌘K` — **Raycast/Linear-Style Command Palette** for instant navigation
>   2. **High-Fidelity Interactive Landing Page (`/`)**:
>      - Live interactive 3-scenario terminal emulator (`querycraft check`, `querycraft ask`, `querycraft doctor`)
>      - **Developer Workflow 4-Stage Interactive Pipeline** (`DeveloperWorkflowSection.jsx`) with animated state transitions, auto-play progression timer, live catalog visualizer, interactive 1-tap clarification chips, and SQL Doctor auto-heal simulation
>      - 5-Pillar safety & architecture showcase, interactive CLI installer tabs, and developer testimonials
>   3. **Model Context Protocol (MCP) Server**: Native `stdio` JSON-RPC 2.0 server with 6 tools for Cursor, Claude Desktop, Google Antigravity / Gemini, Windsurf, and custom agent swarms.
>   4. **QueryCraft CLI (`querycraft`)**: Standalone terminal executable (`ask`, `check`, `doctor`, `query`, `schema`, `connect`, `setup`, `auth`, `workspaces`, `ai`).
>   5. **Interactive 3-Zone CLI Documentation Portal (`/docs/cli`)**: 6 chapters, 17 modular non-scrolling pages with hash deep linking (`#check`, `#doctor`, `#setup`), 3-zone layout (persistent sidebar, ~780px reading column, sticky "On This Page" TOC), Light/Dark/System theme switcher, Raycast/Linear-style `⌘K` command discovery, and Craft AI Copilot.
>   6. **Craft AI Docs Copilot (`DocsAiCopilot.jsx` & `/api/docs-copilot`)**: Grounded documentation AI guide with floating glassmorphic widget on Homepage and Docs.
> **Dual AI Backend Architecture**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver (zero Python server required for Vercel deployment).
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Supervisor Orchestration + `psycopg2`.  
> **Target Database Engines**: Cloud PostgreSQL (Supabase, Neon Serverless, AWS RDS PostgreSQL, CockroachDB, Heroku PG, standard PostgreSQL).  

---

## 1. Executive Summary & Problem Space

Traditional Text-to-SQL tools frequently break down in production environments because of five critical failure modes:
1. **Ambiguity & Blind Guessing**: Standard single-turn models guess dates, dimensions, metrics, and filters without asking, producing plausible-looking but inaccurate queries.
2. **Schema & Typo Hallucinations**: LLMs invent non-existent table and column names, misspell similar entity names (e.g., `custmers` vs `customers`), or misuse database-specific types (`UUID`, `TIMESTAMPTZ`, `JSONB`, `NUMERIC`).
3. **Runtime Failures & Cryptic Errors**: Generated queries fail at runtime due to missing `GROUP BY` clauses, column type mismatches, or SQLSTATE syntax errors (`42703`, `42803`, `42P01`).
4. **Dangerous Runaway Scans & Missing Indexes**: Queries trigger expensive full sequential table scans or cross-join memory spikes on multi-million row production databases without pre-execution cost analysis.
5. **Accidental Data Mutations**: Generic coding assistants can inadvertently generate mutating DDL/DML statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`).

### The QueryCraft 5-Pillar Solution Architecture
QueryCraft eliminates these failure modes with an integrated end-to-end defensive pipeline:
1. **Pre-Flight Cost Guard & 3-Tier Risk Engine**: Dry-runs PostgreSQL `EXPLAIN (FORMAT JSON, COSTS TRUE)` to estimate compute cost, classifies risk into 3 tiers (`[LOW RISK]`, `[MEDIUM RISK]`, `[HIGH RISK]`), detects sequential scans on high-row tables, auto-heals Cartesian joins, and generates targeted `CREATE INDEX CONCURRENTLY` DDL suggestions without mutating user DML queries.
2. **Proactive Conversational Clarification Loop**: Evaluates prompt ambiguity and pauses to ask targeted clarifying questions with **1-tap interactive response chips** before compilation, while executing direct queries immediately.
3. **Zero-Hallucination Live Schema Grounding**: Automatically introspects live PostgreSQL Information Schemas (tables, column types, UUIDs, JSONB, foreign keys, constraints) to ground prompts strictly in valid schemas.
4. **Self-Healing Critic Loop ("SQL Doctor")**: Intercepts database runtime execution errors, parses SQLSTATE codes (`42703`, `42P01`, `22P02`, `42803`, `42601`), uses an LLM Critic to diagnose root causes, and automatically repairs queries with up to 3 self-healing retries.
5. **Universal Agent & IDE Connectivity (6 MCP Tools + CLI)**: Full Model Context Protocol (MCP) server over `stdio` with user session binding, 1-click IDE configuration via `querycraft setup`, automatic CLI session handshake, and standalone CLI toolchain.

### MVP Scope Status (Streamlined for Production Reliability)
- **Active & Hardened**: PostgreSQL Engine, Supabase, Neon Serverless, AWS RDS, Pre-Flight Cost Guard, SQL Doctor Critic, Clarification Loop, 6 MCP Tools, Standalone CLI, 6-Chapter Page-Wise Docs, Multi-Tab Studio Sandbox, Craft AI Docs Copilot.
- **Postponed / Disabled for MVP**: MongoDB/NoSQL document stores, BI Canvas Architect (redirects gracefully to `/Dashboard`), Semantic KPI Glossary.

```
                                  ┌───────────────────────────────┐
                                  │      User Natural Language    │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                ┌───────────────────────────────────┐
                                │   Node 1: Intent & Clarifier      │
                                │   - Ambiguity & Retrieval Routing │
                                │   - Typo & Entity DDL Matcher     │
                                └─────────┬───────────────┬─────────┘
                                          │               │
                  [Ambiguous / Missing]   │               │   [Clear / Direct Query]
                                          ▼               ▼
                      ┌───────────────────────┐  ┌───────────────────────────────────┐
                      │ Needs Clarification   │  │   Node 2: Schema Context Retriever│
                      │ - Date Boundary?      │  │   - Live PostgreSQL DDL & Types   │
                      │ - Metric Calculation? │  │   - Primary & Foreign Keys (PK/FK)│
                      │ - 1-Tap Reply Chips   │  │   - Verified Few-Shot Pairs (RAG) │
                      └───────────────────────┘  └─────────────────┬─────────────────┘
                                                                   │
                                                                   ▼
                                                 ┌───────────────────────────────────┐
                                                 │   Node 3: Safe SQL Compiler       │
                                                 │   - Grounded Llama 3.1 70B Prompt │
                                                 │   - Strict Read-Only & LIMIT 50   │
                                                 └─────────────────┬─────────────────┘
                                                                   │
                                           ┌───────────────────────┴───────────────────────┐
                                           │                                               │
                                           ▼                                               ▼
                         ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
                         │   Dry-Run EXPLAIN / Cost Guard    │           │   Node 4: Execute & Guard         │
                         │   - Cost Estimation (<60 / <300)  │           │   - Read-Only Database Execution  │
                         │   - 3-Tier Risk: LOW / MED / HIGH │           │   - 8000ms Statement Timeout      │
                         │   - Seq Scan → Index Suggestions  │           └─────────────────┬─────────────────┘
                         └───────────────────────────────────┘                             │
                                                                   ┌───────────────────────┴───────────────────────┐
                                                                   │                                               │
                                                            [Execution OK]                                 [Runtime Error]
                                                                   │                                               │
                                                                   ▼                                               ▼
                                                 ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
                                                 │   Node 6: Interactive Results     │           │   Node 5: SQL Doctor (Critic)     │
                                                 │   - Resizable Column Grid         │◀──────────│   - SQLSTATE Error Code Diagnosis │
                                                 │   - 1-Click CSV Export & Copy     │  [Healed] │   - Schema-Aware Auto Heal Retry  │
                                                 │   - Safety & EXPLAIN Analysis     │           │   - 3 Self-Healing Retries        │
                                                 └───────────────────────────────────┘           └───────────────────────────────────┘
```

---

## 2. Monorepo Structure & File Map

```
TTS/
├── backend/                        # FastAPI Python 3.10+ Backend Service & CLI Tools
│   ├── app/
│   │   ├── data/                   # Local multi-tenant JSON persistence storage
│   │   │   ├── cli_sessions.json       # Active CLI session tokens & expiry timestamps
│   │   │   ├── notebook_queries.json   # Saved snippets & team SQL notebook entries
│   │   │   ├── semantic_rules.json     # Business metric definitions
│   │   │   ├── settings.json           # User settings, preferences, shortcuts, usage counters
│   │   │   ├── user_workspaces.json    # User-scoped database workspaces & connection strings
│   │   │   ├── verified_queries.json   # Gold standard few-shot training queries
│   │   │   └── workspaces.json         # Default fallback workspace definitions
│   │   ├── Models/
│   │   │   └── schema.py           # Pydantic models (risk_level, error_category, ExplainPlanResponse)
│   │   ├── routers/
│   │   │   ├── clarification.py    # /api/clarification - Multi-turn clarify & compile
│   │   │   ├── dashboard.py        # /api/dashboard - (MVP disabled, returns 404)
│   │   │   ├── database.py         # /api/database - Connect, introspect, execute, explain, diagnose, sample
│   │   │   ├── guard.py            # /api/v1/guard - Pre-Flight Cost Guard LangGraph API
│   │   │   ├── memory.py           # /api/memory - Verified few-shot memory & notebook snippets
│   │   │   ├── semantic.py         # /api/semantic - (Postponed post-MVP)
│   │   │   ├── settings.py         # /api/settings - Sync settings, shortcuts, usage counters
│   │   │   └── workspaces.py       # /api/workspaces & /api/auth - Workspaces CRUD & CLI OAuth token exchange
│   │   ├── services/
│   │   │   ├── cost_guard_graph.py # LangGraph Pre-Flight Cost Guard AI Firewall workflow
│   │   │   ├── dashboard_service.py# Dashboard Architect graph (postponed post-MVP)
│   │   │   ├── db_service.py       # PostgreSQL connection, introspection, execution, sampling
│   │   │   ├── explain_service.py  # PostgreSQL EXPLAIN cost analyzer, 3-tier risk logic, index advisor
│   │   │   ├── healing_service.py  # Critic agent self-healing loop & SQL Doctor error diagnoser
│   │   │   ├── llm_services.py     # Llama 3.1 prompt builder, clarification logic, safety validator
│   │   │   ├── memory_service.py   # Few-shot memory RAG, schema pruning RAG, notebook persistence
│   │   │   ├── semantic_service.py # Business metric matching (postponed post-MVP)
│   │   │   ├── sql_graph.py        # LangGraph multi-agent StateGraph workflow & self-healing loop
│   │   │   └── workspace_service.py# User-scoped workspace storage & credential authentication
│   │   ├── main.py                 # FastAPI initialization, CORS, router registrations
│   │   └── mcp_server.py           # Model Context Protocol (MCP) Server (6 native tools, stdio transport)
│   ├── tests/                      # Pytest Automated Test Suite (117 passed, 3 skipped)
│   │   ├── conftest.py             # Test fixtures & mock environments
│   │   ├── test_api_clarification.py # Clarification endpoint integration tests
│   │   ├── test_cli_auth.py        # CLI OAuth login, verification & token tests
│   │   ├── test_cost_guard.py      # LangGraph cost guard & firewall unit tests
│   │   ├── test_dashboard_service.py # 3 skipped intentionally (MVP disabled router)
│   │   ├── test_db_service.py      # Database connection, introspection & execution tests
│   │   ├── test_graph_nodes.py     # LangGraph workflow node execution tests
│   │   ├── test_healing_service.py # SQL Doctor critic & SQLSTATE auto-heal tests
│   │   ├── test_mcp_server.py      # MCP tools & stdio JSON-RPC 2.0 tests
│   │   ├── test_sql_safety.py      # Read-only enforcement, injection protection tests
│   │   └── test_workspace_service.py # Workspace persistence & isolation tests
│   ├── cli.py                      # Standalone QueryCraft CLI (`querycraft` executable)
│   ├── pyproject.toml              # UV / Pip build definition & dependencies
│   ├── requirements.txt            # Production pip dependencies
│   └── uv.lock                     # UV package lock
│
├── frontend/                       # Next.js 16.3 + React 19 + TailwindCSS v4 Dashboard
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── Login/
│   │   │   │   └── page.jsx        # Auth login view with responsive Card backdrop, OAuth providers
│   │   │   └── Register/
│   │   │       └── page.jsx        # Auth register view with role selection & Firebase auth
│   │   ├── (website)/
│   │   │   ├── auth/
│   │   │   │   ├── cli/
│   │   │   │   │   └── page.jsx    # Browser OAuth handshake view for CLI login flow
│   │   │   │   └── oauth/
│   │   │   │       └── page.jsx    # OAuth redirect & callback handler
│   │   │   ├── Dashboard/
│   │   │   │   ├── canvas/
│   │   │   │   │   └── page.jsx    # Client redirect to /Dashboard (Canvas disabled in MVP)
│   │   │   │   ├── chat/
│   │   │   │   │   ├── Chatbox.jsx # Responsive interactive clarification chat & SQL Doctor studio
│   │   │   │   │   └── page.jsx    # Chat view route (⌘1)
│   │   │   │   ├── guard/
│   │   │   │   │   └── page.jsx    # Pre-Flight Cost Guard (AI Firewall) Studio (⌘2)
│   │   │   │   ├── layout.jsx      # 3-Zone shell, ⌘1/⌘2/⌘3 hotkeys, header status pill, CLI docs link
│   │   │   │   ├── page.jsx        # Multi-tab SQL compiler sandbox, CSV export, SQL formatter (⌘3)
│   │   │   │   └── slidebar.jsx    # Workspace switcher, Recents drawer, 2-tab schema explorer
│   │   │   ├── docs/
│   │   │   │   └── cli/
│   │   │   │       └── page.jsx    # 6-chapter page-wise CLI documentation portal (17 modular pages)
│   │   │   └── page.js             # High-fidelity QueryCraft landing page with 3-scenario terminal
│   │   ├── api/                    # Serverless Next.js API Routes (Vercel & Node.js)
│   │   │   ├── auth/
│   │   │   │   ├── cli-token/route.js # POST /api/auth/cli-token (Browser OAuth token exchange)
│   │   │   │   └── cli-verify/route.js# POST /api/auth/cli-verify (CLI token verification)
│   │   │   ├── clarification/
│   │   │   │   ├── route.js        # POST /api/clarification (Llama 3.1 70B AI compilation)
│   │   │   │   └── schema/route.js # GET /api/clarification/schema (Grounding schema)
│   │   │   ├── database/
│   │   │   │   ├── connect/route.js   # POST /api/database/connect (pg live introspection)
│   │   │   │   ├── diagnose/route.js  # POST /api/database/diagnose (SQL Doctor healing)
│   │   │   │   ├── execute/route.js   # POST /api/database/execute (pg live query execution)
│   │   │   │   └── explain/route.js   # POST /api/database/explain (pg EXPLAIN cost planner)
│   │   │   ├── docs-copilot/
│   │   │   │   └── route.js        # POST /api/docs-copilot (Craft AI Docs assistant)
│   │   │   ├── settings/
│   │   │   │   └── route.js        # GET/POST /api/settings (Sync settings, usage, quotas)
│   │   │   ├── v1/
│   │   │   │   └── guard/route.js  # POST /api/v1/guard (Cost Guard Firewall API)
│   │   │   └── workspaces/
│   │   │       └── route.js        # GET/POST/PUT/DELETE /api/workspaces (Multi-workspace sync)
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   └── DashboardCanvas.jsx         # Canvas visualization (tested in Jest)
│   │   │   ├── database/
│   │   │   │   ├── ConnectDatabaseModal.jsx    # Dual mode URI/Builder, Password encoder, Sandboxes
│   │   │   │   └── TableDataProfilerModal.jsx  # 5-row sample preview & distinct distribution
│   │   │   ├── docs/
│   │   │   │   └── DocsAiCopilot.jsx           # Floating Craft AI documentation copilot
│   │   │   ├── extension/
│   │   │   │   └── ExtensionPromptModal.jsx    # Chrome extension modal
│   │   │   ├── guard/
│   │   │   │   ├── CostGuardDashboard.jsx     # Split-screen Pre-Flight Cost Guard Studio
│   │   │   │   └── RiskBadge.jsx              # 3-tier risk badge (LOW/MED/HIGH) and banner
│   │   │   ├── onboarding/
│   │   │   │   ├── OnboardingModal.jsx         # New user walkthrough modal
│   │   │   │   └── SpotlightTooltip.jsx        # Step-by-step UI spotlight tour
│   │   │   ├── semantic/
│   │   │   │   └── MetricGlossaryModal.jsx     # Business metric glossary (postponed post-MVP)
│   │   │   ├── settings/
│   │   │   │   └── SettingsPanel.jsx           # User preferences & shortcut configurator
│   │   │   ├── shell/
│   │   │   │   └── CommandPalette.jsx          # Raycast/Linear-style global ⌘K command modal
│   │   │   ├── workflow/
│   │   │   │   └── DeveloperWorkflowSection.jsx# Interactive 4-stage safety pipeline with animated transitions
│   │   │   └── workspace/
│   │   │       ├── CreateWorkspaceModal.jsx    # Multi-workspace creation modal
│   │   │       ├── QueryNotebookModal.jsx      # Tagged SQL snippet notebook
│   │   │       └── WorkspaceSwitcher.jsx       # Adaptive workspace dropdown switcher
│   │   ├── lib/
│   │   │   ├── api.js                          # Frontend API client (databaseApi, clarificationApi, etc.)
│   │   │   ├── authContext.jsx                 # Firebase authentication context
│   │   │   ├── databaseContext.jsx             # Active database workspace state & live execution
│   │   │   ├── extensionContext.jsx            # Chrome extension communication state
│   │   │   ├── serverLlm.js                    # Serverless Llama 3.1 70B prompt execution
│   │   │   ├── settingsContext.jsx             # User settings & shortcut state
│   │   │   ├── soundUtils.js                   # Subtle audio feedback triggers
│   │   │   └── tourContext.jsx                 # Spotlight onboarding tour state
│   │   ├── globals.css                         # TailwindCSS v4 styles, custom scrollbars, tokens
│   │   ├── layout.js                           # Root HTML layout with font imports
│   │   └── page.js                             # Root route rendering QueryCraftLandingPage
│   └── __tests__/                              # Jest Automated Frontend Tests (76 passed)
│       ├── components/                         # 7 component test suites
│       └── lib/                                # 5 utility & context test suites
```

---

## 3. Core Feature Details & Technical Implementation

### 3.1. Pre-Flight Cost Guard & 3-Tier Risk Engine
- **Backend Service**: [`backend/app/services/explain_service.py`](file:///Users/nitindeep/Developer/TTS/backend/app/services/explain_service.py) & [`backend/app/services/cost_guard_graph.py`](file:///Users/nitindeep/Developer/TTS/backend/app/services/cost_guard_graph.py)
- **Frontend Studio**: [`CostGuardDashboard.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/components/guard/CostGuardDashboard.jsx) & [`RiskBadge.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/components/guard/RiskBadge.jsx)
- **Methodology**: Executes `EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE)` inside a read-only transaction on the target PostgreSQL database without mutating user data.
- **Risk Classification Rules**:
  - `[LOW RISK]`: Total compute cost `< 60.0`, uses indexed access (`Index Scan`, `Index Only Scan`), bounded row count.
  - `[MEDIUM RISK]`: Compute cost `60.0 – 300.0`, or Sequential Scan on moderate tables (`> 1,000` rows).
  - `[HIGH RISK]`: Compute cost `> 300.0`, Sequential Scan on large tables (`> 10,000` rows), unconstrained Cartesian cross-joins, or memory-intensive nested loops without join keys.
- **Targeted Index Advisor**: When a sequential scan is detected on a filtered column, generates `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_{table}_{col} ON {table}({col});` DDL. Crucially, the engine does **not** replace the user's DML query with DDL; it presents the DDL suggestion alongside the query.

### 3.2. Proactive Conversational Clarification Loop
- **Backend Service**: [`backend/app/services/llm_services.py`](file:///Users/nitindeep/Developer/TTS/backend/app/services/llm_services.py) & [`frontend/app/api/clarification/route.js`](file:///Users/nitindeep/Developer/TTS/frontend/app/api/clarification/route.js)
- **Frontend Studio**: [`Chatbox.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/app/%28website%29/Dashboard/chat/Chatbox.jsx)
- **Behavior**: When a user prompt lacks critical filtering dimensions (e.g., date windows, status filters, aggregation metrics), the engine returns `status: "needs_clarification"` with targeted **1-tap interactive response chips** (e.g., `["Completed Only", "All Statuses", "Past 30 Days"]`). Direct, unambiguous queries compile and execute immediately.

### 3.3. SQL Doctor Self-Healing Critic Loop
- **Backend Service**: [`backend/app/services/healing_service.py`](file:///Users/nitindeep/Developer/TTS/backend/app/services/healing_service.py) & [`backend/app/services/sql_graph.py`](file:///Users/nitindeep/Developer/TTS/backend/app/services/sql_graph.py)
- **API Endpoint**: `POST /api/database/diagnose`
- **Error Code Mapping**:
  - `42703` (`undefined_column`): Auto-maps hallucinated or misspelled column names against introspected table catalog.
  - `42P01` (`undefined_table`): Auto-maps entity names to valid tables in the connected database.
  - `42803` (`grouping_error`): Auto-injects missing non-aggregated columns into `GROUP BY` or wraps with aggregators (`SUM`, `COUNT`, `MAX`).
  - `22P02` (`invalid_text_representation`): Auto-corrects UUID, numeric, and timestamp literal formatting.
  - `42601` (`syntax_error`): Auto-repairs trailing commas, missing parentheses, and PostgreSQL reserved keyword conflicts.
- **Max Retries**: Up to 3 self-healing critic cycles. Returns structured `error_category` for frontend badge rendering.

### 3.4. Universal Model Context Protocol (MCP) Server (v2.0-mvp)
- **Server**: [`backend/app/mcp_server.py`](file:///Users/nitindeep/Developer/TTS/backend/app/mcp_server.py)
- **Protocol**: JSON-RPC 2.0 over `stdio`.
- **CLI OAuth Auto-Login**: Automatically inspects `~/.querycraft/auth.json` on startup and pre-authenticates the user session without requiring manual login.
- **6 Native Tools**:
  1. `login_querycraft(email, api_key)`: Binds active user session & workspaces.
  2. `list_workspaces()`: Returns workspaces, engines & live connection status.
  3. `switch_workspace(workspace_name)`: Switches active database context.
  4. `evaluate_and_heal_sql(sql_query, cost_threshold)`: EXPLAIN pre-flight check + auto-heal execution.
  5. `inspect_schema([workspace])`: Returns tables, columns, data types & foreign keys in Markdown table.
  6. `generate_safe_sql(prompt, [workspace])`: Compiles English to safe SQL with 3-tier risk badge.
- **1-Click Auto Config**: `querycraft setup` auto-detects Claude Desktop, Cursor IDE, Antigravity, and Windsurf and writes their MCP configurations automatically.

### 3.5. QueryCraft CLI (`querycraft`)
- **Executable**: [`backend/cli.py`](file:///Users/nitindeep/Developer/TTS/backend/cli.py)
- **Commands**:
  - `querycraft ask "<prompt>"`: Natural language to SQL execution with aligned ASCII results table.
  - `querycraft check "<SQL>" [--threshold <cost>]`: Pre-Flight Cost Guard analysis with 3-tier risk badge and index suggestions.
  - `querycraft doctor "<SQL or Error>"`: SQL Doctor self-healing agent and error diagnosis.
  - `querycraft query "<SQL>" [--limit <N>]`: Direct raw SQL execution with latency timing.
  - `querycraft schema [--table <name>]`: Introspects tables, data types, primary keys, and foreign keys.
  - `querycraft connect <URI> [--workspace <name>]`: Links live PostgreSQL database.
  - `querycraft setup`: 1-Click auto-configure Claude Desktop, Cursor, Antigravity, and Windsurf.
  - `querycraft auth login`: Browser-based OAuth handshake on port 9876 with secure token storage (`~/.querycraft/auth.json`, `chmod 600`).
  - `querycraft auth whoami`: Verifies active session token and connected workspace.
  - `querycraft auth logout`: Clears stored credentials.
  - `querycraft workspaces list`: Lists configured workspaces.
  - `querycraft ai setup | list | chatgpt`: AI assistant configuration tools.

### 3.6. Interactive 3-Zone CLI Documentation Portal
- **Page**: [`frontend/app/(website)/docs/cli/page.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/app/%28website%29/docs/cli/page.jsx)
- **Architecture**: 6 organized chapters across 17 modular non-scrolling pages:
  1. *Getting Started*: Overview & Architecture (`#overview`), Installation Options (`#installation`), 3-Step Quickstart (`#quickstart`).
  2. *Universal AI Integration*: `querycraft setup` (`#setup`), Claude & Cursor MCP (`#mcp-server`).
  3. *Query, Safety & Self-Healing*: `querycraft ask` (`#ask`), `querycraft check` (`#check`), `querycraft doctor` (`#doctor`), `querycraft query` (`#query`), `querycraft schema` (`#schema`), `querycraft connect` (`#connect`).
  4. *Authentication & Security*: `querycraft auth login` (`#auth-login`), `querycraft auth whoami` (`#auth-whoami`), `querycraft auth logout` (`#auth-logout`).
  5. *Workspaces & Environments*: `workspaces list` (`#workspaces`).
  6. *Reference & Config*: Command Cheat Sheet (`#cheatsheet`), Environment Variables (`#env-vars`).
- **Design System & UX Features**:
  - **3-Zone Desktop Layout**: Persistent left sidebar with real-time command filter, center reading column (~780px max-width) with hierarchical breadcrumbs, and sticky right sidebar ("On This Page" Table of Contents) for in-page section jumping.
  - **First-Class Theme System**: Segmented theme selector in header supporting Light (☀), Dark (☾), and System (💻) with `localStorage` persistence and automatic `prefers-color-scheme` synchronization.
  - **Raycast / Linear-Style Command Discovery Modal (`⌘K` / `Ctrl+K`)**: Fast modal indexing all 17 pages, flags, and descriptions with keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).
  - **Code Blocks as a Major UX Feature**: Distinct terminal header with mac dots and shell tags, distinct formatting between shell command prompts (`$ ` in emerald) and output/ASCII tables, plus precision 1-click copy with `Copied ✓` feedback.
  - **Structured Command Metadata**: Top metadata row displaying Command signature, Category, Purpose, and Safety Level badge on all command pages.
  - **Tasteful Callouts & Argument Tables**: 4 minimal callout variants (`Tip`, `Note`, `Warning`, `Security`) and high-contrast `ParamTable` with type badges, defaults, and descriptions.
  - **Quick Command Jumper Pills**: Compact pill navigation bar (`ask`, `check`, `doctor`, `query`, `schema`, `connect`, `setup`, `cheatsheet`) with live active state highlighting.
  - **Keyboard Navigation**: `⌘K` for search, `←` / `→` for sequential page navigation, and `Esc` to dismiss dialogs. Zero endless scrolling.

### 3.7. Craft AI Documentation Copilot
- **Component**: [`DocsAiCopilot.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/components/docs/DocsAiCopilot.jsx)
- **Backend API**: [`/api/docs-copilot/route.js`](file:///Users/nitindeep/Developer/TTS/frontend/app/api/docs-copilot/route.js)
- **Capabilities**: Grounded conversational assistant embedded on the website and docs pages. Answers CLI usage, MCP setup, risk tiers, and database connectivity questions using Llama 3.1 70B with strict deterministic safety boundaries.

### 3.8. Overhauled Dashboard Studios & Universal Theme Engine
- **Universal Light / Dark / System Theme System**:
  - Persistent segmented theme switcher in Header (`layout.jsx`), Settings Panel (`SettingsPanel.jsx`), and CLI Docs (`/docs/cli`).
  - Seamlessly updates `document.documentElement` (`.dark` class and `data-theme`), synchronizes with user preferences (`settingsContext`), and persists across sessions via `localStorage` (`querycraft-theme` and `querycraft-docs-theme`).
  - Dark mode features deep neutral obsidian surfaces (`#09090b` / `#111113`) with subtle borders (`#27272a`), while Light mode features crisp, airy slate canvases with emerald brand accents.
- **Interactive Database Telemetry Control (`DatabaseStatusControl`)**:
  - Replaces static badge with an interactive popover displaying live connection metrics: Target Engine (`POSTGRESQL`, `SUPABASE`, `NEON`), Host, Grounded Catalog Table Count, SSL Status, and 1-click quick actions (*Re-introspect Schema*, *Disconnect Database*).
- **Layout Shell & Navigation** ([`Dashboard/layout.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/app/%28website%29/Dashboard/layout.jsx)):
  - Hotkey switcher: `⌘1` SQL Doctor & Clarification Chat, `⌘2` Pre-Flight Cost Guard AI Firewall, `⌘3` SQL Compiler Sandbox, `⌘K` Command Palette.
  - Header actions: Direct link to CLI Docs (`/docs/cli`), Settings dialog trigger (`⌘,`), theme switcher, and modernized user avatar dropdown.
- **Sidebar & Schema Explorer** ([`Dashboard/slidebar.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/app/%28website%29/Dashboard/slidebar.jsx)):
  - Built with semantic Tailwind tokens (`bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`).
  - Real-time schema table search filter, table count badges, primary key (`PK`) & foreign key (`FK`) badges, monospace column data types, 1-click sample data profiler trigger (`Eye`), and DDL copy with instant feedback.
  - New Developer group linking directly to CLI Docs (`/docs/cli`) and Command Discovery (`⌘K`).
- **SQL Doctor & Clarification Chat Studio** ([`Chatbox.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/app/%28website%29/Dashboard/chat/Chatbox.jsx)):
  - Full Light/Dark support with high-contrast message bubbles, 1-tap clarification chips, and floating input dock.
  - SQL Doctor critic diagnosis card with root-cause explanations and 1-click query repair.
  - Slide-out Schema Explorer drawer with live filter and profiling triggers.
- **SQL Compiler Sandbox** ([`Dashboard/page.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/app/%28website%29/Dashboard/page.jsx)):
  - Multi-tab query editor (`Query 1`, `Query 2`) with add/close tabs.
  - 1-click **Export CSV** download and **Copy Data** (JSON/TSV).
  - 1-click **Format SQL** query standardizer.
  - Enhanced Data Table: 1-click cell copy with `Copied ✓` feedback, right-aligned numeric data in monospace font, and formatted `NULL` value badges.
  - 3-mode Results Pane: `Table` (resizable columns, execution ms), `Safety & Plan` (EXPLAIN cost analysis + `RiskBadge` + index advisor), `JSON`.
- **Pre-Flight Cost Guard Studio** ([`CostGuardDashboard.jsx`](file:///Users/nitindeep/Developer/TTS/frontend/components/guard/CostGuardDashboard.jsx)):
  - Split-screen HUD with baseline compute cost vs remediated cost comparison and percentage savings indicator.
  - 3-Tier risk badge classification (`LOW RISK`, `MEDIUM RISK`, `HIGH RISK`).
  - Automated `CREATE INDEX CONCURRENTLY` suggestion card with 1-click DDL copy.
- **Settings & Supporting Modals**:
  - `SettingsPanel.jsx`: Two-column architecture featuring an **Appearance & Theme** tab with segmented Light/System/Dark mode selection, UI density controls, and audio feedback toggles.
  - `WorkspaceSwitcher.jsx`: Popover switcher with search filter and environment status chips (`Production`, `Staging`, `Development`).
  - `CreateWorkspaceModal.jsx`, `QueryNotebookModal.jsx`, and `TableDataProfilerModal.jsx`: Modernized with semantic design tokens and high-contrast accessibility.

---

## 4. API Endpoints Reference

### 4.1. Serverless Next.js API Routes (`frontend/app/api/`)

| Method | Route | Input Payload | Output Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/clarification` | `{ prompt, connectionUri, history }` | `{ status, sql_query, message, risk_level, extracted_data }` | Serverless AI compilation using Llama 3.1 70B |
| `GET` | `/api/clarification/schema` | `?connection_uri=...` | `{ schema_sql, tables: [...] }` | Live database Information Schema catalog |
| `POST` | `/api/database/connect` | `{ connection_uri }` | `{ success, db_type, host, tables: [...] }` | Introspects live PostgreSQL tables, UUIDs, PKs/FKs |
| `POST` | `/api/database/execute` | `{ connectionUri, sqlQuery, limit }` | `{ columns: [...], rows: [...], execution_time_ms }` | Executes safe read-only SQL with 8000ms timeout |
| `POST` | `/api/database/explain` | `{ connectionUri, sqlQuery }` | `{ total_cost, plan_rows, has_seq_scan, suggestions, risk_level }` | Dry-runs PostgreSQL EXPLAIN cost analyzer |
| `POST` | `/api/database/diagnose` | `{ sqlQuery, errorMessage, schemaContext }` | `{ diagnosis, healedQuery, rootCause, sqlstate_code, error_category }` | SQL Doctor Critic diagnosing SQLSTATE runtime errors |
| `POST` | `/api/v1/guard` | `{ sql_query, connection_uri, cost_threshold }` | `{ is_safe, action_type, cost_comparison, suggested_index, optimized_query }` | Pre-Flight Cost Guard AI Firewall evaluation |
| `POST` | `/api/docs-copilot` | `{ message, history }` | `{ reply: "..." }` | Craft AI documentation copilot assistant |
| `GET/POST` | `/api/settings` | `{ settings: {...} }` | `{ settings: {...}, usage: {...} }` | Syncs user preferences, shortcuts, and quotas |
| `GET/POST/PUT/DELETE` | `/api/workspaces` | `{ user_id, email, workspaces }` | `{ status, workspaces: [...], count }` | Multi-workspace synchronization |
| `POST` | `/api/auth/cli-token` | `{ email, firebase_id_token }` | `{ status: "success", cli_token, expires_at }` | Exchanges browser OAuth login into a durable CLI token |
| `POST` | `/api/auth/cli-verify` | `{ cli_token }` | `{ status: "verified", email, workspaces: [...] }` | Verifies stored CLI session token |

---

## 5. Security, Isolation & Safety Rails

1. **Strict Read-Only Enforcement (`SET TRANSACTION READ ONLY`)**: Every execution connection explicitly runs inside a read-only transaction block. Mutating statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`) are blocked before dispatch.
2. **Hard Statement Execution Timeouts (8000ms)**: Every database session sets `SET statement_timeout = 8000;` to prevent runaway long-running queries from locking production tables.
3. **Safe Result LIMIT Clamps (`LIMIT 50`)**: Non-aggregating queries without explicit `LIMIT` clauses are automatically wrapped with a safe `LIMIT 50` ceiling.
4. **Password Special Character Auto-Encoding**: URIs automatically encode `#`, `@`, `/`, `?`, and `&` to prevent connection string parsing failures.
5. **RFC-Compliant Demo Sandboxes (`.internal`)**: Pre-configured sandboxes use non-routable `.internal` domains to eliminate false-positive secret scanning alerts while allowing immediate testing.
6. **Stateless In-Memory Connections**: Database credentials and connection URIs are resolved in memory per request and never shared across tenant boundaries.
7. **Secure Local Token Storage**: CLI tokens are saved with strict owner-only file permissions (`chmod 600 ~/.querycraft/auth.json`, directory `chmod 700`).

---

## 6. Automated Testing & Verification Status

* **Automated Frontend Tests**: `12 passed, 12 total` suites (76 passing tests in `frontend/__tests__`).
  - Suites: `ConnectDatabaseModal`, `DashboardCanvas`, `DataVisualizer`, `ExtensionPromptModal`, `OnboardingModal`, `SpotlightTour`, `CostGuardDashboard`, `serverLlm`, `authContext`, `databaseContext`, `api`, `soundUtils`.
* **Automated Backend Tests**: `117 passed, 3 skipped` across 11 suites (in `backend/tests/`).
  - Unit & Integration suites covering clarification API (`test_api_clarification.py`), CLI OAuth authentication (`test_cli_auth.py`), cost guard LangGraph (`test_cost_guard.py`), database service (`test_db_service.py`), workflow graph nodes (`test_graph_nodes.py`), critic healing (`test_healing_service.py`), MCP server tools (`test_mcp_server.py`), SQL safety (`test_sql_safety.py`), and workspaces (`test_workspace_service.py`).
  - *Note*: 3 dashboard router tests (`test_dashboard_service.py`) are skipped intentionally because BI Canvas is postponed for MVP.
* **Production Build**: Clean Turbopack compilation with zero runtime errors.

---

## 7. Developer Runbook

### 7.1. Starting the Frontend (Next.js 16.3)
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run dev
```
*Web dashboard and landing page available at `http://localhost:3000`.*

### 7.2. Starting the Python FastAPI Backend (Optional / Microservice Mode)
```bash
cd /Users/nitindeep/Developer/TTS/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*Interactive Swagger API documentation available at `http://127.0.0.1:8000/docs`.*

### 7.3. Launching the Model Context Protocol (MCP) Server
```bash
cd /Users/nitindeep/Developer/TTS/backend
python -m app.mcp_server
```

### 7.4. Using the QueryCraft CLI
```bash
# 1-Click Browser OAuth Login
querycraft auth login

# Check Active Session & Workspace
querycraft auth whoami

# Query Database in Natural Language
querycraft ask "show total orders by month"

# Pre-Flight Cost Guard Analysis
querycraft check "SELECT * FROM orders WHERE total_amount > 100;"

# SQL Doctor Error Repair
querycraft doctor "column users.full_name does not exist"

# Direct Read-Only SQL Execution
querycraft query "SELECT * FROM users LIMIT 10;"

# Inspect Database Tables and Columns
querycraft schema

# 1-Click Connect to Claude Desktop, Cursor, Antigravity, Windsurf
querycraft setup
```

### 7.5. Running Test Suites
```bash
# Frontend Jest Suites (76 tests across 12 suites)
cd /Users/nitindeep/Developer/TTS/frontend
npm test -- --watchAll=false

# Backend Pytest Suites (117 passed, 3 skipped)
cd /Users/nitindeep/Developer/TTS/backend
uv run pytest -q
```
