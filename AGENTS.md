# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Project Context & Architecture Reference for AI Agents (`AGENTS.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.5.0` (Production Hardened · Autonomous Dashboard Architect · Canvas Mode · Global Command Palette · Multi-Workspace · Recents History · Quotas & Billing)  
> **Primary Interfaces**: Next.js 16 Web Dashboard & Manifest V3 Chrome Extension (Spotlight Copilot)  
> **Dual AI Backend Support**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver.
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Supervisor Orchestration + `psycopg2` / `pymongo`.  
> **Supported Engines**: PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB), MySQL, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Problem Space

Traditional Text-to-SQL / Text-to-NoSQL tools frequently fail in real-world production environments because of fundamental flaws:
1. **Ambiguity & Blind Guessing**: Standard models guess timeframes, metrics, and filters without asking, leading to inaccurate queries.
2. **Schema & Typo Hallucinations**: LLMs invent non-existent table names, misspell similar entities (e.g. `ocunter parties` vs `counterparties`), or misuse database-specific types (`UUID`, `TIMESTAMPTZ`, `JSONB`, BSON object types).
3. **Runtime Failures & Broken Pipelines**: Generated queries fail due to missing `GROUP BY` clauses, column type mismatches, or invalid MongoDB aggregation pipeline stages (`$lookup`, `$unwind`, `$group`).
4. **Dangerous Runaway Scans & Missing Indexes**: Queries trigger expensive full sequential table scans or memory spikes on production databases without warning.
5. **Missing Organizational Context**: Models lack domain-specific business definitions (e.g., how an organization defines *"Active Churn"* or calculates *"Net MRR"*).

### QueryCraft 7-Pillar Architecture
QueryCraft resolves these with an integrated end-to-end pipeline:
* **Fuzzy Schema & Typo Mapping**: Automatically maps misspelled entity requests (e.g. `custmers` $\rightarrow$ `customers`, `ocunter parties` $\rightarrow$ `counterparties`) strictly against live introspected tables before query compilation.
* **Conversational Clarification Loop**: Evaluates context and pauses to ask targeted clarifying questions with **1-tap interactive response chips** and multi-selection before compilation if parameters are ambiguous, while executing direct data inspection requests immediately.
* **Zero-Hallucination Live Schema Grounding**: Automatically introspects live PostgreSQL Information Schemas and MongoDB Atlas cluster databases & collections to ground prompts strictly in valid schemas.
* **Autonomous Dashboard Architect (Canvas Mode)**: Supervisor planner decomposes high-level requests into 4 parallel query streams, assembling comprehensive multi-widget analytical dashboards with live DAG telemetry.
* **Self-Healing Critic Loop ("SQL & MQL Doctor")**: Intercepts database runtime execution errors, parses SQLSTATE codes, uses an LLM Critic to diagnose root causes, and automatically repairs queries with up to 3 self-healing retries.
* **Performance Guard & Index Advisor**: Dry-runs PostgreSQL `EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE)` to estimate cost, detect sequential scans, and generate `CREATE INDEX CONCURRENTLY` statements.
* **Cross-Engine Semantic Layer & Policy Ingestion**: Custom KPI glossary with keyword/RAG retrieval, conversational metric learning ("Teach AI"), and automated policy document metric extraction.

