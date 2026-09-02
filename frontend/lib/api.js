import axios from "axios"

/**
 * Intelligent dynamic API Base URL resolution.
 * - If NEXT_PUBLIC_API_URL is configured (e.g. deployed backend URL), uses it.
 * - If running in browser in production (e.g. *.vercel.app), uses relative "" to route through Vercel.
 * - If running locally (localhost / 127.0.0.1), uses http://127.0.0.1:8000.
 */
export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    // If running in production cloud deployment (not localhost)
    if (host !== "localhost" && host !== "127.0.0.1" && host !== "0.0.0.0") {
      return ""
    }
  }
  return "http://127.0.0.1:8000"
}

export const API_BASE_URL = getApiBaseUrl()

/**
 * Configured Axios instance with dynamic Base URL and standard headers.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000,
})

// Dynamic baseURL interceptor for runtime environment adaptation
if (apiClient && apiClient.interceptors && apiClient.interceptors.request) {
  apiClient.interceptors.request.use((config) => {
    if (!config.baseURL || config.baseURL === "http://127.0.0.1:8000") {
      config.baseURL = getApiBaseUrl()
    }
    return config
  })
}

// ============================================================================
// DEFAULT FALLBACK DATA (For offline or Vercel preview environments)
// ============================================================================
const DEFAULT_FALLBACK_SCHEMA = [
  {
    table_name: "users",
    description: "Registered user accounts and credentials",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "email", type: "VARCHAR(255)" },
      { name: "name", type: "VARCHAR(100)" },
      { name: "role", type: "VARCHAR(50)" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    table_name: "products",
    description: "Catalog items available for purchase",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "category", type: "VARCHAR(100)" },
      { name: "price", type: "NUMERIC(10,2)" },
      { name: "stock_quantity", type: "INTEGER" },
      { name: "is_available", type: "BOOLEAN" },
    ],
  },
  {
    table_name: "orders",
    description: "Customer transactions and purchase orders",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "user_id", type: "UUID", is_foreign_key: true },
      { name: "total_amount", type: "NUMERIC(12,2)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
]

const DEFAULT_FALLBACK_METRICS = [
  {
    id: "active_churn",
    name: "Active Churn Rate",
    definition: "Percentage of users who canceled without renewal in the last 30 days",
    sql_formula: "COUNT(CASE WHEN status = 'churned' THEN 1 END) * 100.0 / COUNT(*)",
    category: "revenue",
    tags: ["churn", "retention"],
  },
  {
    id: "net_mrr",
    name: "Net MRR",
    definition: "Monthly Recurring Revenue minus churned and downgraded accounts",
    sql_formula: "SUM(CASE WHEN status = 'active' THEN mrr_amount ELSE 0 END)",
    category: "finance",
    tags: ["revenue", "mrr", "finance"],
  },
]

const DEFAULT_FALLBACK_SETTINGS = {
  account: { displayName: "QueryCraft User", email: "demo@querycraft.dev", plan: "free" },
  preferences: { theme: "dark", fontSize: "12", compactOnStart: false, autoFocus: true },
  shortcuts: {},
  apiBase: "http://127.0.0.1:8000",
  usage: { queries: 0, heals: 0, verified: 0 },
}

// ============================================================================
// 1. CLARIFICATION & MULTI-AGENT COMPILER APIs
// ============================================================================
export const clarificationApi = {
  /**
   * Compiles natural language queries using LangGraph StateGraph with clarification loop.
   */
  compileQuery: async ({
    user_prompt,
    session_history = [],
    live_schema = null,
    connection_uri = null,
  }) => {
    try {
      const res = await apiClient.post("/api/clarification", {
        user_prompt,
        session_history,
        live_schema,
        connection_uri,
      })
      return res.data
    } catch (err) {
      if (!err.response) {
        return {
          status: "error",
          message:
            "Backend server is offline or unreachable. If deployed on Vercel, please set NEXT_PUBLIC_API_URL in your Vercel Project Settings > Environment Variables to your backend URL (e.g., https://your-backend.onrender.com or Railway).",
          extracted_data: null,
        }
      }
      throw err
    }
  },

  /**
   * Fetches introspected live schema DDL definitions for the active database.
   */
  getSchema: async (connection_uri = null) => {
    try {
      const params = connection_uri ? { connection_uri } : {}
      const res = await apiClient.get("/api/clarification/schema", { params })
      return res.data
    } catch (err) {
      // Graceful fallback for offline / disconnected environments
      return {
        database_type: "Cloud PostgreSQL (Supabase / Neon / AWS RDS)",
        tables: DEFAULT_FALLBACK_SCHEMA,
      }
    }
  },
}

