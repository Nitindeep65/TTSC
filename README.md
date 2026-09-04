# QueryCraft — PostgreSQL Safety & Intelligence Engine

<p align="center">
  <img src="https://raw.githubusercontent.com/antigravity-community/querycraft/main/assets/querycraft-banner.png" alt="QueryCraft Banner" width="100%" style="border-radius: 8px;" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>The Enterprise-Grade PostgreSQL Safety Layer, Pre-Flight Cost Guard AI Firewall, and Self-Healing SQL Doctor.</strong><br/>
  <em>Eliminate runaway sequential scans, query hallucinations, and silent analytical errors before queries ever touch your production database.</em>
</p>

<p align="center">
  <a href="#theoretical-foundations--system-architecture"><img src="https://img.shields.io/badge/Architecture-LangGraph%20%7C%20Serverless%20Dual--Engine-6366f1.svg?style=flat-square" alt="Architecture" /></a>
  <a href="#pre-flight-cost-guard--query-cost-modeling"><img src="https://img.shields.io/badge/Pre--Flight-Cost%20Guard%20AI%20Firewall-10b981.svg?style=flat-square" alt="Cost Guard" /></a>
  <a href="#the-self-healing-critic-loop-sql-doctor"><img src="https://img.shields.io/badge/Self--Healing-SQL%20Doctor%20(SQLSTATE)-f59e0b.svg?style=flat-square" alt="SQL Doctor" /></a>
  <a href="#universal-agent-connectivity-model-context-protocol-mcp"><img src="https://img.shields.io/badge/MCP-6%20Native%20Tools%20(JSON--RPC%202.0)-3b82f6.svg?style=flat-square" alt="MCP" /></a>
  <a href="#automated-testing--verification"><img src="https://img.shields.io/badge/Tests-117%20Pytest%20%7C%2076%20Jest%20Passing-emerald.svg?style=flat-square" alt="Tests" /></a>
  <a href="#security-privacy--safety-invariants"><img src="https://img.shields.io/badge/Safety-Read--Only%20Enforced-critical.svg?style=flat-square" alt="Safety" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" /></a>
</p>

---

## Table of Contents

