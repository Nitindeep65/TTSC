// QueryCraft — Universal SQL & NoSQL Studio Extension
// Robust, Production-Ready Client with Bidirectional Sync & Zero-Bug Handlers
// ═══════════════════════════════════════════════════════════════════════════════

let API_BASE = "http://127.0.0.1:8000"

const STORAGE_KEY_PROFILES = "querycraft_db_profiles_v4"
const STORAGE_KEY_ACTIVE_ID = "querycraft_active_db_id_v4"
const STORAGE_KEY_SHORTCUTS = "querycraft_shortcuts_v1"
const STORAGE_KEY_PREFS = "querycraft_prefs_v1"
const STORAGE_KEY_ACCOUNT = "querycraft_account_v1"
const STORAGE_KEY_USAGE = "querycraft_usage_v1"
const STORAGE_KEY_API_BASE = "querycraft_api_base_v1"

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SHORTCUT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_SHORTCUTS = [
  { id: "openDB", label: "Switch Database Profile", mod: "Cmd", key: "K" },
  { id: "tabChat", label: "Go to Chat Tab", mod: "Cmd", key: "1" },
  { id: "tabSchema", label: "Go to Schema Explorer", mod: "Cmd", key: "2" },
  { id: "tabMetrics", label: "Go to Business Metrics", mod: "Cmd", key: "3" },
  { id: "tabNotebook", label: "Go to Query Notebook", mod: "Cmd", key: "4" },
  { id: "tabDBs", label: "Go to Databases", mod: "Cmd", key: "5" },
  { id: "compact", label: "Toggle Compact Mode", mod: "Cmd", key: "M" },
  { id: "settings", label: "Open Settings", mod: "Cmd", key: "," },
  { id: "clearChat", label: "Clear Conversation", mod: "Cmd", key: "Backspace" },
  { id: "closeAll", label: "Close Panels / Escape", mod: "", key: "Escape" },
]

let customShortcuts = {}
let recordingFor = null

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK DEMO SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════
const fallbackDemoSchema = [
  { table_name: "users", description: "Registered user accounts", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "email", type: "VARCHAR(255)" }, { name: "name", type: "VARCHAR(100)" }, { name: "role", type: "VARCHAR(50)" }, { name: "is_active", type: "BOOLEAN" }, { name: "created_at", type: "TIMESTAMPTZ" }] },
  { table_name: "products", description: "Catalog products", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "name", type: "VARCHAR(255)" }, { name: "category", type: "VARCHAR(100)" }, { name: "price", type: "NUMERIC(10,2)" }, { name: "stock_quantity", type: "INTEGER" }, { name: "is_available", type: "BOOLEAN" }] },
  { table_name: "orders", description: "Customer purchase orders", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "user_id", type: "UUID", is_foreign_key: true }, { name: "total_amount", type: "NUMERIC(12,2)" }, { name: "status", type: "VARCHAR(50)" }, { name: "created_at", type: "TIMESTAMPTZ" }] },
  { table_name: "order_items", description: "Line items per order", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "order_id", type: "UUID", is_foreign_key: true }, { name: "product_id", type: "UUID", is_foreign_key: true }, { name: "quantity", type: "INTEGER" }, { name: "unit_price", type: "NUMERIC(10,2)" }] },
  { table_name: "payments", description: "Payment transactions", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "order_id", type: "UUID", is_foreign_key: true }, { name: "amount", type: "NUMERIC(12,2)" }, { name: "payment_method", type: "VARCHAR(50)" }, { name: "status", type: "VARCHAR(50)" }] },
]

const initialDefaultProfile = {
  id: "prof-demo",
  name: "Demo DB",
  uri: "",
  dbInfo: { host: "demo.postgres", tables_count: 5, tables: fallbackDemoSchema }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════════
let profiles = [initialDefaultProfile]
let activeProfileId = "prof-demo"
let chatHistory = []
let activeTab = "chat"
let isLoading = false
let collapsedTablesState = {}
let lastQueryResults = null
let currentResultViewMode = "table"
let isCompactMode = false
let isSettingsOpen = false
let activeSettingsTab = "account"
let prefs = { compactOnStart: false, autoFocus: true, theme: "dark", fontSize: "12" }
let account = { displayName: "QueryCraft User", email: "demo@querycraft.dev" }
let usage = { queries: 0, heals: 0, verified: 0 }
let savedNotebookSnippets = []
let activeNotebookTagFilter = "all"
let isInitialized = false
let isEventsBound = false

// ═══════════════════════════════════════════════════════════════════════════════
// SAFE DOM SELECTORS & EVENT HELPER
// ═══════════════════════════════════════════════════════════════════════════════
const $ = (id) => document.getElementById(id)
const $$ = (sel) => document.querySelectorAll(sel)

function safeOn(target, event, handler, options) {
  const el = typeof target === "string" ? $(target) : target
  if (el && typeof el.addEventListener === "function") {
    el.addEventListener(event, handler, options)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE LAYER (Chrome Storage + LocalStorage Fallback)
// ═══════════════════════════════════════════════════════════════════════════════
const storage = {
  get: (keys, cb) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, cb)
    } else {
      const res = {}
      ;(Array.isArray(keys) ? keys : [keys]).forEach(k => {
        const v = localStorage.getItem(k)
        if (v) { try { res[k] = JSON.parse(v) } catch { } }
      })
      cb(res)
    }
  },
  set: (items, cb) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(items, cb)
    } else {
      Object.keys(items).forEach(k => localStorage.setItem(k, JSON.stringify(items[k])))
      if (cb) cb()
    }
  }
}

// ── Backend settings sync ─────────────────────────────────────────────────────
async function fetchBackendSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings/`, { signal: AbortSignal.timeout(2000) })
    if (res.ok) return await res.json()
  } catch { }
  return null
}

async function pushBackendSettings(patch) {
  try {
    const res = await fetch(`${API_BASE}/api/settings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (res.ok) return await res.json()
  } catch { }
  return null
}

async function syncFromBackend() {
  const data = await fetchBackendSettings()
  if (!data) return
  if (data.account) account = { ...account, ...data.account }
  if (data.preferences) prefs = { ...prefs, ...data.preferences }
  if (data.shortcuts) customShortcuts = { ...data.shortcuts }
  if (data.usage) usage = { ...usage, ...data.usage }
  if (data.apiBase) API_BASE = data.apiBase
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIT & LOAD
// ═══════════════════════════════════════════════════════════════════════════════
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp)
} else {
  initApp()
}

function initApp() {
  if (isInitialized) return
  isInitialized = true
  loadAll()
}

