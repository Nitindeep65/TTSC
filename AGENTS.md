# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Comprehensive Project Context, Architecture & Feature Reference for AI Agents (`AGENTS.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.6.0` (Production Hardened · Autonomous Dashboard Architect · Canvas Studio · Pre-Flight Cost Guard · Universal MCP Server · QueryCraft CLI · Global Command Palette · Multi-Workspace · Interactive Docs Copilot · ChatGPT Custom Action)  
> **Primary Interfaces**: 
>   1. **Next.js 16 Web Dashboard & Studio**: Direct Compiler, Clarification Chat, Canvas Architect, Pre-Flight Cost Guard, Interactive CLI Docs.
>   2. **Model Context Protocol (MCP) Server**: Native `stdio` JSON-RPC 2.0 server for Cursor, Claude Desktop, Google Antigravity / Gemini, Windsurf, and custom agent swarms.
>   3. **QueryCraft CLI (`querycraft`)**: Terminal-native natural language query runner, raw SQL executor, schema inspector, 1-click AI configurator, and browser OAuth login.
>   4. **Manifest V3 Chrome Extension**: Spotlight Copilot (`Cmd+Shift+K`) with In-Situ Shadow DOM overlay.
>   5. **ChatGPT Custom Action / GPT**: OpenAPI 3.1.0 specification endpoint (`/api/gpt-action/openapi.json`) and legacy plugin manifest.
> **Dual AI Backend Architecture**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver (zero Python server required for Vercel deployment).
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Supervisor Orchestration + `psycopg2` / `pymongo`.  
> **Supported Database Engines**: PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB, Heroku PG), MySQL/MariaDB, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Problem Space

Traditional Text-to-SQL and Text-to-NoSQL tools frequently break down in production environments because of five critical failure modes:
1. **Ambiguity & Blind Guessing**: Standard single-turn models guess dates, dimensions, metrics, and filters without asking, producing plausible-looking but inaccurate queries.
2. **Schema & Typo Hallucinations**: LLMs invent non-existent table and column names, misspell similar entity names (e.g., `custmers` vs `customers`, `ocunter parties` vs `counterparties`), or misuse database-specific types (`UUID`, `TIMESTAMPTZ`, `JSONB`, BSON object types).
3. **Runtime Failures & Broken Aggregation Pipelines**: Generated queries fail at runtime due to missing `GROUP BY` clauses, column type mismatches, or invalid MongoDB aggregation pipeline stages (`$lookup`, `$unwind`, `$group`).
4. **Dangerous Runaway Scans & Missing Indexes**: Queries trigger expensive full sequential table scans or cross-join memory spikes on multi-million row production databases without pre-execution cost analysis.
5. **Missing Organizational Context**: Generic models lack domain-specific business definitions (e.g., how an organization defines *"Active Churn"*, calculates *"Net MRR"*, or accounts for refunds).

### The QueryCraft 8-Pillar Solution Architecture
QueryCraft eliminates these failure modes with an integrated end-to-end pipeline:
1. **Fuzzy Schema & Typo Mapping**: Automatically maps misspelled entity requests strictly against live introspected tables and columns before query compilation.
2. **Conversational Clarification Loop**: Evaluates prompt ambiguity and pauses to ask targeted clarifying questions with **1-tap interactive response chips** and multi-selection before compilation, while executing direct queries immediately.
3. **Zero-Hallucination Live Schema Grounding**: Automatically introspects live PostgreSQL Information Schemas and MongoDB Atlas cluster databases/collections to ground prompts strictly in valid schemas.
4. **Autonomous Dashboard Architect (Canvas Mode)**: Multi-agent supervisor planner decomposes high-level requests into 4 parallel query streams (*Primary Trend*, *Cohort Distribution*, *Leaderboard*, *Status Breakdown*), assembling a multi-widget analytical canvas with live DAG telemetry.
5. **Pre-Flight Cost Guard & AI Firewall**: Dry-runs PostgreSQL `EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE)` to estimate compute cost, detect full sequential scans on high-row tables, auto-heal cross joins, and generate targeted `CREATE INDEX CONCURRENTLY` DDL suggestions without mutating user DML queries.
6. **Self-Healing Critic Loop ("SQL & MQL Doctor")**: Intercepts database runtime execution errors, parses SQLSTATE codes (`42703`, `42P01`, `22P02`, `42803`), uses an LLM Critic to diagnose root causes, and automatically repairs queries with up to 3 self-healing retries.
7. **Cross-Engine Semantic Layer & Policy Ingestion**: Custom KPI glossary with keyword/RAG retrieval, conversational metric learning ("Teach AI"), and automated policy document metric extraction.
8. **Universal Agent & IDE Connectivity (MCP + CLI + ChatGPT)**: Full Model Context Protocol (MCP) server over `stdio` with user session binding, standalone CLI with browser OAuth flow, and ChatGPT Custom Action integration.

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

## 2. Monorepo Structure & Exhaustive File Map