// ============================================================================
// 2. DATABASE INTROSPECTION, EXECUTION & PROFILING APIs
// ============================================================================
export const databaseApi = {
  /**
   * Introspects cloud PostgreSQL or MongoDB database and retrieves schema catalog.
   */
  connect: async (connection_uri) => {
    const res = await apiClient.post("/api/database/connect", {
      connection_uri: connection_uri.trim(),
    })
    return res.data
  },

  /**
   * Executes a safe, read-only SQL query or MongoDB aggregation pipeline with self-healing critic.
   */
  execute: async ({
    connection_uri,
    sql_query,
    limit = 50,
    auto_heal = true,
    user_prompt = null,
    live_schema = null,
  }) => {
    const res = await apiClient.post("/api/database/execute", {
      connection_uri: connection_uri.trim(),
      sql_query,
      limit,
      auto_heal,
      user_prompt,
      live_schema,
    })
    return res.data
  },

  /**
   * Runs EXPLAIN plan cost estimation and generates CREATE INDEX recommendations.
   */
  explain: async ({ connection_uri, sql_query }) => {
    const res = await apiClient.post("/api/database/explain", {
      connection_uri: connection_uri?.trim() || "",
      sql_query,
    })
    return res.data
  },

  /**
   * Fetches 5-row live sample data preview and categorical column enum distributions.
   */
  sample: async ({ connection_uri = "", table_name, limit = 5 }) => {
    const res = await apiClient.post("/api/database/sample", {
      connection_uri: connection_uri ? connection_uri.trim() : "",
      table_name,
      limit,
    })
    return res.data
  },

  /**
   * SQL Doctor standalone runtime error diagnosis and self-healing.
   */
  diagnose: async ({
    error_message,
    failing_sql = null,
    live_schema = null,
    user_prompt = null,
  }) => {
    const res = await apiClient.post("/api/database/diagnose", {
      error_message,
      failing_sql,
      live_schema,
      user_prompt,
    })
    return res.data
  },
}

// ============================================================================
// 2.5 USER WORKSPACES & MULTI-TENANT SYNC APIs
// ============================================================================
export const workspaceApi = {
  /**
   * Retrieves all workspaces for a user account.
   */
  list: async (user_email = null) => {
    try {
      const url = user_email ? `/api/workspaces?email=${encodeURIComponent(user_email)}` : "/api/workspaces"
      const res = await apiClient.get(url)
      return res.data
    } catch {
      return []
    }
  },

  /**
   * Synchronizes full workspace array from browser to backend for active user.
   */
  sync: async ({ email, user_id, workspaces }) => {
    try {
      const res = await apiClient.post("/api/workspaces/sync", {
        email: email || "default_user",
        user_id,
        workspaces,
      })
      return res.data
    } catch (err) {
      console.warn("Workspace sync warning:", err?.message)
      return null
    }
  },

  /**
   * Connects and binds a live database URI to a user workspace.
   */
  connect: async ({ email, user_id, workspace_id, connection_uri }) => {
    const res = await apiClient.post("/api/workspaces/connect", {
      email: email || "default_user",
      user_id,
      workspace_id,
      connection_uri,
    })
    return res.data
  },
}