function loadAll() {
  storage.get([
    STORAGE_KEY_PROFILES,
    STORAGE_KEY_ACTIVE_ID,
    STORAGE_KEY_SHORTCUTS,
    STORAGE_KEY_PREFS,
    STORAGE_KEY_ACCOUNT,
    STORAGE_KEY_USAGE,
    STORAGE_KEY_API_BASE
  ], async (res) => {
    if (res[STORAGE_KEY_PROFILES] && Array.isArray(res[STORAGE_KEY_PROFILES]) && res[STORAGE_KEY_PROFILES].length > 0) {
      profiles = res[STORAGE_KEY_PROFILES]
    }
    if (res[STORAGE_KEY_ACTIVE_ID]) activeProfileId = res[STORAGE_KEY_ACTIVE_ID]
    if (res[STORAGE_KEY_SHORTCUTS]) customShortcuts = res[STORAGE_KEY_SHORTCUTS]
    if (res[STORAGE_KEY_PREFS]) prefs = { ...prefs, ...res[STORAGE_KEY_PREFS] }
    if (res[STORAGE_KEY_ACCOUNT]) account = { ...account, ...res[STORAGE_KEY_ACCOUNT] }
    if (res[STORAGE_KEY_USAGE]) usage = { ...usage, ...res[STORAGE_KEY_USAGE] }
    if (res[STORAGE_KEY_API_BASE]) API_BASE = res[STORAGE_KEY_API_BASE]

    // Sync cloud settings from backend
    await syncFromBackend()

    applyTheme(prefs.theme || "dark")
    applyFontSize(prefs.fontSize || "12")

    if (prefs.compactOnStart) {
      setCompactMode(true)
    }

    if ($("inputDisplayName")) $("inputDisplayName").value = account.displayName || ""
    if ($("inputEmail")) $("inputEmail").value = account.email || ""
    if ($("inputApiBase")) $("inputApiBase").value = API_BASE
    if ($("prefCompactOnStart")) $("prefCompactOnStart").checked = !!prefs.compactOnStart
    if ($("prefAutoFocus")) $("prefAutoFocus").checked = prefs.autoFocus !== false

    renderActiveProfilePill()
    renderSavedProfiles()
    renderSchemaExplorer()
    renderMetricsList()
    renderNotebookSnippets()
    renderShortcutsList()
    updateUsageDisplay()
    checkBackendHealth()

    if (!isEventsBound) {
      bindEvents()
      isEventsBound = true
    }

    if (prefs.autoFocus !== false && $("userPromptInput")) {
      setTimeout(() => $("userPromptInput")?.focus(), 150)
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEME & APPEARANCE
// ═══════════════════════════════════════════════════════════════════════════════
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme)
  $$(".pref-chip[data-theme]").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.theme === theme)
  })
}