```
TTS/
├── backend/                        # FastAPI Python 3.10+ Backend Service & Tools
│   ├── app/
│   │   ├── configs/                # Configuration constants and environment loaders
│   │   ├── data/                   # Local JSON persistence storage (multi-tenant)
│   │   │   ├── cli_sessions.json       # Active CLI session tokens & expiry dates
│   │   │   ├── notebook_queries.json   # Saved snippets & team SQL notebook entries
│   │   │   ├── oauth_codes.json        # Temporary PKCE authorization codes
│   │   │   ├── semantic_rules.json     # Custom KPI metrics & business glossary
│   │   │   ├── settings.json           # User settings, preferences, shortcuts, usage counters
│   │   │   ├── verified_queries.json   # Gold standard few-shot training queries
│   │   │   └── workspaces.json         # User-scoped database workspaces & connection strings
│   │   ├── Libs/                   # Helper utilities
│   │   ├── middleware/             # Custom HTTP middlewares (CORS, timing, logging)
│   │   ├── Models/
│   │   │   └── schema.py           # Pydantic data models & request/response schemas
│   │   ├── routers/
│   │   │   ├── clarification.py    # /api/clarification - Multi-turn clarify & LangGraph compile
│   │   │   ├── dashboard.py        # /api/dashboard - Multi-agent supervisor dashboard generation
│   │   │   ├── database.py         # /api/database - Connect, introspect, execute, explain, diagnose, sample
│   │   │   ├── guard.py            # /api/v1/guard - Pre-Flight Cost Guard LangGraph API
│   │   │   ├── memory.py           # /api/memory - Verified few-shot memory & notebook snippets
│   │   │   ├── semantic.py         # /api/semantic - Semantic rules, teach AI, policy upload
│   │   │   ├── settings.py         # /api/settings - Sync settings, shortcuts, usage counters
│   │   │   └── workspaces.py       # /api/workspaces & /api/auth - Workspaces CRUD & CLI OAuth token exchange
│   │   ├── services/
│   │   │   ├── cost_guard_graph.py # LangGraph Pre-Flight Cost Guard & AI Firewall workflow
│   │   │   ├── dashboard_service.py# Supervisor multi-agent planner & worker synthesis
│   │   │   ├── db_service.py       # PostgreSQL & MongoDB connection, introspection, execution, sampling
│   │   │   ├── explain_service.py  # PostgreSQL EXPLAIN cost analyzer & index advisor
│   │   │   ├── healing_service.py  # Critic agent self-healing loop & SQL Doctor error diagnoser
│   │   │   ├── llm_services.py     # Llama 3.1 prompt builder, clarification logic, safety validator
│   │   │   ├── memory_service.py   # Few-shot memory RAG, schema pruning RAG, notebook persistence
│   │   │   ├── semantic_service.py # Semantic metric CRUD, RAG matcher, policy doc extraction
│   │   │   ├── sql_graph.py        # LangGraph multi-agent StateGraph workflow & self-healing loop
│   │   │   └── workspace_service.py# User-scoped workspace storage & credential authentication
│   │   ├── main.py                 # FastAPI initialization, CORS, ChatGPT plugin manifest
│   │   └── mcp_server.py           # Model Context Protocol (MCP) Server (stdio transport, JSON-RPC 2.0)
│   ├── tests/                      # Pytest Automated Test Suite (120 tests passed)
│   │   ├── test_clarification.py
│   │   ├── test_cost_guard.py
│   │   ├── test_dashboard_service.py
│   │   ├── test_database.py
│   │   ├── test_explain.py
│   │   ├── test_healing.py
│   │   ├── test_memory.py
│   │   ├── test_mcp_server.py
│   │   ├── test_semantic.py
│   │   ├── test_settings.py
│   │   └── test_workspaces.py
│   ├── cli.py                      # Standalone QueryCraft CLI (`querycraft` executable)
│   ├── mcp_server.py               # Root MCP server launcher wrapper
│   ├── test_mcp_client.py          # Standalone MCP client testing utility
│   ├── pyproject.toml              # UV / Pip build definition & dependencies
│   ├── requirements.txt            # Production pip dependencies
│   ├── uv.lock                     # UV package lock
│   └── .env                        # NVIDIA NIM API Key, model name, base URL
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
│   │   │   │   │   └── page.jsx    # Autonomous Dashboard Architect & Canvas Studio
│   │   │   │   ├── chat/
│   │   │   │   │   ├── Chatbox.jsx # Responsive interactive clarification chat studio
│   │   │   │   │   └── page.jsx    # Chat view route
│   │   │   │   ├── guard/
│   │   │   │   │   └── page.jsx    # Pre-Flight Cost Guard (AI Firewall) Studio
│   │   │   │   ├── layout.jsx      # 3-Zone shell, ⌘1/⌘2/⌘3/⌘4 hotkeys, header status pill
│   │   │   │   ├── page.jsx        # Direct SQL/NoSQL compiler & execution sandbox
│   │   │   │   └── slidebar.jsx    # Workspace switcher, Recents drawer, 2-tab schema explorer
│   │   │   ├── docs/
│   │   │   │   └── cli/
│   │   │   │       └── page.jsx    # Interactive CLI Documentation Portal & Craft AI Copilot
│   │   │   ├── Home/               # Modern landing page components
│   │   │   │   ├── CLIDocs.jsx     # Terminal playground & 1-click CLI installer snippet
│   │   │   │   ├── CTA.jsx         # Call to action & workflow steps
│   │   │   │   ├── DailyUseCases.jsx# Interactive persona & dialect use case tabs
│   │   │   │   ├── Features.jsx    # 6-Pillar feature showcase
│   │   │   │   ├── Hero.jsx        # Interactive landing hero with live demo simulation
│   │   │   │   ├── Homepage.jsx    # Assembled landing page container
│   │   │   │   ├── HowItWorks.jsx  # 4-Step interactive architecture timeline
│   │   │   │   ├── MCPSection.jsx  # Live schema grounding & MCP architecture overview
│   │   │   │   ├── ProblemSection.jsx # Problem vs solution comparison
│   │   │   │   ├── Testimonial.jsx # Social proof & developer testimonials
│   │   │   │   └── V3Roadmap.jsx   # Agentic V3 proactive workflows roadmap
│   │   │   ├── globals.css         # TailwindCSS v4 styles, custom scrollbars, tokens
│   │   │   ├── layout.js           # Root HTML layout with font imports (Plus Jakarta Sans & JetBrains Mono)
│   │   │   └── page.js             # Root route rendering Homepage
│   │   ├── api/                    # Serverless Next.js API Routes (Vercel & Node.js)
│   │   │   ├── auth/
│   │   │   │   ├── cli-token/route.js # POST /api/auth/cli-token (Browser OAuth token exchange)
│   │   │   │   └── cli-verify/route.js# POST /api/auth/cli-verify (CLI token verification)
│   │   │   ├── clarification/
│   │   │   │   ├── route.js        # POST /api/clarification (Llama 3.1 70B AI compilation)
│   │   │   │   └── schema/route.js # GET /api/clarification/schema (Grounding schema)
│   │   │   ├── dashboard/
│   │   │   │   ├── generate/route.js # POST /api/dashboard/generate (Supervisor multi-agent planner)
│   │   │   │   └── templates/route.js# GET /api/dashboard/templates (Analytical templates)
│   │   │   ├── database/
│   │   │   │   ├── connect/route.js   # POST /api/database/connect (pg live introspection)
│   │   │   │   ├── diagnose/route.js  # POST /api/database/diagnose (SQL Doctor healing)
│   │   │   │   ├── execute/route.js   # POST /api/database/execute (pg live query execution)
│   │   │   │   └── explain/route.js   # POST /api/database/explain (pg EXPLAIN cost planner)
│   │   │   ├── docs-copilot/
│   │   │   │   └── route.js        # POST /api/docs-copilot (Craft AI Docs assistant)
│   │   │   ├── gpt-action/
│   │   │   │   └── openapi.json/route.js # GET /api/gpt-action/openapi.json (OpenAPI 3.1.0 spec for ChatGPT)
│   │   │   ├── semantic/
│   │   │   │   └── metrics/route.js   # GET/POST /api/semantic/metrics (KPI glossary)
│   │   │   ├── settings/
│   │   │   │   └── route.js        # GET/POST /api/settings (Sync settings, usage, quotas)
│   │   │   ├── v1/
│   │   │   │   └── guard/route.js  # POST /api/v1/guard (Cost Guard Firewall API)
│   │   │   └── workspaces/
│   │   │       └── route.js        # GET/POST/PUT/DELETE /api/workspaces (Multi-workspace sync)
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── DashboardCanvas.jsx       # Multi-widget responsive 3-column canvas grid
│   │   │   │   └── PipelineExecutionFlow.jsx # Multi-agent DAG visualizer
│   │   │   ├── database/
│   │   │   │   ├── ConnectDatabaseModal.jsx    # Dual mode URI/Builder, Password encoder, Sandboxes
│   │   │   │   └── TableDataProfilerModal.jsx  # 5-row sample preview & distinct distribution
│   │   │   ├── docs/
│   │   │   │   └── DocsAiCopilot.jsx           # Intelligent documentation floating/embedded AI copilot
│   │   │   ├── extension/
│   │   │   │   └── ExtensionPromptModal.jsx    # Interactive Spotlight demo & 3-step setup
│   │   │   ├── guard/
│   │   │   │   └── CostGuardDashboard.jsx     # Split-screen Pre-Flight Cost Guard Studio
│   │   │   ├── onboarding/
│   │   │   │   ├── OnboardingModal.jsx         # 3-step role personalization & sandbox modal
│   │   │   │   └── SpotlightTooltip.jsx        # Floating 3-step interactive UI spotlight tour
│   │   │   ├── providers/
│   │   │   │   └── AuthProviderWrapper.jsx     # Firebase Auth context wrapper
│   │   │   ├── resuable/
│   │   │   │   ├── Footer.jsx                  # Global footer component
│   │   │   │   └── Navbar.jsx                  # Global navigation bar component
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
│   │   ├── __tests__/                          # Jest Automated Test Suites (12 suites / 76 tests)
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
│   ├── AI_INTEGRATIONS_GUIDE.md    # 1-Click Universal AI setup instructions (Claude, Cursor, Antigravity)
│   ├── MCP_SERVER_GUIDE.md         # Model Context Protocol (MCP) developer guide & tool schemas
│   ├── UI_UX_AUDIT_REPORT.md       # Comprehensive UI/UX Audit & Transformation Roadmap
│   └── chatgpt_custom_action.json  # OpenAPI 3.1.0 specification for ChatGPT Custom Actions
├── .cursor/
│   └── mcp.json                    # Auto-discovered Cursor IDE MCP configuration
├── setup-mcp.sh                    # 1-Click universal curl installer script
├── vercel.json                     # Vercel monorepo deployment routing
├── package.json                    # Root monorepo workspace definition
├── README.md                       # High-level overview & quickstart instructions
├── agent.md                        # Quick agent cheatsheet & architectural summary
└── AGENTS.md                       # Complete developer & agent architecture context (this file)
```

