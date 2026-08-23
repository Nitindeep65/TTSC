// QueryCraft - Minimalist Developer Client
const API_BASE = "http://127.0.0.1:8000"

const STORAGE_KEY_PROFILES = "querycraft_db_profiles_v3"
const STORAGE_KEY_ACTIVE_ID = "querycraft_active_db_id_v3"

const fallbackDemoSchema = [
  {
    table_name: "users",
    description: "Registered user accounts and credentials",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "email", type: "VARCHAR(255)" },
      { name: "name", type: "VARCHAR(100)" },
      { name: "role", type: "VARCHAR(50)" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" }
    ]
  },
  {
    table_name: "products",
    description: "Catalog products available for purchase",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "category", type: "VARCHAR(100)" },
      { name: "price", type: "NUMERIC(10,2)" },
      { name: "stock_quantity", type: "INTEGER" },
      { name: "is_available", type: "BOOLEAN" }
    ]
  },
  {
    table_name: "orders",
    description: "Customer transactions and purchase orders",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "user_id", type: "UUID", is_foreign_key: true },
      { name: "total_amount", type: "NUMERIC(12,2)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "created_at", type: "TIMESTAMPTZ" }
    ]
  },
  {
    table_name: "order_items",
    description: "Line items contained within each order",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "order_id", type: "UUID", is_foreign_key: true },
      { name: "product_id", type: "UUID", is_foreign_key: true },
      { name: "quantity", type: "INTEGER" },
      { name: "unit_price", type: "NUMERIC(10,2)" }
    ]
  },
  {
    table_name: "payments",
    description: "Payment transactions and settlement status",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "order_id", type: "UUID", is_foreign_key: true },
      { name: "amount", type: "NUMERIC(12,2)" },
      { name: "payment_method", type: "VARCHAR(50)" },
      { name: "status", type: "VARCHAR(50)" }
    ]
  }
]

const initialDefaultProfile = {
  id: "prof-demo",
  name: "Demo DB",
  uri: "",
  dbInfo: {
    host: "demo.postgres",
    tables_count: 5,
    tables: fallbackDemoSchema
  }
}

// Global State
let profiles = [initialDefaultProfile]
let activeProfileId = "prof-demo"
let chatHistory = []
let activeTab = "chat"
let isLoading = false
let collapsedTablesState = {}
let lastQueryResults = null

// Storage Layer
const storage = {
  get: (keys, callback) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback)
    } else {
      const res = {}
      if (Array.isArray(keys)) {
        keys.forEach((k) => {
          const val = localStorage.getItem(k)
          if (val) {
            try { res[k] = JSON.parse(val) } catch (e) {}
          }
        })
      }
      callback(res)
    }
  },
  set: (items, callback) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(items, callback)
    } else {
      Object.keys(items).forEach((k) => {
        localStorage.setItem(k, JSON.stringify(items[k]))
      })
      if (callback) callback()
    }
  }
}

// DOM References
const activeDbNameEl = document.getElementById("activeDbName")
const activeDbBadgeEl = document.getElementById("activeDbBadge")
const activeDbDotEl = document.getElementById("activeDbDot")
const welcomeDbNameEl = document.getElementById("welcomeDbName")
const dbSwitcherTrigger = document.getElementById("dbSwitcherTrigger")
const dbDropdownMenu = document.getElementById("dbDropdownMenu")
const dbProfilesList = document.getElementById("dbProfilesList")
const dbCountBadge = document.getElementById("dbCountBadge")
const btnAddDbQuick = document.getElementById("btnAddDbQuick")
const serverStatusText = document.getElementById("serverStatusText")

const welcomeState = document.getElementById("welcomeState")
const messagesFeed = document.getElementById("messagesFeed")
const userPromptInput = document.getElementById("userPromptInput")
const btnSendPrompt = document.getElementById("btnSendPrompt")
const btnResetChat = document.getElementById("btnResetChat")
const appFooter = document.getElementById("appFooter")

