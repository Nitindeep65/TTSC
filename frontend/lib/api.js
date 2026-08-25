import axios from "axios"

/**
 * Centralized API Base URL extracted from Next.js environment variables.
 * Falls back to local FastAPI development server at http://127.0.0.1:8000.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

/**
 * Configured Axios instance with Base URL and standard headers.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// ============================================================================
// 1. CLARIFICATION & MULTI-AGENT COMPILER APIs
// ============================================================================
export const clarificationApi = {
  /**
   * Compiles natural language queries using LangGraph StateGraph with clarification loop.
   * @param {{ user_prompt: string, session_history?: Array, live_schema?: string, connection_uri?: string }} payload
   */
  compileQuery: async ({
    user_prompt,
    session_history = [],
    live_schema = null,
    connection_uri = null,
  }) => {
    const res = await apiClient.post("/api/clarification/", {
      user_prompt,
      session_history,
      live_schema,
      connection_uri,
    })
    return res.data
  },

  /**
   * Fetches introspected live schema DDL definitions for the active database.
   * @param {string} [connection_uri]
   */
  getSchema: async (connection_uri = null) => {
    const params = connection_uri ? { connection_uri } : {}
    const res = await apiClient.get("/api/clarification/schema", { params })
    return res.data
  },
}

// ============================================================================
// 2. DATABASE INTROSPECTION, EXECUTION & PROFILING APIs
// ============================================================================
export const databaseApi = {
  /**
   * Introspects cloud PostgreSQL or MongoDB database and retrieves schema catalog.
   * @param {string} connection_uri
   */
  connect: async (connection_uri) => {
    const res = await apiClient.post("/api/database/connect", {
      connection_uri: connection_uri.trim(),
    })
    return res.data
  },

  /**
   * Executes a safe, read-only SQL query or MongoDB aggregation pipeline with self-healing critic.
   * @param {{ connection_uri: string, sql_query: string, limit?: number, auto_heal?: boolean, user_prompt?: string, live_schema?: string }} payload
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
   * @param {{ connection_uri: string, sql_query: string }} payload
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
   * @param {{ connection_uri: string, table_name: string, limit?: number }} payload
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
   * @param {{ error_message: string, failing_sql?: string, live_schema?: string, user_prompt?: string }} payload
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
// 3. SEMANTIC LAYER & BUSINESS RULES APIs
// ============================================================================
export const semanticApi = {
  /**
   * Retrieves list of custom business KPI metrics.
   */
  getMetrics: async () => {
    const res = await apiClient.get("/api/semantic/metrics")
    return res.data
  },

  /**
   * Saves a new custom metric definition.
   * @param {{ name: string, definition: string, sql_formula?: string, category?: string, tags?: Array<string> }} payload
   */
  createMetric: async (payload) => {
    const res = await apiClient.post("/api/semantic/metrics", payload)
    return res.data
  },

  /**
   * Deletes a metric by ID.
   * @param {string} id
   */
  deleteMetric: async (id) => {
    const res = await apiClient.delete(`/api/semantic/metrics/${id}`)
    return res.data
  },

  /**
   * Teaches AI a new business KPI rule from plain natural language instruction.
   * @param {{ instruction: string }} payload
   */
  teachAI: async ({ instruction }) => {
    const res = await apiClient.post("/api/semantic/teach", { instruction })
    return res.data
  },

  /**
   * Ingests policy document or markdown and extracts KPI metrics.
   * @param {{ title: string, content: string }} payload
   */
  uploadPolicy: async ({ title, content }) => {
    const res = await apiClient.post("/api/semantic/upload-policy", {
      title,
      content,
    })
    return res.data
  },
}

// ============================================================================
// 4. MEMORY & NOTEBOOK SNIPPETS APIs
// ============================================================================
export const memoryApi = {
  /**
   * Retrieves gold-standard verified query memory pairs.
   */
  getVerified: async () => {
    const res = await apiClient.get("/api/memory/verified")
    return res.data
  },

  /**
   * Persists a query-SQL pair into few-shot verified memory.
   * @param {{ user_prompt: string, verified_sql: string, tables?: Array<string>, explanation?: string, tags?: Array<string> }} payload
   */
  verifyQuery: async (payload) => {
    const res = await apiClient.post("/api/memory/verify", payload)
    return res.data
  },

  /**
   * Retrieves saved query notebook snippets.
   */
  getNotebook: async () => {
    const res = await apiClient.get("/api/memory/notebook")
    return res.data
  },

  /**
   * Saves a query snippet to the team notebook.
   * @param {{ title: string, user_prompt: string, sql_query: string, tags?: Array<string>, database_host?: string }} payload
   */
  saveNotebook: async (payload) => {
    const res = await apiClient.post("/api/memory/notebook", payload)
    return res.data
  },

  /**
   * Deletes a notebook snippet by ID.
   * @param {string} id
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
    const res = await apiClient.get("/api/settings/")
    return res.data
  },

  /**
   * Updates settings with patch object.
   * @param {Object} patch
   */
  updateSettings: async (patch) => {
    const res = await apiClient.post("/api/settings/", patch)
    return res.data
  },

  /**
   * Increments usage counters (queries, heals, verified).
   * @param {string} field
   */
  incrementUsage: async (field) => {
    const res = await apiClient.post(`/api/settings/usage/increment?field=${encodeURIComponent(field)}`)
    return res.data
  },

  /**
   * Resets all settings to default.
   */
  resetSettings: async () => {
    const res = await apiClient.delete("/api/settings/reset")
    return res.data
  },

  /**
   * Pings the API server to test health and measure latency.
   * @param {string} [customUrl]
   */
  pingHealth: async (customUrl = null) => {
    const targetUrl = customUrl ? customUrl.replace(/\/$/, "") : API_BASE_URL
    const start = performance.now()
    const res = await axios.get(`${targetUrl}/`, { timeout: 5000 })
    const latency = Math.round(performance.now() - start)
    return { ok: res.status === 200, latency, message: res.data?.message }
  },
}

const api = {
  API_BASE_URL,
  apiClient,
  clarificationApi,
  databaseApi,
  semanticApi,
  memoryApi,
  settingsApi,
}

export default api
