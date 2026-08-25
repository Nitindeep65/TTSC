# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Project Context & Architecture Reference for AI Agents (`AGENTS.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.0.0`  
> **Primary Interfaces**: Next.js Web Dashboard & Manifest V3 Chrome Extension (Spotlight Copilot)  
> **Backend Service**: FastAPI (Python 3.10+) + Llama 3.1 70B Instruct via NVIDIA NIM + LangGraph Multi-Agent Orchestration  
> **Supported Engines**: PostgreSQL (Supabase, Neon, AWS RDS), MySQL, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Problem Space

Traditional Text-to-SQL / Text-to-NoSQL tools frequently fail in real-world production environments because of five fundamental flaws:
1. **Ambiguity & Blind Guessing**: When given vague natural language requests (*"Show top customers"*), standard models guess timeframes, metrics, and filters without asking, leading to inaccurate queries.
2. **Schema & Collection Hallucination**: LLMs invent non-existent table names, MongoDB document fields, or misuse database-specific types (`UUID`, `TIMESTAMPTZ`, `JSONB`, BSON object types).
3. **Runtime Failures & Broken Pipelines**: Generated queries fail due to missing `GROUP BY` clauses, column type mismatches, or invalid MongoDB aggregation pipeline stages (`$lookup`, `$unwind`, `$group`).
4. **Dangerous Runaway Scans & Missing Indexes**: Queries trigger expensive full sequential table scans or memory spikes on production databases without warning.
5. **Missing Organizational Context**: Models lack domain-specific business definitions (e.g., how an organization defines *"Active Churn"* or calculates *"Net MRR"*).

### QueryCraft Solution Architecture
QueryCraft fixes this with a 6-pillar multi-agent pipeline orchestrated via **LangGraph**:
* **Conversational Clarification Loop**: Evaluates context and pauses to ask targeted clarifying questions with **1-tap interactive response chips** before query compilation if parameters are ambiguous or missing.
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
                                │   - Ambiguity & Window Evaluation │
                                └─────────┬───────────────┬─────────┘
                                          │               │
                  [Ambiguous / Missing]   │               │   [Clear & Complete]
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

