# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Project Context & Architecture Reference for AI Agents (`AGENTS.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.2.0` (Vercel Serverless Ready + Native `pg` Driver + Multi-Device Responsive)  
> **Primary Interfaces**: Next.js Web Dashboard & Manifest V3 Chrome Extension (Spotlight Copilot)  
> **Dual AI Backend Support**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver.
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Orchestration + `psycopg2` / `pymongo`.  
> **Supported Engines**: PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB), MySQL, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Problem Space

Traditional Text-to-SQL / Text-to-NoSQL tools frequently fail in real-world production environments because of five fundamental flaws:
1. **Ambiguity & Blind Guessing**: When given vague natural language requests (*"Show top customers"*), standard models guess timeframes, metrics, and filters without asking, leading to inaccurate queries.
2. **Schema & Collection Hallucination**: LLMs invent non-existent table names, MongoDB document fields, or misuse database-specific types (`UUID`, `TIMESTAMPTZ`, `JSONB`, BSON object types).
3. **Runtime Failures & Broken Pipelines**: Generated queries fail due to missing `GROUP BY` clauses, column type mismatches, or invalid MongoDB aggregation pipeline stages (`$lookup`, `$unwind`, `$group`).
4. **Dangerous Runaway Scans & Missing Indexes**: Queries trigger expensive full sequential table scans or memory spikes on production databases without warning.
5. **Missing Organizational Context**: Models lack domain-specific business definitions (e.g., how an organization defines *"Active Churn"* or calculates *"Net MRR"*).

### QueryCraft Solution Architecture
QueryCraft resolves these with an integrated 6-pillar pipeline:
* **Conversational Clarification Loop**: Evaluates context and pauses to ask targeted clarifying questions with **1-tap interactive response chips** before query compilation if parameters are ambiguous, while immediately executing direct data inspection requests.
* **Zero-Hallucination Live Schema Grounding**: Automatically introspects live PostgreSQL Information Schemas and MongoDB Atlas cluster databases & collections to ground prompts strictly in valid schemas.
* **Self-Healing Critic Loop ("SQL & MQL Doctor")**: Intercepts database runtime execution errors, parses SQLSTATE codes, uses an LLM Critic to diagnose root causes, and automatically repairs queries with up to 3 self-healing retries.
* **Performance Guard & Index Advisor**: Dry-runs PostgreSQL `EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE)` to estimate cost, detect sequential scans, and generate `CREATE INDEX CONCURRENTLY` statements.
* **Cross-Engine Semantic Layer & Policy Ingestion**: Custom KPI glossary with keyword/RAG retrieval, conversational metric learning ("Teach AI"), and automated policy document metric extraction.
* **Few-Shot Verified Memory & Notebook**: Dynamic token-overlap RAG retrieval for verified gold-standard queries and a tagged query snippet notebook with bidirectional cloud sync.