---

## 3. Comprehensive Subsystem & Feature Specifications

### 3.1. Dual AI Execution Architecture
QueryCraft provides dual execution modes for flexible deployment:
1. **Serverless Direct Mode (Vercel & Node.js)**:
   - Implemented in `frontend/lib/serverLlm.js` and `frontend/lib/dbDriver.js`.
   - Runs directly inside Next.js Edge/Serverless Route Handlers (`/api/clarification`, `/api/database/*`, `/api/dashboard/*`).
   - Powered by **Llama 3.1 70B Instruct** via NVIDIA NIM with live schema context injection.
   - Built-in fuzzy table & typo matching mapping misspelled user inputs to introspected catalog tables.
   - Native `pg` (`node-postgres`) client for PostgreSQL live introspection and safe read-only execution.
   - Requires zero Python dependencies or external microservices for production deployment on Vercel.
2. **LangGraph Microservice Mode (FastAPI & Python 3.10+)**:
   - Implemented in `backend/app/services/sql_graph.py` and `backend/app/services/cost_guard_graph.py`.
   - 6-node StateGraph state machine orchestrating supervisor planning, parallel worker generation, critic self-healing loops, and memory RAG.

---

### 3.2. Web Studio & Direct SQL/NoSQL Compiler (`/Dashboard`)
* **Location**: `frontend/app/(website)/Dashboard/page.jsx`
* **Core Capabilities**:
  - **1-Tap `[ Compile & Execute ]` Workflow (`⌘Enter` / `Ctrl+Enter`)**: Single keystroke triggers natural language compilation, EXPLAIN cost validation, and instant database execution.
  - **Monospace Code Editor**: JetBrains Mono monospace editor with syntax contrast, line numbers, and formatted SQL/MQL output.
  - **Direct Raw SQL Execution**: Allows engineers to type and run arbitrary read-only SQL queries directly against their active database.
  - **Inline EXPLAIN Cost Planner**: Real-time compute cost indicator (`Estimated Cost: 24.50`) with scan type alerts.
  - **Tabular Numeral Data Grid**: Resizable columns, sticky headers, null-value badges, and pagination for up to 50 rows.
  - **1-Click CSV Export**: Instant download of query results as clean CSV files.
  - **SQL Doctor Healing Trigger**: Automatic or 1-tap manual invocation of the Critic healing loop on SQL runtime errors.