## 2. Monorepo Structure & File Map

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
│   │   │   ├── Login/              # Auth login view
│   │   │   └── Register/           # Auth register view
│   │   ├── (website)/
│   │   │   ├── Dashboard/
│   │   │   │   ├── chat/
│   │   │   │   │   ├── Chatbox.jsx # Multi-turn interactive clarification chat client (default closed schema)
│   │   │   │   │   └── page.jsx    # Chat view route
│   │   │   │   ├── layout.jsx      # Dashboard shell, header, database status pill
│   │   │   │   ├── page.jsx        # Direct SQL/NoSQL compiler & execution sandbox
│   │   │   │   └── slidebar.jsx    # Collapsible navigation, workspaces, starter prompts
│   │   │   ├── Home/               # Modern landing page components
│   │   │   │   ├── Hero.jsx        # Interactive landing hero with live demo simulation
│   │   │   │   ├── Features.jsx    # Feature showcase
│   │   │   │   ├── ProblemSection.jsx  # Problem vs solution comparison
│   │   │   │   ├── DailyUseCases.jsx   # Interactive persona & dialect use case tabs
│   │   │   │   ├── MCPSection.jsx  # Live schema grounding & MCP architecture overview
│   │   │   │   ├── Testimonial.jsx # Social proof & developer testimonials
│   │   │   │   ├── CTA.jsx         # Call to action & workflow steps
│   │   │   │   └── Homepage.jsx    # Assembled landing page
│   │   │   ├── globals.css         # TailwindCSS styles, custom scrollbars, animations
│   │   │   ├── layout.js           # Root HTML layout with font imports (Plus Jakarta Sans & JetBrains Mono)
│   │   │   └── page.js             # Root route rendering Homepage
│   │   ├── components/
│   │   │   ├── database/
│   │   │   │   ├── ConnectDatabaseModal.jsx    # Multi-engine connection modal with templates
│   │   │   │   └── TableDataProfilerModal.jsx  # 5-row sample preview & distinct distribution
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
│   │   │       └── WorkspaceSwitcher.jsx       # Workspace switcher dropdown
│   │   ├── hooks/
│   │   │   └── use-mobile.js                   # Mobile viewport detection hook
│   │   └── lib/
│   │       ├── api.js                          # Centralized Next.js frontend API client (env NEXT_PUBLIC_API_URL)
│   │       ├── databaseContext.jsx             # Active workspace, connection, live query state
│   │       ├── settingsContext.jsx             # Synced settings & preferences context
│   │       └── utils.js                        # Tailwind merge & clsx utility
│   ├── .env.local                              # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
│   ├── .env.example                            # Example env configuration
│   └── package.json                            # Next.js, React 19, Lucide, TailwindCSS v4
│
├── extension/                      # Manifest V3 Chrome Extension (SQL/NoSQL Studio & Copilot)
│   ├── background.js               # Service Worker: Global shortcuts & context menu actions
│   ├── content.js                  # In-Situ Shadow DOM Spotlight Copilot (`Cmd+Shift+K`)
│   ├── content.css                 # Isolated spotlight overlay & modal styling
│   ├── manifest.json               # Manifest V3 configuration, permissions, command hotkeys
│   ├── popup.html                  # Main extension popup studio UI (5-tab navigation)
│   ├── popup.js                    # Extension client logic, tabs, schema explorer, execution, sync
│   ├── popup.css                   # Refined dark aesthetic styles with global .hidden utility
│   └── icons/                      # 16, 32, 48, 128px extension icons
│
├── vercel.json                     # Vercel multi-service monorepo deployment routing
├── README.md                       # High-level overview & setup instructions
├── agent.md                        # Quick agent cheatsheet & architectural summary
└── AGENTS.md                       # Complete developer & agent architecture context (this file)
```

---

## 3. Core Engine Subsystems & Implementation Details

### 3.1. LangGraph Multi-Agent Orchestration Workflow
* **Location**: `backend/app/services/sql_graph.py` & `backend/app/routers/clarification.py`
* **Orchestration**: Built on LangGraph `StateGraph(AgentState)` managing a 6-node state machine:
  1. `intent_and_clarifier_node`: Evaluates visual intent, parses session history, and checks for ambiguity. If ambiguous, terminates early with `status: "needs_clarification"`.
  2. `context_retriever_node`: Runs RAG against `semantic_rules.json` (business metrics) and `verified_queries.json` (gold-standard few-shot examples) while grounding in introspected schema DDL.
  3. `query_compiler_node`: Synthesizes prompt, passes to Llama 3.1 70B Instruct via NVIDIA NIM, enforces read-only SQL/MQL safety, and appends `LIMIT 50`.
  4. `execute_and_guard_node`: Dry-runs execution on live database with statement timeout if `connection_uri` is supplied.
  5. `critic_healer_node`: If execution fails, analyzes runtime SQLSTATE error trace and schema DDL, heals query, and loops back for re-execution (up to 3 retries).
  6. `visualizer_router_node`: Determines optimal visualization type (Bar, Line, Pie, Area, Table).
* **Asynchronous Invocation**: The FastAPI endpoint `/api/clarification/` calls `await querycraft_graph.ainvoke(initial_state)` returning a standardized `ClarificationResponse`.

### 3.2. Zero-Hallucination Database Introspection
* **Location**: `backend/app/services/db_service.py`
* **PostgreSQL Engine**:
  - Connects using `psycopg2` with 8-second connect timeout.
  - Queries `information_schema.tables`, `information_schema.columns`, `information_schema.table_constraints`, and `information_schema.key_column_usage` for the `public` schema.
  - Introspects data types, nullability, defaults, primary keys, and foreign key references.
  - Generates synthetic live DDL statements formatted for LLM system prompt injection.
* **MongoDB Atlas Engine**:
  - Connects using `pymongo.MongoClient` with 8-second server selection timeout.
  - Cluster Discovery: Introspects all non-system databases via `client.list_database_names()`.
  - Introspects collections in each database, sampling the first 10 documents per collection.
  - Runs recursive type inference (`_infer_bson_type`) mapping BSON values to schema descriptions (`ObjectId`, `String`, `Integer`, `Double`, `Boolean`, `Date`, `Array<T>`, `Object`).
  - Outputs namespaced collection signatures: `Collection: db.getSiblingDB('dbname').collection_name { ... }`.
* **Redis / Upstash & MySQL Support**:
  - URI scheme detection (`postgres://`, `mongodb+srv://`, `redis://`, `mysql://`) and safe metadata extraction (`parse_connection_info`).

