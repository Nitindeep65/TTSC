# QueryCraft — Universal SQL & NoSQL Query & Clarification Engine

An AI-powered multi-engine database clarification engine, query client, and schema analyzer designed for **Relational SQL** (PostgreSQL, MySQL, Supabase, Neon, AWS RDS) and **NoSQL / Document & Key-Value databases** (MongoDB Atlas, DynamoDB, Redis).

---

## 1. What Problem Does It Solve?

Traditional Text-to-SQL and Text-to-NoSQL tools suffer from several critical shortcomings:

* **Ambiguity & Blind Assumptions**: When given vague requests (e.g., *"Show top customers"*), standard AI models guess timeframes, metrics, and filters without asking, leading to inaccurate queries and faulty business decisions.
* **Schema & Collection Hallucinations**: General LLMs often invent non-existent table names, MongoDB document fields, or misuse database-specific data types (`UUID`, `TIMESTAMPTZ`, `JSONB`, `NUMERIC`, BSON types).
* **Runtime Failures & Broken Pipelines**: When generated queries fail due to missing `GROUP BY` clauses, syntax errors, or invalid MongoDB `$lookup`/`$unwind` aggregation stages, users are left with raw error traces.
* **Dangerous Runaway Queries & Unindexed Scans**: Unconstrained queries can trigger heavy sequential scans, memory spikes, or cloud egress costs on production databases without warning.
* **Missing Business Context**: Standard models lack domain-specific business definitions (e.g., how your organization defines an *"active subscription"* or calculates *"net revenue"*).

**QueryCraft solves these issues** by introducing conversational clarification before query generation, live SQL & NoSQL schema grounding, an automated self-healing critic loop, query performance analysis (EXPLAIN cost estimation), and a customizable semantic layer.

---

## 2. What Is It Used For?

QueryCraft is used to translate natural language into safe, production-grade SQL and NoSQL queries and execute them with confidence across cloud and local databases.

### Supported Databases:
* **Relational SQL**: PostgreSQL, MySQL, Supabase, Neon Serverless, AWS RDS, Aurora
* **Document & NoSQL**: MongoDB Atlas, Amazon DynamoDB, DocumentDB
* **Key-Value & In-Memory**: Redis, Upstash

### Key Capabilities:
* **Conversational Clarification Engine**: Detects missing parameters (date ranges, status filters, aggregation methods, target dialect) and prompts the user with targeted questions before generating code.
* **Zero-Hallucination Schema Grounding**: Introspects live SQL database schemas and NoSQL collections to ensure queries reference only valid schema entities.
* **Self-Healing Critic Loop ("SQL & MQL Doctor")**: Intercepts runtime execution errors, diagnoses root causes via an LLM critic agent, and automatically repairs the query.
* **Performance Guard & Index Advisor**: Performs dry-run query cost estimations, identifies sequential table scans, and recommends optimal indexing.
* **Cross-Engine Semantic Layer**: Allows teams to define custom KPI metrics, business glossary rules, or extract rules directly from policy documents.
* **Few-Shot Verified Memory & Notebook**: Stores verified "gold standard" queries to guide future AI generations and saves team snippets in an organized notebook.
* **Dual Interface Support**:
  * **Browser Extension (Manifest V3)**: Query databases directly from any browser tab via a sleek popup client.
  * **Web Application (Next.js)**: Full-featured web dashboard for team collaboration and query management.

---

## 3. How to Use It

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & `npm`
* **Supported Database** (PostgreSQL, MySQL, Supabase, Neon, AWS RDS, MongoDB, or Redis)
* **NVIDIA NIM API Key** (or compatible OpenAI-compatible LLM endpoint)

---

### Step 1: Start the Backend Service

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # Or if using uv:
   # uv sync
   ```

4. Configure your `.env` file in the `backend/` directory:
   ```env
   NVIDIA_API_KEY=your_nvidia_api_key_here
   model=meta/llama-3.1-70b-instruct
   Base_url=https://integrate.api.nvidia.com/v1
   ```

5. Run the FastAPI backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be available at `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).

---

### Step 2: Use the Chrome Extension (Option A)

1. Open Google Chrome (or any Chromium browser: Brave, Edge, Arc).
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `extension/` folder from this repository.
5. Click the **QueryCraft** icon in your browser toolbar to open the extension.
6. Enter your PostgreSQL or MongoDB connection string to connect to your database and start querying.

---

### Step 3: Use the Web Application (Option B)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

### Step 4: Querying Workflow

1. **Connect Database**: Provide your database connection URI (e.g. `postgresql://...` or `mongodb+srv://...`). The engine automatically introspects your schemas and collections.
2. **Ask in Natural Language**: Type your question (e.g., *"What were the top selling products last month?"* or *"Calculate revenue from nested order items in MongoDB"*).
3. **Clarify (if prompted)**: If details like status filters or date boundaries are missing, answer the engine's targeted clarification question.
4. **Inspect & Execute**: Review the generated SQL or MongoDB MQL aggregation pipeline, view the estimated EXPLAIN cost / index recommendations, and run the query to see tabular or visual chart results.