```
                                  ┌───────────────────────────────┐
                                  │      User Natural Language    │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                ┌───────────────────────────────────┐
                                │   Node 1: Intent & Clarifier      │
                                │   - Typo & Fuzzy Schema Matcher   │
                                │   - Ambiguity & Retrieval Routing │
                                └─────────┬───────────────┬─────────┘
                                          │               │
                  [Ambiguous / Missing]   │               │   [Clear / Direct Query]
                                          ▼               ▼
                      ┌───────────────────────┐  ┌───────────────────────────────────┐
                      │ Needs Clarification   │  │   Node 2: Context Retriever       │
                      │ - Target Database?    │  │   - Live Schema & Types (DDL/BSON)│
                      │ - Date Boundary?      │  │   - Semantic Metrics RAG Matcher  │
                      │ - Metric Calculation? │  │   - Verified Few-Shot Pairs (RAG) │
                      │ - 1-Tap Reply Chips   │  └─────────────────┬─────────────────┘
                      └───────────────────────┘                    │
                                                                   ▼
                                                 ┌───────────────────────────────────┐
                                                 │   Node 3: Query / Canvas Compiler │
                                                 │   - Grounded Llama 3.1 70B Prompt │
                                                 │   - Safe Read-Only & LIMIT 50     │
                                                 └─────────────────┬─────────────────┘
                                                                   │
                                           ┌───────────────────────┴───────────────────────┐
                                           │                                               │
                                           ▼                                               ▼
                         ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
                         │   Dry-Run EXPLAIN / Cost Guard    │           │   Node 4: Execute & Guard         │
                         │   - Cost Estimation (<60 / <300)  │           │   - Read-Only Database Execution  │
                         │   - Seq Scan → Index Suggestions  │           │   - 8000ms Statement Timeout      │
                         └───────────────────────────────────┘           └─────────────────┬─────────────────┘
                                                                                           │
                                                                   ┌───────────────────────┴───────────────────────┐
                                                                   │                                               │
                                                            [Execution OK]                                 [Runtime Error]
                                                                   │                                               │
                                                                   ▼                                               ▼
                                                 ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
                                                 │   Node 6: Visualizer / Canvas     │           │   Node 5: Critic Healer (Doctor)  │
                                                 │   - Bar / Line / Pie / Area/ Table│◀──────────│   - SQLSTATE Error Diagnosis      │
                                                 │   - CSV One-Click Export          │  [Healed] │   - Schema-Aware Auto Heal & Retry│
                                                 └───────────────────────────────────┘           └───────────────────────────────────┘
```

---

## 2. Monorepo Structure & Current File Map