### 3.3. Self-Healing Critic Loop ("SQL & MQL Doctor")
* **Location**: `backend/app/services/healing_service.py` & `backend/app/routers/database.py`
* **Mechanisms**:
  - **Inline Execution Healing**: When `execute_read_only_query` fails and `auto_heal=True`, the exception is caught and forwarded to `heal_sql_with_critic()`. The Critic Agent analyzes the failing query, runtime error trace, and live schema, generates a repaired query, and automatically re-executes it. The response includes `HealedQueryInfo` showing original SQL, healed SQL, and diagnosis.
  - **PostgreSQL SQLSTATE Mapping**: Extracts SQLSTATE codes (`42703` Undefined Column, `42P01` Undefined Table, `22P02` Invalid Text Representation, `42803` Grouping Error, `42601` Syntax Error, `42501` Permission Denied, `40P01` Deadlock).
  - **Standalone SQL Doctor (`/api/database/diagnose`)**: Evaluates raw error strings, detects root causes, identifies affected entities, and produces repaired queries.

### 3.4. PostgreSQL EXPLAIN Plan & Index Advisor
* **Location**: `backend/app/services/explain_service.py`
* **Execution**: Runs `EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE) <query>` inside a read-only transaction with a 5000ms statement timeout.
* **AST Plan Traversal**:
  - Recursively traverses plan nodes extracting `Total Cost`, `Startup Cost`, `Plan Rows`, `Plan Width`.
  - Flags sequential scans (`Seq Scan on 'table_name' (Filter: cond)`).
  - Generates recommended DDL indexes: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_{table}_{col} ON {table}({col});`.
  - Performance Grading:
    - **Fast / Optimal**: Total cost < 60.
    - **Moderate**: Total cost < 300.
    - **Heavy / Slow**: Total cost >= 300 or heavy unindexed scans.
* **Static Fallback Analyzer**: If the live database is unreachable during EXPLAIN, runs regex AST parsing over `FROM`, `JOIN`, and `WHERE` clauses to simulate cost estimation and recommend indexes.

### 3.5. Cross-Engine Semantic Layer & Business Metrics RAG
* **Location**: `backend/app/services/semantic_service.py` & `backend/app/routers/semantic.py`
* **Features**:
  - **Custom Metric CRUD**: Manage business metrics with `id`, `name`, `definition`, `sql_formula`, `category`, `tags`.
  - **Keyword & Token RAG**: `find_matching_metrics()` scores and retrieves the top-K relevant metrics based on phrase match, token overlap, and category tags to inject into the LLM system prompt.
  - **Teach AI Conversational Learning (`/api/semantic/teach`)**: Parses instructions like *"From now on, consider VIP Customer as anyone who spent over $1,000 this year"* into structured `SemanticRule` records.
  - **Document Policy RAG (`/api/semantic/upload-policy`)**: Ingests raw policy text, markdown, or CSV, extracts all KPI formulas via Llama 3.1, and indexes them into the Semantic Layer.

### 3.6. Few-Shot Verified Memory & Query Notebook
* **Location**: `backend/app/services/memory_service.py` & `backend/app/routers/memory.py`
* **Features**:
  - **Verified Query Memory**: Persists gold-standard prompt-SQL pairs. `find_relevant_few_shot_examples()` dynamically injects top-2 relevant examples into prompts.
  - **Schema RAG Pruning**: `prune_schema_for_prompt()` scores and trims large enterprise schemas (20+ tables) down to the most relevant 8 tables based on prompt keyword matching and foreign key relationships.
  - **Query Notebook & Snippets Library**: Team query snippet storage with tags, host tracking, and one-click execution with bidirectional cloud sync.

### 3.7. Multi-Workspace & Synchronized Settings Architecture
* **Location**: `frontend/lib/databaseContext.jsx`, `frontend/lib/settingsContext.jsx`, and `backend/app/routers/settings.py`
* **Workspaces**: Supports multiple database workspaces (`ws-default`, `ws-staging`, etc.), each storing an isolated connection URI, color theme, environment label, and introspected schema cache. Persisted in `localStorage` (`tts_cloud_workspaces_v2`).
* **Settings Synchronization**: The extension and web dashboard share settings persisted in `backend/app/data/settings.json`, including account metadata, display preferences, keyboard shortcuts, API base URL, and query usage statistics (`queries`, `heals`, `verified`).

---

## 4. Complete REST API Reference

All backend endpoints run under `http://127.0.0.1:8000`.

