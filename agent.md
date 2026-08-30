# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Project Context & Architecture Reference for AI Agents (`agent.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.5.0` (Production Hardened · Autonomous Dashboard Architect · Canvas Mode · Global Command Palette · Multi-Workspace · Quotas & Billing)  
> **Primary Interfaces**: Next.js 16 Web Dashboard & Manifest V3 Chrome Extension (Spotlight Copilot)  
> **Dual AI Backend Support**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver.
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Supervisor Orchestration + `psycopg2` / `pymongo`.  
> **Supported Engines**: PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB), MySQL, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Architecture Highlights

QueryCraft is an enterprise-grade AI database platform and natural language query engine that bridges raw database schemas and business analytics through structured multi-agent workflows:

* **Dual AI Execution Architecture**:
  - **Serverless Direct Mode (Vercel & Node.js)**: Runs inside Next.js Route Handlers (`/api/clarification`, `/api/database/*`, `/api/dashboard/*`) powered by NVIDIA NIM Llama 3.1 70B Instruct and native `pg` driver. Zero Python server required for deployment.
  - **LangGraph Microservice Mode (FastAPI)**: Python multi-agent StateGraph orchestrating supervisor planning, parallel worker generation, critic self-healing loops, and memory RAG.
* **Autonomous Dashboard Architect & Canvas Mode (`/Dashboard/canvas`)**:
  - Supervisor Planner decomposes high-level business goals into 4 parallel query streams (*Primary Trend*, *Cohort Distribution*, *Leaderboard*, *Status Breakdown*).
  - Multi-Agent Pipeline DAG Flow with live visual execution telemetry.
  - Handcrafted SVG charts (Bar, Line, Pie, Area, Table), inline metric sparklines, independent widget controls, and CSV export.
* **Interactive Clarification Chat Studio (`/Dashboard/chat`)**:
  - Evaluates ambiguity and pauses for **1-tap reply chips** before compilation on multi-dimensional requests, while executing direct queries immediately.
  - Multi-chip selection with confirmation badge.
  - Self-Healing **SQL Doctor Critic** diagnosing SQLSTATE codes (`42703`, `42P01`, `22P02`, `42803`) with auto-remediation.
* **Query Execution Sandbox (`/Dashboard`)**:
  - 1-tap `[ Compile & Execute ]` (`⌘Enter`) workflow.
  - JetBrains Mono monospace editor with syntax contrast and inline EXPLAIN cost planner.
  - Tabular numeral data grids with column drag-resize handles.
* **Global Command Palette (`⌘K` / `Ctrl+K`)**:
  - Linear/Raycast-inspired modal navigation across views, live schema tables, recent queries, workspaces, and engine settings.
* **Universal Database Connectors & Safety Rails**:
  - Fast Single URI mode + Structured Parameter Builder with password auto-encoder (`#`, `@`, `/`).
  - Strict read-only enforcement (`SET TRANSACTION READ ONLY`), 8000ms statement timeouts, and default `LIMIT 50` clamps.
  - Pre-configured RFC `.internal` sandboxes (E-Commerce, SaaS Billing, MongoDB IoT).
* **Cross-Engine Semantic KPI Layer & Policy Ingestion**:
  - Custom glossary metrics with RAG matching, conversational "Teach AI", and automated policy document extraction.
* **Chrome Extension Spotlight Copilot (`Cmd+Shift+K`)**:
  - Manifest V3 Shadow DOM overlay with bi-directional workspace and settings synchronization.
* **Automated Verification**:
  - **Frontend**: 11/11 passing Jest test suites (73 tests).
  - **Backend**: 83/83 passing Pytest test suites.
  - **Build**: Next.js 16.3 Turbopack compiles all 19 routes cleanly with zero static errors.

---

## 2. Monorepo Quick Reference

```
TTS/
├── frontend/                       # Next.js 16.3 + React 19 + TailwindCSS v4
│   ├── app/
│   │   ├── (auth)/Login, Register  # Centered card auth backdrop
│   │   ├── (website)/Dashboard/
│   │   │   ├── page.jsx            # Compiler Studio
│   │   │   ├── chat/Chatbox.jsx    # Clarification Studio
│   │   │   ├── canvas/page.jsx     # Canvas Studio & Supervisor Orchestration
│   │   │   ├── layout.jsx          # 3-Zone Header, ⌘1/⌘2/⌘3 hotkeys, DB status
│   │   │   └── slidebar.jsx        # 2-Tab Sidebar (Nav/Recents vs Schema Explorer)
│   │   ├── api/                    # Serverless API routes (clarification, database, dashboard, semantic, settings)
│   │   ├── components/
│   │   │   ├── canvas/             # DashboardCanvas & PipelineExecutionFlow
│   │   │   ├── database/           # ConnectDatabaseModal & TableDataProfilerModal
│   │   │   ├── extension/          # ExtensionPromptModal
│   │   │   ├── onboarding/         # OnboardingModal & SpotlightTour
│   │   │   ├── semantic/           # MetricGlossaryModal
│   │   │   ├── settings/           # SettingsPanel (8 tabs, quotas, billing)
│   │   │   ├── shell/              # CommandPalette (⌘K)
│   │   │   └── visualization/      # DataVisualizer (Handcrafted SVG charts)
│   │   └── lib/                    # serverLlm, dbDriver, api, databaseContext, authContext, soundUtils
│   └── __tests__/                  # 11 Jest test suites (73 tests passed)
│
├── backend/                        # FastAPI Python 3.10+ Microservice
│   ├── app/
│   │   ├── routers/                # clarification, database, dashboard, memory, semantic, settings
│   │   ├── services/               # sql_graph, db_service, explain_service, healing_service, dashboard_service
│   │   └── Models/schema.py        # Pydantic data schemas
│   └── tests/                      # 83 Pytest tests passed
│
├── extension/                      # Manifest V3 Chrome Extension (Spotlight Copilot)
└── docs/                           # Architecture specs & UI/UX audit reports
```

---

## 3. Developer Runbook

### Start Web Application (Vercel Serverless Mode)
```bash
cd frontend
npm run dev
# Dashboard at http://localhost:3000
```

### Run Test Suites
```bash
# Frontend Jest Suites (73 tests)
cd frontend && npm test

# Backend Pytest Suites (83 tests)
cd backend && uv run pytest
```

### Build Production Bundle
```bash
cd frontend && npm run build
# Compiles all 19 static/dynamic routes with Turbopack
```