```
TTS/
├── backend/                        # FastAPI Python 3.10+ Backend Service
│   ├── app/
│   │   ├── configs/                # Configuration helpers
│   │   ├── data/                   # Local JSON storage engines (persisted)
│   │   │   ├── notebook_queries.json   # Saved snippets & team queries
│   │   │   ├── semantic_rules.json     # Custom KPI metrics & business glossary
│   │   │   ├── settings.json           # User settings, preferences, shortcuts, usage
│   │   │   └── verified_queries.json   # Gold standard few-shot training queries
│   │   ├── Libs/                   # Helper libraries
│   │   ├── middleware/             # Custom HTTP middlewares
│   │   ├── Models/
│   │   │   └── schema.py           # Pydantic data models & request/response schemas
│   │   ├── routers/
│   │   │   ├── clarification.py    # /api/clarification - Multi-turn clarify & LangGraph compile
│   │   │   ├── dashboard.py        # /api/dashboard - Multi-agent supervisor dashboard generation
│   │   │   ├── database.py         # /api/database - Connect, introspect, execute, explain, diagnose, sample
│   │   │   ├── guard.py            # /api/v1/guard - Pre-Flight Cost Guard LangGraph API
│   │   │   ├── memory.py           # /api/memory - Verified few-shot memory & notebook snippets
│   │   │   ├── semantic.py         # /api/semantic - Semantic rules, teach AI, policy upload
│   │   │   └── settings.py         # /api/settings - Sync settings, shortcuts, usage counters
│   │   ├── services/
│   │   │   ├── cost_guard_graph.py # LangGraph Pre-Flight Cost Guard & AI Firewall workflow
│   │   │   ├── dashboard_service.py# Supervisor multi-agent planner & worker synthesis
│   │   │   ├── db_service.py       # PostgreSQL & MongoDB connection, introspection, execution, sampling
│   │   │   ├── explain_service.py  # PostgreSQL EXPLAIN cost analyzer & index advisor
│   │   │   ├── healing_service.py  # Critic agent self-healing loop & SQL Doctor error diagnoser
│   │   │   ├── llm_services.py     # Llama 3.1 prompt builder, clarification logic, safety validator
│   │   │   ├── memory_service.py   # Few-shot memory RAG, schema pruning RAG, notebook persistence
│   │   │   ├── semantic_service.py # Semantic metric CRUD, RAG matcher, policy doc extraction
│   │   │   └── sql_graph.py        # LangGraph multi-agent StateGraph workflow & self-healing loop
│   │   └── main.py                 # FastAPI application initialization & CORS config
│   ├── tests/                      # Pytest Automated Test Suite (89 tests passed)
│   │   ├── test_clarification.py
│   │   ├── test_cost_guard.py
│   │   ├── test_dashboard_service.py
│   │   ├── test_database.py
│   │   ├── test_explain.py
│   │   ├── test_healing.py
│   │   ├── test_memory.py
│   │   ├── test_semantic.py
│   │   └── test_settings.py
│   ├── pyproject.toml              # Dependencies & build definition
│   ├── requirements.txt            # Production pip dependencies for deployment
│   ├── uv.lock                     # UV package lock
│   └── .env                        # NVIDIA NIM API Key, model name, base URL
│
├── frontend/                       # Next.js 16.3 + React 19 + TailwindCSS v4 Dashboard
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── Login/              # Auth login view with responsive Card backdrop
│   │   │   └── Register/           # Auth register view with responsive Card backdrop
│   │   ├── (website)/
│   │   │   ├── Dashboard/
│   │   │   │   ├── canvas/
│   │   │   │   │   └── page.jsx    # Autonomous Dashboard Architect & Canvas Studio
│   │   │   │   ├── chat/
│   │   │   │   │   ├── Chatbox.jsx # Responsive interactive clarification chat studio
│   │   │   │   │   └── page.jsx    # Chat view route
│   │   │   │   ├── guard/
│   │   │   │   │   └── page.jsx    # Pre-Flight Cost Guard (AI Firewall) Studio
│   │   │   │   ├── layout.jsx      # 3-Zone shell, ⌘1/⌘2/⌘3/⌘4 hotkeys, header status pill
│   │   │   │   ├── page.jsx        # Direct SQL/NoSQL compiler & execution sandbox
│   │   │   │   └── slidebar.jsx    # Workspace switcher, Recents drawer, 2-tab schema explorer
│   │   │   ├── Home/               # Modern landing page components
│   │   │   │   ├── Hero.jsx        # Interactive landing hero with live demo simulation
│   │   │   │   ├── Features.jsx    # Feature showcase
│   │   │   │   ├── ProblemSection.jsx  # Problem vs solution comparison
│   │   │   │   ├── DailyUseCases.jsx   # Interactive persona & dialect use case tabs
│   │   │   │   ├── MCPSection.jsx  # Live schema grounding & MCP architecture overview
│   │   │   │   ├── V3Roadmap.jsx   # Agentic V3 proactive workflows roadmap
│   │   │   │   ├── Testimonial.jsx # Social proof & developer testimonials
│   │   │   │   ├── CTA.jsx         # Call to action & workflow steps
│   │   │   │   └── Homepage.jsx    # Assembled landing page
│   │   │   ├── globals.css         # TailwindCSS styles, custom scrollbars, tokens
│   │   │   ├── layout.js           # Root HTML layout with font imports (Plus Jakarta Sans & JetBrains Mono)
│   │   │   └── page.js             # Root route rendering Homepage
│   │   ├── api/                    # Serverless Next.js API Routes (Vercel & Node.js)
│   │   │   ├── clarification/
│   │   │   │   ├── route.js        # POST /api/clarification (Llama 3.1 70B AI compilation)
│   │   │   │   └── schema/route.js # GET /api/clarification/schema (Grounding schema)
│   │   │   ├── dashboard/
│   │   │   │   ├── generate/route.js # POST /api/dashboard/generate
│   │   │   │   └── templates/route.js# GET /api/dashboard/templates
│   │   │   ├── database/
│   │   │   │   ├── connect/route.js    # POST /api/database/connect (pg live introspection)
│   │   │   │   ├── diagnose/route.js   # POST /api/database/diagnose (SQL Doctor healing)
│   │   │   │   ├── execute/route.js    # POST /api/database/execute (pg live query execution)
│   │   │   │   └── explain/route.js    # POST /api/database/explain (pg EXPLAIN cost planner)
│   │   │   ├── semantic/
│   │   │   │   └── metrics/route.js    # GET/POST /api/semantic/metrics
│   │   │   ├── settings/
│   │   │   │   └── route.js        # GET/POST /api/settings
│   │   │   └── v1/
│   │   │       └── guard/route.js  # POST /api/v1/guard (Cost Guard Firewall API)
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── DashboardCanvas.jsx       # Multi-widget responsive 3-column canvas grid
│   │   │   │   └── PipelineExecutionFlow.jsx # Multi-agent DAG visualizer
│   │   │   ├── database/
│   │   │   │   ├── ConnectDatabaseModal.jsx    # Dual mode URI/Builder, Password encoder, Sandboxes
│   │   │   │   └── TableDataProfilerModal.jsx  # 5-row sample preview & distinct distribution
│   │   │   ├── extension/
│   │   │   │   └── ExtensionPromptModal.jsx    # Interactive Spotlight demo & 3-step setup
│   │   │   ├── guard/
│   │   │   │   └── CostGuardDashboard.jsx     # Split-screen Pre-Flight Cost Guard Studio
│   │   │   ├── onboarding/
│   │   │   │   ├── OnboardingModal.jsx         # 3-step role personalization & sandbox modal
│   │   │   │   └── SpotlightTooltip.jsx        # Floating 3-step interactive UI spotlight tour
│   │   │   ├── semantic/
│   │   │   │   └── MetricGlossaryModal.jsx     # Semantic layer glossary, "Teach AI", policy upload
│   │   │   ├── settings/
│   │   │   │   └── SettingsPanel.jsx           # 8-Tab Settings (AI Engine, Safety, Studio, Quotas, Plans, Workspaces)
│   │   │   ├── shell/
│   │   │   │   └── CommandPalette.jsx          # Raycast/Linear-style global ⌘K command modal
│   │   │   ├── ui/                             # Base-UI reusable components (command, dropdown, button, badge)
│   │   │   ├── visualization/
│   │   │   │   └── DataVisualizer.jsx          # SVG Bar/Line/Pie/Area/Table chart visualizer
│   │   │   └── workspace/
│   │   │       ├── CreateWorkspaceModal.jsx    # Multi-workspace creation modal with environment tags
│   │   │       ├── QueryNotebookModal.jsx      # Tagged SQL snippet notebook
│   │   │       └── WorkspaceSwitcher.jsx       # Adaptive workspace dropdown switcher
│   │   ├── hooks/
│   │   │   └── use-mobile.js                   # Mobile viewport detection hook
│   │   ├── lib/
│   │   │   ├── api.js                          # Centralized frontend API client
│   │   │   ├── authContext.jsx                 # Firebase Auth Context (Email, Google, GitHub)
│   │   │   ├── databaseContext.jsx             # Multi-workspace, connection, live query state
│   │   │   ├── dbDriver.js                     # Native 'pg' client for live introspection & execution
│   │   │   ├── extensionContext.jsx            # Extension detection & spotlight manager
│   │   │   ├── firebase.js                     # Firebase Web SDK initialization & providers
│   │   │   ├── serverBackendHelper.js          # Safe microservice proxying & timeout guard
│   │   │   ├── serverLlm.js                    # Serverless Llama 3.1 70B AI engine & typo corrector
│   │   │   ├── settingsContext.jsx             # Synced settings, usage metrics & preferences context
│   │   │   ├── soundUtils.js                   # Audio feedback utilities
│   │   │   ├── tourContext.jsx                 # Spotlight walkthrough tour context & state
│   │   │   └── utils.js                        # Tailwind merge & clsx utility
│   │   ├── __tests__/                          # Jest Automated Test Suites (11 suites / 73 tests)
│   │   │   ├── components/                     # ConnectDatabaseModal, DashboardCanvas, ExtensionPrompt, Onboarding, Visualizer tests
│   │   │   └── lib/                            # serverLlm, databaseContext, authContext, api, soundUtils tests
│   │   ├── .env.local                          # NVIDIA NIM API Key, model, Firebase credentials
│   │   ├── .env.example                        # Example env configuration
│   │   └── package.json                        # Next.js 16.3, React 19, pg, Firebase, Lucide, TailwindCSS v4
│
├── extension/                      # Manifest V3 Chrome Extension (SQL/NoSQL Studio & Copilot)
│   ├── background.js               # Service Worker: Global shortcuts & context menu actions
│   ├── content.js                  # In-Situ Shadow DOM Spotlight Copilot (`Cmd+Shift+K`)
│   ├── content.css                 # Isolated spotlight overlay & modal styling
│   ├── manifest.json               # Manifest V3 configuration, permissions, command hotkeys
│   ├── popup.html                  # Main extension popup studio UI (5-tab navigation)
│   ├── popup.js                    # Extension client logic, tabs, schema explorer, execution, sync
│   ├── popup.css                   # Refined dark aesthetic styles
│   └── icons/                      # 16, 32, 48, 128px extension icons
│
├── docs/
│   └── UI_UX_AUDIT_REPORT.md       # Comprehensive UI/UX Audit & Transformation Roadmap
├── vercel.json                     # Vercel monorepo deployment routing
├── package.json                    # Root monorepo workspace definition
├── README.md                       # High-level overview & setup instructions
├── agent.md                        # Quick agent cheatsheet & architectural summary
└── AGENTS.md                       # Complete developer & agent architecture context (this file)
```