function applyFontSize(size) {
  document.body.style.fontSize = `${size}px`
  $$(".pref-chip[data-fontsize]").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.fontsize === String(size))
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════
async function checkBackendHealth() {
  const statusEl = $("serverStatusText")
  const syncDot = $("backendSyncDot")
  const syncLabel = $("backendSyncLabel")
  const startTime = performance.now()

  try {
    const res = await fetch(`${API_BASE}/`, { signal: AbortSignal.timeout(2000) })
    const latency = Math.round(performance.now() - startTime)
    if (res.ok) {
      if (statusEl) statusEl.textContent = `${API_BASE.replace('http://', '')} (${latency}ms · LangGraph)`
      if (syncDot) syncDot.className = "status-indicator live"
      if (syncLabel) syncLabel.textContent = `Connected to ${API_BASE} (${latency}ms)`
    } else {
      throw new Error()
    }
  } catch {
    if (statusEl) statusEl.textContent = "Backend offline (127.0.0.1:8000)"
    if (syncDot) syncDot.className = "status-indicator"
    if (syncLabel) syncLabel.textContent = "Backend offline — start uvicorn"
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILES & WORKSPACE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function getActiveProfile() {
  return profiles.find(p => p.id === activeProfileId) || profiles[0] || initialDefaultProfile
}

function renderActiveProfilePill() {
  const active = getActiveProfile()
  if ($("activeDbName")) $("activeDbName").textContent = active.name
  if ($("welcomeDbName")) $("welcomeDbName").textContent = active.name
  if ($("compactDbLabel")) $("compactDbLabel").textContent = active.name

  const count = active.dbInfo?.tables_count ?? (active.dbInfo?.tables?.length || 5)
  if ($("activeDbBadge")) $("activeDbBadge").textContent = `${count} tbls`

  const dot = $("activeDbDot")
  if (dot) {
    dot.className = active.uri ? "status-indicator live" : "status-indicator"
  }
}

function renderSavedProfiles() {
  const container = $("savedProfilesList")
  const popoverList = $("dbProfilesList")
  const countBadge = $("savedCount")
  const popoverBadge = $("dbCountBadge")

  if (countBadge) countBadge.textContent = profiles.length
  if (popoverBadge) popoverBadge.textContent = profiles.length

  if (container) container.innerHTML = ""
  if (popoverList) popoverList.innerHTML = ""

  profiles.forEach(p => {
    const isActive = p.id === activeProfileId
    const host = p.dbInfo?.host || (p.uri ? "cloud-database" : "demo.schema")
    const tblCount = p.dbInfo?.tables_count || (p.dbInfo?.tables?.length || 5)

    // 1. Settings view item
    if (container) {
      const card = document.createElement("div")
      card.className = `profile-item ${isActive ? "active" : ""}`
      card.innerHTML = `
        <div class="profile-info">
          <span class="profile-name">${escapeHtml(p.name)} ${isActive ? '<span class="status-badge complete" style="font-size:9px;">Active</span>' : ''}</span>
          <span class="profile-host">${escapeHtml(host)} · ${tblCount} schemas</span>
        </div>
        <div style="display:flex;gap:4px;">
          ${!isActive ? `<button type="button" class="action-pill-btn select-prof-btn" data-id="${p.id}">Select</button>` : ''}
          ${p.id !== "prof-demo" ? `<button type="button" class="action-pill-btn delete-prof-btn" data-id="${p.id}" style="color:var(--red);">✕</button>` : ''}
        </div>
      `

      // Attach button events
      const selBtn = card.querySelector(".select-prof-btn")
      if (selBtn) {
        safeOn(selBtn, "click", () => selectProfile(p.id))
      }

      const delBtn = card.querySelector(".delete-prof-btn")
      if (delBtn) {
        safeOn(delBtn, "click", () => deleteProfile(p.id))
      }

      container.appendChild(card)
    }

    // 2. Dropdown popover item
    if (popoverList) {
      const item = document.createElement("div")
      item.className = `profile-item ${isActive ? "active" : ""}`
      item.dataset.id = p.id
      item.innerHTML = `
        <div class="profile-info">
          <span class="profile-name">${escapeHtml(p.name)}</span>
          <span class="profile-host">${escapeHtml(host)}</span>
        </div>
        <span class="tbl-count">${tblCount}</span>
      `
      safeOn(item, "click", () => {
        selectProfile(p.id)
        $("dbDropdownMenu")?.classList.add("hidden")
      })
      popoverList.appendChild(item)
    }
  })
}

function selectProfile(id) {
  activeProfileId = id
  storage.set({ [STORAGE_KEY_ACTIVE_ID]: id })
  renderActiveProfilePill()
  renderSavedProfiles()
  renderSchemaExplorer()
}

function deleteProfile(id) {
  if (id === "prof-demo") return
  profiles = profiles.filter(p => p.id !== id)
  if (activeProfileId === id) {
    activeProfileId = profiles[0]?.id || "prof-demo"
  }
  storage.set({
    [STORAGE_KEY_PROFILES]: profiles,
    [STORAGE_KEY_ACTIVE_ID]: activeProfileId
  })
  renderActiveProfilePill()
  renderSavedProfiles()
  renderSchemaExplorer()
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT & CLARIFICATION WORKFLOW
// ═══════════════════════════════════════════════════════════════════════════════
async function handleSendPrompt(customText) {
  const input = $("userPromptInput")
  const prompt = (customText || (input ? input.value : "")).trim()
  if (!prompt || isLoading) return

  if (input && !customText) {
    input.value = ""
    input.style.height = "22px"
  }

  $("welcomeState")?.classList.add("hidden")
  $("messagesFeed")?.classList.remove("hidden")

  appendUserMessage(prompt)

  const active = getActiveProfile()
  const historyPayload = chatHistory.slice(-4).map(m => ({
    role: m.role,
    content: m.content || m.rawContent || "",
    status: m.status || "complete"
  }))

  const payload = {
    user_prompt: prompt,
    session_history: historyPayload
  }

  if (active.uri) {
    payload.connection_uri = active.uri
    payload.db_uri = active.uri
  }
  if (active.dbInfo?.schema_sql) {
    payload.live_schema = active.dbInfo.schema_sql
  }

  const loadingEl = appendLoading()
  isLoading = true
  const sendBtn = $("btnSendPrompt")
  if (sendBtn) sendBtn.disabled = true

  try {
    const res = await fetch(`${API_BASE}/api/clarification/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`Backend HTTP ${res.status}`)
    const aiData = await res.json()
    if (loadingEl) loadingEl.remove()

    if (aiData.status === "needs_clarification") {
      appendClarificationMessage(aiData.message)
      chatHistory.push({
        role: "assistant",
        content: aiData.message,
        rawContent: aiData.message,
        status: "needs_clarification"
      })
    } else if (aiData.status === "complete") {
      const extracted = aiData.extracted_data || {}
      appendCompleteMessage({
        message: aiData.message,
        explanation: extracted.explanation,
        sql_query: extracted.sql_query,
        tables: extracted.tables_identified || [],
        visual_intent: extracted.visual_intent || aiData.visual_intent,
        matched_metrics: extracted.matched_metrics || []
      })
      chatHistory.push({
        role: "assistant",
        content: aiData.message,
        sql_query: extracted.sql_query,
        rawContent: `${aiData.message || ""} ${extracted.explanation || ""} SQL: ${extracted.sql_query || ""}`,
        status: "complete"
      })
    }

    incrementUsage("queries")
  } catch (err) {
    if (loadingEl) loadingEl.remove()
    appendErrorMessage(`Unable to reach LangGraph backend at ${API_BASE}`)
    checkBackendHealth()
  } finally {
    isLoading = false
    if (sendBtn) sendBtn.disabled = false
    const feed = $("messagesFeed")
    if (feed) feed.scrollTop = feed.scrollHeight
  }
}

function appendUserMessage(text) {
  chatHistory.push({ role: "user", content: text })
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const row = document.createElement("div")
  row.className = "msg-row user"
  row.innerHTML = `<div class="user-bubble">${escapeHtml(text)}</div>`
  feedEl.appendChild(row)
  feedEl.scrollTop = feedEl.scrollHeight
}

function appendLoading() {
  const feedEl = $("messagesFeed")
  if (!feedEl) return null

  const row = document.createElement("div")
  row.className = "msg-row assistant"
  row.innerHTML = `
    <div class="assistant-card">
      <div class="card-header">
        <div class="card-status">
          <span class="pulse-dot"></span>
          <span class="status-badge clarify" style="color:var(--accent);">LangGraph Reasoning...</span>
        </div>
      </div>
      <div class="card-body">
        <div style="font-size:12px;color:var(--text-3);">Compiling grounded query &amp; checking ambiguity...</div>
      </div>
    </div>
  `
  feedEl.appendChild(row)
  feedEl.scrollTop = feedEl.scrollHeight
  return row
}

function appendClarificationMessage(question) {
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const chips = generateClarificationChips(question)

  const row = document.createElement("div")
  row.className = "msg-row assistant"
  row.innerHTML = `
    <div class="assistant-card" style="border-color:rgba(245,158,11,0.3);">
      <div class="card-header" style="background:var(--amber-bg);">
        <div class="card-status">
          <span>⚠️</span>
          <span class="status-badge clarify">Clarification Required</span>
        </div>
      </div>
      <div class="card-body">
        <p class="clarification-text">${escapeHtml(question)}</p>
        ${chips.length > 0 ? `
          <div class="clarification-chips">
            ${chips.map(c => `<button type="button" class="clarify-chip-btn" data-reply="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `
  feedEl.appendChild(row)

  row.querySelectorAll(".clarify-chip-btn").forEach(btn => {
    safeOn(btn, "click", () => {
      handleSendPrompt(btn.dataset.reply)
    })
  })

  feedEl.scrollTop = feedEl.scrollHeight
}

function generateClarificationChips(text) {
  const t = (text || "").toLowerCase()
  const chips = []
  if (t.includes("time") || t.includes("date") || t.includes("window") || t.includes("year") || t.includes("month")) {
    chips.push("Last 30 Days", "Calendar Year 2024", "All Time")
  }
  if (t.includes("status") || t.includes("completed") || t.includes("active")) {
    chips.push("Completed Orders Only", "Active Users Only")
  }
  if (t.includes("ranking") || t.includes("spend") || t.includes("metric") || t.includes("count")) {
    chips.push("By Total Order Spend", "By Total Order Count")
  }
  if (chips.length === 0) {
    chips.push("Yes, proceed with defaults", "Filter by last 30 days")
  }
  return chips.slice(0, 3)
}

function appendCompleteMessage({ message, explanation, sql_query, tables, visual_intent, matched_metrics }) {
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const row = document.createElement("div")
  row.className = "msg-row assistant"

  const tablesBadges = (tables || []).map(t => `<span class="chip-badge emerald">${escapeHtml(t)}</span>`).join(" ")
  const metricsBadges = (matched_metrics || []).map(m => `<span class="chip-badge purple">${escapeHtml(m)}</span>`).join(" ")

  row.innerHTML = `
    <div class="assistant-card">
      <div class="card-header">
        <div class="card-status">
          <span class="status-badge complete">Compiled &amp; Grounded</span>
          ${tablesBadges}
          ${metricsBadges}
        </div>
      </div>
      <div class="card-body">
        <p style="font-size:12px;color:var(--text);">${escapeHtml(explanation || message || "Production-ready query compiled.")}</p>
        
        <div class="code-block-wrap">
          <div class="code-block-header">
            <span>SQL / MQL (Read-Only)</span>
            <span>LIMIT 50</span>
          </div>
          <code class="sql-code">${escapeHtml(sql_query)}</code>
        </div>
      </div>
      <div class="card-actions-bar">
        <div class="actions-group">
          <button type="button" class="action-pill-btn primary btn-exec-sql">
            <span>▶</span> Run Query
          </button>
          <button type="button" class="action-pill-btn btn-copy-sql">
            <span>📋</span> Copy
          </button>
          <button type="button" class="action-pill-btn btn-explain-sql">
            <span>⚡</span> EXPLAIN
          </button>
          <button type="button" class="action-pill-btn btn-save-nb">
            <span>⭐</span> Notebook
          </button>
        </div>
      </div>
    </div>
  `

  const copyBtn = row.querySelector(".btn-copy-sql")
  safeOn(copyBtn, "click", async () => {
    await navigator.clipboard.writeText(sql_query)
    copyBtn.innerHTML = "<span>✓</span> Copied!"
    setTimeout(() => { copyBtn.innerHTML = "<span>📋</span> Copy" }, 1800)
  })

  const execBtn = row.querySelector(".btn-exec-sql")
  safeOn(execBtn, "click", () => {
    executeLiveQuery(sql_query)
  })

  const explainBtn = row.querySelector(".btn-explain-sql")
  safeOn(explainBtn, "click", () => {
    runExplainAnalysis(sql_query)
  })

  const saveNbBtn = row.querySelector(".btn-save-nb")
  safeOn(saveNbBtn, "click", async () => {
    const active = getActiveProfile()
    await saveQueryToNotebook({
      title: explanation?.slice(0, 45) || "Saved Query Snippet",
      user_prompt: message || "Generated query",
      sql_query: sql_query,
      tags: ["#saved", ...(tables || [])],
      database_host: active.dbInfo?.host || "cloud-db"
    })
    saveNbBtn.innerHTML = "<span>✓</span> Saved!"
    setTimeout(() => { saveNbBtn.innerHTML = "<span>⭐</span> Notebook" }, 1800)
  })

  feedEl.appendChild(row)
  feedEl.scrollTop = feedEl.scrollHeight
}

function appendErrorMessage(msg) {
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const row = document.createElement("div")
  row.className = "msg-row assistant"
  row.innerHTML = `
    <div class="assistant-card" style="border-color:var(--red);">
      <div class="card-header" style="background:var(--red-bg);">
        <span class="status-badge error">Execution Error</span>
      </div>
      <div class="card-body">
        <p style="font-size:12px;color:var(--red);">${escapeHtml(msg)}</p>
      </div>
    </div>
  `
  feedEl.appendChild(row)
  feedEl.scrollTop = feedEl.scrollHeight
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTION, EXPLAIN & VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════════
async function executeLiveQuery(sql) {
  const active = getActiveProfile()
  const drawer = $("queryResultsDrawer")
  const content = $("queryResultsContent")
  const countEl = $("resultRowCount")

  if (drawer) drawer.classList.remove("hidden")
  if (content) content.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-3);"><span class="pulse-dot"></span> Executing query on ${escapeHtml(active.name)}...</div>`

  try {
    let resData
    if (active.uri) {
      const res = await fetch(`${API_BASE}/api/database/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_uri: active.uri,
          sql_query: sql,
          limit: 50,
          auto_heal: true
        })
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.detail || `HTTP ${res.status}`)
      }
      resData = await res.json()
    } else {
      // Demo mock data
      resData = {
        status: "success",
        columns: ["id", "name", "email", "total_spent"],
        rows: [
          { id: "1", name: "Alex Morgan", email: "alex@example.com", total_spent: 1450.00 },
          { id: "2", name: "Sarah Chen", email: "sarah@example.com", total_spent: 1280.50 },
          { id: "3", name: "Marcus Vance", email: "marcus@example.com", total_spent: 1120.00 },
        ],
        row_count: 3
      }
    }

    lastQueryResults = resData
    if (countEl) countEl.textContent = `${resData.row_count} rows`
    renderQueryResultsView(resData, currentResultViewMode)
    incrementUsage("queries")
    if (resData.healing_info?.was_healed) incrementUsage("heals")
  } catch (err) {
    if (content) {
      content.innerHTML = `
        <div style="padding:12px;color:var(--red);font-size:11.5px;">
          <strong>Execution Failed:</strong> ${escapeHtml(err.message)}
          <div style="margin-top:6px;">
            <button type="button" class="submit-btn btn-heal-prompt" style="padding:4px 8px;font-size:10px;">🔧 Fix with SQL Doctor</button>
          </div>
        </div>
      `
      safeOn(content.querySelector(".btn-heal-prompt"), "click", () => {
        handleSendPrompt(`Fix and repair query error: ${err.message}`)
      })
    }
  }
}

function renderQueryResultsView(data, mode) {
  const content = $("queryResultsContent")
  if (!content) return

  if (mode === "chart") {
    renderSVGChart(data, content)
    return
  }

  const cols = data.columns || []
  const rows = data.rows || []

  if (rows.length === 0) {
    content.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-3);">0 rows returned.</div>`
    return
  }

  const tableHtml = `
    <table class="results-table">
      <thead>
        <tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>${cols.map(c => {
            const val = r[c]
            const strVal = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? '')
            return `<td>${escapeHtml(strVal)}</td>`
          }).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
  `
  content.innerHTML = tableHtml
}

function renderSVGChart(data, container) {
  const rows = data.rows || []
  const cols = data.columns || []
  if (rows.length === 0 || cols.length === 0) {
    container.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-3);">No data for chart.</div>`
    return
  }

  const numCols = cols.filter(c => rows.slice(0, 5).every(r => r[c] !== null && !isNaN(Number(String(r[c]).replace(/[$,]/g, '')))))
  const strCols = cols.filter(c => !numCols.includes(c))
  const xKey = strCols[0] || cols[0]
  const yKey = numCols[0] || cols[1] || cols[0]

  const chartData = rows.slice(0, 8).map((r, i) => ({
    label: String(r[xKey] || `#${i+1}`).slice(0, 12),
    val: parseFloat(String(r[yKey] || '0').replace(/[$,]/g, '')) || 0
  }))

  const maxVal = Math.max(...chartData.map(d => d.val), 1)

  const bars = chartData.map((d) => {
    const heightPct = Math.round((d.val / maxVal) * 80) + 5
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:32px;">
        <span style="font-size:9px;color:var(--text-2);font-family:var(--mono);">${d.val}</span>
        <div style="width:100%;height:${heightPct}px;background:linear-gradient(180deg, #22c55e 0%, #16a34a 100%);border-radius:3px 3px 0 0;"></div>
        <span style="font-size:9px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:42px;">${escapeHtml(d.label)}</span>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div style="padding:12px 16px;display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:10.5px;font-weight:700;color:var(--text-2);">${escapeHtml(yKey)} by ${escapeHtml(xKey)}</div>
      <div style="display:flex;align-items:flex-end;gap:8px;height:120px;border-bottom:1px solid var(--border);padding-bottom:4px;">
        ${bars}
      </div>
    </div>
  `
}

async function runExplainAnalysis(sql) {
  const active = getActiveProfile()
  const drawer = $("explainDrawer")
  const content = $("explainContent")
  if (drawer) drawer.classList.remove("hidden")
  if (content) content.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-3);"><span class="pulse-dot"></span> Running PostgreSQL EXPLAIN analysis...</div>`

  try {
    const res = await fetch(`${API_BASE}/api/database/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_uri: active.uri || "",
        sql_query: sql
      })
    })
    const data = await res.json()
    const badgeColor = data.performance_rating === "fast" ? "emerald" : (data.performance_rating === "moderate" ? "amber" : "red")

    content.innerHTML = `
      <div style="padding:12px;display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="chip-badge ${badgeColor}">${escapeHtml(data.rating_label || data.performance_rating)}</span>
          <span style="font-size:11px;font-family:var(--mono);color:var(--text-2);">Total Cost: ${data.total_cost}</span>
        </div>
        ${data.has_seq_scan ? `<div style="font-size:11px;color:var(--amber);">⚠️ Sequential table scan detected without index.</div>` : ''}
        ${data.index_recommendations?.length > 0 ? `
          <div style="background:#06080b;padding:8px;border-radius:4px;">
            <span style="font-size:10px;color:var(--text-3);display:block;margin-bottom:4px;">Recommended Index:</span>
            <code style="font-family:var(--mono);font-size:10px;color:#a7f3d0;">${escapeHtml(data.index_recommendations[0])}</code>
          </div>
        ` : ''}
      </div>
    `
  } catch (err) {
    if (content) content.innerHTML = `<div style="padding:12px;color:var(--red);">Explain evaluation failed: ${escapeHtml(err.message)}</div>`
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA EXPLORER & DATA PROFILER
// ═══════════════════════════════════════════════════════════════════════════════
function renderSchemaExplorer() {
  const container = $("schemaTablesContainer")
  if (!container) return

  const active = getActiveProfile()
  const tables = active.dbInfo?.tables || fallbackDemoSchema
  const search = ($("inputSchemaSearch")?.value || "").toLowerCase()

  container.innerHTML = ""

  tables.forEach(tbl => {
    const tName = tbl.table_name || ""
    const cols = tbl.columns || []
    const isMatched = tName.toLowerCase().includes(search) || cols.some(c => c.name.toLowerCase().includes(search))
    if (search && !isMatched) return

    // DEFAULT CLOSED: Collapsed unless explicitly set to false
    const isCollapsed = collapsedTablesState[tName] !== false

    const card = document.createElement("div")
    card.className = "notebook-card"
    card.innerHTML = `
      <div class="notebook-header" style="cursor:pointer;" data-table="${escapeHtml(tName)}">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;">🗂️</span>
          <span class="notebook-title">${escapeHtml(tName)}</span>
          <span class="tbl-count">${cols.length} cols</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="action-pill-btn btn-sample-tbl" data-table="${escapeHtml(tName)}">Sample 5</button>
          <span style="font-size:10px;color:var(--text-3);">${isCollapsed ? '▶' : '▼'}</span>
        </div>
      </div>
      ${!isCollapsed ? `
        <div style="display:flex;flex-direction:column;gap:3px;margin-top:4px;padding-top:4px;border-top:1px solid var(--border-subtle);">
          ${cols.map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;padding:2px 4px;">
              <span style="color:var(--text);font-family:var(--mono);">${escapeHtml(c.name)} ${c.is_primary_key ? '<span style="color:var(--amber);font-size:9px;">PK</span>' : ''}</span>
              <span style="color:var(--text-3);font-family:var(--mono);font-size:10px;">${escapeHtml(c.type)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `

    safeOn(card.querySelector(".notebook-header"), "click", (e) => {
      if (e.target.classList.contains("btn-sample-tbl")) return
      collapsedTablesState[tName] = !isCollapsed ? true : false
      renderSchemaExplorer()
    })

    safeOn(card.querySelector(".btn-sample-tbl"), "click", () => {
      sampleTableData(tName)
    })

    container.appendChild(card)
  })
}

async function sampleTableData(tableName) {
  const active = getActiveProfile()
  const drawer = $("queryResultsDrawer")
  const content = $("queryResultsContent")
  const countEl = $("resultRowCount")

  if (drawer) drawer.classList.remove("hidden")
  if (content) content.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-3);"><span class="pulse-dot"></span> Profiling 5 sample records from ${escapeHtml(tableName)}...</div>`

  try {
    const res = await fetch(`${API_BASE}/api/database/sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_uri: active.uri || "",
        table_name: tableName,
        limit: 5
      })
    })
    const data = await res.json()
    lastQueryResults = data
    if (countEl) countEl.textContent = `Sample ${data.row_count} rows`
    renderQueryResultsView(data, "table")
  } catch (err) {
    if (content) content.innerHTML = `<div style="padding:12px;color:var(--red);">Table sampling failed: ${escapeHtml(err.message)}</div>`
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTEBOOK & SNIPPET SYNC
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchNotebookSnippets() {
  try {
    const res = await fetch(`${API_BASE}/api/memory/notebook`)
    if (res.ok) {
      const data = await res.json()
      savedNotebookSnippets = data.queries || []
    }
  } catch {
    savedNotebookSnippets = [
      {
        id: "nb-1",
        title: "Top 10 High-Spend VIP Customers",
        user_prompt: "Top customers by total spend",
        sql_query: "SELECT u.id, u.name, SUM(o.total_amount) AS total_spent FROM users u JOIN orders o ON u.id = o.user_id WHERE o.status = 'completed' GROUP BY u.id, u.name ORDER BY total_spent DESC LIMIT 10;",
        tags: ["#vip", "#finance"],
        database_host: "postgres"
      }
    ]
  }
}

async function renderNotebookSnippets() {
  await fetchNotebookSnippets()
  const container = $("notebookSnippetsList")
  if (!container) return

  const search = ($("inputNotebookSearch")?.value || "").toLowerCase()
  const filterTag = activeNotebookTagFilter

  container.innerHTML = ""

  const filtered = savedNotebookSnippets.filter(s => {
    const matchSearch = (s.title || "").toLowerCase().includes(search) || (s.sql_query || "").toLowerCase().includes(search) || (s.tags || []).some(t => t.toLowerCase().includes(search))
    const matchTag = filterTag === "all" || (s.tags || []).includes(filterTag)
    return matchSearch && matchTag
  })

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-3);font-size:11.5px;">No saved snippets found. Click ⭐ on any generated query to save!</div>`
    return
  }

  filtered.forEach(s => {
    const card = document.createElement("div")
    card.className = "notebook-card"
    card.innerHTML = `
      <div class="notebook-header">
        <span class="notebook-title">${escapeHtml(s.title)}</span>
        <div style="display:flex;gap:4px;">
          ${(s.tags || []).map(t => `<span class="chip-badge purple">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <code class="notebook-sql">${escapeHtml(s.sql_query)}</code>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
        <span style="font-size:10px;color:var(--text-3);font-family:var(--mono);">${escapeHtml(s.database_host || 'cloud-db')}</span>
        <div style="display:flex;gap:4px;">
          <button type="button" class="action-pill-btn primary btn-run-snippet">▶ Run</button>
          <button type="button" class="action-pill-btn btn-copy-snippet">📋 Copy</button>
          <button type="button" class="action-pill-btn btn-del-snippet" style="color:var(--red);">✕</button>
        </div>
      </div>
    `

    safeOn(card.querySelector(".btn-run-snippet"), "click", () => {
      switchTab("chat")
      executeLiveQuery(s.sql_query)
    })

    safeOn(card.querySelector(".btn-copy-snippet"), "click", async () => {
      await navigator.clipboard.writeText(s.sql_query)
      const btn = card.querySelector(".btn-copy-snippet")
      btn.textContent = "Copied!"
      setTimeout(() => { btn.textContent = "📋 Copy" }, 1500)
    })

    safeOn(card.querySelector(".btn-del-snippet"), "click", async () => {
      await deleteNotebookSnippet(s.id)
    })

    container.appendChild(card)
  })
}

async function saveQueryToNotebook(req) {
  try {
    await fetch(`${API_BASE}/api/memory/notebook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    })
    await renderNotebookSnippets()
  } catch { }
}

async function deleteNotebookSnippet(id) {
  try {
    await fetch(`${API_BASE}/api/memory/notebook/${id}`, { method: "DELETE" })
    await renderNotebookSnippets()
  } catch { }
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS & BUSINESS RULES
// ═══════════════════════════════════════════════════════════════════════════════
async function renderMetricsList() {
  const container = $("metricsListContainer")
  const countEl = $("metricsCount")
  if (!container) return

  try {
    const res = await fetch(`${API_BASE}/api/semantic/metrics`)
    const data = await res.json()
    const metrics = data.metrics || []
    if (countEl) countEl.textContent = metrics.length

    container.innerHTML = ""
    metrics.forEach(m => {
      const card = document.createElement("div")
      card.className = "notebook-card"
      card.innerHTML = `
        <div class="notebook-header">
          <span class="notebook-title">${escapeHtml(m.name)}</span>
          <span class="chip-badge emerald">${escapeHtml(m.category || 'General')}</span>
        </div>
        <p style="font-size:11.5px;color:var(--text-2);">${escapeHtml(m.definition)}</p>
        ${m.sql_formula ? `<code class="notebook-sql">${escapeHtml(m.sql_formula)}</code>` : ''}
      `
      container.appendChild(card)
    })
  } catch {
    if (container) container.innerHTML = `<div style="padding:12px;color:var(--text-3);">Using default glossary metrics.</div>`
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS, SHORTCUTS & USAGE
// ═══════════════════════════════════════════════════════════════════════════════
function renderShortcutsList() {
  const container = $("shortcutsList")
  if (!container) return

  container.innerHTML = ""
  DEFAULT_SHORTCUTS.forEach(s => {
    const binding = customShortcuts[s.id] || { mod: s.mod, key: s.key }
    const keyComboStr = binding.mod ? `${binding.mod}+${binding.key}` : binding.key

    const row = document.createElement("div")
    row.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-subtle);"
    row.innerHTML = `
      <span style="font-size:11px;color:var(--text-2);">${escapeHtml(s.label)}</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="key-badge">${escapeHtml(keyComboStr)}</span>
        <button type="button" class="tiny-link-btn btn-edit-shortcut" data-id="${s.id}" style="font-size:10px;color:var(--accent);background:none;border:none;cursor:pointer;">Edit</button>
      </div>
    `
    safeOn(row.querySelector(".btn-edit-shortcut"), "click", () => {
      openShortcutModal(s)
    })
    container.appendChild(row)
  })
}

function openShortcutModal(shortcut) {
  recordingFor = shortcut.id
  const modal = $("shortcutModalOverlay")
  const title = $("modalShortcutLabel")
  const preview = $("modalPreviewBadge")
  if (title) title.textContent = `Edit Shortcut: ${shortcut.label}`

  const binding = customShortcuts[shortcut.id] || { mod: shortcut.mod, key: shortcut.key }
  if (preview) preview.textContent = binding.mod ? `${binding.mod}+${binding.key}` : binding.key
  if ($("selectShortcutMod")) $("selectShortcutMod").value = binding.mod
  if ($("selectShortcutKey")) $("selectShortcutKey").value = binding.key

  if (modal) modal.classList.remove("hidden")
}

function updateUsageDisplay() {
  if ($("usageQueries")) $("usageQueries").textContent = usage.queries || 0
  if ($("usageHeals")) $("usageHeals").textContent = usage.heals || 0
  if ($("usageVerified")) $("usageVerified").textContent = usage.verified || 0
  if ($("usageDbs")) $("usageDbs").textContent = profiles.length
  if ($("settingsDisplayName")) $("settingsDisplayName").textContent = account.displayName || "QueryCraft User"
  if ($("settingsUserEmail")) $("settingsUserEmail").textContent = account.email || "demo@querycraft.dev"
}

function incrementUsage(field) {
  usage[field] = (usage[field] || 0) + 1
  storage.set({ [STORAGE_KEY_USAGE]: usage })
  updateUsageDisplay()
  fetch(`${API_BASE}/api/settings/usage/increment?field=${field}`, { method: "POST" }).catch(() => {})
}

function setCompactMode(compact) {
  isCompactMode = compact
  document.body.style.height = compact ? "40px" : "610px"
  $("compactBar")?.classList.toggle("hidden", !compact)
  $("mainContent")?.classList.toggle("hidden", compact)
  $("appFooter")?.classList.toggle("hidden", compact)
}

function switchTab(tabId) {
  activeTab = tabId
  $$(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tabId)
  })
  $$(".view-panel").forEach(panel => {
    panel.classList.add("hidden")
  })

  if (tabId === "chat") {
    $("tabChat")?.classList.remove("hidden")
  } else if (tabId === "schema") {
    $("tabSchema")?.classList.remove("hidden")
    renderSchemaExplorer()
  } else if (tabId === "metrics") {
    $("tabMetrics")?.classList.remove("hidden")
    renderMetricsList()
  } else if (tabId === "notebook") {
    $("tabNotebook")?.classList.remove("hidden")
    renderNotebookSnippets()
  } else if (tabId === "databases") {
    $("tabDatabases")?.classList.remove("hidden")
    renderSavedProfiles()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BINDINGS
// ═══════════════════════════════════════════════════════════════════════════════
function bindEvents() {
  // Navigation tabs
  $$(".nav-item").forEach(item => {
    safeOn(item, "click", () => switchTab(item.dataset.tab))
  })

  // DB quick popover toggle
  safeOn($("dbSwitcherTrigger"), "click", () => {
    $("dbDropdownMenu")?.classList.toggle("hidden")
  })

  safeOn($("btnAddDbQuick"), "click", () => {
    $("dbDropdownMenu")?.classList.add("hidden")
    switchTab("databases")
  })

  // Compact bar actions
  safeOn($("btnToggleCompact"), "click", () => setCompactMode(!isCompactMode))
  safeOn($("btnCompactExpand"), "click", () => setCompactMode(false))
  safeOn($("btnCompactChat"), "click", () => { setCompactMode(false); switchTab("chat") })

  // Reset Chat
  safeOn($("btnResetChat"), "click", () => {
    chatHistory = []
    const feed = $("messagesFeed")
    if (feed) { feed.innerHTML = ""; feed.classList.add("hidden") }
    $("welcomeState")?.classList.remove("hidden")
    $("queryResultsDrawer")?.classList.add("hidden")
    $("explainDrawer")?.classList.add("hidden")
  })

  // Settings Slide-over
  safeOn($("btnOpenSettings"), "click", () => {
    $("settingsSidebar")?.classList.remove("hidden")
    $("settingsOverlay")?.classList.remove("hidden")
  })
  safeOn($("btnCloseSettings"), "click", () => {
    $("settingsSidebar")?.classList.add("hidden")
    $("settingsOverlay")?.classList.add("hidden")
  })
  safeOn($("settingsOverlay"), "click", () => {
    $("settingsSidebar")?.classList.add("hidden")
    $("settingsOverlay")?.classList.add("hidden")
  })

  // Settings sub-navigation
  $$(".settings-nav-item").forEach(btn => {
    safeOn(btn, "click", () => {
      $$(".settings-nav-item").forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      $$(".settings-panel").forEach(p => p.classList.remove("active"))
      const tabKey = btn.dataset.settingsTab
      if (tabKey === "account") $("settingsTabAccount")?.classList.add("active")
      else if (tabKey === "usage") $("settingsTabUsage")?.classList.add("active")
      else if (tabKey === "preferences") $("settingsTabPreferences")?.classList.add("active")
    })
  })

  // Save Account
  safeOn($("btnSaveAccount"), "click", () => {
    const name = $("inputDisplayName")?.value.trim()
    const email = $("inputEmail")?.value.trim()
    if (name) account.displayName = name
    if (email) account.email = email
    storage.set({ [STORAGE_KEY_ACCOUNT]: account })
    pushBackendSettings({ account })
    updateUsageDisplay()
    const btn = $("btnSaveAccount")
    if (btn) {
      btn.textContent = "Saved & Synced!"
      setTimeout(() => { btn.textContent = "Save & Sync to Cloud" }, 1500)
    }
  })

  // Save API Base
  safeOn($("btnSaveApiBase"), "click", () => {
    const newBase = $("inputApiBase")?.value.trim()
    if (newBase) {
      API_BASE = newBase
      storage.set({ [STORAGE_KEY_API_BASE]: newBase })
      pushBackendSettings({ apiBase: newBase })
      checkBackendHealth()
      const btn = $("btnSaveApiBase")
      if (btn) {
        btn.textContent = "Saved!"
        setTimeout(() => { btn.textContent = "Save API URL" }, 1500)
      }
    }
  })

  // Reset Shortcuts
  safeOn($("btnResetShortcuts"), "click", () => {
    customShortcuts = {}
    storage.set({ [STORAGE_KEY_SHORTCUTS]: customShortcuts })
    pushBackendSettings({ shortcuts: customShortcuts })
    renderShortcutsList()
  })

  // Open Chrome Shortcuts page
  safeOn($("btnOpenChromeShortcuts"), "click", () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
    }
  })

  // Rebind Modal handlers
  safeOn($("selectShortcutMod"), "change", updateModalPreview)
  safeOn($("selectShortcutKey"), "change", updateModalPreview)

  function updateModalPreview() {
    const mod = $("selectShortcutMod")?.value || ""
    const key = $("selectShortcutKey")?.value || ""
    const preview = $("modalPreviewBadge")
    if (preview) preview.textContent = mod ? `${mod}+${key}` : key
  }

  const recorderBox = $("keyRecorderBox")
  if (recorderBox) {
    safeOn(recorderBox, "keydown", (e) => {
      e.preventDefault()
      e.stopPropagation()
      let mod = ""
      if (e.metaKey || e.ctrlKey) mod = "Cmd"
      else if (e.altKey) mod = "Alt"
      else if (e.shiftKey) mod = "Shift"

      let key = e.key
      if (key === " " || key === "Spacebar") key = "Space"
      if (["Control", "Meta", "Alt", "Shift"].includes(key)) return

      key = key.length === 1 ? key.toUpperCase() : key
      if ($("selectShortcutMod")) $("selectShortcutMod").value = mod
      if ($("selectShortcutKey")) $("selectShortcutKey").value = key
      updateModalPreview()

      const recText = $("keyRecorderText")
      if (recText) recText.textContent = `Recorded: ${mod ? mod + '+' : ''}${key}`
    })
  }

  safeOn($("btnSaveModalShortcut"), "click", () => {
    const idToSave = recordingFor || "openDB"
    const mod = $("selectShortcutMod")?.value || ""
    const key = $("selectShortcutKey")?.value || ""
    if (key) {
      customShortcuts[idToSave] = { mod, key }
      storage.set({ [STORAGE_KEY_SHORTCUTS]: customShortcuts })
      pushBackendSettings({ shortcuts: customShortcuts })
      renderShortcutsList()
    }
    const modal = $("shortcutModalOverlay")
    if (modal) modal.classList.add("hidden")
    recordingFor = null
  })

  safeOn($("btnCancelModalShortcut"), "click", () => {
    const modal = $("shortcutModalOverlay")
    if (modal) modal.classList.add("hidden")
    recordingFor = null
  })

  safeOn($("btnCloseShortcutModal"), "click", () => {
    const modal = $("shortcutModalOverlay")
    if (modal) modal.classList.add("hidden")
    recordingFor = null
  })

  // Theme & Font Scale chips
  $$(".pref-chip[data-theme]").forEach(chip => {
    safeOn(chip, "click", () => {
      prefs.theme = chip.dataset.theme
      storage.set({ [STORAGE_KEY_PREFS]: prefs })
      pushBackendSettings({ preferences: prefs })
      applyTheme(prefs.theme)
    })
  })

  $$(".pref-chip[data-fontsize]").forEach(chip => {
    safeOn(chip, "click", () => {
      prefs.fontSize = chip.dataset.fontsize
      storage.set({ [STORAGE_KEY_PREFS]: prefs })
      pushBackendSettings({ preferences: prefs })
      applyFontSize(prefs.fontSize)
    })
  })

  // Toggle startup prefs
  safeOn($("prefCompactOnStart"), "change", (e) => {
    prefs.compactOnStart = e.target.checked
    storage.set({ [STORAGE_KEY_PREFS]: prefs })
    pushBackendSettings({ preferences: prefs })
  })

  safeOn($("prefAutoFocus"), "change", (e) => {
    prefs.autoFocus = e.target.checked
    storage.set({ [STORAGE_KEY_PREFS]: prefs })
    pushBackendSettings({ preferences: prefs })
  })

  // Starter prompts
  $$(".prompt-chip").forEach(chip => {
    safeOn(chip, "click", () => {
      handleSendPrompt(chip.dataset.prompt)
    })
  })

  // Send prompt button & enter key
  safeOn($("btnSendPrompt"), "click", () => handleSendPrompt())

  const textarea = $("userPromptInput")
  if (textarea) {
    safeOn(textarea, "keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendPrompt()
      }
    })
    safeOn(textarea, "input", () => {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`
    })
  }

  // Results drawer buttons
  safeOn($("btnCloseResults"), "click", () => $("queryResultsDrawer")?.classList.add("hidden"))
  safeOn($("btnCloseExplain"), "click", () => $("explainDrawer")?.classList.add("hidden"))

  safeOn($("btnViewTable"), "click", () => {
    currentResultViewMode = "table"
    $("btnViewTable")?.classList.add("active")
    $("btnViewChart")?.classList.remove("active")
    if (lastQueryResults) renderQueryResultsView(lastQueryResults, "table")
  })

  safeOn($("btnViewChart"), "click", () => {
    currentResultViewMode = "chart"
    $("btnViewChart")?.classList.add("active")
    $("btnViewTable")?.classList.remove("active")
    if (lastQueryResults) renderQueryResultsView(lastQueryResults, "chart")
  })

  safeOn($("btnExportCsv"), "click", async () => {
    if (!lastQueryResults?.rows?.length) return
    const cols = lastQueryResults.columns || []
    const rows = lastQueryResults.rows || []
    const csv = [cols.join(","), ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(","))].join("\n")
    await navigator.clipboard.writeText(csv)
    const btn = $("btnExportCsv")
    if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "CSV" }, 1500) }
  })

  // Notebook tags filter
  $$(".tag-chip").forEach(chip => {
    safeOn(chip, "click", () => {
      $$(".tag-chip").forEach(c => c.classList.remove("active"))
      chip.classList.add("active")
      activeNotebookTagFilter = chip.dataset.tag
      renderNotebookSnippets()
    })
  })
  safeOn($("inputNotebookSearch"), "input", () => renderNotebookSnippets())
  safeOn($("btnRefreshNotebook"), "click", () => renderNotebookSnippets())

  // Schema Search
  safeOn($("inputSchemaSearch"), "input", () => renderSchemaExplorer())
  safeOn($("btnToggleAllTables"), "click", () => {
    const active = getActiveProfile()
    const tables = active.dbInfo?.tables || fallbackDemoSchema
    const isAnyOpen = tables.some(t => collapsedTablesState[t.table_name] === false)
    tables.forEach(t => { collapsedTablesState[t.table_name] = isAnyOpen ? true : false })
    const btn = $("btnToggleAllTables")
    if (btn) btn.textContent = isAnyOpen ? "Expand All" : "Collapse All"
    renderSchemaExplorer()
  })

  // Toggle URI Password Eye
  safeOn($("btnToggleUriEye"), "click", () => {
    const input = $("inputConnectionUri")
    if (input) {
      input.type = input.type === "password" ? "text" : "password"
    }
  })

  // Database Connection Preset buttons
  $$(".preset-btn").forEach(btn => {
    safeOn(btn, "click", () => {
      if ($("inputConnectionUri")) $("inputConnectionUri").value = btn.dataset.uri || ""
      if ($("inputProfileName") && !$("inputProfileName").value) {
        $("inputProfileName").value = btn.textContent.trim() + " Profile"
      }
    })
  })

  // Add DB Form
  safeOn($("formAddDb"), "submit", async (e) => {
    e.preventDefault()
    const name = $("inputProfileName")?.value.trim()
    const uri = $("inputConnectionUri")?.value.trim()
    if (!name || !uri) return

    const btn = $("btnConnectProfile")
    if (btn) btn.innerHTML = `<span class="pulse-dot"></span> Introspecting...`

    try {
      const res = await fetch(`${API_BASE}/api/database/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_uri: uri })
      })
      const data = await res.json()
      const newProf = {
        id: `prof-${Date.now()}`,
        name: name,
        uri: uri,
        dbInfo: data
      }
      profiles.push(newProf)
      storage.set({ [STORAGE_KEY_PROFILES]: profiles })
      selectProfile(newProf.id)
      switchTab("chat")
    } catch (err) {
      alert(`Database connection error: ${err.message}`)
    } finally {
      if (btn) btn.innerHTML = "Connect &amp; Introspect Schema"
    }
  })

  // Teach AI Form
  safeOn($("formTeachAi"), "submit", async (e) => {
    e.preventDefault()
    const inst = $("inputTeachInstruction")?.value.trim()
    if (!inst) return
    const btn = $("btnSubmitTeach")
    if (btn) btn.textContent = "Learning..."
    try {
      await fetch(`${API_BASE}/api/semantic/teach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: inst })
      })
      if ($("inputTeachInstruction")) $("inputTeachInstruction").value = ""
      await renderMetricsList()
      alert("Business rule taught successfully!")
    } catch (err) {
      alert(`Teach AI error: ${err.message}`)
    } finally {
      if (btn) btn.textContent = "Teach & Save Metric Rule"
    }
  })

  // Upload Policy Document Form
  safeOn($("formUploadPolicy"), "submit", async (e) => {
    e.preventDefault()
    const title = $("inputPolicyTitle")?.value.trim() || "Company Policy"
    const text = $("inputPolicyText")?.value.trim()
    if (!text) return
    const btn = $("btnSubmitPolicy")
    if (btn) btn.textContent = "Extracting..."
    try {
      const res = await fetch(`${API_BASE}/api/semantic/upload-policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_title: title, document_text: text })
      })
      const data = await res.json()
      if ($("inputPolicyText")) $("inputPolicyText").value = ""
      await renderMetricsList()
      alert(`Extracted and indexed ${data.count || 0} business metric rules from policy!`)
    } catch (err) {
      alert(`Policy extraction error: ${err.message}`)
    } finally {
      if (btn) btn.textContent = "Extract & Learn Policy Rules"
    }
  })

  // Global Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    const isCmd = e.metaKey || e.ctrlKey

    if (e.key === "Escape") {
      $("shortcutModalOverlay")?.classList.add("hidden")
      $("settingsSidebar")?.classList.add("hidden")
      $("settingsOverlay")?.classList.add("hidden")
      $("dbDropdownMenu")?.classList.add("hidden")
      $("queryResultsDrawer")?.classList.add("hidden")
      $("explainDrawer")?.classList.add("hidden")
      return
    }

    if (isCmd && e.key.toLowerCase() === "k") {
      e.preventDefault()
      $("dbDropdownMenu")?.classList.toggle("hidden")
    } else if (isCmd && e.key === "1") {
      e.preventDefault()
      switchTab("chat")
    } else if (isCmd && e.key === "2") {
      e.preventDefault()
      switchTab("schema")
    } else if (isCmd && e.key === "3") {
      e.preventDefault()
      switchTab("metrics")
    } else if (isCmd && e.key === "4") {
      e.preventDefault()
      switchTab("notebook")
    } else if (isCmd && e.key === "5") {
      e.preventDefault()
      switchTab("databases")
    } else if (isCmd && e.key.toLowerCase() === "m") {
      e.preventDefault()
      setCompactMode(!isCompactMode)
    } else if (isCmd && e.key === ",") {
      e.preventDefault()
      $("settingsSidebar")?.classList.toggle("hidden")
      $("settingsOverlay")?.classList.toggle("hidden")
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════
function escapeHtml(str) {
  if (!str) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