// ============================================================================
// 3. SEMANTIC LAYER APIs — MVP DISABLED
// Semantic layer KPI glossary is postponed for post-MVP.
// Re-enable by un-commenting and restoring /api/semantic routes in the FastAPI backend.
// ============================================================================
// export const semanticApi = { getMetrics, createMetric, deleteMetric, teachAI, uploadPolicy }

// ============================================================================
// 4. MEMORY & NOTEBOOK SNIPPETS APIs
// ============================================================================
export const memoryApi = {
  /**
   * Retrieves gold-standard verified query memory pairs.
   */
  getVerified: async () => {
    try {
      const res = await apiClient.get("/api/memory/verified")
      return res.data
    } catch {
      return []
    }
  },

  /**
   * Persists a query-SQL pair into few-shot verified memory.
   */
  verifyQuery: async (payload) => {
    const res = await apiClient.post("/api/memory/verify", payload)
    return res.data
  },

  /**
   * Retrieves saved query notebook snippets.
   */
  getNotebook: async () => {
    try {
      const res = await apiClient.get("/api/memory/notebook")
      return res.data
    } catch {
      return []
    }
  },

  /**
   * Saves a query snippet to the team notebook.
   */
  saveNotebook: async (payload) => {
    const res = await apiClient.post("/api/memory/notebook", payload)
    return res.data
  },

  /**
   * Deletes a notebook snippet by ID.
   */
  deleteNotebook: async (id) => {
    const res = await apiClient.delete(`/api/memory/notebook/${id}`)
    return res.data
  },
}

// ============================================================================
// 5. SETTINGS & SYNCHRONIZATION APIs
// ============================================================================
export const settingsApi = {
  /**
   * Retrieves shared user settings, shortcuts, and query usage statistics.
   */
  getSettings: async () => {
    try {
      const res = await apiClient.get("/api/settings")
      return res.data
    } catch {
      return DEFAULT_FALLBACK_SETTINGS
    }
  },

  /**
   * Updates settings with patch object.
   */
  updateSettings: async (patch) => {
    try {
      const res = await apiClient.post("/api/settings", patch)
      return res.data
    } catch {
      return patch
    }
  },

  /**
   * Increments usage counters (queries, heals, verified).
   */
  incrementUsage: async (field) => {
    try {
      const res = await apiClient.post(
        `/api/settings/usage/increment?field=${encodeURIComponent(field)}`
      )
      return res.data
    } catch {
      return { status: "ok", field }
    }
  },

  /**
   * Resets all settings to default.
   */
  resetSettings: async () => {
    try {
      const res = await apiClient.delete("/api/settings/reset")
      return res.data
    } catch {
      return DEFAULT_FALLBACK_SETTINGS
    }
  },

  /**
   * Pings the API server to test health and measure latency.
   */
  pingHealth: async (customUrl = null) => {
    try {
      const targetUrl = customUrl
        ? customUrl.replace(/\/$/, "")
        : getApiBaseUrl() || ""
      const start = performance.now()
      const res = await axios.get(`${targetUrl}/`, { timeout: 5000 })
      const latency = Math.round(performance.now() - start)
      return { ok: res.status === 200, latency, message: res.data?.message }
    } catch (e) {
      return { ok: false, latency: 0, message: "Backend offline" }
    }
  },
}

// ============================================================================
// 6. DASHBOARD ARCHITECT APIs — MVP DISABLED
// BI Dashboard Canvas is out of MVP scope. Re-enable by restoring dashboardApi
// and re-enabling app.include_router(dashboard.router) in backend/app/main.py.
// ============================================================================
// export const dashboardApi = { generateDashboard, getTemplates }

const api = {
  API_BASE_URL,
  getApiBaseUrl,
  apiClient,
  clarificationApi,
  databaseApi,
  workspaceApi,
  memoryApi,
  settingsApi,
  // MVP Disabled: dashboardApi, semanticApi
}

export default api