---

### 3.3. Interactive Clarification Chat Studio (`/Dashboard/chat`)
* **Location**: `frontend/app/(website)/Dashboard/chat/Chatbox.jsx` & `frontend/app/(website)/Dashboard/chat/page.jsx`
* **Core Capabilities**:
  - **Ambiguity Detection & Interactive Response Chips**: Evaluates multi-dimensional or underspecified user prompts and pauses to ask targeted clarifying questions with **1-tap reply chips** before compilation.
  - **Multi-Chip Selection**: Supports selecting multiple constraint chips with an interactive confirmation pill.
  - **Immediate Direct Execution**: Direct, unambiguous data inspection requests (e.g. *"Show total revenue for June 2024"*) bypass clarification and compile/execute immediately.
  - **Conversational Session Memory**: Retains multi-turn conversation context, allowing iterative prompt refinement.
  - **Integrated SQL Doctor**: Detects SQLSTATE error codes and automatically diagnoses and auto-heals queries in chat.

---

### 3.4. Autonomous Dashboard Architect & Canvas Mode (`/Dashboard/canvas`)
* **Location**: `frontend/app/(website)/Dashboard/canvas/page.jsx` & `frontend/components/canvas/DashboardCanvas.jsx`
* **Core Capabilities**:
  - **Supervisor Multi-Agent Decomposition**: A single high-level business goal (e.g. *"Executive revenue and retention overview"*) is automatically decomposed by a Supervisor Planner into 4 parallel query streams:
    1. *Primary Trend* (Time-series revenue or growth)
    2. *Cohort Distribution* (Tier, plan, or segment breakdown)
    3. *Leaderboard* (Top customers, products, or regions)
    4. *Status Breakdown* (Order status, active/churned states)
  - **Multi-Agent Pipeline DAG Flow (`PipelineExecutionFlow.jsx`)**: Real-time animated visualization of the 4-node workflow (*Supervisor Planner* $\rightarrow$ *4 Parallel Workers* $\rightarrow$ *Critic Doctor Guard* $\rightarrow$ *Canvas Assembler*).
  - **KPI Hero Metric Tiles with Sparklines**: Inline trend sparklines provide immediate executive metrics above the charts.
  - **Handcrafted Zero-Dependency SVG Charts (`DataVisualizer.jsx`)**: Responsive Bar, Line, Pie, Area, and Table visualizers with hover tooltips and smooth curves.
  - **Interactive Widget Controls**: Dynamic chart type toggling (`[ Bar | Line | Pie | Table ]`), raw SQL inspection dialog, CSV download, and full-screen widget zoom.