const navTabs = document.querySelectorAll(".nav-item")
const tabPanels = {
  chat: document.getElementById("tabChat"),
  schema: document.getElementById("tabSchema"),
  databases: document.getElementById("tabDatabases")
}

const inputSchemaSearch = document.getElementById("inputSchemaSearch")
const btnToggleAllTables = document.getElementById("btnToggleAllTables")
const schemaTablesContainer = document.getElementById("schemaTablesContainer")

const formAddDb = document.getElementById("formAddDb")
const inputProfileName = document.getElementById("inputProfileName")
const inputConnectionUri = document.getElementById("inputConnectionUri")
const btnToggleUriEye = document.getElementById("btnToggleUriEye")
const savedProfilesList = document.getElementById("savedProfilesList")
const savedCount = document.getElementById("savedCount")

const queryResultsDrawer = document.getElementById("queryResultsDrawer")
const btnCloseResults = document.getElementById("btnCloseResults")
const queryResultsContent = document.getElementById("queryResultsContent")
const resultRowCount = document.getElementById("resultRowCount")
const btnExportCsv = document.getElementById("btnExportCsv")

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  loadProfiles()
  bindEvents()
  checkBackendHealth()
})

function loadProfiles() {
  storage.get([STORAGE_KEY_PROFILES, STORAGE_KEY_ACTIVE_ID], (data) => {
    if (data[STORAGE_KEY_PROFILES] && Array.isArray(data[STORAGE_KEY_PROFILES]) && data[STORAGE_KEY_PROFILES].length > 0) {
      profiles = data[STORAGE_KEY_PROFILES]
    }
    if (data[STORAGE_KEY_ACTIVE_ID] && profiles.some((p) => p.id === data[STORAGE_KEY_ACTIVE_ID])) {
      activeProfileId = data[STORAGE_KEY_ACTIVE_ID]
    } else {
      activeProfileId = profiles[0].id
    }
    updateActiveProfileUI()
    renderProfilesList()
  })
}

function getActiveProfile() {
  return profiles.find((p) => p.id === activeProfileId) || profiles[0] || initialDefaultProfile
}

function updateActiveProfileUI() {
  const active = getActiveProfile()
  activeDbNameEl.textContent = active.name
  if (welcomeDbNameEl) welcomeDbNameEl.textContent = active.name
  
  const tablesCount = active.dbInfo?.tables_count || active.dbInfo?.tables?.length || 5
  activeDbBadgeEl.textContent = `${tablesCount} tbls`

  if (active.uri) {
    activeDbDotEl.classList.add("live")
  } else {
    activeDbDotEl.classList.remove("live")
  }

  renderSchemaExplorer()
}

function saveProfilesState() {
  storage.set({
    [STORAGE_KEY_PROFILES]: profiles,
    [STORAGE_KEY_ACTIVE_ID]: activeProfileId
  })
}

// --- HEALTH CHECK ---
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET", signal: AbortSignal.timeout(2000) })
    if (res.ok) {
      serverStatusText.textContent = "127.0.0.1:8000"
      serverStatusText.style.color = "#10b981"
    } else {
      throw new Error()
    }
  } catch (e) {
    serverStatusText.textContent = "Backend Offline"
    serverStatusText.style.color = "#ef4444"
  }
}

// --- TAB ROUTING ---
function switchTab(tabName) {
  activeTab = tabName
  navTabs.forEach((tab) => {
    if (tab.getAttribute("data-tab") === tabName) {
      tab.classList.add("active")
    } else {
      tab.classList.remove("active")
    }
  })

  Object.keys(tabPanels).forEach((k) => {
    if (k === tabName) {
      tabPanels[k].classList.remove("hidden")
    } else {
      tabPanels[k].classList.add("hidden")
    }
  })

  if (tabName === "chat") {
    appFooter.classList.remove("hidden")
  } else {
    appFooter.classList.add("hidden")
  }

  if (tabName === "schema") renderSchemaExplorer()
  if (tabName === "databases") renderProfilesList()
}