| Endpoint | Method | Request Payload | Response Schema | Description |
| :--- | :---: | :--- | :--- | :--- |
| `/` | `GET` | _None_ | `{"message": str, "features": List[str]}` | Health check and active capabilities list |
| `/api/clarification/` | `POST` | `ClarificationRequest` (`user_prompt`, `session_history`, `live_schema`, `connection_uri`) | `ClarificationResponse` (`status`, `message`, `extracted_data`, `visual_intent`) | LangGraph multi-agent clarify & compile engine |
| `/api/clarification/schema` | `GET` | _None_ | `SchemaInfoResponse` (`database_type`, `tables`) | Returns default demo schema metadata |
| `/api/database/test` | `POST` | `DBConnectRequest` (`connection_uri`) | `{"status": "success", "data": dict}` | Tests database connectivity and returns ping/version |
| `/api/database/connect` | `POST` | `DBConnectRequest` (`connection_uri`) | `DBConnectResponse` (`host`, `database`, `user`, `tables_count`, `schema_sql`, `tables`) | Introspects live PostgreSQL schema or MongoDB cluster |
| `/api/database/execute` | `POST` | `ExecuteQueryRequest` (`connection_uri`, `sql_query`, `limit`, `auto_heal`, `user_prompt`, `live_schema`) | `ExecuteQueryResponse` (`status`, `columns`, `rows`, `row_count`, `healing_info`) | Executes read-only query with auto-healing critic retry |
| `/api/database/explain` | `POST` | `ExplainPlanRequest` (`connection_uri`, `sql_query`) | `ExplainPlanResponse` (`total_cost`, `startup_cost`, `plan_rows`, `has_seq_scan`, `scan_details`, `performance_rating`, `index_recommendations`, `raw_plan`) | Runs PostgreSQL EXPLAIN, estimates cost, advises indexes |
| `/api/database/sample` | `POST` | `TableSampleRequest` (`connection_uri`, `table_name`, `limit`) | `TableSampleResponse` (`table_name`, `columns`, `rows`, `column_profiles`, `row_count`) | Returns 5 sample rows and column value distribution |
| `/api/database/diagnose` | `POST` | `DiagnoseErrorRequest` (`error_message`, `failing_sql`, `live_schema`, `user_prompt`, `connection_uri`) | `DiagnoseErrorResponse` (`error_code`, `root_cause`, `healed_sql`, `affected_entities`, `explanation`) | SQL Doctor: Evaluates error traces and generates fixed query |
| `/api/semantic/metrics` | `GET` | _None_ | `SemanticMetricsResponse` (`metrics`, `total_count`) | Lists all custom business rules & glossary metrics |
| `/api/semantic/metrics` | `POST` | `CreateMetricRequest` (`name`, `definition`, `sql_formula`, `category`, `tags`) | `SemanticRule` | Creates or updates a semantic rule |
| `/api/semantic/metrics/{id}` | `DELETE` | Path parameter `id` | `{"status": "success", "message": str}` | Deletes a metric by ID |
| `/api/semantic/teach` | `POST` | `TeachAIRequest` (`instruction`) | `SemanticRule` | Converts conversational rule instruction to structured metric |
| `/api/semantic/upload-policy` | `POST` | `PolicyUploadRequest` (`document_title`, `document_text`) | `PolicyUploadResponse` (`extracted_metrics`, `count`, `message`) | Ingests policy text/doc and extracts multiple KPI rules |
| `/api/memory/queries` | `GET` | _None_ | `VerifiedQueriesResponse` (`queries`, `total_count`) | Returns all few-shot verified gold-standard queries |
| `/api/memory/verify` | `POST` | `SaveVerifiedQueryRequest` (`user_prompt`, `verified_sql`, `tables`, `explanation`, `tags`) | `VerifiedQuery` | Saves a verified query into few-shot RAG memory |
| `/api/memory/queries/{id}` | `DELETE` | Path parameter `id` | `{"status": "success", "message": str}` | Deletes a verified query from memory |
| `/api/memory/notebook` | `GET` | _None_ | `NotebookQueriesResponse` (`queries`, `total_count`) | Returns all saved query snippets in the notebook |
| `/api/memory/notebook` | `POST` | `SaveNotebookQueryRequest` (`title`, `user_prompt`, `sql_query`, `tags`, `database_host`) | `SavedNotebookQuery` | Adds a saved query snippet to the team notebook |
| `/api/memory/notebook/{id}` | `DELETE` | Path parameter `id` | `{"status": "success", "message": str}` | Deletes a notebook query snippet |
| `/api/settings/` | `GET` | _None_ | Full settings object (`account`, `preferences`, `shortcuts`, `apiBase`, `usage`) | Returns current persistent settings |
| `/api/settings/` | `POST` | `SettingsPatch` (partial keys) | Updated full settings object | Merges and persists settings patch |
| `/api/settings/usage/increment`| `POST` | Query parameter `field` (`queries` / `heals` / `verified`) | Updated `usage` dictionary | Increments usage counter by 1 |
| `/api/settings/reset` | `DELETE` | _None_ | Default settings object | Resets settings to factory defaults |