---

### 3.5. Pre-Flight Cost Guard & AI Firewall (`/Dashboard/guard` & `/api/v1/guard`)
* **Location**: `backend/app/services/cost_guard_graph.py`, `backend/app/routers/guard.py`, `frontend/components/guard/CostGuardDashboard.jsx`, `/Dashboard/guard`
* **Core Capabilities**:
  - **Stateful LangGraph Workflow**: 3-node cyclic state machine (`execute_explain` $\rightarrow$ `evaluate_cost` $\rightarrow$ `auto_heal_query`).
  - **Deterministic AST Parser**: Traverses the PostgreSQL EXPLAIN AST, detects sequential scans on high-row tables, and calculates compute cost reduction deltas.
  - **Cartesian Product Trap Auto-Healing**: Detects unconstrained cross joins (e.g. `users` $\times$ `audit_logs` scanning 500,000 rows at 385,000.0 cost) and automatically rewrites them to ANSI `JOIN ... ON ...` with `LIMIT 50`, achieving **99.9% cost reduction**.
  - **Missing Index Detection & AI Firewall Block**: Flags full table scans on unindexed tables (e.g. `audit_logs.action` at 14,250.0 cost) and returns a critical execution block with recommended `CREATE INDEX CONCURRENTLY` DDL statements.
  - **DDL vs DML Clean Separation (`action_type: 'rewritten' | 'blocked_needs_index'`)**: Never replaces the user's `SELECT` query with DDL statements. Unsafe queries requiring infrastructure fixes are cleanly blocked, preserving the original DML query while outputting index creation DDL in a dedicated Data Engineering report.
  - **Developer HUD & Diff Preview**: Split-screen workbench featuring real-time cost reduction comparison, scan method status, remediated SQL monospace diff, and collapsible raw AST plan.

---

### 3.6. Model Context Protocol (MCP) Server — Universal Agent & IDE Connectivity
* **Location**: `backend/app/mcp_server.py`, `backend/mcp_server.py`, `.cursor/mcp.json`, `docs/MCP_SERVER_GUIDE.md`
* **Core Capabilities**:
  - **Native stdio Transport (JSON-RPC 2.0)**: Fully compliant standard I/O transport recognized by **Cursor IDE**, **Claude Desktop**, **Google Antigravity / Gemini**, **Windsurf**, and custom **LangGraph / LangChain** agent swarms.
  - **Session Binding & CLI Auto-Login**: Automatically reads `~/.querycraft/auth.json` on startup to pre-authenticate the user without manual tool calls, or accepts `login_querycraft(email, api_key)`.
  - **4 Registered MCP Tools**:
    1. `login_querycraft(email, api_key_or_token)`: Authenticates user session and binds real databases.
    2. `list_workspaces(user_email)`: Lists all configured database workspaces with live connection status.
    3. `switch_workspace(workspace_name)`: Switches active default database workspace.
    4. `evaluate_and_heal_sql(sql_query, workspace, user_email, cost_threshold, connection_uri, execute_if_safe)`: Evaluates cost, auto-heals cross joins, blocks runaway unindexed queries with index recommendations, and safely executes queries on live databases returning formatted Markdown tables.
  - **Auto-Discovery Configurations**:
    - Cursor: Auto-discovered via `.cursor/mcp.json`.
    - Claude Desktop: Auto-configured via `querycraft setup` writing to `~/Library/Application Support/Claude/claude_desktop_config.json`.
    - Antigravity / Gemini: Auto-configured via `querycraft setup` writing to `~/.gemini/config/mcp_config.json`.

---

### 3.7. Standalone QueryCraft CLI (`querycraft`)
* **Location**: `backend/cli.py`, `setup-mcp.sh`
* **Core Commands & Capabilities**:
  - `querycraft auth login`: Launches GitHub-style browser OAuth flow on local port 9876, performs PKCE token exchange, and securely writes credentials to `~/.querycraft/auth.json` (`0o600`).
  - `querycraft auth whoami`: Displays active authenticated user email, token expiration date, and connected workspaces count.
  - `querycraft auth logout`: Clears stored local credentials.
  - `querycraft ask "<question>"`: Translates natural language questions to safe SQL via Llama 3.1 70B, evaluates safety via Cost Guard, executes query on active database, and renders an aligned ASCII table with execution timing.
  - `querycraft query "<SQL>"`: Direct read-only SQL execution returning formatted ASCII tables.
  - `querycraft connect <URI> [--workspace <name>]`: Links and persists live database connection string to a workspace.
  - `querycraft schema`: Introspects and displays all tables, column types, primary keys `[PK]`, and foreign keys `[FK]`.
  - `querycraft setup` / `querycraft ai setup`: 1-Click universal auto-config for Claude Desktop, Cursor IDE, and Antigravity MCP configs.
  - `querycraft ai list`: Status check of all AI assistant integrations.
  - `querycraft ai chatgpt`: Displays ChatGPT Custom Action OpenAPI configuration instructions.
  - `querycraft workspaces list`: Lists all configured workspaces and connection statuses.

