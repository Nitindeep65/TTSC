# QueryCraft — Universal SQL & NoSQL Query, Clarification & Optimization Engine
## Project Context & Architecture Reference for AI Agents (`agent.md`)

> **Repository**: `TTS` (Text-To-SQL / Text-To-NoSQL Engine)  
> **Brand / Product Name**: **QueryCraft**  
> **Version**: `1.2.0` (Vercel Serverless Ready + Native `pg` Driver + Multi-Device Responsive)  
> **Primary Interfaces**: Next.js Web Dashboard & Manifest V3 Chrome Extension (Spotlight Copilot)  
> **Dual AI Backend Support**: 
>   1. **Serverless AI Engine**: Next.js Route Handlers (`serverLlm.js` + `dbDriver.js`) with Llama 3.1 70B Instruct via NVIDIA NIM & native `pg` driver.
>   2. **Microservice Backend**: FastAPI (Python 3.10+) + LangGraph Multi-Agent Orchestration + `psycopg2` / `pymongo`.  
> **Supported Engines**: PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB), MySQL, MongoDB Atlas, Amazon DynamoDB, Redis/Upstash  

---

## 1. Executive Summary & Architecture Highlights

QueryCraft is a production-grade AI query engine featuring:
* **Serverless Direct Execution on Vercel**: Llama 3.1 70B Instruct via NVIDIA NIM running in serverless edge/Node route handlers with zero-hallucination live schema grounding.
* **Native PostgreSQL Driver (`pg`)**: Live PostgreSQL introspection (`information_schema.tables`, `columns`, foreign keys, synthetic DDL generation) and direct read-only query execution returning live database rows.
* **Conversational Clarification Loop**: Intelligently compiles direct retrieval queries (`SELECT ... LIMIT 50;`) immediately, while pausing for 1-tap interactive reply chips on ambiguous multi-dimensional analytical requests.
* **Multi-Device Responsive Studio**: Responsive across Mobile (320px–640px), Tablets (640px–1024px), Small Laptops / MacBooks (1024px–1280px), and Large Displays (1440px+) with slide-over schema drawer and dynamic viewport heights.
* **SQL & MQL Doctor**: Self-healing critic agent diagnosing SQLSTATE codes (`42703`, `42P01`, `22P02`, `42803`) and repairing failing queries.
* **Manifest V3 Chrome Extension**: Spotlight Copilot overlay (`Cmd + Shift + K`) with bidirectional settings & query notebook synchronization.
* **Automated Verification**: 7/7 passing test suites (36 tests) and clean Next.js production builds.