---

## 3. Core Engine Subsystems & Implementation Details

### 3.1. Dual AI Execution Architecture
QueryCraft provides dual deployment paths:
1. **Serverless Next.js Node.js Execution (`frontend/lib/serverLlm.js` & `frontend/lib/dbDriver.js`)**:
   - Runs directly inside Next.js Edge/Serverless Route Handlers on Vercel without requiring Python dependencies.
   - Grounded Llama 3.1 70B Instruct via NVIDIA NIM with live schema context injection.
   - Built-in fuzzy table & typo matching mapping misspelled user inputs to existing catalog tables.
   - Native `pg` (`node-postgres`) client for PostgreSQL introspection and read-only execution.
2. **Microservice LangGraph Workflow (`backend/app/services/sql_graph.py`)**:
   - 6-node StateGraph state machine in Python with critic self-healing retries and memory RAG.

### 3.2. Autonomous Dashboard Architect & Canvas Mode
* **Location**: `frontend/app/(website)/Dashboard/canvas/page.jsx` & `frontend/components/canvas/DashboardCanvas.jsx`
* **Features**:
  - **Supervisor Multi-Agent Decomposition**: One natural language prompt generates 4 parallel queries (*Primary Trend*, *Cohort Distribution*, *Leaderboard*, *Status Breakdown*) and synthesizes a unified analytical canvas.
  - **Multi-Agent Pipeline DAG Flow**: `PipelineExecutionFlow.jsx` animates the 4 nodes (*Supervisor Planner*, *4 Parallel Workers*, *Critic Doctor Guard*, *Canvas Assembler*) with dedicated execution indicators.
  - **KPI Hero Tiles with Sparklines**: Inline trend sparklines provide immediate executive context.
  - **Interactive Widget Controls**: Dynamic chart switching (`[ Bar | Line | Pie | Table ]`), SQL inspection dialog, CSV download, and zoom modal.