---

### 3.8. Database Connectors, Profiler & Mock Sandboxes
* **Location**: `frontend/components/database/ConnectDatabaseModal.jsx` & `frontend/components/database/TableDataProfilerModal.jsx`
* **Core Capabilities**:
  - **Dual Input Modes**: Fast single URI paste mode alongside structured Parameter Builder mode (Host, Port, User, Password, Database Name, SSL) with live two-way synchronization.
  - **Password Auto-Encoder**: Detects unescaped special characters (`#`, `@`, `/`, `?`, `&`) in passwords and encodes them automatically.
  - **Safe Internal Demo Sandboxes**: Pre-configured mock schemas for E-Commerce, SaaS Billing, and MongoDB IoT events using RFC-compliant `.internal` domains (prevents false-positive secret scanning alerts).
  - **Live Table Profiler Modal (`TableDataProfilerModal.jsx`)**: 5-row sample preview with distinct value distribution profiling, column nullability, and primary key indicators.

---

### 3.9. Sidebar & Multi-Workspace Project Manager
* **Location**: `frontend/app/(website)/Dashboard/slidebar.jsx`
* **Core Capabilities**:
  - **Adaptive Workspace Switcher**: Switch between databases and environments (`Production`, `Staging`, `Development`, `Analytics`) with live badge indicators.
  - **Recents Query History Drawer**: Collapsible list tracking recent natural language prompts and compiled SQL/MQL statements with 1-click re-run and clipboard copy.
  - **2-Tab Navigation**: Fast toggle between Views/Recents and the searchable Schema Explorer.
  - **Schema Explorer**: Searchable data dictionary with column types, primary key badges, and explicit `[ Live Introspected ]` vs `[ Sandbox Mock ]` banner indicators.

---

### 3.10. Global Command Palette (`⌘K` / `Ctrl+K`)
* **Location**: `frontend/components/shell/CommandPalette.jsx`
* **Core Capabilities**:
  - Instant keyboard access from any dashboard page.
  - Grouped navigation categories:
    - *Views & Studios*: Canvas Studio (`G C`), Clarification Chat (`G V`), Cost Guard Studio (`G X`), Direct Studio.
    - *Database & Schema*: Connect Database (`⌘D`), Inspect Schema, Query Notebook.
    - *Recent Queries*: 1-tap re-execution of recent queries.
    - *Workspaces*: Fast workspace switching.
    - *Settings & Tools*: Settings Studio (`⌘,`), Cost Guard (`⌘G`), Extension Spotlight.

---

### 3.11. Settings Studio & Quota Engine
* **Location**: `frontend/components/settings/SettingsPanel.jsx`
* **8 Core Sections**:
  1. **AI Engine & Doctor**: Model selection, Temperature slider (`0.0` to `0.5`), SQL Doctor Critic auto-healing toggle, Schema Pruning toggle.
  2. **Database Safety**: `SET TRANSACTION READ ONLY` enforcement, Statement execution timeouts (default 8000ms), Safe Result LIMIT clamps (default 50), EXPLAIN cost warnings.
  3. **Studio & Formatting**: SQL keyword casing (`UPPERCASE` vs `lowercase`), CSV export delimiters, Haptic audio effects.
  4. **Usage & Quotas**: Real-time monthly query quota progress (`X / 500 Queries`), auto-heals count, verified snippets, live schema tables, dialect distribution.
  5. **Plans & Billing**: Developer Free Tier vs Team Pro ($19/mo) comparison & upgrade path.
  6. **Keybindings & Copilot**: Hotkey bindings (`Cmd+Shift+K`, `Cmd+Enter`, `Cmd+,`, `Cmd+K`).
  7. **Projects & Workspaces**: Workspace CRUD management with environment tags.
  8. **Profile & Cloud Sync**: Profile info and factory defaults reset.

---

### 3.12. Cross-Engine Semantic Layer & Policy Ingestion
* **Location**: `frontend/components/semantic/MetricGlossaryModal.jsx` & `backend/app/services/semantic_service.py`
* **Core Capabilities**:
  - **Business KPI Glossary**: Defines custom metrics (e.g. *Active Customer*, *Net MRR*, *Churn Rate*) with SQL/MQL calculation rules.
  - **RAG Metric Matcher**: Automatically retrieves and injects relevant semantic formulas into query compilation prompts.
  - **Conversational "Teach AI"**: Interactive modal allowing users to explain business terminology in plain English.
  - **Policy Document Ingestion**: Upload PDF/Markdown/Text policy documents to automatically extract business KPI definitions.

---

### 3.13. Interactive CLI Documentation Portal & Craft AI Docs Copilot
* **Location**: `frontend/app/(website)/docs/cli/page.jsx` & `frontend/components/docs/DocsAiCopilot.jsx`
* **Core Capabilities**:
  - **Comprehensive Interactive Reference**: Searchable documentation for all CLI commands, MCP setup, database connectivity, and troubleshooting.
  - **Interactive Terminal Playground**: Try CLI commands in a simulated browser terminal with realistic ASCII table output.
  - **Craft AI Documentation Copilot**: Intelligent floating and embedded AI assistant powered by Llama 3.1 70B with deterministic fallback answers for all QueryCraft commands and workflows.