---

## 5. Chrome Extension (Manifest V3) Architecture

The extension operates in two presentation modes:

### 5.1. Extension Popup Studio (`popup.html` / `popup.js` / `popup.css`)
* **Typography**: Unified with the web dashboard using local system typography (`Plus Jakarta Sans` for UI and `JetBrains Mono` for SQL / Code) with zero remote font CSP violations.
* **Segmented Tabs**:
  1. `💬 Chat`: Natural language query generation, visual clarification status pills with **1-tap Interactive Reply Chips**, syntax-highlighted SQL blocks, starter prompts, and tabular / SVG chart execution.
  2. `🗄️ Schema`: Default-collapsed tables/collections, column data types, PK/FK indicators, and 5-row live table profiler.
  3. `📐 Metrics`: Business KPI glossary and conversational "Teach AI" rule creator.
  4. `📓 Notebook`: Saved team query snippets with tag filtering (`#finance`, `#vip`, `#inventory`, `#trend`), 1-click execution, and real-time synchronization with backend `/api/memory/notebook`.
  5. `⚡ DBs`: Multi-engine profile switcher (Supabase, Neon, AWS RDS, MongoDB Atlas, Redis, MySQL), connection test, and schema introspection.
* **Storage & Cloud Bridging**: Synchronizes profiles, theme (`dark`, `dim`, `light`), font scale, shortcuts, and usage counters with backend `/api/settings/` and `chrome.storage.local` (with `localStorage` fallback in tab view).
* **Modal Management**: Global `.hidden { display: none !important; }` rule prevents modal overlay glitches on startup.

### 5.2. In-Situ Floating Spotlight Copilot (`content.js` / `content.css`)
* **Activation**: Press `Cmd + Shift + K` (or `Ctrl + Shift + K`) anywhere on any webpage, or select text and right-click context menus:
  - *"QueryCraft: Explain & Optimize SQL"*
  - *"QueryCraft: SQL Error Doctor (Fix Error)"*
  - *"QueryCraft: Open Command Bar"*
* **Shadow DOM Isolation**: Injected via `document.createElement("div").attachShadow({ mode: "open" })`. Inlines `content.css` dynamically to bypass Chrome's strict CSP, ensuring zero CSS collision with host web pages.
* **Modes**:
  - **Prompt Mode**: Instant natural language to SQL/MQL compilation with 1-click "Insert to Editor" into active textareas.
  - **Explain Mode**: Execution plan cost analysis and indexing advice for highlighted queries.
  - **Doctor Mode**: Instant diagnosis and repair for highlighted error traces.

---

## 6. Frontend Web Dashboard Architecture