### 3.3. Global Command Palette (`⌘K` / `Ctrl+K`)
* **Location**: `frontend/components/shell/CommandPalette.jsx`
* **Features**:
  - Instant keyboard access from any dashboard page.
  - Grouped categories: *Views & Studios* (`G C`, `G V`, `G X`), *Recent Queries* (1-tap re-run), *Database & Schema* (`⌘D`), *Workspaces*, and *Tools & Settings* (`⌘,`, `⌘G`).

### 3.4. Database Connector & Sandbox Architecture
* **Location**: `frontend/components/database/ConnectDatabaseModal.jsx`
* **Features**:
  - **Dual Input Modes**: Fast single URI paste mode alongside structured Parameter Builder mode with live two-way sync.
  - **Password Auto-Encoder**: Detects unescaped special characters (`#`, `@`, `/`, `?`) and encodes them automatically.
  - **Safe Internal Demo Sandboxes**: Pre-configured mock schemas for E-Commerce, SaaS Billing, and MongoDB IoT events using RFC-compliant `.internal` domains (prevents false-positive secret scanning alerts).
  - **Pre-Flight Security Guards**: Explicitly documents `SET TRANSACTION READ ONLY`, 8000ms statement timeouts, and stateless in-memory sessions.

### 3.5. Sidebar & Workspace Project Manager
* **Location**: `frontend/app/(website)/Dashboard/slidebar.jsx`
* **Key Components**:
  - **Workspace & Project Switcher**: Fast 1-click workspace switching with environment badges (`Production`, `Staging`, `Development`, `Analytics`) and `+ Create New Workspace` action.
  - **Recents Query History Drawer**: Collapsible list tracking recent natural language prompts and compiled SQL/MQL statements with 1-click re-run and clipboard copy.
  - **Schema Explorer**: Searchable data dictionary with column types, primary key badges, and explicit `[ Live Introspected ]` vs `[ Sandbox Mock ]` banner indicators.