---

### 3.14. Manifest V3 Chrome Extension (Spotlight Copilot)
* **Location**: `extension/`
* **Core Capabilities**:
  - **Global Hotkey (`Cmd+Shift+K` / `Ctrl+Shift+K`)**: Injects an isolated In-Situ Shadow DOM Spotlight modal onto any active web page (e.g. Supabase, Neon, AWS RDS, Metabase, internal admin panels).
  - **5-Tab Popup Studio**: Complete extension popup with Query Compiler, Schema Explorer, Cost Guard, Workspaces, and Settings.
  - **Bi-Directional Sync**: Synchronizes workspaces, active connections, and preferences with the web dashboard via shared storage.

---

### 3.15. ChatGPT Custom Action & AI Ecosystem
* **Location**: `docs/chatgpt_custom_action.json`, `frontend/app/api/gpt-action/openapi.json/route.js`, `backend/app/main.py`
* **Core Capabilities**:
  - **OpenAPI 3.1.0 Specification**: Hosted endpoint at `/api/gpt-action/openapi.json` allowing custom ChatGPT GPTs to evaluate SQL, inspect schemas, and execute queries via Custom Actions.
  - **Legacy Plugin Manifest**: Served at `/.well-known/ai-plugin.json` on the FastAPI backend for ChatGPT Developer Mode plugins.

---

## 4. Complete API Endpoints Directory

### 4.1. Next.js Serverless API Routes (`frontend/app/api/`)

| Method | Endpoint | Request Body | Response Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/clarification` | `{ user_prompt, session_history, live_schema }` | `{ status, clarification_message, options, extracted_data, is_multi_select }` | Compiles prompt, evaluates ambiguity, generates 1-tap reply chips |
| `GET` | `/api/clarification/schema` | None | `{ tables, total_tables, engine }` | Returns current database catalog schema for grounding |
| `POST` | `/api/dashboard/generate` | `{ prompt, live_schema, dialect }` | `{ dashboard_title, summary, widgets: [4], kpi_cards: [3] }` | Supervisor multi-agent planner synthesizing 4-widget analytical canvas |
| `GET` | `/api/dashboard/templates` | None | `{ templates: [...] }` | Returns curated analytical dashboard templates |
| `POST` | `/api/database/connect` | `{ connectionUri, engine }` | `{ status: "connected", tables: [...], count }` | Live PostgreSQL introspection via native `pg` client |
| `POST` | `/api/database/execute` | `{ connectionUri, sqlQuery, limit }` | `{ columns: [...], rows: [...], execution_time_ms }` | Executes safe read-only SQL with 8000ms timeout |
| `POST` | `/api/database/explain` | `{ connectionUri, sqlQuery }` | `{ total_cost, plan_rows, has_seq_scan, suggestions, raw_plan }` | Dry-runs PostgreSQL EXPLAIN cost analyzer |
| `POST` | `/api/database/diagnose` | `{ sqlQuery, errorMessage, schemaContext }` | `{ diagnosis, healedQuery, rootCause }` | SQL Doctor Critic diagnosing SQLSTATE runtime errors |
| `POST` | `/api/docs-copilot` | `{ message, history }` | `{ reply: "..." }` | Craft AI intelligent documentation assistant |
| `GET` | `/api/gpt-action/openapi.json` | None | OpenAPI 3.1.0 JSON Schema | OpenAPI specification for ChatGPT Custom Actions |
| `GET/POST` | `/api/semantic/metrics` | `{ name, calculation_sql, description }` | `{ metrics: [...] }` | Semantic KPI layer CRUD |
| `GET/POST` | `/api/settings` | `{ settings: {...} }` | `{ settings: {...}, usage: {...} }` | Syncs user preferences, quotas, and keybindings |
| `POST` | `/api/v1/guard` | `{ sql_query, connection_uri, cost_threshold }` | `{ is_safe, action_type, cost_metrics, suggested_index, current_query }` | Pre-Flight Cost Guard AI Firewall evaluation |
| `GET/POST/PUT/DELETE` | `/api/workspaces` | `{ user_id, email, workspaces }` | `{ status, workspaces: [...], count }` | Multi-tenant workspace synchronization |
| `POST` | `/api/auth/cli-token` | `{ email, firebase_id_token }` | `{ status: "success", cli_token, expires_at }` | Exchanges browser OAuth login into a durable CLI token |
| `POST` | `/api/auth/cli-verify` | `{ cli_token }` | `{ status: "verified", email, workspaces: [...] }` | Verifies stored CLI session token |

### 4.2. FastAPI Microservice Endpoints (`backend/app/routers/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/clarification/` | Multi-turn conversational clarification and LangGraph compilation |
| `POST` | `/api/dashboard/generate` | Supervisor multi-agent planner synthesizing analytical dashboards |
| `POST` | `/api/database/connect` | Live database connection & schema introspection (PostgreSQL & MongoDB) |
| `POST` | `/api/database/execute` | Read-only SQL/MQL execution with statement timeout |
| `POST` | `/api/database/explain` | PostgreSQL EXPLAIN cost analyzer & index advisor |
| `POST` | `/api/database/diagnose` | Critic self-healing loop for runtime error diagnosis |
| `POST` | `/api/database/sample` | 5-row sample preview data profiler |
| `POST` | `/api/v1/guard` | Pre-Flight Cost Guard LangGraph 3-node cyclic workflow |
| `GET/POST` | `/api/memory/verified` | Verified few-shot query memory CRUD |
| `GET/POST` | `/api/memory/notebook` | Saved query notebook snippets CRUD |
| `GET/POST` | `/api/semantic/rules` | Custom semantic KPI rules CRUD |
| `POST` | `/api/semantic/teach` | Conversational "Teach AI" metric ingestion |
| `POST` | `/api/semantic/upload-policy` | Policy document upload & metric extraction |
| `GET/POST` | `/api/settings/` | User preferences, shortcuts, and usage tracking |
| `GET/POST/PUT/DELETE` | `/api/workspaces/` | User-scoped database workspace CRUD |
| `POST` | `/api/auth/cli-token` | CLI OAuth token exchange |
| `POST` | `/api/auth/cli-verify` | CLI session verification |
| `GET` | `/.well-known/ai-plugin.json` | ChatGPT Developer Mode plugin manifest |

---

## 5. Database Security, Isolation & Safety Rails

1. **Strict Read-Only Enforcement (`SET TRANSACTION READ ONLY`)**: Every execution connection explicitly runs inside a read-only transaction block. Mutating statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`) are blocked before dispatch.
2. **Hard Statement Execution Timeouts (8000ms)**: Every database session sets `SET statement_timeout = 8000;` to prevent runaway long-running queries from locking production tables.
3. **Safe Result LIMIT Clamps (`LIMIT 50`)**: Non-aggregating queries without explicit `LIMIT` clauses are automatically wrapped with a safe `LIMIT 50` ceiling.
4. **Password Special Character Auto-Encoding**: URIs automatically encode `#`, `@`, `/`, `?`, and `&` to prevent connection string parsing failures.
5. **RFC-Compliant Demo Sandboxes (`.internal`)**: Pre-configured sandboxes use non-routable `.internal` domains to eliminate false-positive secret scanning alerts while allowing immediate testing.
6. **Stateless In-Memory Connections**: Database credentials and connection URIs are resolved in memory per request and never shared across tenant boundaries.

