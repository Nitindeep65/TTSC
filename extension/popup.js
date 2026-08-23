// QueryCraft - Multi-Database Text-to-SQL Clarification Engine Client
const API_BASE = "http://127.0.0.1:8000"

const STORAGE_KEY_PROFILES = "querycraft_db_profiles_v1"
const STORAGE_KEY_ACTIVE_ID = "querycraft_active_db_id_v1"

const fallbackDemoSchema = [
  {
    table_name: "users",
    description: "Registered user accounts",
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
    description: "Catalog products",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "category", type: "VARCHAR(100)" },
      { name: "price", type: "NUMERIC(10,2)" },
      { name: "stock_quantity", type: "INTEGER" }
    ]
  },
  {
    table_name: "orders",
    description: "Purchase orders",
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
    description: "Order line items",
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
    description: "Payment transactions",
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
  name: "Demo PostgreSQL",
  uri: "",
  dbInfo: {
    host: "e-commerce-demo",
    tables_count: 5,
    tables: fallbackDemoSchema
  }
}

// Global Extension State
let profiles = [initialDefaultProfile]
let activeProfileId = "prof-demo"
let chatHistory = [] // { role: "user" | "assistant", content: string, status?: string, sql_query?: string, rawContent?: string }
let isLoading = false

// Storage Helper (supports chrome.storage.local and localStorage fallback)
const storage = {
  get: (keys, callback) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback)
    } else {
      const res = {}
      if (Array.isArray(keys)) {
        keys.forEach((k) => {
          const val = localStorage.getItem(k)
          if (val) res[k] = JSON.parse(val)
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

// DOM Elements
const activeDbNameEl = document.getElementById("activeDbName")
const activeDbBadgeEl = document.getElementById("activeDbBadge")
const activeDbDotEl = document.getElementById("activeDbDot")
const welcomeDbNameEl = document.getElementById("welcomeDbName")
const dbSwitcherTrigger = document.getElementById("dbSwitcherTrigger")
const dbDropdownMenu = document.getElementById("dbDropdownMenu")
const dbProfilesList = document.getElementById("dbProfilesList")
const dbCountBadge = document.getElementById("dbCountBadge")
const btnAddDbQuick = document.getElementById("btnAddDbQuick")

const welcomeState = document.getElementById("welcomeState")
const messagesFeed = document.getElementById("messagesFeed")
const userPromptInput = document.getElementById("userPromptInput")
const btnSendPrompt = document.getElementById("btnSendPrompt")
const btnResetChat = document.getElementById("btnResetChat")

const btnToggleSchema = document.getElementById("btnToggleSchema")
const schemaDrawer = document.getElementById("schemaDrawer")
const btnCloseSchema = document.getElementById("btnCloseSchema")
const schemaTablesContainer = document.getElementById("schemaTablesContainer")

const btnManageDbs = document.getElementById("btnManageDbs")
const manageDbsModal = document.getElementById("manageDbsModal")
const btnCloseManageDbs = document.getElementById("btnCloseManageDbs")
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

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  loadProfiles()
  bindEvents()
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
  welcomeDbNameEl.textContent = active.name
  
  const tablesCount = active.dbInfo?.tables_count || active.dbInfo?.tables?.length || 5
  activeDbBadgeEl.textContent = `${tablesCount} tbls`

  if (active.uri) {
    activeDbDotEl.classList.add("active")
  } else {
    activeDbDotEl.classList.remove("active")
  }

  renderSchemaInspector()
}

function saveProfilesState() {
  storage.set({
    [STORAGE_KEY_PROFILES]: profiles,
    [STORAGE_KEY_ACTIVE_ID]: activeProfileId
  })
}

// --- EVENT LISTENERS ---
function bindEvents() {
  // DB Switcher Dropdown
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
    openManageDbsModal()
  })

  // Modals & Drawers
  btnToggleSchema.addEventListener("click", () => {
    schemaDrawer.classList.toggle("hidden")
    queryResultsDrawer.classList.add("hidden")
  })

  btnCloseSchema.addEventListener("click", () => {
    schemaDrawer.classList.add("hidden")
  })

  btnManageDbs.addEventListener("click", openManageDbsModal)
  btnCloseManageDbs.addEventListener("click", () => manageDbsModal.classList.add("hidden"))

  btnCloseResults.addEventListener("click", () => {
    queryResultsDrawer.classList.add("hidden")
  })

  btnResetChat.addEventListener("click", resetChat)

  // Presets in Add Form
  document.querySelectorAll(".chip-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      inputConnectionUri.value = btn.getAttribute("data-uri")
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

  // Add DB Form Submit
  formAddDb.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = inputProfileName.value.trim()
    const uri = inputConnectionUri.value.trim()
    if (!name || !uri) return

    const btnSubmit = document.getElementById("btnConnectProfile")
    btnSubmit.disabled = true
    btnSubmit.innerHTML = "Connecting &amp; Introspecting..."

    try {
      const res = await fetch(`${API_BASE}/api/database/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_uri: uri })
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.detail || "Failed to connect to PostgreSQL database.")
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
      manageDbsModal.classList.add("hidden")
    } catch (err) {
      alert(`Connection Error: ${err.message}`)
    } finally {
      btnSubmit.disabled = false
      btnSubmit.innerHTML = "Connect &amp; Introspect Schema"
    }
  })

  // Input & Submit Handlers
  btnSendPrompt.addEventListener("click", () => handleSendPrompt())

  userPromptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendPrompt()
    }
  })

  // Quick Starters Chips
  document.querySelectorAll(".starter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt")
      if (prompt) handleSendPrompt(prompt)
    })
  })

  // Keyboard Shortcuts: Cmd/Ctrl + K to switch DB, Esc to close drawers
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault()
      dbDropdownMenu.classList.toggle("hidden")
    }
    if (e.key === "Escape") {
      dbDropdownMenu.classList.add("hidden")
      schemaDrawer.classList.add("hidden")
      manageDbsModal.classList.add("hidden")
      queryResultsDrawer.classList.add("hidden")
    }
  })
}

// --- PROFILES RENDERING ---
function renderProfilesList() {
  dbProfilesList.innerHTML = ""
  savedProfilesList.innerHTML = ""
  dbCountBadge.textContent = `${profiles.length} profiles`
  savedCount.textContent = profiles.length

  profiles.forEach((p) => {
    const isActive = p.id === activeProfileId
    const tblCount = p.dbInfo?.tables_count || p.dbInfo?.tables?.length || 5

    // 1. Dropdown Item
    const dropItem = document.createElement("div")
    dropItem.className = `db-profile-item ${isActive ? "active" : ""}`
    dropItem.innerHTML = `
      <div class="db-profile-left">
        <div class="db-dot ${p.uri ? "active" : ""}"></div>
        <span class="db-name">${p.name}</span>
      </div>
      <span class="db-badge">${tblCount} tbls</span>
    `
    dropItem.addEventListener("click", () => {
      activeProfileId = p.id
      saveProfilesState()
      updateActiveProfileUI()
      renderProfilesList()
      dbDropdownMenu.classList.add("hidden")
    })
    dbProfilesList.appendChild(dropItem)

    // 2. Manage Modal Row
    const savedRow = document.createElement("div")
    savedRow.className = "saved-profile-row"
    savedRow.innerHTML = `
      <div class="saved-profile-meta">
        <span class="saved-profile-title">${p.name}</span>
        <span class="saved-profile-host">${p.dbInfo?.host || "Local/Demo Schema"} (${tblCount} tables)</span>
      </div>
      <div class="saved-profile-actions">
        ${isActive ? '<span class="btn-small active-tag">Active</span>' : `<button type="button" class="btn-small btn-set-active" data-id="${p.id}">Select</button>`}
        ${profiles.length > 1 ? `<button type="button" class="btn-small delete btn-delete-prof" data-id="${p.id}">✕</button>` : ""}
      </div>
    `
    savedProfilesList.appendChild(savedRow)
  })

  // Bind Switch & Delete in Modal
  savedProfilesList.querySelectorAll(".btn-set-active").forEach((b) => {
    b.addEventListener("click", () => {
      activeProfileId = b.getAttribute("data-id")
      saveProfilesState()
      updateActiveProfileUI()
      renderProfilesList()
    })
  })

  savedProfilesList.querySelectorAll(".btn-delete-prof").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-id")
      if (confirm("Delete this database profile?")) {
        profiles = profiles.filter((p) => p.id !== id)
        if (activeProfileId === id) activeProfileId = profiles[0].id
        saveProfilesState()
        updateActiveProfileUI()
        renderProfilesList()
      }
    })
  })
}

function openManageDbsModal() {
  renderProfilesList()
  manageDbsModal.classList.remove("hidden")
  inputProfileName.focus()
}

// --- SCHEMA INSPECTOR ---
function renderSchemaInspector() {
  const active = getActiveProfile()
  const tables = active.dbInfo?.tables || fallbackDemoSchema
  schemaTablesContainer.innerHTML = ""

  tables.forEach((t) => {
    const card = document.createElement("div")
    card.className = "table-card"

    const cols = t.columns || []
    let colsHtml = cols
      .map((c) => {
        const colName = typeof c === "string" ? c : c.name
        const colType = typeof c === "string" ? "TEXT" : c.type
        const isPk = c?.is_primary_key ? "🔑 " : ""
        const isFk = c?.is_foreign_key ? "🔗 " : ""
        return `<div class="col-item"><span>${isPk}${isFk}${colName}</span><span style="color:#5e7065;">${colType}</span></div>`
      })
      .join("")

    card.innerHTML = `
      <div class="table-card-header">
        <span>📦 ${t.table_name || t.table}</span>
        <span style="font-size:10px; color:#5e7065;">${cols.length} cols</span>
      </div>
      <div class="table-cols">${colsHtml}</div>
    `
    schemaTablesContainer.appendChild(card)
  })
}

// --- CHAT & PROMPT EXECUTION ---
async function handleSendPrompt(text) {
  const prompt = text || userPromptInput.value.trim()
  if (!prompt || isLoading) return

  userPromptInput.value = ""
  welcomeState.classList.add("hidden")
  messagesFeed.classList.remove("hidden")

  // Append User Message
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

  // Show Loading Spinner
  const loadingEl = appendLoading()
  isLoading = true
  btnSendPrompt.disabled = true

  try {
    const res = await fetch(`${API_BASE}/api/clarification/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`)
    }

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
    appendErrorMessage(
      `Failed to connect to FastAPI backend at ${API_BASE}. Make sure 'uvicorn app.main:app --reload' is running.`
    )
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
  row.innerHTML = `<div class="msg-bubble-user">${escapeHtml(text)}</div>`
  messagesFeed.appendChild(row)
  messagesFeed.scrollTop = messagesFeed.scrollHeight
}

function appendClarificationMessage(text) {
  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `
    <div class="msg-assistant-wrap">
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
      </div>
      <div class="msg-card-clarify">
        <div class="clarify-tag">
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
    ? `<div style="display:flex; gap:4px; flex-wrap:wrap; font-size:10px;"><strong>Tables:</strong> ${data.tables.map((t) => `<span class="db-badge">${t}</span>`).join("")}</div>`
    : ""

  const sqlHtml = data.sql_query
    ? `
      <div class="sql-container">
        <div class="sql-topbar">
          <span>PostgreSQL (Read-Only)</span>
          <div class="sql-actions">
            <button type="button" class="btn-sql-action btn-copy-sql">📋 Copy</button>
            <button type="button" class="btn-sql-action run btn-run-sql">▶ Run on DB</button>
          </div>
        </div>
        <pre class="sql-pre"><code>${escapeHtml(data.sql_query)}</code></pre>
      </div>
    `
    : ""

  row.innerHTML = `
    <div class="msg-assistant-wrap" style="width:100%;">
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div class="msg-card-complete" style="width:100%;">
        ${data.message ? `<div style="font-weight:700; color:#1e6138;">${escapeHtml(data.message)}</div>` : ""}
        ${data.explanation ? `<p style="color:#5e7065; font-size:11px;">${escapeHtml(data.explanation)}</p>` : ""}
        ${tablesHtml}
        ${sqlHtml}
      </div>
    </div>
  `

  // Bind Copy & Run
  if (data.sql_query) {
    const btnCopy = row.querySelector(".btn-copy-sql")
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(data.sql_query)
      btnCopy.textContent = "✓ Copied"
      setTimeout(() => (btnCopy.textContent = "📋 Copy"), 1800)
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
    <div class="msg-assistant-wrap">
      <div class="msg-avatar" style="background:#d9383a; color:#fff;">!</div>
      <div style="background:#fee2e2; border:1px solid #fca5a5; border-radius:10px; padding:8px 10px; font-size:11px; color:#991b1b;">
        ${escapeHtml(msg)}
      </div>
    </div>
  `
  messagesFeed.appendChild(row)
}

function appendLoading() {
  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `
    <div class="msg-assistant-wrap">
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle></svg>
      </div>
      <div class="loading-box">
        <div class="spinner"></div>
        <span>Evaluating intent, schema constraints &amp; rules...</span>
      </div>
    </div>
  `
  messagesFeed.appendChild(row)
  messagesFeed.scrollTop = messagesFeed.scrollHeight
  return row
}

// --- LIVE QUERY EXECUTION ---
async function executeQuery(sql) {
  const active = getActiveProfile()
  if (!active.uri) {
    alert("No cloud database connected to this profile. Please open 'Manage Databases' to add a connection URI.")
    openManageDbsModal()
    return
  }

  queryResultsDrawer.classList.remove("hidden")
  queryResultsContent.innerHTML = `<div class="loading-box"><div class="spinner"></div><span>Executing read-only query on ${active.name}...</span></div>`
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
      throw new Error(errJson.detail || "Query execution failed.")
    }

    const data = await res.json()
    resultRowCount.textContent = `${data.row_count} row(s)`

    if (data.rows && data.rows.length > 0) {
      let tableHtml = `<table class="results-table"><thead><tr>`
      data.columns.forEach((c) => {
        tableHtml += `<th>${escapeHtml(c)}</th>`
      })
      tableHtml += `</tr></thead><tbody>`

      data.rows.forEach((row) => {
        tableHtml += `<tr>`
        data.columns.forEach((c) => {
          const val = row[c] === null ? '<span style="color:#9aa79e; font-style:italic;">null</span>' : escapeHtml(String(row[c]))
          tableHtml += `<td>${val}</td>`
        })
        tableHtml += `</tr>`
      })
      tableHtml += `</tbody></table>`
      queryResultsContent.innerHTML = tableHtml
    } else {
      queryResultsContent.innerHTML = `<div style="padding:12px; color:#5e7065; font-style:italic;">Query executed successfully. 0 rows returned.</div>`
    }
  } catch (err) {
    resultRowCount.textContent = "Error"
    queryResultsContent.innerHTML = `<div style="padding:10px; background:#fee2e2; color:#991b1b; border-radius:6px; font-size:11px;"><strong>Execution Error:</strong> ${escapeHtml(err.message)}</div>`
  }
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