1. [Executive Summary & Problem Space](#1-executive-summary--problem-space)
2. [Theoretical Foundations & Algorithmic Rigor](#2-theoretical-foundations--algorithmic-rigor)
   - [2.1. The Fundamental Dilemma: Probabilistic LLMs vs. Deterministic Relational Schemas](#21-the-fundamental-dilemma-probabilistic-llms-vs-deterministic-relational-schemas)
   - [2.2. Information Entropy & Clarification Theory](#22-information-entropy--clarification-theory)
   - [2.3. Relational Constraint Graph & Zero-Hallucination Grounding](#23-relational-constraint-graph--zero-hallucination-grounding)
   - [2.4. Query Cost Modeling & Pre-Flight Cost Guard Theory](#24-query-cost-modeling--pre-flight-cost-guard-theory)
   - [2.5. Closed-Loop Feedback Control: The SQL Doctor Critic](#25-closed-loop-feedback-control-the-sql-doctor-critic)
   - [2.6. Defense-in-Depth Safety & Isolation Architecture](#26-defense-in-depth-safety--isolation-architecture)
3. [System Architecture & Dual AI Engine](#3-system-architecture--dual-ai-engine)
4. [Primary Interfaces & Developer Tooling](#4-primary-interfaces--developer-tooling)
   - [4.1. Web Dashboard & Studios (⌘1, ⌘2, ⌘3, ⌘K)](#41-web-dashboard--studios)
   - [4.2. Standalone QueryCraft CLI (`querycraft`)](#42-standalone-querycraft-cli-querycraft)
   - [4.3. Universal Model Context Protocol (MCP) Server](#43-universal-model-context-protocol-mcp-server)
   - [4.4. Interactive 3-Zone CLI Documentation Portal](#44-interactive-3-zone-cli-documentation-portal)
   - [4.5. Browser Extension (Manifest V3)](#45-browser-extension-manifest-v3)
5. [Quickstart & Setup Runbook](#5-quickstart--setup-runbook)
   - [Prerequisites](#prerequisites)
   - [Mode A: Complete Full-Stack Web Development (Next.js 16)](#mode-a-complete-full-stack-web-development-nextjs-16)
   - [Mode B: Microservice Backend (FastAPI + LangGraph)](#mode-b-microservice-backend-fastapi--langgraph)
   - [Mode C: Global CLI & Universal IDE MCP Integration](#mode-c-global-cli--universal-ide-mcp-integration)
   - [Mode D: Chrome Browser Extension](#mode-d-chrome-browser-extension)
6. [Security, Privacy & Zero-Leak Guarantees](#6-security-privacy--zero-leak-guarantees)
7. [Automated Testing & Verification](#7-automated-testing--verification)
8. [Contributing, RFC Process & Expressing New Ideas](#8-contributing-rfc-process--expressing-new-ideas)
   - [Expressing New Ideas via RFCs](#expressing-new-ideas-via-rfcs)
   - [Contribution Workflow](#contribution-workflow)
   - [Coding Standards & Invariants](#coding-standards--invariants)
   - [Responsible Security Vulnerability Disclosure](#responsible-security-vulnerability-disclosure)

---

## 1. Executive Summary & Problem Space

Traditional natural language Text-to-SQL assistants fail in production environments because of five systemic flaws:

1. **Ambiguity & Blind Assumptions**: Single-turn models guess dates, dimensions, metrics, and filters when given underspecified requests (e.g., *"Show top customers"*). They make arbitrary assumptions about time windows, order statuses, and aggregations, generating plausible-looking but factually wrong analytical results.
2. **Schema & Typo Hallucinations**: Standard LLMs invent non-existent table and column names, misspell similar entity identifiers (`custmers` vs `customers`), join unrelated tables on non-key columns, or mishandle database-specific types (`UUID`, `TIMESTAMPTZ`, `JSONB`, `NUMERIC`).
3. **Runtime Failures & Cryptic Errors**: Generated queries break on live databases due to missing `GROUP BY` clauses, type mismatches, or SQLSTATE syntax violations (`42703`, `42803`, `42P01`), leaving non-technical users staring at raw database tracebacks.
4. **Dangerous Runaway Scans & Unindexed Queries**: Unconstrained queries trigger full sequential table scans, cross-join Cartesian blowups ($O(N \times M)$), or memory spikes on multi-million row production databases, causing service degradation or cloud egress bill shocks without warning.
5. **Accidental Data Mutations**: General-purpose coding assistants can inadvertently generate mutating DDL/DML statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`), risking catastrophic data loss.

**QueryCraft solves these challenges** by inserting an active defensive safety layer between human intent (or AI coding agents) and your database. Through pre-flight cost simulation (`EXPLAIN`), automated conversational clarification, live schema grounding, a self-healing critic loop, and strict read-only execution sandboxes, QueryCraft ensures that every executed query is accurate, performant, and safe.

---

## 2. Theoretical Foundations & Algorithmic Rigor

```
                        ┌──────────────────────────────────────────────┐
                        │      User Intent / Natural Language Prompt   │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │   STAGE 1: Intent & Ambiguity Clarifier      │
                        │   - Entropy & Information Gap Evaluation     │
                        │   - Entity & Typo Resolution                 │
                        └──────────────┬────────────────┬──────────────┘
                                       │                │
               [Ambiguity > Threshold] │                │ [Unambiguous Query]
                                       ▼                ▼
                   ┌───────────────────────┐  ┌────────────────────────────────┐
                   │ Targeted Clarifier    │  │ STAGE 2: Live Schema Grounding │
                   │ - 1-Tap Response Chips│  │ - PostgreSQL Information Cat.  │
                   │ - Parameter Boundaries│  │ - FK Referential Graph / RAG   │
                   └───────────────────────┘  └────────────────┬───────────────┘
                                                               │
                                                               ▼
                                              ┌────────────────────────────────┐
                                              │ STAGE 3: Safe SQL Compiler     │
                                              │ - Llama 3.1 70B Grounded Prompt│
                                              │ - LIMIT 50 Clamp & AST Defense │
                                              └────────────────┬───────────────┘
                                                               │
                                       ┌───────────────────────┴───────────────────────┐
                                       │                                               │
                                       ▼                                               ▼
                     ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
                     │ STAGE 4: Pre-Flight Cost Guard    │           │ STAGE 5: Read-Only DB Execution   │
                     │ - EXPLAIN (FORMAT JSON, COSTS)    │           │ - SET TRANSACTION READ ONLY       │
                     │ - 3-Tier Risk (LOW / MED / HIGH)  │           │ - 8000ms Statement Timeout Guard  │
                     │ - Concurrent Index Advisor (DDL)  │           └─────────────────┬─────────────────┘
                     └───────────────────────────────────┘                             │
                                                               ┌───────────────────────┴───────────────────────┐
                                                               │                                               │
                                                        [Execution OK]                                 [Runtime Error]
                                                               │                                               │
                                                               ▼                                               ▼
                                             ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
                                             │ STAGE 6: Interactive Telemetry    │           │ STAGE 7: SQL Doctor Critic        │
                                             │ - Monospace Data Table & CSV      │◀──────────│ - SQLSTATE Code Classification    │
                                             │ - Visual Chart Recommendations   │  [Healed] │ - Schema-Aware Auto-Heal (Max 3)  │
                                             │ - Live EXPLAIN Metric Breakdown   │           └───────────────────────────────────┘
                                             └───────────────────────────────────┘
```

### 2.1. The Fundamental Dilemma: Probabilistic LLMs vs. Deterministic Relational Schemas

Large Language Models operate as probabilistic token predictors:

$$P(W) = \prod_{t=1}^{T} P(w_t \mid w_1, w_2, \dots, w_{t-1})$$

In contrast, relational databases function under deterministic first-order relational calculus and strict mathematical schemas:

$$\sigma_{\text{predicate}}(R) \bowtie_{\text{FK}=\text{PK}} S$$

When a probabilistic model generates SQL without grounding, it samples tokens from general semantic space rather than your database's strict entity set. This structural mismatch produces:
* **Semantic Hallucinations**: Confusing business synonyms (`user_name`, `username`, `full_name`, `name`).
* **Broken Referential Graphs**: Joining tables on arbitrary integer fields instead of valid Foreign Key constraints.
* **Dialect Incompatibilities**: Treating PostgreSQL as generic ANSI SQL, breaking on `UUID`, `TIMESTAMPTZ`, `JSONB`, or strict boolean coercions.

QueryCraft bridges this divide by mathematically constraining the generation envelope using live schema metadata, referential integrity graphs, and AST validation.

### 2.2. Information Entropy & Clarification Theory

When a user provides a prompt with missing dimensions (such as time boundaries, order status, or aggregation granularity), the conditional entropy of the SQL query given the prompt is high:

$$H(\text{Query} \mid \text{Prompt}) \gg 0$$

Naive Text-to-SQL tools minimize generation loss by hallucinating the most probable default (e.g., assuming `status = 'completed'` or `created_at >= NOW() - INTERVAL '30 days'`). However, this introduces **silent analytical drift**, producing convincing numbers that misrepresent business reality.

QueryCraft introduces an active **Clarification Gate**:
* It evaluates prompt ambiguity across four critical dimensions: **Time Boundaries**, **Entity Filtering**, **Aggregation Granularity**, and **Status Flags**.
* When missing criteria exceed an uncertainty threshold, the engine halts compilation, emits `status: "needs_clarification"`, and synthesizes **1-tap interactive response chips** (e.g., `["Completed Orders Only", "Active Users Only", "Past 30 Days"]`).
* Once the user provides the missing dimension in $O(1)$ turns, the conditional entropy collapses to $H(\text{Query} \mid \text{Prompt} + \text{Clarification}) \approx 0$, enabling deterministic, accurate SQL compilation.

### 2.3. Relational Constraint Graph & Zero-Hallucination Grounding

QueryCraft eliminates hallucinations by continuously introspecting the live database catalog:

$$\mathcal{G}_{schema} = (\mathcal{V}_{tables}, \mathcal{E}_{foreign\_keys}, \mathcal{T}_{types})$$

1. **Information Schema Introspection**: Extracts real-time table definitions, column types, nullability, unique constraints, and check constraints directly from PostgreSQL `information_schema.tables`, `columns`, and `table_constraints`.
2. **Referential Integrity Mapping**: Discovers primary key (`PK`) to foreign key (`FK`) dependencies via `information_schema.key_column_usage` and `constraint_column_usage`, guaranteeing valid join paths.
3. **Dynamic Schema Pruning (RAG)**: For large databases with hundreds of tables, QueryCraft calculates semantic relevance between prompt tokens and table catalog embeddings, feeding only the required schema subset to the LLM context window.

### 2.4. Query Cost Modeling & Pre-Flight Cost Guard Theory

PostgreSQL determines query execution strategy using a cost model representing total page I/O and CPU computation:

$$C_{total} = (N_{pages} \cdot C_{page\_io}) + (N_{tuples} \cdot C_{cpu\_tuple}) + (N_{operators} \cdot C_{cpu\_operator})$$

Executing an unindexed query on a high-cardinality table forces PostgreSQL into a Sequential Scan ($O(N)$), reading every disk block into shared buffers. When combined with unindexed joins, execution time degrades into Cartesian nested loops ($O(N \times M)$).

QueryCraft's **Pre-Flight Cost Guard** dry-runs an isolated execution plan:

$$\text{EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE) } \mathcal{Q}$$

Inside a read-only transaction, the resulting plan tree is parsed against a 3-tier risk engine:

| Risk Tier | Total Cost Metric ($C_{total}$) | Plan Characteristics | System Behavior |
| :--- | :--- | :--- | :--- |
| **`[LOW RISK]`** | $C_{total} < 60.0$ | Pure index scans (`Index Scan`, `Index Only Scan`), bounded row cardinality, low CPU footprint. | Automatically approved for execution. |
| **`[MEDIUM RISK]`** | $60.0 \le C_{total} \le 300.0$ | Sequential scan on moderate tables ($1,000 - 10,000$ rows) or intermediate hash joins. | Warning issued with performance metrics. |
| **`[HIGH RISK]`** | $C_{total} > 300.0$ | Sequential scan on large tables ($> 10,000$ rows), Cartesian cross-joins, or unindexed nested loops. | Blocked / Flagged with mandatory review. |

#### Automated Index Advisor
When a sequential scan with a filter condition (`Filter: (created_at > ...)`) is detected, QueryCraft does **not** mutate the user's analytical query into DDL. Instead, it extracts the filtered predicate and synthesizes non-blocking DDL alongside the query:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at 
ON orders(created_at);
```

### 2.5. Closed-Loop Feedback Control: The SQL Doctor Critic

When a database returns an execution error, traditional tools fail catastrophically. QueryCraft implements a closed-loop feedback control system utilizing an LLM Critic:

```
[Agent Query] ──▶ [DB Execution] ──▶ [Runtime Error]
       ▲                                     │
       │                                     ▼
 [Healed Query] ◀── [Schema Catalog] ◀── [SQLSTATE Critic]
```

QueryCraft intercepts PostgreSQL SQLSTATE 5-character error codes, parses the diagnostic message, and applies targeted healing strategies:

* **`42703` (`undefined_column`)**: Levenshtein distance and embedding match against valid columns in the introspected catalog.
* **`42P01` (`undefined_table`)**: Replaces hallucinated entity names with valid tables in the connected schema.
* **`42803` (`grouping_error`)**: Identifies non-aggregated projection columns and injects them into the `GROUP BY` clause or applies necessary aggregations (`SUM`, `COUNT`, `MAX`).
* **`22P02` (`invalid_text_representation`)**: Auto-corrects literal formatting for `UUID`, `NUMERIC`, or `TIMESTAMPTZ` values.
* **`42601` (`syntax_error`)**: Repairs trailing commas, mismatched parentheses, or PostgreSQL reserved keyword collisions.

The critic loop executes iteratively with a hard ceiling of **3 self-healing retries**, ensuring rapid convergence without infinite loops.

### 2.6. Defense-in-Depth Safety & Isolation Architecture

QueryCraft enforces database safety at multiple architectural layers:

1. **AST & Token Lexical Filtering**: Regular expressions and abstract syntax tree parsers reject mutating keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`, `EXEC`) prior to database submission.
2. **Read-Only Transaction Isolation**: Every query execution explicitly runs inside:
   ```sql
   SET TRANSACTION READ ONLY;
   ```
   Even if an injection payload bypasses token filtering, PostgreSQL's storage engine enforces read-only invariants at the kernel level.
3. **Hard Statement Execution Timeout**: Every session sets:
   ```sql
   SET statement_timeout = '8000'; -- 8000ms max
   ```
   Runaway locks and infinite loops are terminated by the database engine within 8 seconds.
4. **Safe Cardinality Clamping**: Queries without an explicit `LIMIT` are automatically wrapped with a safe `LIMIT 50` ceiling to protect network bandwidth and client memory.

---

## 3. System Architecture & Dual AI Engine

QueryCraft features a dual-engine architecture designed for flexible deployment:

```
TTS/
├── backend/                        # FastAPI Microservice & Standalone CLI
│   ├── app/
│   │   ├── Models/schema.py        # Pydantic schemas (RiskLevel, ExplainPlanResponse)
│   │   ├── routers/                # FastAPI routers (guard, database, clarification, auth)
│   │   ├── services/               # LangGraph state graphs, explain engine, healing critic
│   │   ├── mcp_server.py           # Native MCP stdio JSON-RPC 2.0 server (6 tools)
│   │   └── main.py                 # FastAPI application root
│   ├── tests/                      # 117 passing Pytest automated test suites
│   └── cli.py                      # Standalone `querycraft` terminal executable
│
├── frontend/                       # Next.js 16.3 + React 19 + TailwindCSS v4 Dashboard
│   ├── app/
│   │   ├── (website)/              # Public landing page & 3-zone documentation portal
│   │   ├── Dashboard/              # Studios: Chat (⌘1), Guard (⌘2), Sandbox (⌘3)
│   │   └── api/                    # Serverless Next.js API route handlers (zero-Python mode)
│   ├── components/                 # UI components, modals, telemetry badges, command palette
│   ├── lib/                        # Serverless LLM driver, database context, sound utilities
│   └── __tests__/                  # 76 passing Jest automated test suites
│
├── extension/                      # Manifest V3 Chrome Extension popup client
└── setup-mcp.sh                    # Universal 1-click MCP configuration script
```

### Dual Backend Modes
1. **Serverless AI Engine (Vercel & Node.js)**: Runs completely within Next.js Route Handlers (`/api/clarification`, `/api/database/explain`, `/api/database/diagnose`) using Llama 3.1 70B Instruct via NVIDIA NIM and the native `pg` driver. **Requires zero Python servers for production deployment.**
2. **Microservice AI Engine (FastAPI & LangGraph)**: Runs as a dedicated Python 3.10+ service using LangGraph state graphs for advanced multi-agent supervision, deep graph-based cost analysis, and CLI/MCP stdio execution.

---

## 4. Primary Interfaces & Developer Tooling

### 4.1. Web Dashboard & Studios

QueryCraft's web dashboard provides dedicated studios accessible via instant keyboard shortcuts:

* **`⌘1` — SQL Doctor & Clarification Chat Studio (`/Dashboard/chat`)**: Multi-turn conversational interface with 1-tap clarification chips, real-time schema sidebar, and live SQL Doctor root-cause diagnosis cards.
* **`⌘2` — Pre-Flight Cost Guard AI Firewall Studio (`/Dashboard/guard`)**: Split-screen telemetry dashboard visualizing baseline compute cost versus remediated cost, 3-tier risk badges (`LOW`, `MEDIUM`, `HIGH`), and 1-click `CREATE INDEX CONCURRENTLY` DDL suggestions.
* **`⌘3` — Multi-Tab SQL Compiler Sandbox (`/Dashboard`)**: Multi-tab SQL editor with syntax highlighting, 1-click SQL formatting, CSV/TSV/JSON data export, monospace cell alignment, and live PostgreSQL EXPLAIN plan inspection.
* **`⌘K` — Raycast/Linear-Style Command Palette**: Instant modal for keyboard-driven navigation across workspaces, database actions, documentation pages, and developer settings.
* **Universal Theme Engine**: Seamless Light, Dark (obsidian surfaces), and System theme switcher synchronized with user preferences and `localStorage`.

### 4.2. Standalone QueryCraft CLI (`querycraft`)

QueryCraft includes a standalone terminal executable for database inspection and query compilation directly from your terminal:

```bash
# 1. Ask plain English questions against your active database
querycraft ask "show total orders by month for completed orders"

# 2. Pre-Flight Cost Guard: analyze cost, risk tier, and missing indexes
querycraft check "SELECT * FROM orders WHERE total_amount > 100;"

# 3. SQL Doctor: diagnose broken queries and database error messages
querycraft doctor "column users.full_name does not exist in SELECT full_name FROM users;"

# 4. Direct read-only query execution with latency timing
querycraft query "SELECT id, email, created_at FROM users LIMIT 10;"

# 5. Schema introspection: display tables, column types, and PK/FK keys
querycraft schema --table orders

# 6. Connect a database connection URI to your workspace
querycraft connect "postgresql://user:password@host:5432/dbname" --workspace Production

# 7. 1-Click universal setup for Cursor, Claude Desktop, Antigravity, and Windsurf
querycraft setup

# 8. Authentication commands (browser-based OAuth login)
querycraft auth login      # Opens browser -> OAuth handshake on port 9876 -> saves token
querycraft auth whoami     # Inspects active token, user email, and workspace
querycraft auth logout     # Securely removes stored credentials

# 9. Workspace management
querycraft workspaces list # Lists configured database workspaces
```

### 4.3. Universal Model Context Protocol (MCP) Server

QueryCraft exposes a native Model Context Protocol (MCP) server over `stdio` (JSON-RPC 2.0). AI agents in **Cursor**, **Claude Desktop**, **Google Antigravity / Gemini**, and **Windsurf** can natively introspect your schema, run pre-flight cost checks, and execute safe queries without leaving the editor.

#### The 6 Native MCP Tools
1. `login_querycraft(email, api_key)`: Binds active user session and workspaces.
2. `list_workspaces()`: Returns all available database workspaces and live connectivity status.
3. `switch_workspace(workspace_name)`: Switches active database context between environments.
4. `evaluate_and_heal_sql(sql_query, cost_threshold)`: Runs EXPLAIN pre-flight check, classifies risk, and automatically repairs errors.
5. `inspect_schema(workspace)`: Returns tables, columns, data types, primary keys, and foreign keys in structured Markdown.
6. `generate_safe_sql(prompt, workspace)`: Compiles plain English to safe SQL with pre-flight risk evaluation.

#### Automatic CLI OAuth Handshake
On startup, the MCP server automatically checks `~/.querycraft/auth.json` (written by `querycraft auth login`). If a valid session token exists, the user is **pre-authenticated immediately**—no manual tool login call is required.

### 4.4. Interactive 3-Zone CLI Documentation Portal

Located at `/docs/cli`, the documentation portal provides a non-scrolling, high-density reference manual:
* **6 Chapters & 17 Modular Pages**: Deep hash navigation (`#ask`, `#check`, `#doctor`, `#setup`, `#mcp-server`, `#env-vars`).
* **3-Zone Layout**: Persistent left sidebar with real-time search, ~780px center reading column, and sticky "On This Page" right TOC.
* **Craft AI Docs Copilot**: Floating conversational documentation guide (`/api/docs-copilot`) answering developer questions directly from grounded reference docs.

### 4.5. Browser Extension (Manifest V3)

A Chrome extension popup located in `extension/` allows developers to connect to PostgreSQL, inspect schemas, and query databases directly from any browser tab.

---

## 5. Quickstart & Setup Runbook

### Prerequisites
* **Node.js 18+** & `npm`
* **Python 3.10+** (if using the CLI or FastAPI microservice)
* **PostgreSQL Database** (Supabase, Neon Serverless, AWS RDS, or local PostgreSQL 12+)
* **NVIDIA NIM API Key** (or OpenAI-compatible LLM endpoint)

---

### Mode A: Complete Full-Stack Web Development (Next.js 16)

This mode runs the entire application—frontend dashboard, studios, and serverless AI engine—without requiring a Python server.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/querycraft.git
   cd querycraft
   ```

2. **Configure Environment Variables**:
   Create `frontend/.env.local`:
   ```env
   # LLM Engine Credentials (NVIDIA NIM or OpenAI-compatible endpoint)
   NVIDIA_API_KEY=your_nvidia_api_key_here
   LLM_BASE_URL=https://integrate.api.nvidia.com/v1
   LLM_MODEL=meta/llama-3.1-70b-instruct

   # Optional: Default Database Connection for Local Testing
   DEFAULT_DATABASE_URI=postgresql://user:password@localhost:5432/dbname
   ```

3. **Install Dependencies & Start Development Server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access QueryCraft**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   * Press `⌘1` for SQL Doctor & Clarification Chat Studio.
   * Press `⌘2` for Pre-Flight Cost Guard AI Firewall Studio.
   * Press `⌘3` for Multi-Tab SQL Compiler Sandbox.
   * Press `⌘K` for Global Command Palette.

---

### Mode B: Microservice Backend (FastAPI + LangGraph)

If you wish to run the LangGraph multi-agent orchestration backend or develop backend features:

1. **Navigate to Backend & Set Up Virtual Environment**:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   # Or with uv:
   # uv sync
   ```

3. **Configure Environment Variables**:
   Create `backend/.env`:
   ```env
   NVIDIA_API_KEY=your_nvidia_api_key_here
   Base_url=https://integrate.api.nvidia.com/v1
   model=meta/llama-3.1-70b-instruct
   QUERYCRAFT_PORT=8000
   ```

4. **Launch the FastAPI Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * API root: `http://127.0.0.1:8000`
   * Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

---

### Mode C: Global CLI & Universal IDE MCP Integration

To connect QueryCraft directly to Cursor, Claude Desktop, Google Antigravity, or your terminal:

1. **Run the 1-Click Installer**:
   From the repository root:
   ```bash
   ./setup-mcp.sh
   ```
   * Automatically resolves your Python virtual environment.
   * Injects MCP configuration into Cursor (`~/.cursor/mcp.json`), Antigravity/Gemini (`~/.gemini/config/mcp_config.json`), and Claude Desktop (`claude_desktop_config.json`).
   * Installs the global `querycraft` CLI to `~/.local/bin/querycraft`.

2. **Ensure `~/.local/bin` is on your PATH**:
   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Authenticate Once via Browser OAuth**:
   ```bash
   querycraft auth login
   ```
   Your browser will open to complete the authentication handshake. Upon completion, a session token is securely written to `~/.querycraft/auth.json`.

4. **Verify Active Session**:
   ```bash
   querycraft auth whoami
   ```

---

### Mode D: Chrome Browser Extension

1. Open Google Chrome (or any Chromium browser: Brave, Edge, Arc).
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `extension/` directory from this repository.
5. Click the **QueryCraft** icon in your browser toolbar to connect to your PostgreSQL database.

---

## 6. Security, Privacy & Zero-Leak Guarantees

QueryCraft was engineered from day one to operate safely alongside production databases:

* **Strict Read-Only Enforcement (`SET TRANSACTION READ ONLY`)**: Every execution connection explicitly runs inside a read-only transaction block. Mutating statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`) are blocked by both pre-execution AST parsing and kernel-level PostgreSQL transaction semantics.
* **Hard 8000ms Statement Timeouts**: Every database session sets `SET statement_timeout = 8000;`. Long-running queries or accidental table locks are terminated within 8 seconds.
* **Zero Secret Telemetry**: Database credentials and connection URIs are stored in memory or in your local filesystem. Connection strings are never sent to third-party telemetry, analytics, or external servers.
* **Secure Local Token Permissions**: CLI OAuth tokens in `~/.querycraft/auth.json` are written with owner-only permissions:
  ```bash
  chmod 700 ~/.querycraft
  chmod 600 ~/.querycraft/auth.json
  ```
* **Credential Masking in Logs & EXPLAIN**: Passwords, auth tokens, and sensitive connection parameters are automatically sanitized in stdout and MCP logs.
* **RFC-Compliant Test Sandboxes**: Internal demo sandboxes utilize RFC 2606 / RFC 6761 non-routable `.internal` domains, preventing accidental network routing while passing secret-scanning audits.

---

## 7. Automated Testing & Verification

QueryCraft maintains full test suites covering both the Python microservice and the Next.js frontend:

```bash
# Run Frontend Test Suite (76 passing tests across 12 suites)
cd frontend
npm test -- --watchAll=false

# Run Backend Test Suite (117 passing tests across 11 suites)
cd backend
uv run pytest -q
# Or with standard pytest:
# pytest -q
```

### Verified Test Coverage
* **Clarification Endpoint & Multi-Turn State**: `test_api_clarification.py`
* **CLI OAuth Handshake & Token Verification**: `test_cli_auth.py`
* **Pre-Flight Cost Guard & LangGraph Firewall**: `test_cost_guard.py`
* **PostgreSQL Connection, Introspection & Sampling**: `test_db_service.py`
* **Workflow Graph Nodes & State Transitions**: `test_graph_nodes.py`
* **SQL Doctor Critic & SQLSTATE Self-Healing**: `test_healing_service.py`
* **MCP Server Native Tools (JSON-RPC 2.0 stdio)**: `test_mcp_server.py`
* **SQL Safety Invariants & Injection Protection**: `test_sql_safety.py`
* **Multi-Workspace Isolation & Local Persistence**: `test_workspace_service.py`
* **Frontend React Components & Context Providers**: `frontend/__tests__/`

---

## 8. Contributing, RFC Process & Expressing New Ideas

We welcome contributions from database engineers, AI researchers, and developers! Whether you are proposing a new feature, optimizing cost estimation algorithms, or fixing a bug, here is how to get involved:

### Expressing New Ideas via RFCs

For significant architectural changes, new database engine drivers, or alterations to the safety and critic loops, we use a **Request for Comments (RFC)** process:

1. **Check Existing Discussions**: Visit [GitHub Discussions](https://github.com/your-username/querycraft/discussions) to see if your idea is already being explored.
2. **Submit an RFC Proposal**: Create an issue using the `RFC: Proposal` template outlining:
   * **The Problem**: What limitation or use-case is not addressed?
   * **Theoretical / Technical Design**: How should the solution be modeled mathematically or architecturally?
   * **Safety & Invariant Impact**: Does the proposal uphold the strict Read-Only and zero-credential-leak guarantees?
   * **Backward Compatibility**: How does this impact existing CLI commands, MCP tools, and Web Studios?
3. **Community Review**: Maintainers and community members will provide feedback, iterate on the design, and vote on adoption.

### Contribution Workflow

1. **Fork the Repository**: Create a fork of `querycraft` on GitHub.
2. **Create a Topic Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
3. **Set Up Local Environment**: Follow the [Quickstart Runbook](#5-quickstart--setup-runbook) to configure both `frontend/` and `backend/`.
4. **Make Your Changes**: Adhere to our coding standards.
5. **Run All Automated Tests**: Ensure all 117 backend tests and 76 frontend tests pass cleanly before opening a PR:
   ```bash
   cd frontend && npm test -- --watchAll=false
   cd ../backend && pytest -q
   ```
6. **Submit a Pull Request**: Provide a clear description of your changes, reference any related issues or RFCs, and include screenshots for UI updates.

### Coding Standards & Invariants

* **Safety Invariant is Non-Negotiable**: Under no circumstances will a PR be merged that relaxes `SET TRANSACTION READ ONLY`, bypasses AST mutation filters, or introduces mutating DDL/DML capabilities into the query execution path.
* **Type Annotations**: Python code must include complete type hints (`typing.Dict`, `Optional`, `Union`, etc.) and adhere to PEP 8.
* **React 19 & TailwindCSS v4 Tokens**: Frontend code must use standard React functional components with clean hooks and semantic design tokens (`bg-sidebar`, `text-foreground`, etc.). Avoid hardcoded arbitrary color values.
* **MCP Stdio Hygiene**: In `backend/app/mcp_server.py`, never print to `stdout` (`print()`). All logging must be routed exclusively to `sys.stderr` to avoid corrupting the JSON-RPC 2.0 transport frame.

### Responsible Security Vulnerability Disclosure

If you discover a potential security vulnerability, query leakage vector, or injection bypass in QueryCraft, **please do not open a public GitHub issue**. Instead, report it responsibly:

* Email the security team directly at: `security@querycraft.internal` (or reach out via GitHub Security Advisories).
* Include detailed reproduction steps and an example query payload.
* We acknowledge reports within 24 hours and coordinate patch verification prior to public disclosure.

---

<p align="center">
  Built with precision by the <strong>QueryCraft</strong> Core Team.<br/>
  <em>Guarding production databases with AI-powered mathematical rigor.</em>
</p>