---

## 6. Automated Testing & Verification Status

* **Automated Frontend Tests**: `12 passed, 12 total` (76 passing tests in `frontend/__tests__`).
  - Unit & Integration suites covering `ConnectDatabaseModal`, `DashboardCanvas`, `ExtensionPrompt`, `OnboardingModal`, `DataVisualizer`, `serverLlm`, `databaseContext`, `authContext`, `api`, and `soundUtils`.
* **Automated Backend Tests**: `120 passed, 120 total` (in `backend/tests/`).
  - Unit & Integration suites covering clarification, cost guard LangGraph, dashboard synthesis, database connection/execution, explain planner, critic healing, memory RAG, semantic layer, settings, workspaces, and MCP tools.
* **Production Build**: `next build` compiles all 21 static and dynamic routes cleanly with Turbopack.
* **Chrome Extension**: Manifest V3 compliant with background service worker and isolated content scripts.

---

## 7. Developer Runbook & Deployment

### 7.1. Starting the Frontend (Vercel Serverless Mode)
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run dev
```
*Web dashboard is available at `http://localhost:3000`.*

### 7.2. Starting the Python FastAPI Backend (Optional / Microservice Mode)
```bash
cd /Users/nitindeep/Developer/TTS/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.*

### 7.3. Launching the Model Context Protocol (MCP) Server
```bash
cd /Users/nitindeep/Developer/TTS/backend
python -m app.mcp_server
```

### 7.4. Using the QueryCraft CLI
```bash
# 1-Click Browser OAuth Login
querycraft auth login

# Check Active Session
querycraft auth whoami

# Query Database in Natural Language
querycraft ask "show total orders by month"

# Direct Read-Only SQL Execution
querycraft query "SELECT * FROM users LIMIT 10;"

# Inspect Database Tables and Columns
querycraft schema

# 1-Click Connect to Claude Desktop, Cursor, Antigravity
querycraft setup
```

### 7.5. Running Test Suites
```bash
# Frontend Jest Suites (76 tests)
cd /Users/nitindeep/Developer/TTS/frontend
npm test

# Backend Pytest Suites (120 tests)
cd /Users/nitindeep/Developer/TTS/backend
uv run pytest
```

### 7.6. Building for Production
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run build
```

---

## 8. Required Environment Variables

### Frontend (`frontend/.env.local`)
```env
# NVIDIA NIM AI Engine
NVIDIA_API_KEY=nvapi-...
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

# Optional Microservice Backend Override
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
# NVIDIA NIM AI Engine
NVIDIA_API_KEY=nvapi-...
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# Multi-Tenant & Port Configuration
PORT=8000
QUERYCRAFT_USER_EMAIL=default_user
QUERYCRAFT_BACKEND_URL=http://localhost:8000
QUERYCRAFT_FRONTEND_URL=http://localhost:3000
```