// --- EVENT BINDINGS ---
function bindEvents() {
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.getAttribute("data-tab")))
  })

  dbSwitcherTrigger.addEventListener("click", (e) => {
    e.stopPropagation()
    dbDropdownMenu.classList.toggle("hidden")
  })

  document.addEventListener("click", () => {
    dbDropdownMenu.classList.add("hidden")
  })

  dbDropdownMenu.addEventListener("click", (e) => e.stopPropagation())

  btnAddDbQuick.addEventListener("click", () => {
    dbDropdownMenu.classList.add("hidden")
    switchTab("databases")
    inputProfileName.focus()
  })

  btnCloseResults.addEventListener("click", () => queryResultsDrawer.classList.add("hidden"))
  btnExportCsv.addEventListener("click", exportCsvResults)
  btnResetChat.addEventListener("click", resetChat)

  // Presets in Form
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      inputConnectionUri.value = btn.getAttribute("data-uri")
      inputConnectionUri.focus()
    })
  })

  // Password Visibility Toggle
  btnToggleUriEye.addEventListener("click", () => {
    if (inputConnectionUri.type === "password") {
      inputConnectionUri.type = "text"
      btnToggleUriEye.textContent = "🙈"
    } else {
      inputConnectionUri.type = "password"
      btnToggleUriEye.textContent = "👁"
    }
  })

  // Add DB Submit
  formAddDb.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = inputProfileName.value.trim()
    const uri = inputConnectionUri.value.trim()
    if (!name || !uri) return

    const btnSubmit = document.getElementById("btnConnectProfile")
    btnSubmit.disabled = true
    btnSubmit.textContent = "Connecting..."

    try {
      const res = await fetch(`${API_BASE}/api/database/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_uri: uri })
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.detail || "Connection failed")
      }

      const dbData = await res.json()
      const newProfile = {
        id: `prof-${Date.now()}`,
        name,
        uri,
        dbInfo: dbData
      }

      profiles.push(newProfile)
      activeProfileId = newProfile.id
      saveProfilesState()
      updateActiveProfileUI()
      renderProfilesList()

      inputProfileName.value = ""
      inputConnectionUri.value = ""
      switchTab("chat")
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      btnSubmit.disabled = false
      btnSubmit.textContent = "Connect & Introspect"
    }
  })

  // Schema Search Filter
  inputSchemaSearch.addEventListener("input", (e) => {
    renderSchemaExplorer(e.target.value.toLowerCase().trim())
  })

  btnToggleAllTables.addEventListener("click", () => {
    const active = getActiveProfile()
    const tables = active.dbInfo?.tables || fallbackDemoSchema
    const allCollapsed = tables.every((t) => collapsedTablesState[t.table_name || t.table])
    tables.forEach((t) => {
      collapsedTablesState[t.table_name || t.table] = !allCollapsed
    })
    btnToggleAllTables.textContent = allCollapsed ? "Collapse All" : "Expand All"
    renderSchemaExplorer(inputSchemaSearch.value.toLowerCase().trim())
  })

  // Prompt Submit
  btnSendPrompt.addEventListener("click", () => handleSendPrompt())

  userPromptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendPrompt()
    }
  })

  // Starter Prompts
  document.querySelectorAll(".prompt-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt")
      if (prompt) handleSendPrompt(prompt)
    })
  })

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault()
      dbDropdownMenu.classList.toggle("hidden")
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "1") {
      e.preventDefault()
      switchTab("chat")
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "2") {
      e.preventDefault()
      switchTab("schema")
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "3") {
      e.preventDefault()
      switchTab("databases")
    }
    if (e.key === "Escape") {
      dbDropdownMenu.classList.add("hidden")
      queryResultsDrawer.classList.add("hidden")
    }
  })
}

// --- PROFILES RENDERING ---
function renderProfilesList() {
  dbProfilesList.innerHTML = ""
  savedProfilesList.innerHTML = ""
  dbCountBadge.textContent = profiles.length
  savedCount.textContent = profiles.length

  profiles.forEach((p) => {
    const isActive = p.id === activeProfileId
    const tblCount = p.dbInfo?.tables_count || p.dbInfo?.tables?.length || 5

    // Popover item
    const popItem = document.createElement("div")
    popItem.className = `popover-item ${isActive ? "active" : ""}`
    popItem.innerHTML = `
      <div class="popover-item-left">
        <span class="status-indicator ${p.uri ? "live" : ""}"></span>
        <span>${escapeHtml(p.name)}</span>
      </div>
      <span class="tbl-count">${tblCount} tbls</span>
    `
    popItem.addEventListener("click", () => {
      activeProfileId = p.id
      saveProfilesState()
      updateActiveProfileUI()
      renderProfilesList()
      dbDropdownMenu.classList.add("hidden")
    })
    dbProfilesList.appendChild(popItem)

    // Saved list item in DB tab
    const savedItem = document.createElement("div")
    savedItem.className = `saved-db-item ${isActive ? "active" : ""}`
    savedItem.innerHTML = `
      <div>
        <span class="font-medium">${escapeHtml(p.name)}</span>
        <span class="tbl-count" style="margin-left:6px;">${escapeHtml(p.dbInfo?.host || "demo.postgres")}</span>
      </div>
      <div class="saved-db-actions">
        ${isActive ? '<span class="tbl-count" style="color:#10b981; font-weight:600;">Active</span>' : `<button type="button" class="tiny-btn btn-sel-prof" data-id="${p.id}">Select</button>`}
        ${profiles.length > 1 ? `<button type="button" class="tiny-btn delete btn-del-prof" data-id="${p.id}">✕</button>` : ""}
      </div>
    `
    savedProfilesList.appendChild(savedItem)
  })

  savedProfilesList.querySelectorAll(".btn-sel-prof").forEach((b) => {
    b.addEventListener("click", () => {
      activeProfileId = b.getAttribute("data-id")
      saveProfilesState()
      updateActiveProfileUI()
      renderProfilesList()
    })
  })

  savedProfilesList.querySelectorAll(".btn-del-prof").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-id")
      if (confirm("Delete connection profile?")) {
        profiles = profiles.filter((p) => p.id !== id)
        if (activeProfileId === id) activeProfileId = profiles[0].id
        saveProfilesState()
        updateActiveProfileUI()
        renderProfilesList()
      }
    })
  })
}

// --- SCHEMA EXPLORER ---
function renderSchemaExplorer(filterQuery = "") {
  const active = getActiveProfile()
  const tables = active.dbInfo?.tables || fallbackDemoSchema
  schemaTablesContainer.innerHTML = ""

  let filteredTables = tables
  if (filterQuery) {
    filteredTables = tables.filter((t) => {
      const matchTable = (t.table_name || t.table || "").toLowerCase().includes(filterQuery)
      const matchCol = (t.columns || []).some((c) => {
        const colName = (typeof c === "string" ? c : c.name || "").toLowerCase()
        return colName.includes(filterQuery)
      })
      return matchTable || matchCol
    })
  }

  if (filteredTables.length === 0) {
    schemaTablesContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#6b7280; font-size:11px;">No tables match "${escapeHtml(filterQuery)}"</div>`
    return
  }

  filteredTables.forEach((t) => {
    const tableName = t.table_name || t.table
    const isCollapsed = !!collapsedTablesState[tableName]
    const card = document.createElement("div")
    card.className = "table-node"

    const cols = t.columns || []
    let colsHtml = cols
      .map((c) => {
        const colName = typeof c === "string" ? c : c.name
        const colType = typeof c === "string" ? "TEXT" : c.type
        const isPk = c?.is_primary_key ? "🔑 " : ""
        const isFk = c?.is_foreign_key ? "🔗 " : ""
        return `
          <div class="column-row">
            <span>${isPk}${isFk}${escapeHtml(colName)}</span>
            <span class="col-tag">${escapeHtml(colType)}</span>
          </div>
        `
      })
      .join("")

    card.innerHTML = `
      <div class="table-node-header" data-table="${tableName}">
        <span>${escapeHtml(tableName)}</span>
        <span class="tbl-count">${cols.length} cols ${isCollapsed ? "▸" : "▾"}</span>
      </div>
      ${isCollapsed ? "" : `<div class="table-columns">${colsHtml}</div>`}
    `

    card.querySelector(".table-node-header").addEventListener("click", () => {
      collapsedTablesState[tableName] = !collapsedTablesState[tableName]
      renderSchemaExplorer(inputSchemaSearch.value.toLowerCase().trim())
    })

    schemaTablesContainer.appendChild(card)
  })
}