* **Framework**: Next.js 16.3 (App Router) + React 19 + TailwindCSS v4.
* **Key Routes**:
  - `/(website)/Dashboard/chat`: Multi-turn conversational clarification chat with default-closed schema helper (`isHelperOpen: false`).
  - `/(website)/Dashboard`: Direct query compiler sandbox, manual SQL editor, and live schema browser.
  - `/(website)/Home`: Full marketing landing page with live interactive demo simulation, feature deep dives, and persona use cases.
* **State Management**:
  - `DatabaseContext` (`frontend/lib/databaseContext.jsx`): Manages active workspaces, database connection state, introspected schema cache, and live query execution.
  - `SettingsContext` (`frontend/lib/settingsContext.jsx`): Synchronizes theme, font size, keyboard shortcuts, and usage counters with backend `/api/settings`.
* **Components**:
  - `DataVisualizer.jsx`: Automatic visualization switching between Bar, Line, Pie/Donut, Area, and tabular data with one-click CSV export.
  - `ConnectDatabaseModal.jsx`: Provider templates for Supabase, Neon, AWS RDS, MongoDB Atlas, Redis, and MySQL.
  - `TableDataProfilerModal.jsx`: Live sample records and categorical value distribution.
  - `MetricGlossaryModal.jsx`: Glossary rules, conversational rule learning, and policy document extraction.
  - `QueryNotebookModal.jsx`: Tagged snippet organizer with search and filter.
  - `SettingsPanel.jsx`: Slide-over drawer for user account, shortcuts, preferences, and usage metrics.

---

## 7. Environment Variables & Configuration

Backend environment configuration is stored in `backend/.env`:

```env
# NVIDIA NIM API Key for Llama 3.1 70B Instruct
NVIDIA_API_KEY=nvapi-your-key-here

# Target LLM Model Name
model=meta/llama-3.1-70b-instruct

# OpenAI-Compatible Endpoint URL
Base_url=https://integrate.api.nvidia.com/v1
```

* **Backend Port**: `8000` (`http://127.0.0.1:8000`)
* **Frontend Port**: `3000` (`http://localhost:3000`)
* **CORS Policy**: Configured in `backend/app/main.py` with `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`.

---

## 8. Development & Operational Runbook

### 8.1. Starting the Backend Service
```bash
cd /Users/nitindeep/Developer/TTS/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*API documentation is available at `http://127.0.0.1:8000/docs`.*

### 8.2. Starting the Frontend Web App
```bash
cd /Users/nitindeep/Developer/TTS/frontend
npm run dev
```
*Web dashboard is available at `http://localhost:3000`.*

### 8.3. Loading the Chrome Extension
1. Open Google Chrome or any Chromium browser (Brave, Edge, Arc).
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** (top-left).
5. Select the `/Users/nitindeep/Developer/TTS/extension` directory.
6. Open the extension popup or press `Cmd + Shift + K` on any webpage.

### 8.4. Running the Automated Test Suites
```bash
# 1. Backend Pytest Suite (70 tests: LangGraph, SQL safety, DB mocks, Doctor)
cd /Users/nitindeep/Developer/TTS/backend
source venv/bin/activate
pytest

# 2. Frontend Jest Suite (8 tests: DataVisualizer, DatabaseContext)
cd /Users/nitindeep/Developer/TTS/frontend
npm test

# 3. Chrome Extension Jest Suite (4 tests: popup tabs, chips, storage)
cd /Users/nitindeep/Developer/TTS/extension
npm test
```

---

## 9. Guidelines for Future Agent Modifications

1. **Safety First**: Never bypass `validate_and_enforce_sql_safety()`. All queries sent to live databases must remain read-only (`SELECT` or read-only MQL/Redis commands) with enforced `LIMIT 50` unless explicitly overridden.
2. **Schema Grounding**: Always pass the live introspected schema into `build_system_prompt()`. Avoid static schema assumptions when a live connection URI is present.
3. **Multi-Database MongoDB Disambiguation**: When dealing with MongoDB clusters with multiple databases, verify if the query targets a specific database or requires clarification before compiling.
4. **Synchronized State**: Any new settings field added to `backend/app/routers/settings.py` must be mirrored in `frontend/lib/settingsContext.jsx` and `extension/popup.js`.
5. **Preserve Fallbacks**: Keep demo mock schemas and static EXPLAIN fallbacks operational so the UI remains fully functional even when disconnected from a live database.