### 3.6. Settings Studio & Quota Engine
* **Location**: `frontend/components/settings/SettingsPanel.jsx`
* **8 Core Sections**:
  1. **AI Engine & Doctor**: Model selection, Temperature slider (`0.0` to `0.5`), SQL Doctor Critic auto-healing, Schema Pruning.
  2. **Database Safety**: `SET TRANSACTION READ ONLY` enforcement, Statement execution timeouts, Safe Result LIMIT clamps, EXPLAIN cost warnings.
  3. **Studio & Formatting**: SQL keyword casing (`UPPERCASE` vs `lowercase`), CSV export delimiters, Haptic audio effects.
  4. **Usage & Quotas**: Real-time monthly query quota progress (`X / 500 Queries`), auto-heals count, verified snippets, live schema tables, dialect distribution.
  5. **Plans & Billing**: Developer Free Tier vs Team Pro ($19/mo) comparison & upgrade path.
  6. **Keybindings & Copilot**: Hotkey bindings (`Cmd+Shift+K`, `Cmd+Enter`, `Cmd+,`, `Cmd+K`).
  7. **Projects & Workspaces**: Workspace CRUD management with environment tags.
  8. **Profile & Cloud Sync**: Profile info and factory defaults reset.

### 3.7. Pre-Flight Cost Guard & AI Firewall
* **Location**: `backend/app/services/cost_guard_graph.py`, `backend/app/routers/guard.py`, `frontend/components/guard/CostGuardDashboard.jsx`, `/Dashboard/guard`
* **Features**:
  - **Stateful LangGraph Workflow**: 3-node cyclic state machine (`execute_explain` $\rightarrow$ `evaluate_cost` $\rightarrow$ `auto_heal_query`).
  - **Deterministic AST Parser**: Traverses the PostgreSQL EXPLAIN AST, detects sequential scans on high-row tables, and generates targeted `CREATE INDEX CONCURRENTLY` statements.
  - **Honeypot Schema & Trap Detection**:
    - **Cartesian Product Trap (`users` $\times$ `audit_logs`)**: Flags cross join across 500,000 rows ($385,000.00$ cost), rewrites to `JOIN audit_logs a ON u.id = a.user_id`, applies `LIMIT 50`, achieving 99.9% cost reduction.
    - **Unindexed Sequential Scan (`audit_logs`)**: Flags full table scan on 500,000 unindexed rows ($14,250.00$ cost) and generates infrastructural recommendation `CREATE INDEX CONCURRENTLY idx_audit_logs_action ON audit_logs(action)`.
    - **DDL vs DML Clean Separation (`action_type: 'rewritten' | 'blocked_needs_index'`)**: Never replaces the user's `SELECT` query with DDL statements. Unsafe queries requiring infrastructure fixes are cleanly blocked, preserving the original DML query while outputting index creation DDL in a dedicated Data Engineering report.
  - **Dual Execution Mode**: Operates against live local/cloud PostgreSQL clusters, with deterministic AST fallback in standalone serverless environments.
  - **Developer HUD & Diff Preview**: Split-screen workbench featuring real-time cost reduction comparison, scan method status, remediated SQL monospace diff, and collapsible raw AST plan.