// --- CHAT STREAM ---
async function handleSendPrompt(text) {
  const prompt = text || userPromptInput.value.trim()
  if (!prompt || isLoading) return

  userPromptInput.value = ""
  welcomeState.classList.add("hidden")
  messagesFeed.classList.remove("hidden")

  appendUserMessage(prompt)

  const active = getActiveProfile()
  const historyPayload = chatHistory.map((m) => ({
    role: m.role,
    content: m.rawContent || m.content
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
  btnSendPrompt.disabled = true

  try {
    const res = await fetch(`${API_BASE}/api/clarification/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(`Server status ${res.status}`)

    const aiData = await res.json()
    loadingEl.remove()

    if (aiData.status === "needs_clarification") {
      appendClarificationMessage(aiData.message)
      chatHistory.push({
        role: "assistant",
        content: aiData.message,
        rawContent: aiData.message,
        status: "needs_clarification"
      })
    } else if (aiData.status === "complete") {
      const { sql_query, explanation, tables_identified } = aiData.extracted_data || {}
      appendCompleteMessage({
        message: aiData.message,
        explanation,
        sql_query,
        tables: tables_identified || []
      })
      chatHistory.push({
        role: "assistant",
        content: aiData.message,
        sql_query,
        rawContent: `${aiData.message || ""} ${explanation || ""} SQL: ${sql_query || ""}`,
        status: "complete"
      })
    }
  } catch (err) {
    loadingEl.remove()
    appendErrorMessage(`Unable to connect to backend at ${API_BASE}`)
    checkBackendHealth()
  } finally {
    isLoading = false
    btnSendPrompt.disabled = false
    messagesFeed.scrollTop = messagesFeed.scrollHeight
  }
}

function appendUserMessage(text) {
  chatHistory.push({ role: "user", content: text })
  const row = document.createElement("div")
  row.className = "msg-row user"
  row.innerHTML = `<div class="user-bubble">${escapeHtml(text)}</div>`
  messagesFeed.appendChild(row)
  messagesFeed.scrollTop = messagesFeed.scrollHeight
}

function appendClarificationMessage(text) {
  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `
    <div class="assistant-card">
      <div class="clarify-box">
        <div class="clarify-header">
          <span>⚠️ Clarification Required</span>
        </div>
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `
  messagesFeed.appendChild(row)
}

function appendCompleteMessage(data) {
  const row = document.createElement("div")
  row.className = "msg-row"

  const tablesHtml = data.tables && data.tables.length
    ? `<div style="font-size:10px; color:#6b7280; display:flex; gap:4px;"><strong>Tables:</strong> ${data.tables.map((t) => `<span class="col-tag">${t}</span>`).join("")}</div>`
    : ""

  const sqlHtml = data.sql_query
    ? `
      <div class="sql-box">
        <div class="sql-header">
          <span>POSTGRESQL</span>
          <div class="sql-buttons">
            <button type="button" class="sql-btn btn-copy-sql">Copy</button>
            <button type="button" class="sql-btn run btn-run-sql">Run</button>
          </div>
        </div>
        <pre class="sql-code"><code>${escapeHtml(data.sql_query)}</code></pre>
      </div>
    `
    : ""

  row.innerHTML = `
    <div class="assistant-card">
      <div class="complete-box">
        ${data.message ? `<div class="complete-status">${escapeHtml(data.message)}</div>` : ""}
        ${data.explanation ? `<div class="complete-explanation">${escapeHtml(data.explanation)}</div>` : ""}
        ${tablesHtml}
        ${sqlHtml}
      </div>
    </div>
  `

  if (data.sql_query) {
    const btnCopy = row.querySelector(".btn-copy-sql")
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(data.sql_query)
      btnCopy.textContent = "Copied"
      setTimeout(() => (btnCopy.textContent = "Copy"), 1500)
    })

    const btnRun = row.querySelector(".btn-run-sql")
    btnRun.addEventListener("click", () => executeQuery(data.sql_query))
  }

  messagesFeed.appendChild(row)
}

function appendErrorMessage(msg) {
  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `
    <div style="width:100%; background:var(--danger-bg); border:1px solid var(--danger-border); border-radius:6px; padding:8px 10px; font-size:11px; color:var(--danger-text);">
      ${escapeHtml(msg)}
    </div>
  `
  messagesFeed.appendChild(row)
}

function appendLoading() {
  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `
    <div class="loading-indicator">
      <div class="spin-dot"></div>
      <span>Reasoning over schema...</span>
    </div>
  `
  messagesFeed.appendChild(row)
  messagesFeed.scrollTop = messagesFeed.scrollHeight
  return row
}

// --- QUERY RUNNER ---
async function executeQuery(sql) {
  const active = getActiveProfile()
  if (!active.uri) {
    alert("No connection string attached to this profile. Switch to DBs tab to add one.")
    switchTab("databases")
    return
  }

  queryResultsDrawer.classList.remove("hidden")
  queryResultsContent.innerHTML = `<div class="loading-indicator"><div class="spin-dot"></div><span>Running query on ${escapeHtml(active.name)}...</span></div>`
  resultRowCount.textContent = "Running..."

  try {
    const res = await fetch(`${API_BASE}/api/database/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_uri: active.uri,
        sql_query: sql,
        limit: 50
      })
    })

    if (!res.ok) {
      const errJson = await res.json()
      throw new Error(errJson.detail || "Execution failed")
    }

    const data = await res.json()
    lastQueryResults = data
    resultRowCount.textContent = `${data.row_count} rows`

    if (data.rows && data.rows.length > 0) {
      let tableHtml = `<table class="data-table"><thead><tr>`
      data.columns.forEach((c) => {
        tableHtml += `<th>${escapeHtml(c)}</th>`
      })
      tableHtml += `</tr></thead><tbody>`

      data.rows.forEach((row) => {
        tableHtml += `<tr>`
        data.columns.forEach((c) => {
          const val = row[c] === null ? '<span style="color:#6b7280; font-style:italic;">null</span>' : escapeHtml(String(row[c]))
          tableHtml += `<td>${val}</td>`
        })
        tableHtml += `</tr>`
      })
      tableHtml += `</tbody></table>`
      queryResultsContent.innerHTML = tableHtml
    } else {
      queryResultsContent.innerHTML = `<div style="padding:16px; color:#6b7280; font-size:11px; text-align:center;">Query executed. 0 rows returned.</div>`
    }
  } catch (err) {
    resultRowCount.textContent = "Error"
    queryResultsContent.innerHTML = `<div style="padding:10px; background:var(--danger-bg); color:var(--danger-text); border-radius:6px; font-size:11px;">${escapeHtml(err.message)}</div>`
  }
}

// CSV Export
function exportCsvResults() {
  if (!lastQueryResults || !lastQueryResults.rows || !lastQueryResults.rows.length) return
  const { columns, rows } = lastQueryResults
  let csv = columns.join(",") + "\n"
  rows.forEach((r) => {
    const line = columns.map((c) => {
      const val = r[c] === null ? "" : String(r[c])
      return `"${val.replace(/"/g, '""')}"`
    }).join(",")
    csv += line + "\n"
  })

  navigator.clipboard.writeText(csv)
  btnExportCsv.textContent = "Copied"
  setTimeout(() => (btnExportCsv.textContent = "CSV"), 1500)
}

function resetChat() {
  chatHistory = []
  messagesFeed.innerHTML = ""
  messagesFeed.classList.add("hidden")
  welcomeState.classList.remove("hidden")
  queryResultsDrawer.classList.add("hidden")
}

function escapeHtml(text) {
  if (typeof text !== "string") return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