```
                                  ┌───────────────────────────────┐
                                  │      User Natural Language    │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                ┌───────────────────────────────────┐
                                │   Node 1: Intent & Clarifier      │
                                │   - Visual Intent Detection       │
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
                                                 │   Node 3: Query Compiler          │
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
                                                 │   Node 6: Visualizer Router       │           │   Node 5: Critic Healer (Doctor)  │
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
│   │   │   ├── database.py         # /api/database - Connect, introspect, execute, explain, diagnose, sample
│   │   │   ├── memory.py           # /api/memory - Verified few-shot memory & notebook snippets
│   │   │   ├── semantic.py         # /api/semantic - Semantic rules, teach AI, policy upload
│   │   │   └── settings.py         # /api/settings - Sync settings, shortcuts, usage counters
│   │   ├── services/
│   │   │   ├── db_service.py       # PostgreSQL & MongoDB connection, introspection, execution, sampling
│   │   │   ├── explain_service.py  # PostgreSQL EXPLAIN cost analyzer & index advisor
│   │   │   ├── healing_service.py  # Critic agent self-healing loop & SQL Doctor error diagnoser
│   │   │   ├── llm_services.py     # Llama 3.1 prompt builder, clarification logic, safety validator
│   │   │   ├── memory_service.py   # Few-shot memory RAG, schema pruning RAG, notebook persistence
│   │   │   ├── semantic_service.py # Semantic metric CRUD, RAG matcher, policy doc extraction
│   │   │   └── sql_graph.py        # LangGraph multi-agent StateGraph workflow & self-healing loop
│   │   └── main.py                 # FastAPI application initialization & CORS config
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
│   │   │   │   ├── chat/
│   │   │   │   │   ├── Chatbox.jsx # Responsive interactive clarification chat studio
│   │   │   │   │   └── page.jsx    # Chat view route
│   │   │   │   ├── layout.jsx      # Responsive shell, header status pill, view switcher
│   │   │   │   ├── page.jsx        # Direct SQL/NoSQL compiler & execution sandbox
│   │   │   │   └── slidebar.jsx    # Collapsible sidebar navigation, workspaces, starter prompts
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
│   │   │   ├── globals.css         # TailwindCSS styles, custom scrollbars, animations
│   │   │   ├── layout.js           # Root HTML layout with font imports (Plus Jakarta Sans & JetBrains Mono)
│   │   │   └── page.js             # Root route rendering Homepage
│   │   ├── api/                    # Serverless Next.js API Routes (Vercel & Node.js)
│   │   │   ├── clarification/
│   │   │   │   ├── route.js        # POST /api/clarification (Llama 3.1 70B AI compilation)
│   │   │   │   └── schema/route.js # GET /api/clarification/schema (Grounding schema)
│   │   │   ├── database/
│   │   │   │   ├── connect/route.js    # POST /api/database/connect (pg live introspection)
│   │   │   │   ├── diagnose/route.js   # POST /api/database/diagnose (SQL Doctor healing)
│   │   │   │   ├── execute/route.js    # POST /api/database/execute (pg live query execution)
│   │   │   │   └── explain/route.js    # POST /api/database/explain (pg EXPLAIN cost planner)
│   │   │   ├── semantic/
│   │   │   │   └── metrics/route.js    # GET/POST /api/semantic/metrics
│   │   │   └── settings/
│   │   │       └── route.js        # GET/POST /api/settings
│   │   ├── components/
│   │   │   ├── database/
│   │   │   │   ├── ConnectDatabaseModal.jsx    # Multi-engine connection modal with templates
│   │   │   │   └── TableDataProfilerModal.jsx  # 5-row sample preview & distinct distribution
│   │   │   ├── extension/
│   │   │   │   └── ExtensionPromptModal.jsx    # Interactive Spotlight demo & 3-step setup
│   │   │   ├── semantic/
│   │   │   │   └── MetricGlossaryModal.jsx     # Semantic layer glossary, "Teach AI", policy upload
│   │   │   ├── settings/
│   │   │   │   └── SettingsPanel.jsx           # Account, preferences, shortcuts, usage drawer
│   │   │   ├── ui/                             # Shadcn & Base-UI reusable components
│   │   │   ├── visualization/
│   │   │   │   └── DataVisualizer.jsx          # SVG Bar/Line/Pie/Area/Table chart visualizer
│   │   │   └── workspace/
│   │   │       ├── CreateWorkspaceModal.jsx    # Workspace creation modal
│   │   │       ├── QueryNotebookModal.jsx      # Tagged SQL snippet notebook
│   │   │       └── WorkspaceSwitcher.jsx       # Adaptive workspace dropdown switcher
│   │   ├── hooks/
│   │   │   └── use-mobile.js                   # Mobile viewport detection hook
│   │   ├── lib/
│   │   │   ├── api.js                          # Centralized frontend API client
│   │   │   ├── authContext.jsx                 # Firebase Auth Context (Email, Google, GitHub)
│   │   │   ├── databaseContext.jsx             # Active workspace, connection, live query state
│   │   │   ├── dbDriver.js                     # Native 'pg' client for live introspection & execution
│   │   │   ├── extensionContext.jsx            # Extension detection & spotlight manager
│   │   │   ├── firebase.js                     # Firebase Web SDK initialization & providers
│   │   │   ├── serverLlm.js                    # Serverless Llama 3.1 70B AI engine & validator
│   │   │   ├── settingsContext.jsx             # Synced settings & preferences context
│   │   │   ├── soundUtils.js                   # Audio feedback utilities
│   │   │   └── utils.js                        # Tailwind merge & clsx utility
│   │   ├── __tests__/                          # Jest Automated Test Suites (7 suites / 36 tests)
│   │   │   ├── components/                     # ExtensionPromptModal, DataVisualizer tests
│   │   │   └── lib/                            # serverLlm, databaseContext, authContext, api tests
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
   - Runs directly inside Next.js Edge/Serverless Route Handlers on Vercel without requiring a separate Python service.
   - Directly calls **Llama 3.1 70B Instruct** via NVIDIA NIM with grounded system prompts.
   - Direct PostgreSQL live introspection & query execution powered by native `pg` (`node-postgres`).
   - Categorizes user intent: immediate query compilation for direct inspection (`SELECT ... FROM users LIMIT 50;`) vs. 1-tap clarification chips for ambiguous multi-dimensional requests.
2. **Microservice LangGraph Workflow (`backend/app/services/sql_graph.py`)**:
   - Full 6-node StateGraph state machine in Python with critic self-healing retries and memory RAG.

### 3.2. Live Database Introspection & Driver Subsystem
* **Location**: `frontend/lib/dbDriver.js` & `backend/app/services/db_service.py`
* **PostgreSQL Engine**:
  - Introspects `information_schema.tables`, `columns`, `table_constraints`, `key_column_usage`, and foreign keys.
  - Generates synthetic live DDL statements formatted for LLM system prompt grounding.
  - Read-only execution enforced with `SET TRANSACTION READ ONLY;` and an 8000ms statement timeout.
* **MongoDB Atlas Engine**:
  - Cluster Discovery: Introspects databases, collections, and infers BSON document schemas (`ObjectId`, `String`, `Date`, `Array<T>`, `Object`).
* **Cloud vs. Localhost Safety**:
  - Intelligently detects private `localhost` / `127.0.0.1` URIs when executing on Vercel cloud serverless functions and returns friendly actionable advice to use cloud databases or run locally.

### 3.3. Self-Healing Critic Loop ("SQL & MQL Doctor")
* **Location**: `frontend/app/api/database/diagnose/route.js`, `backend/app/services/healing_service.py`
* **Mechanisms**:
  - Extracts runtime SQLSTATE codes (`42703` Undefined Column, `42P01` Undefined Table, `22P02` Invalid Representation, `42803` Grouping Error).
  - Schema-grounded critic analyzes error trace and automatically repairs SQL queries before re-executing.

### 3.4. Multi-Device Responsive Design System
* **Breakpoints Supported**:
  - **Mobile Phones (< 640px)**: Compact status pills, horizontal swipeable tab bars, slide-over schema drawer with backdrop blur, single-column cards.
  - **Tablets (640px - 1024px)**: Adaptive header layout, flexible workspace trigger buttons, responsive SQL preview cards.
  - **Small Laptops / MacBooks (1024px - 1280px)**: Seamless non-overflowing sidebar and drawer widths.
  - **Large Displays (1440px+)**: Multi-column studio with live schema inspector sidebar and DataVisualizer chart panels.

---

## 4. Current Verification & Quality Assurance

* **Automated Unit & Integration Tests**: `7 passed, 7 total` (36 tests in `frontend/__tests__`).
* **Production Build**: `next build` compiles all 16 static and dynamic routes cleanly with Turbopack.
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
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*API documentation is available at `http://127.0.0.1:8000/docs`.*

### 5.3. Running Test Suites
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm test
```