### 3.8. Model Context Protocol (MCP) Server — Universal Agent & IDE Connectivity
* **Location**: `backend/app/mcp_server.py`, `backend/mcp_server.py`, `.cursor/mcp.json`, `docs/MCP_SERVER_GUIDE.md`
* **Features**:
  - **Native stdio Transport (JSON-RPC 2.0)**: Standard input/output transport natively recognized across **Cursor**, **Claude Desktop**, **Gemini**, and custom **LangGraph / LangChain** agent swarms.
  - **Registered Tool (`evaluate_and_heal_sql`)**:
    - Input: `sql_query` (`str`), `cost_threshold` (`float`, default `150.0`), `connection_uri` (`str`, optional).
    - Auto-Healed Queries: Returns `is_error=False` with the restructured ANSI `JOIN` query, compute cost delta, and explanation.
    - Blocked Queries (Missing Indexes): Returns `is_error=True` with a critical AI Firewall execution block, preserves the user's `SELECT` query, and outputs the exact `CREATE INDEX` recommendation for Data Engineering.
    - Read-Only Security Guard: Rejects mutating statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`).
  - **Universal Configurations**:
    - Cursor: Auto-discovered via `.cursor/mcp.json`.
    - Claude Desktop: Configured in `claude_desktop_config.json`.
    - Gemini / Custom Agentic AI: Python client examples in `docs/MCP_SERVER_GUIDE.md` and `backend/test_mcp_client.py`.

---

## 4. Current Verification & Quality Assurance

* **Automated Frontend Tests**: `12 passed, 12 total` (76 tests in `frontend/__tests__`).
* **Automated Backend Tests**: `96 passed, 96 total` (in `backend/tests`, including 5 MCP server test cases).
* **Production Build**: `next build` compiles all 21 static and dynamic routes cleanly with Turbopack.
* **Firebase Authentication**: Active email/password, Google OAuth, GitHub OAuth, and session tokens.
* **Chrome Extension Hotkey**: `Cmd + Shift + K` global Spotlight Copilot.

---

## 5. Development Runbook

### 5.1. Starting the Frontend (Vercel Serverless Mode)
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run dev
```
*Web dashboard is available at `http://localhost:3000`.*

### 5.2. Starting the Python FastAPI Backend (Optional / Microservice Mode)
```bash
cd /Users/nitindeep/Developer/TTS/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*API documentation is available at `http://127.0.0.1:8000/docs`.*

### 5.3. Running Test Suites
```bash
# Frontend Jest Suites (11 suites / 73 tests)
cd /Users/nitindeep/Developer/TTS/frontend
npm test

# Backend Pytest Suites (83 tests)
cd /Users/nitindeep/Developer/TTS/backend
uv run pytest
```

### 5.4. Building for Production
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run build
```
