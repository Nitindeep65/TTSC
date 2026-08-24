// QueryCraft — Full-featured Developer Extension
// ═══════════════════════════════════════════════

let API_BASE = "http://127.0.0.1:8000"

const STORAGE_KEY_PROFILES = "querycraft_db_profiles_v4"
const STORAGE_KEY_ACTIVE_ID = "querycraft_active_db_id_v4"
const STORAGE_KEY_SHORTCUTS = "querycraft_shortcuts_v1"
const STORAGE_KEY_PREFS = "querycraft_prefs_v1"
const STORAGE_KEY_ACCOUNT = "querycraft_account_v1"
const STORAGE_KEY_USAGE = "querycraft_usage_v1"
const STORAGE_KEY_API_BASE = "querycraft_api_base_v1"

// ═══════════════════════════════════════════════
// DEFAULT SHORTCUT DEFINITIONS
// ═══════════════════════════════════════════════
const DEFAULT_SHORTCUTS = [
  { id: "openDB", label: "Switch Database", mod: "Cmd", key: "K" },
  { id: "tabChat", label: "Go to Chat", mod: "Cmd", key: "1" },
  { id: "tabSchema", label: "Go to Schema", mod: "Cmd", key: "2" },
  { id: "tabMetrics", label: "Go to Metrics", mod: "Cmd", key: "3" },
  { id: "tabDBs", label: "Go to Databases", mod: "Cmd", key: "4" },
  { id: "compact", label: "Toggle Compact Mode", mod: "Cmd", key: "M" },
  { id: "settings", label: "Open Settings", mod: "Cmd", key: "," },
  { id: "clearChat", label: "Clear Chat", mod: "Cmd", key: "Backspace" },
  { id: "closeAll", label: "Close Panels / Escape", mod: "", key: "Escape" },
]

let customShortcuts = {}   // id -> { mod, key } overrides
let recordingFor = null    // shortcut id currently being recorded

// ═══════════════════════════════════════════════
// FALLBACK DEMO SCHEMA
// ═══════════════════════════════════════════════
const fallbackDemoSchema = [
  { table_name: "users", description: "Registered user accounts", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "email", type: "VARCHAR(255)" }, { name: "name", type: "VARCHAR(100)" }, { name: "role", type: "VARCHAR(50)" }, { name: "is_active", type: "BOOLEAN" }, { name: "created_at", type: "TIMESTAMPTZ" }] },
  { table_name: "products", description: "Catalog products", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "name", type: "VARCHAR(255)" }, { name: "category", type: "VARCHAR(100)" }, { name: "price", type: "NUMERIC(10,2)" }, { name: "stock_quantity", type: "INTEGER" }, { name: "is_available", type: "BOOLEAN" }] },
  { table_name: "orders", description: "Customer purchase orders", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "user_id", type: "UUID", is_foreign_key: true }, { name: "total_amount", type: "NUMERIC(12,2)" }, { name: "status", type: "VARCHAR(50)" }, { name: "created_at", type: "TIMESTAMPTZ" }] },
  { table_name: "order_items", description: "Line items per order", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "order_id", type: "UUID", is_foreign_key: true }, { name: "product_id", type: "UUID", is_foreign_key: true }, { name: "quantity", type: "INTEGER" }, { name: "unit_price", type: "NUMERIC(10,2)" }] },
  { table_name: "payments", description: "Payment transactions", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "order_id", type: "UUID", is_foreign_key: true }, { name: "amount", type: "NUMERIC(12,2)" }, { name: "payment_method", type: "VARCHAR(50)" }, { name: "status", type: "VARCHAR(50)" }] },
]

const initialDefaultProfile = { id: "prof-demo", name: "Demo DB", uri: "", dbInfo: { host: "demo.postgres", tables_count: 5, tables: fallbackDemoSchema } }

// ═══════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════
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
let isInitialized = false
let isEventsBound = false

// ═══════════════════════════════════════════════
// SAFE DOM SELECTORS & EVENT HELPER
// ═══════════════════════════════════════════════
const $ = (id) => document.getElementById(id)
const $$ = (sel) => document.querySelectorAll(sel)

function safeOn(target, event, handler, options) {
  const el = typeof target === "string" ? $(target) : target
  if (el && typeof el.addEventListener === "function") {
    el.addEventListener(event, handler, options)
  }
}

// ═══════════════════════════════════════════════
// STORAGE LAYER
// ═══════════════════════════════════════════════
const storage = {
  get: (keys, cb) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(keys, cb)
    } else {
      const res = {}
        ; (Array.isArray(keys) ? keys : [keys]).forEach(k => {
          const v = localStorage.getItem(k)
          if (v) { try { res[k] = JSON.parse(v) } catch { } }
        })
      cb(res)
    }
  },
  set: (items, cb) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set(items, cb)
    } else {
      Object.keys(items).forEach(k => localStorage.setItem(k, JSON.stringify(items[k])))
      if (cb) cb()
    }
  }
}

// ── Backend settings helpers (shared with web dashboard) ──────────────────────
async function fetchBackendSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings/`, { signal: AbortSignal.timeout(2500) })
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

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
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
  // Step 1: load DB profiles from chrome.storage
  storage.get([STORAGE_KEY_PROFILES, STORAGE_KEY_ACTIVE_ID, STORAGE_KEY_SHORTCUTS, STORAGE_KEY_PREFS], data => {
    if (data[STORAGE_KEY_PROFILES]?.length) profiles = data[STORAGE_KEY_PROFILES]
    if (data[STORAGE_KEY_ACTIVE_ID] && profiles.some(p => p.id === data[STORAGE_KEY_ACTIVE_ID])) {
      activeProfileId = data[STORAGE_KEY_ACTIVE_ID]
    }
    if (data[STORAGE_KEY_SHORTCUTS]) customShortcuts = data[STORAGE_KEY_SHORTCUTS]
    if (data[STORAGE_KEY_PREFS]) prefs = { ...prefs, ...data[STORAGE_KEY_PREFS] }

    applyPrefs()
    updateActiveProfileUI()
    renderProfilesList()
    bindEvents()
    checkBackendHealth()

    // Step 2: sync settings with backend
    syncFromBackend().then(() => {
      applyPrefs()
      updateActiveProfileUI()
      if (prefs.compactOnStart) enableCompactMode()
      if (prefs.autoFocus) $("userPromptInput")?.focus()
    })
  })
}

// ═══════════════════════════════════════════════
// PREFERENCES
// ═══════════════════════════════════════════════
function applyPrefs() {
  if (document.body) {
    document.body.style.fontSize = (prefs.fontSize || "12") + "px"
  }
}

async function savePrefs() {
  storage.set({ [STORAGE_KEY_PREFS]: prefs })
  await pushBackendSettings({ preferences: prefs })
}

// ═══════════════════════════════════════════════
// COMPACT MODE
// ═══════════════════════════════════════════════
function enableCompactMode() {
  isCompactMode = true
  $("app")?.classList.add("compact-mode")
  $("compactBar")?.classList.remove("hidden")
  const active = getActiveProfile()
  const lbl = $("compactDbLabel")
  if (lbl) lbl.textContent = active.name
  if (document.body) document.body.style.height = "40px"
}

function disableCompactMode() {
  isCompactMode = false
  $("app")?.classList.remove("compact-mode")
  $("compactBar")?.classList.add("hidden")
  if (document.body) document.body.style.height = "600px"
}

function toggleCompactMode() {
  if (isCompactMode) disableCompactMode()
  else enableCompactMode()
}

// ═══════════════════════════════════════════════
// SETTINGS SIDEBAR
// ═══════════════════════════════════════════════
function openSettings(tabId = "account") {
  isSettingsOpen = true
  $("settingsSidebar")?.classList.remove("hidden")
  $("settingsOverlay")?.classList.remove("hidden")
  switchSettingsTab(tabId)
  refreshSettingsData()
}

function closeSettings() {
  isSettingsOpen = false
  $("settingsSidebar")?.classList.add("hidden")
  $("settingsOverlay")?.classList.add("hidden")
}

function switchSettingsTab(tabId) {
  activeSettingsTab = tabId
  $$(".settings-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.settingsTab === tabId)
  })
  $$(".settings-panel").forEach(panel => {
    const isTarget = panel.id.toLowerCase() === `settingstab${tabId.toLowerCase()}`
    panel.classList.toggle("active", isTarget)
    panel.classList.toggle("hidden", !isTarget)
  })
  if (tabId === "preferences") {
    renderShortcutsList()
  }
}

async function refreshSettingsData() {
  await syncFromBackend()
  _populateSettingsUI()
}

function _populateSettingsUI() {
  const nameInput = $("inputDisplayName")
  const emailInput = $("inputEmail")
  const nameDisp = $("settingsDisplayName")
  const emailDisp = $("settingsUserEmail")
  if (nameInput) nameInput.value = account.displayName || ""
  if (emailInput) emailInput.value = account.email || ""
  if (nameDisp) nameDisp.textContent = account.displayName || "QueryCraft User"
  if (emailDisp) emailDisp.textContent = account.email || "demo@querycraft.dev"

  const qEl = $("usageQueries")
  const hEl = $("usageHeals")
  const vEl = $("usageVerified")
  const dEl = $("usageDbs")
  if (qEl) qEl.textContent = usage.queries || 0
  if (hEl) hEl.textContent = usage.heals || 0
  if (vEl) vEl.textContent = usage.verified || 0
  if (dEl) dEl.textContent = profiles.length

  const pct = Math.min(100, Math.round(((usage.queries || 0) / 500) * 100))
  const quotaFill = $("quotaFill")
  const quotaUsed = $("quotaUsed")
  if (quotaFill) quotaFill.style.width = pct + "%"
  if (quotaUsed) quotaUsed.textContent = `${usage.queries || 0} queries used`

  const usageDbList = $("usageDbList")
  if (usageDbList) {
    usageDbList.innerHTML = profiles.map(p => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="status-indicator ${p.uri ? 'live' : ''}"></span>
          <span style="font-size:11.5px;font-weight:600;color:var(--text);">${escapeHtml(p.name)}</span>
        </div>
        <span style="font-family:var(--mono);font-size:9.5px;color:var(--text-3);">${p.dbInfo?.tables_count || p.dbInfo?.tables?.length || 5} tbls</span>
      </div>
    `).join("")
  }

  const apiInput = $("inputApiBase")
  if (apiInput) apiInput.value = API_BASE

  renderShortcutsList()

  const prefCompact = $("prefCompactOnStart")
  const prefAuto = $("prefAutoFocus")
  if (prefCompact) prefCompact.checked = !!prefs.compactOnStart
  if (prefAuto) prefAuto.checked = !!prefs.autoFocus

  $$("[data-fontsize]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.fontsize === String(prefs.fontSize || "12"))
  })
}

// ═══════════════════════════════════════════════
// KEYBOARD SHORTCUTS SYSTEM
// ═══════════════════════════════════════════════
let editingShortcutId = null
let isModalRecording = false

function getEffectiveShortcut(id) {
  return customShortcuts[id] || DEFAULT_SHORTCUTS.find(s => s.id === id)
}

function renderShortcutsList() {
  const container = $("shortcutsList")
  if (!container) return
  container.innerHTML = ""

  DEFAULT_SHORTCUTS.forEach(def => {
    const effective = getEffectiveShortcut(def.id)
    const modStr = effective?.mod ? effective.mod + "+" : ""
    const keyStr = effective?.key || "?"

    const row = document.createElement("div")
    row.className = "shortcut-row"
    row.innerHTML = `
      <span class="shortcut-name">${escapeHtml(def.label)}</span>
      <div class="shortcut-actions-wrap">
        <div class="shortcut-key-display" data-shortcut-id="${def.id}" title="Click to edit shortcut">
          <span class="key-badge">${escapeHtml(modStr + keyStr)}</span>
        </div>
        <button type="button" class="btn-edit-shortcut" data-shortcut-id="${def.id}">
          Change ✎
        </button>
      </div>
    `

    // Clicking either the key badge or the Change button opens the editor modal
    row.querySelectorAll(`[data-shortcut-id="${def.id}"]`).forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        openShortcutModal(def.id)
      })
    })

    container.appendChild(row)
  })
}

function openShortcutModal(shortcutId) {
  editingShortcutId = shortcutId
  const def = DEFAULT_SHORTCUTS.find(s => s.id === shortcutId)
  const effective = getEffectiveShortcut(shortcutId)

  const labelEl = $("modalShortcutLabel")
  if (labelEl) labelEl.textContent = `Change: ${def ? def.label : shortcutId}`

  const modSelect = $("selectShortcutMod")
  const keySelect = $("selectShortcutKey")

  if (modSelect) modSelect.value = effective?.mod ?? "Cmd"
  if (keySelect) {
    const k = effective?.key ?? "K"
    // If the key is not currently an option, add it dynamically
    if (!Array.from(keySelect.options).some(o => o.value === k)) {
      const opt = document.createElement("option")
      opt.value = k
      opt.textContent = k
      keySelect.appendChild(opt)
    }
    keySelect.value = k
  }

  updateModalPreview()
  isModalRecording = false
  const recBox = $("keyRecorderBox")
  const recText = $("keyRecorderText")
  if (recBox) recBox.classList.remove("recording")
  if (recText) recText.textContent = "Click here & press keys..."

  $("shortcutModalOverlay")?.classList.remove("hidden")
}

function closeShortcutModal() {
  $("shortcutModalOverlay")?.classList.add("hidden")
  editingShortcutId = null
  isModalRecording = false
}

function updateModalPreview() {
  const modSelect = $("selectShortcutMod")
  const keySelect = $("selectShortcutKey")
  const preview = $("modalPreviewBadge")

  const mod = modSelect?.value || ""
  const key = keySelect?.value || "?"

  if (preview) {
    preview.textContent = `${mod ? mod + "+" : ""}${key}`
  }
}

async function saveModalShortcut() {
  if (!editingShortcutId) return
  const mod = $("selectShortcutMod")?.value || ""
  const key = $("selectShortcutKey")?.value || "K"

  customShortcuts[editingShortcutId] = { mod, key }
  storage.set({ [STORAGE_KEY_SHORTCUTS]: customShortcuts })
  await pushBackendSettings({ shortcuts: customShortcuts })

  const def = DEFAULT_SHORTCUTS.find(s => s.id === editingShortcutId)
  closeShortcutModal()
  renderShortcutsList()
  showToast(`Shortcut for "${def?.label || editingShortcutId}" saved: ${mod ? mod + "+" : ""}${key}`)
}

function openChromeShortcutsPage() {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
  } else {
    window.open("chrome://extensions/shortcuts", "_blank")
  }
}

async function resetShortcuts() {
  if (!confirm("Reset all shortcuts to defaults?")) return
  customShortcuts = {}
  storage.set({ [STORAGE_KEY_SHORTCUTS]: {} })
  await pushBackendSettings({ shortcuts: {} })
  renderShortcutsList()
  showToast("All shortcuts reset to defaults")
}

function shortcutMatches(shortcutId, e) {
  const s = getEffectiveShortcut(shortcutId)
  if (!s) return false

  const mod = (s.mod || "").trim().toLowerCase()
  const hasCmdOrCtrl = e.metaKey || e.ctrlKey
  const hasShift = e.shiftKey
  const hasAlt = e.altKey

  if (mod === "cmd" || mod === "ctrl") {
    if (!hasCmdOrCtrl) return false
  } else if (mod === "alt") {
    if (!hasAlt) return false
  } else if (mod === "shift") {
    if (!hasShift) return false
  } else if (mod === "") {
    if (hasCmdOrCtrl && (s.key || "").toLowerCase() !== "escape") return false
  }

  const targetKey = (s.key || "").trim().toLowerCase()
  const pressedKey = (e.key || "").trim().toLowerCase()

  return targetKey === pressedKey
}

// ═══════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════
async function checkBackendHealth() {
  const statusEl = $("serverStatusText")
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET", signal: AbortSignal.timeout(2000) })
    if (res.ok && statusEl) {
      statusEl.textContent = API_BASE.replace("http://", "")
      statusEl.style.color = "#22c55e"
    } else throw new Error()
  } catch {
    if (statusEl) {
      statusEl.textContent = "Backend Offline"
      statusEl.style.color = "#f87171"
    }
  }
}

// ═══════════════════════════════════════════════
// TAB ROUTING
// ═══════════════════════════════════════════════
function switchTab(tabName) {
  activeTab = tabName
  $$(".nav-item").forEach(t => t.classList.toggle("active", t.dataset.tab === tabName))

  const tabPanels = {
    chat: $("tabChat"),
    schema: $("tabSchema"),
    metrics: $("tabMetrics"),
    databases: $("tabDatabases")
  }

  Object.keys(tabPanels).forEach(k => {
    if (tabPanels[k]) tabPanels[k].classList.toggle("hidden", k !== tabName)
  })

  const appFooter = $("appFooter")
  if (appFooter) appFooter.classList.toggle("hidden", tabName !== "chat")

  if (tabName === "schema") renderSchemaExplorer()
  if (tabName === "metrics") renderMetricsList()
  if (tabName === "databases") renderProfilesList()
}

// ═══════════════════════════════════════════════
// EVENT BINDINGS
// ═══════════════════════════════════════════════
function bindEvents() {
  if (isEventsBound) return
  isEventsBound = true

  // Nav tabs
  $$(".nav-item").forEach(t => safeOn(t, "click", () => switchTab(t.dataset.tab)))

  // DB switcher
  safeOn("dbSwitcherTrigger", "click", (e) => {
    e.stopPropagation()
    $("dbDropdownMenu")?.classList.toggle("hidden")
  })

  safeOn(document, "click", () => {
    $("dbDropdownMenu")?.classList.add("hidden")
  })

  safeOn("dbDropdownMenu", "click", (e) => e.stopPropagation())

  safeOn("btnAddDbQuick", "click", () => {
    $("dbDropdownMenu")?.classList.add("hidden")
    switchTab("databases")
    $("inputProfileName")?.focus()
  })

  // Results/Explain drawers
  safeOn("btnCloseResults", "click", () => $("queryResultsDrawer")?.classList.add("hidden"))
  safeOn("btnCloseExplain", "click", () => $("explainDrawer")?.classList.add("hidden"))
  safeOn("btnExportCsv", "click", exportCsvResults)
  safeOn("btnResetChat", "click", resetChat)

  safeOn("btnViewTable", "click", () => {
    currentResultViewMode = "table"
    $("btnViewTable")?.classList.add("active")
    $("btnViewChart")?.classList.remove("active")
    renderResultsContent()
  })

  safeOn("btnViewChart", "click", () => {
    currentResultViewMode = "chart"
    $("btnViewChart")?.classList.add("active")
    $("btnViewTable")?.classList.remove("active")
    renderResultsContent()
  })

  // Presets
  $$(".preset-btn").forEach(btn => {
    safeOn(btn, "click", () => {
      const uriInput = $("inputConnectionUri")
      if (uriInput) {
        uriInput.value = btn.dataset.uri || ""
        uriInput.focus()
      }
    })
  })

  // Password eye
  safeOn("btnToggleUriEye", "click", () => {
    const uriInput = $("inputConnectionUri")
    const btn = $("btnToggleUriEye")
    if (uriInput && btn) {
      const isPass = uriInput.type === "password"
      uriInput.type = isPass ? "text" : "password"
      btn.textContent = isPass ? "🙈" : "👁"
    }
  })

  // Add DB form
  safeOn("formAddDb", "submit", async (e) => {
    e.preventDefault()
    const nameInput = $("inputProfileName")
    const uriInput = $("inputConnectionUri")
    const name = nameInput?.value.trim() || ""
    const uri = uriInput?.value.trim() || ""
    if (!name || !uri) return

    const btn = $("btnConnectProfile")
    if (btn) { btn.disabled = true; btn.textContent = "Connecting…" }

    try {
      const res = await fetch(`${API_BASE}/api/database/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_uri: uri })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.detail || "Connection failed")
      }
      const dbData = await res.json()
      const newProfile = { id: `prof-${Date.now()}`, name, uri, dbInfo: dbData }
      profiles.push(newProfile)
      activeProfileId = newProfile.id
      saveProfilesState()
      updateActiveProfileUI()
      renderProfilesList()
      incrementUsage("dbs")
      if (nameInput) nameInput.value = ""
      if (uriInput) uriInput.value = ""
      switchTab("chat")
      showToast(`Connected to ${name}`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Connect & Introspect" }
    }
  })

  // Teach AI form
  safeOn("formTeachAi", "submit", async (e) => {
    e.preventDefault()
    const textInput = $("inputTeachInstruction")
    const instruction = textInput?.value.trim() || ""
    if (!instruction) return

    const btn = $("btnSubmitTeach")
    if (btn) { btn.disabled = true; btn.textContent = "Learning…" }

    try {
      const res = await fetch(`${API_BASE}/api/semantic/teach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction })
      })
      if (!res.ok) throw new Error("Failed to teach rule")
      if (textInput) textInput.value = ""
      renderMetricsList()
      showToast("Business rule taught successfully!")
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Teach & Save Rule" }
    }
  })

  // Upload Business Policy (Document RAG)
  safeOn("formUploadPolicy", "submit", async (e) => {
    e.preventDefault()
    const titleInput = $("inputPolicyTitle")
    const textInput = $("inputPolicyText")
    const docText = textInput?.value.trim() || ""
    const docTitle = titleInput?.value.trim() || "Business Policy"
    if (!docText) return

    const btn = $("btnSubmitPolicy")
    if (btn) { btn.disabled = true; btn.textContent = "Extracting & Chunking Document…" }

    try {
      const res = await fetch(`${API_BASE}/api/semantic/upload-policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_title: docTitle, document_text: docText })
      })
      if (!res.ok) throw new Error("Failed to process policy document")
      const data = await res.json()
      if (titleInput) titleInput.value = ""
      if (textInput) textInput.value = ""
      renderMetricsList()
      showToast(`Extracted & indexed ${data.count || 0} business rules!`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Extract & Learn Policy Rules" }
    }
  })

  // Schema search
  safeOn("inputSchemaSearch", "input", (e) => {
    renderSchemaExplorer(e.target.value.toLowerCase().trim())
  })

  safeOn("btnToggleAllTables", "click", () => {
    const tables = getActiveProfile().dbInfo?.tables || fallbackDemoSchema
    const allCollapsed = tables.every(t => collapsedTablesState[t.table_name || t.table])
    tables.forEach(t => { collapsedTablesState[t.table_name || t.table] = !allCollapsed })
    const btn = $("btnToggleAllTables")
    if (btn) btn.textContent = allCollapsed ? "Collapse All" : "Expand All"
    renderSchemaExplorer($("inputSchemaSearch")?.value.toLowerCase().trim() || "")
  })

  // Send prompt
  safeOn("btnSendPrompt", "click", () => handleSendPrompt())

  safeOn("userPromptInput", "keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendPrompt()
    }
  })

  // Prompt chips
  $$(".prompt-chip").forEach(chip => {
    safeOn(chip, "click", () => {
      const p = chip.dataset.prompt
      if (p) handleSendPrompt(p)
    })
  })

  // Compact Mode buttons
  safeOn("btnToggleCompact", "click", toggleCompactMode)
  safeOn("btnCompactExpand", "click", disableCompactMode)
  safeOn("btnCompactChat", "click", () => {
    disableCompactMode()
    switchTab("chat")
    $("userPromptInput")?.focus()
  })

  // Settings Sidebar triggers
  safeOn("btnOpenSettings", "click", () => isSettingsOpen ? closeSettings() : openSettings())
  safeOn("btnCloseSettings", "click", closeSettings)
  safeOn("settingsOverlay", "click", closeSettings)

  // Settings Nav
  $$(".settings-nav-item").forEach(item => {
    safeOn(item, "click", () => {
      switchSettingsTab(item.dataset.settingsTab)
      refreshSettingsData()
    })
  })

  // Account Save
  safeOn("btnSaveAccount", "click", async () => {
    account.displayName = $("inputDisplayName")?.value.trim() || account.displayName
    account.email = $("inputEmail")?.value.trim() || account.email
    storage.set({ [STORAGE_KEY_ACCOUNT]: account })
    await pushBackendSettings({ account })
    refreshSettingsData()
    showToast("Account saved · synced to dashboard")
  })

  // API Base Save
  safeOn("btnSaveApiBase", "click", async () => {
    const v = $("inputApiBase")?.value.trim()
    if (v) {
      API_BASE = v
      storage.set({ [STORAGE_KEY_API_BASE]: v })
      await pushBackendSettings({ apiBase: v })
      checkBackendHealth()
      showToast("API URL saved · synced to dashboard")
    }
  })

  // Reset Shortcuts
  safeOn("btnResetShortcuts", "click", async () => {
    await resetShortcuts()
    showToast("Shortcuts reset · synced to dashboard")
  })

  // Theme chips
  $$("[data-theme]").forEach(btn => {
    safeOn(btn, "click", () => {
      $$("[data-theme]").forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      prefs.theme = btn.dataset.theme
      savePrefs()
    })
  })

  // Font size chips
  $$("[data-fontsize]").forEach(btn => {
    safeOn(btn, "click", () => {
      $$("[data-fontsize]").forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      prefs.fontSize = btn.dataset.fontsize
      savePrefs()
      applyPrefs()
    })
  })

  // Pref toggles
  safeOn("prefCompactOnStart", "change", (e) => {
    prefs.compactOnStart = e.target.checked
    savePrefs()
  })

  safeOn("prefAutoFocus", "change", (e) => {
    prefs.autoFocus = e.target.checked
    savePrefs()
  })

  // Chrome Shortcuts Opener
  safeOn("btnOpenChromeShortcuts", "click", openChromeShortcutsPage)

  // Shortcut Rebind Modal Events
  safeOn("btnCloseShortcutModal", "click", closeShortcutModal)
  safeOn("btnCancelModalShortcut", "click", closeShortcutModal)
  safeOn("btnSaveModalShortcut", "click", saveModalShortcut)
  safeOn("selectShortcutMod", "change", updateModalPreview)
  safeOn("selectShortcutKey", "change", updateModalPreview)

  // Key recorder box inside modal
  const recBox = $("keyRecorderBox")
  const recText = $("keyRecorderText")
  if (recBox) {
    safeOn(recBox, "click", () => {
      isModalRecording = true
      recBox.classList.add("recording")
      if (recText) recText.textContent = "Listening... Press keys on keyboard"
      recBox.focus()
    })

    safeOn(recBox, "keydown", (e) => {
      if (!isModalRecording) return
      if (["Meta", "Control", "Shift", "Alt", "CapsLock", "Tab"].includes(e.key)) return

      e.preventDefault()
      e.stopPropagation()

      let mod = ""
      if (e.metaKey || e.ctrlKey) mod = "Cmd"
      else if (e.altKey) mod = "Alt"
      else if (e.shiftKey) mod = "Shift"

      let key = e.key
      if (key === " ") key = "Space"
      else if (key.length === 1) key = key.toUpperCase()

      const modSelect = $("selectShortcutMod")
      const keySelect = $("selectShortcutKey")
      if (modSelect) modSelect.value = mod
      if (keySelect) {
        if (!Array.from(keySelect.options).some(o => o.value === key)) {
          const opt = document.createElement("option")
          opt.value = key
          opt.textContent = key
          keySelect.appendChild(opt)
        }
        keySelect.value = key
      }

      updateModalPreview()
      isModalRecording = false
      recBox.classList.remove("recording")
      if (recText) recText.textContent = `Recorded: ${mod ? mod + "+" : ""}${key} (Click Save)`
    })
  }

  // Danger zone reset
  const dangerBtn = document.querySelector(".settings-danger-btn")
  if (dangerBtn) {
    safeOn(dangerBtn, "click", async () => {
      if (!confirm("This will delete all profiles, shortcuts, and settings on the extension AND web dashboard. Continue?")) return
      await fetch(`${API_BASE}/api/settings/reset`, { method: "DELETE" }).catch(() => { })
      storage.set({
        [STORAGE_KEY_PROFILES]: [initialDefaultProfile],
        [STORAGE_KEY_ACTIVE_ID]: "prof-demo",
        [STORAGE_KEY_SHORTCUTS]: {},
        [STORAGE_KEY_PREFS]: {},
        [STORAGE_KEY_USAGE]: {},
        [STORAGE_KEY_ACCOUNT]: {},
      }, () => location.reload())
    })
  }

  // Global Keyboard Shortcuts (capture phase)
  document.addEventListener("keydown", (e) => {
    // If currently recording a shortcut, intercept and record it
    if (recordingFor) {
      handleShortcutRecording(e)
      return
    }

    // Normal in-app shortcuts
    if (shortcutMatches("openDB", e)) { e.preventDefault(); $("dbDropdownMenu")?.classList.toggle("hidden") }
    if (shortcutMatches("tabChat", e)) { e.preventDefault(); switchTab("chat") }
    if (shortcutMatches("tabSchema", e)) { e.preventDefault(); switchTab("schema") }
    if (shortcutMatches("tabMetrics", e)) { e.preventDefault(); switchTab("metrics") }
    if (shortcutMatches("tabDBs", e)) { e.preventDefault(); switchTab("databases") }
    if (shortcutMatches("compact", e)) { e.preventDefault(); toggleCompactMode() }
    if (shortcutMatches("settings", e)) { e.preventDefault(); isSettingsOpen ? closeSettings() : openSettings() }
    if (shortcutMatches("clearChat", e)) { e.preventDefault(); resetChat() }
    if (shortcutMatches("closeAll", e)) {
      $("dbDropdownMenu")?.classList.add("hidden")
      $("queryResultsDrawer")?.classList.add("hidden")
      $("explainDrawer")?.classList.add("hidden")
      if (isSettingsOpen) closeSettings()
    }
  }, true)
}

// ── Listen for background service worker command messages ──────────────────
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "TOGGLE_COMPACT") toggleCompactMode()
  })
}

// ═══════════════════════════════════════════════
// USAGE TRACKING
// ═══════════════════════════════════════════════
async function incrementUsage(field) {
  usage[field] = (usage[field] || 0) + 1
  storage.set({ [STORAGE_KEY_USAGE]: usage })
  try {
    await fetch(`${API_BASE}/api/settings/usage/increment?field=${field}`, { method: "POST" })
  } catch { }
}

// ═══════════════════════════════════════════════
// TOAST NOTIFICATION
// ═══════════════════════════════════════════════
function showToast(msg) {
  const existing = document.querySelector(".qc-toast")
  if (existing) existing.remove()

  const toast = document.createElement("div")
  toast.className = "qc-toast"
  toast.textContent = msg
  toast.style.cssText = `
    position:absolute; bottom:64px; left:50%; transform:translateX(-50%);
    background:#141d17; color:#5de08a; border:1px solid rgba(93,224,138,0.3);
    padding:6px 14px; border-radius:8px; font-size:11.5px; font-weight:600;
    z-index:9999; white-space:nowrap;
    animation:fadeIn 0.15s ease;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  `
  document.body?.appendChild(toast)
  setTimeout(() => toast.remove(), 2400)
}

// ═══════════════════════════════════════════════
// PROFILE MANAGEMENT
// ═══════════════════════════════════════════════
function getActiveProfile() {
  return profiles.find(p => p.id === activeProfileId) || profiles[0] || initialDefaultProfile
}

function updateActiveProfileUI() {
  const active = getActiveProfile()
  const nameEl = $("activeDbName")
  const badgeEl = $("activeDbBadge")
  const dotEl = $("activeDbDot")
  const welcomeEl = $("welcomeDbName")
  const compactEl = $("compactDbLabel")

  if (nameEl) nameEl.textContent = active.name
  if (welcomeEl) welcomeEl.textContent = active.name
  if (compactEl) compactEl.textContent = active.name
  const tbl = active.dbInfo?.tables_count || active.dbInfo?.tables?.length || 5
  if (badgeEl) badgeEl.textContent = `${tbl} tbls`
  if (dotEl) dotEl.classList.toggle("live", !!active.uri)

  renderSchemaExplorer()
}

function saveProfilesState() {
  storage.set({ [STORAGE_KEY_PROFILES]: profiles, [STORAGE_KEY_ACTIVE_ID]: activeProfileId })
}

function renderProfilesList() {
  const dbProfilesList = $("dbProfilesList")
  const savedProfilesList = $("savedProfilesList")
  const dbCountBadge = $("dbCountBadge")
  const savedCount = $("savedCount")

  if (dbProfilesList) dbProfilesList.innerHTML = ""
  if (savedProfilesList) savedProfilesList.innerHTML = ""
  if (dbCountBadge) dbCountBadge.textContent = profiles.length
  if (savedCount) savedCount.textContent = profiles.length

  profiles.forEach(p => {
    const isActive = p.id === activeProfileId
    const tbl = p.dbInfo?.tables_count || p.dbInfo?.tables?.length || 5

    // Popover item
    if (dbProfilesList) {
      const popItem = document.createElement("div")
      popItem.className = `popover-item ${isActive ? "active" : ""}`
      popItem.innerHTML = `
        <div class="popover-item-left">
          <span class="status-indicator ${p.uri ? "live" : ""}"></span>
          <span>${escapeHtml(p.name)}</span>
        </div>
        <span class="tbl-count">${tbl} tbls</span>
      `
      popItem.addEventListener("click", () => {
        activeProfileId = p.id
        saveProfilesState()
        updateActiveProfileUI()
        renderProfilesList()
        $("dbDropdownMenu")?.classList.add("hidden")
      })
      dbProfilesList.appendChild(popItem)
    }

    // Saved list
    if (savedProfilesList) {
      const savedItem = document.createElement("div")
      savedItem.className = `saved-db-item ${isActive ? "active" : ""}`
      savedItem.innerHTML = `
        <div>
          <span class="font-medium">${escapeHtml(p.name)}</span>
          <span class="tbl-count" style="margin-left:6px;">${escapeHtml(p.dbInfo?.host || "demo.postgres")}</span>
        </div>
        <div class="saved-db-actions">
          ${isActive ? '<span class="tbl-count" style="color:#22c55e; font-weight:600;">Active</span>' : `<button type="button" class="tiny-btn btn-sel-prof" data-id="${p.id}">Select</button>`}
          ${profiles.length > 1 ? `<button type="button" class="tiny-btn delete btn-del-prof" data-id="${p.id}">✕</button>` : ""}
        </div>
      `
      savedProfilesList.appendChild(savedItem)
    }
  })

  if (savedProfilesList) {
    savedProfilesList.querySelectorAll(".btn-sel-prof").forEach(b => {
      b.addEventListener("click", () => {
        activeProfileId = b.dataset.id
        saveProfilesState()
        updateActiveProfileUI()
        renderProfilesList()
      })
    })

    savedProfilesList.querySelectorAll(".btn-del-prof").forEach(b => {
      b.addEventListener("click", () => {
        if (confirm("Delete connection profile?")) {
          profiles = profiles.filter(p => p.id !== b.dataset.id)
          if (activeProfileId === b.dataset.id) activeProfileId = profiles[0].id
          saveProfilesState()
          updateActiveProfileUI()
          renderProfilesList()
        }
      })
    })
  }
}

// ═══════════════════════════════════════════════
// METRICS
// ═══════════════════════════════════════════════
async function renderMetricsList() {
  const countEl = $("metricsCount")
  const container = $("metricsListContainer")
  if (!container) return

  try {
    const res = await fetch(`${API_BASE}/api/semantic/metrics`, { signal: AbortSignal.timeout(2500) })
    const data = await res.json()
    const list = data.metrics || []
    if (countEl) countEl.textContent = list.length
    container.innerHTML = ""

    list.forEach(m => {
      const item = document.createElement("div")
      item.className = "saved-db-item"
      item.innerHTML = `
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="font-medium">${escapeHtml(m.name)}</span>
            <span class="tbl-count" style="color:#22c55e;">${escapeHtml(m.category)}</span>
          </div>
          <p style="font-size:9.5px;color:#9ca3af;margin-top:2px;" class="truncate">${escapeHtml(m.definition)}</p>
        </div>
        <button type="button" class="tiny-btn delete btn-del-metric" data-id="${m.id}">✕</button>
      `
      container.appendChild(item)
    })

    container.querySelectorAll(".btn-del-metric").forEach(btn => {
      btn.addEventListener("click", async () => {
        await fetch(`${API_BASE}/api/semantic/metrics/${btn.dataset.id}`, { method: "DELETE" })
        renderMetricsList()
      })
    })
  } catch {
    container.innerHTML = `<div style="color:#6b7280;font-size:10.5px;padding:8px;">Unable to load metrics from ${API_BASE}</div>`
  }
}

// ═══════════════════════════════════════════════
// SCHEMA EXPLORER
// ═══════════════════════════════════════════════
function renderSchemaExplorer(filterQuery = "") {
  const container = $("schemaTablesContainer")
  if (!container) return

  const active = getActiveProfile()
  const tables = active.dbInfo?.tables || fallbackDemoSchema
  container.innerHTML = ""

  const query = filterQuery.toLowerCase().trim()
  let filtered = query
    ? tables.filter(t => {
      const matchTable = (t.table_name || t.table || "").toLowerCase().includes(query)
      const matchCol = (t.columns || []).some(c => (typeof c === "string" ? c : c.name || "").toLowerCase().includes(query))
      return matchTable || matchCol
    })
    : tables

  if (!filtered.length) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#6b7280;font-size:11px;">No tables match "${escapeHtml(query)}"</div>`
    return
  }

  filtered.forEach(t => {
    const tableName = t.table_name || t.table
    const isCollapsed = !!collapsedTablesState[tableName]
    const cols = t.columns || []
    const colsHtml = cols.map(c => {
      const name = typeof c === "string" ? c : c.name
      const type = typeof c === "string" ? "TEXT" : c.type
      const pk = c?.is_primary_key ? "🔑 " : ""
      const fk = c?.is_foreign_key ? "🔗 " : ""
      return `<div class="column-row"><span>${pk}${fk}${escapeHtml(name)}</span><span class="col-tag">${escapeHtml(type)}</span></div>`
    }).join("")

    const card = document.createElement("div")
    card.className = "table-node"
    card.innerHTML = `
      <div class="table-node-header" data-table="${tableName}">
        <span style="display:flex;align-items:center;gap:6px;">
          <strong style="color:var(--text);">${escapeHtml(tableName)}</strong>
        </span>
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="btn-sample-data" data-table="${tableName}" style="font-size:9.5px;font-weight:700;color:#34d399;background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.25);border-radius:4px;padding:1px 6px;cursor:pointer;">👁 Sample</button>
          <span class="tbl-count">${cols.length} cols ${isCollapsed ? "▸" : "▾"}</span>
        </div>
      </div>
      ${isCollapsed ? "" : `<div class="table-columns">${colsHtml}</div>`}
      <div class="sample-drawer hidden" id="sampleDrawer-${tableName}"></div>
    `
    const hdr = card.querySelector(".table-node-header")
    if (hdr) {
      hdr.addEventListener("click", (e) => {
        if (e.target.closest(".btn-sample-data")) return
        collapsedTablesState[tableName] = !collapsedTablesState[tableName]
        renderSchemaExplorer($("inputSchemaSearch")?.value.toLowerCase().trim() || "")
      })
    }

    const btnSample = card.querySelector(".btn-sample-data")
    if (btnSample) {
      btnSample.addEventListener("click", async (e) => {
        e.stopPropagation()
        const drawer = card.querySelector(`#sampleDrawer-${tableName}`)
        if (!drawer) return

        if (!drawer.classList.contains("hidden")) {
          drawer.classList.add("hidden")
          return
        }

        drawer.classList.remove("hidden")
        drawer.innerHTML = `<div style="padding:8px;font-size:11px;color:#34d399;">Loading sample records &amp; categorical values…</div>`

        try {
          const res = await fetch(`${API_BASE}/api/database/sample`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connection_uri: active.uri || "", table_name: tableName, limit: 5 })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.detail || "Sample failed")

          let catBadges = ""
          if (data.column_profiles && data.column_profiles.length > 0) {
            const withEnums = data.column_profiles.filter(p => p.distinct_values && p.distinct_values.length > 0)
            if (withEnums.length > 0) {
              catBadges = `
                <div style="padding:6px 8px;background:rgba(0,0,0,0.3);border-bottom:1px solid var(--border);font-size:10px;">
                  <span style="color:#6ee7b7;font-weight:700;">Categorical Values:</span>
                  ${withEnums.map(p => `
                    <div style="margin-top:2px;">
                      <span style="color:#a7f3d0;font-family:monospace;">${p.name}:</span>
                      ${p.distinct_values.map(v => `<span style="background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);border-radius:3px;padding:1px 4px;margin:0 2px;color:#d1fae5;">${escapeHtml(v)}</span>`).join('')}
                    </div>
                  `).join('')}
                </div>
              `
            }
          }

          let tableRows = ""
          if (data.rows && data.rows.length > 0) {
            const cols = data.columns || Object.keys(data.rows[0])
            tableRows = `
              <div style="overflow-x:auto;max-height:120px;padding:4px;">
                <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:monospace;">
                  <thead>
                    <tr style="background:#111b15;color:#6ee7b7;text-align:left;">
                      ${cols.map(c => `<th style="padding:3px 6px;border:1px solid var(--border);">${escapeHtml(c)}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${data.rows.map(r => `
                      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                        ${cols.map(c => `<td style="padding:3px 6px;border:1px solid var(--border);color:#c4e6d2;">${escapeHtml(r[c] !== null && r[c] !== undefined ? String(r[c]) : 'NULL')}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `
          }

          drawer.innerHTML = `
            <div style="background:#0c1410;border-top:1px solid var(--border);border-radius:0 0 6px 6px;">
              ${catBadges}
              ${tableRows}
            </div>
          `
        } catch (err) {
          drawer.innerHTML = `<div style="padding:8px;font-size:10.5px;color:#f87171;">Could not profile table: ${escapeHtml(err.message)}</div>`
        }
      })
    }

    container.appendChild(card)
  })
}

// ═══════════════════════════════════════════════
// CHAT STREAM
// ═══════════════════════════════════════════════
async function handleSendPrompt(text) {
  const promptInput = $("userPromptInput")
  const sendBtn = $("btnSendPrompt")
  const welcomeEl = $("welcomeState")
  const feedEl = $("messagesFeed")

  const prompt = text || promptInput?.value.trim() || ""
  if (!prompt || isLoading) return

  if (promptInput) promptInput.value = ""
  if (welcomeEl) welcomeEl.classList.add("hidden")
  if (feedEl) feedEl.classList.remove("hidden")

  appendUserMessage(prompt)

  const active = getActiveProfile()
  const historyPayload = chatHistory.map(m => ({ role: m.role, content: m.rawContent || m.content }))
  const payload = { user_prompt: prompt, session_history: historyPayload }
  if (active.uri) { payload.connection_uri = active.uri; payload.db_uri = active.uri }
  if (active.dbInfo?.schema_sql) payload.live_schema = active.dbInfo.schema_sql

  const loadingEl = appendLoading()
  isLoading = true
  if (sendBtn) sendBtn.disabled = true

  try {
    const res = await fetch(`${API_BASE}/api/clarification/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`Server status ${res.status}`)
    const aiData = await res.json()
    if (loadingEl) loadingEl.remove()

    if (aiData.status === "needs_clarification") {
      appendClarificationMessage(aiData.message)
      chatHistory.push({ role: "assistant", content: aiData.message, rawContent: aiData.message, status: "needs_clarification" })
    } else if (aiData.status === "complete") {
      const { sql_query, explanation, tables_identified, visual_intent } = aiData.extracted_data || {}
      appendCompleteMessage({
        message: aiData.message,
        explanation,
        sql_query,
        tables: tables_identified || [],
        visual_intent: visual_intent || aiData.visual_intent
      })
      chatHistory.push({
        role: "assistant",
        content: aiData.message,
        sql_query,
        rawContent: `${aiData.message || ""} ${explanation || ""} SQL: ${sql_query || ""}`,
        status: "complete"
      })
    }

    incrementUsage("queries")
  } catch (err) {
    if (loadingEl) loadingEl.remove()
    appendErrorMessage(`Unable to connect to backend at ${API_BASE}`)
    checkBackendHealth()
  } finally {
    isLoading = false
    if (sendBtn) sendBtn.disabled = false
    if (feedEl) feedEl.scrollTop = feedEl.scrollHeight
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

function appendClarificationMessage(text) {
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `
    <div class="assistant-card">
      <div class="clarify-box">
        <div class="clarify-header"><span>⚠️ Clarification Required</span></div>
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `
  feedEl.appendChild(row)
}

function appendCompleteMessage(data) {
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const row = document.createElement("div")
  row.className = "msg-row"
  const tablesHtml = data.tables?.length
    ? `<div style="font-size:10px;color:#6b7280;display:flex;gap:4px;flex-wrap:wrap;"><strong>Tables:</strong>${data.tables.map(t => `<span class="col-tag">${escapeHtml(t)}</span>`).join("")}</div>`
    : ""

  const sqlHtml = data.sql_query ? `
    <div class="sql-box">
      <div class="sql-header">
        <span>POSTGRESQL (READ-ONLY)</span>
        <div class="sql-buttons">
          <button type="button" class="sql-btn explain btn-explain-sql">⚡ EXPLAIN</button>
          <button type="button" class="sql-btn btn-copy-sql">Copy</button>
          <button type="button" class="sql-btn run btn-run-sql">▶ Run</button>
        </div>
      </div>
      <pre class="sql-code"><code>${escapeHtml(data.sql_query)}</code></pre>
    </div>
  ` : ""

  row.innerHTML = `
    <div class="assistant-card">
      <div class="complete-box">
        <div class="complete-topbar">
          <span class="complete-status">${data.message ? escapeHtml(data.message) : "Query Ready"}</span>
          <div style="display:flex;gap:4px;">
            <button type="button" class="verified-btn btn-save-notebook" title="Save into query notebook">💾 Notebook</button>
            <button type="button" class="verified-btn btn-save-verified" title="Save into verified memory">⭐ Verified</button>
          </div>
        </div>
        ${data.explanation ? `<div class="complete-explanation">${escapeHtml(data.explanation)}</div>` : ""}
        ${tablesHtml}
        ${sqlHtml}
      </div>
    </div>
  `

  if (data.sql_query) {
    const btnCopy = row.querySelector(".btn-copy-sql")
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(data.sql_query)
        btnCopy.textContent = "Copied"
        setTimeout(() => (btnCopy.textContent = "Copy"), 1500)
      })
    }

    const btnRun = row.querySelector(".btn-run-sql")
    if (btnRun) btnRun.addEventListener("click", () => executeQuery(data.sql_query, data))

    const btnExp = row.querySelector(".btn-explain-sql")
    if (btnExp) btnExp.addEventListener("click", () => explainQuery(data.sql_query))

    const btnSave = row.querySelector(".btn-save-verified")
    if (btnSave) {
      btnSave.addEventListener("click", async (e) => {
        const btn = e.currentTarget
        try {
          await fetch(`${API_BASE}/api/memory/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_prompt: data.message || "Verified Query",
              verified_sql: data.sql_query,
              tables: data.tables || [],
              explanation: data.explanation
            })
          })
          btn.classList.add("saved")
          btn.textContent = "✓ Verified"
          incrementUsage("verified")
        } catch {
          alert("Failed to save verified query.")
        }
      })
    }

    const btnNotebook = row.querySelector(".btn-save-notebook")
    if (btnNotebook) {
      btnNotebook.addEventListener("click", async (e) => {
        const btn = e.currentTarget
        const tag = prompt("Enter tags for this snippet (comma separated, e.g. #finance, #vip):", "#saved") || "#saved"
        const tagList = tag.split(",").map(t => t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`)
        try {
          await fetch(`${API_BASE}/api/memory/notebook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.message || "Saved Snippet",
              user_prompt: data.message || "Saved SQL Query",
              sql_query: data.sql_query,
              tags: tagList,
              database_host: getActiveProfile().name || "postgres"
            })
          })
          btn.classList.add("saved")
          btn.textContent = "✓ In Notebook"
          showToast("Saved to Query Notebook!")
        } catch {
          alert("Failed to save to notebook.")
        }
      })
    }
  }

  feedEl.appendChild(row)
}

function appendErrorMessage(msg) {
  const feedEl = $("messagesFeed")
  if (!feedEl) return

  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `<div style="width:100%;background:var(--red-bg);border:1px solid rgba(248,113,113,0.2);border-radius:6px;padding:8px 10px;font-size:11px;color:var(--red);">${escapeHtml(msg)}</div>`
  feedEl.appendChild(row)
}

function appendLoading() {
  const feedEl = $("messagesFeed")
  if (!feedEl) return null

  const row = document.createElement("div")
  row.className = "msg-row"
  row.innerHTML = `<div class="loading-indicator"><div class="spin-dot"></div><span>Reasoning over schema, metrics &amp; few-shot memory…</span></div>`
  feedEl.appendChild(row)
  feedEl.scrollTop = feedEl.scrollHeight
  return row
}

// ═══════════════════════════════════════════════
// QUERY EXECUTION
// ═══════════════════════════════════════════════
async function executeQuery(sql, messageData) {
  const active = getActiveProfile()
  if (!active.uri) {
    alert("No connection string attached. Switch to DBs tab to add one.")
    switchTab("databases")
    return
  }

  const resultsDrawer = $("queryResultsDrawer")
  const resultsContent = $("queryResultsContent")
  const countEl = $("resultRowCount")

  if (resultsDrawer) resultsDrawer.classList.remove("hidden")
  if (resultsContent) resultsContent.innerHTML = `<div class="loading-indicator"><div class="spin-dot"></div><span>Running on ${escapeHtml(active.name)}…</span></div>`
  if (countEl) countEl.textContent = "Running…"

  try {
    const res = await fetch(`${API_BASE}/api/database/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_uri: active.uri,
        sql_query: sql,
        limit: 50,
        auto_heal: true,
        user_prompt: messageData?.explanation || "Execute query",
        live_schema: active.dbInfo?.schema_sql || null
      })
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.detail || "Execution failed")
    }
    const data = await res.json()
    lastQueryResults = data
    if (countEl) countEl.textContent = `${data.row_count} rows`

    if (messageData?.visual_intent?.should_visualize) {
      currentResultViewMode = "chart"
      $("btnViewChart")?.classList.add("active")
      $("btnViewTable")?.classList.remove("active")
    } else {
      currentResultViewMode = "table"
      $("btnViewTable")?.classList.add("active")
      $("btnViewChart")?.classList.remove("active")
    }
    renderResultsContent(data.healing_info)
    if (data.healing_info?.was_healed) incrementUsage("heals")
  } catch (err) {
    if (countEl) countEl.textContent = "Error"
    if (resultsContent) {
      resultsContent.innerHTML = `<div style="padding:10px;background:var(--red-bg);color:var(--red);border-radius:6px;font-size:11px;">${escapeHtml(err.message)}</div>`
    }
  }
}

function renderResultsContent(healingInfo) {
  const resultsContent = $("queryResultsContent")
  if (!resultsContent || !lastQueryResults?.rows) return

  const { columns, rows } = lastQueryResults
  let healHtml = healingInfo?.was_healed
    ? `<div class="auto-healed-tag" style="margin-bottom:6px;">⚡ Auto-Healed by Critic: ${escapeHtml(healingInfo.diagnosis)}</div>`
    : ""

  if (!rows.length) {
    resultsContent.innerHTML = `${healHtml}<div style="padding:16px;color:#6b7280;font-size:11px;text-align:center;">Query executed. 0 rows returned.</div>`
    return
  }

  if (currentResultViewMode === "table") {
    let html = `${healHtml}<table class="data-table"><thead><tr>`
    columns.forEach(c => { html += `<th>${escapeHtml(c)}</th>` })
    html += `</tr></thead><tbody>`
    rows.forEach(row => {
      html += `<tr>`
      columns.forEach(c => {
        const v = row[c] === null ? `<span style="color:#6b7280;font-style:italic;">null</span>` : escapeHtml(String(row[c]))
        html += `<td>${v}</td>`
      })
      html += `</tr>`
    })
    html += `</tbody></table>`
    resultsContent.innerHTML = html
  } else {
    const numCol = columns.find(c => rows.some(r => !isNaN(Number(r[c])))) || columns[1] || columns[0]
    const labelCol = columns.find(c => c !== numCol) || columns[0]
    const maxY = Math.max(...rows.map(r => Number(r[numCol]) || 0), 1)

    let html = `${healHtml}<div class="chart-container">`
    rows.slice(0, 12).forEach(r => {
      const val = Number(r[numCol]) || 0
      const h = Math.max(8, (val / maxY) * 100)
      const lbl = String(r[labelCol] || "")
      html += `<div class="chart-bar-item" title="${escapeHtml(lbl)}: ${val}"><div class="chart-bar" style="height:${h}%;"></div><span class="chart-label">${escapeHtml(lbl)}</span></div>`
    })
    html += `</div>`
    resultsContent.innerHTML = html
  }
}

// ═══════════════════════════════════════════════
// EXPLAIN
// ═══════════════════════════════════════════════
async function explainQuery(sql) {
  const active = getActiveProfile()
  if (!active.uri) {
    alert("No cloud database connected to run EXPLAIN.")
    return
  }

  const drawer = $("explainDrawer")
  const content = $("explainContent")
  if (drawer) drawer.classList.remove("hidden")
  if (content) content.innerHTML = `<div class="loading-indicator"><div class="spin-dot"></div><span>Analyzing execution tree and query cost…</span></div>`

  try {
    const res = await fetch(`${API_BASE}/api/database/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connection_uri: active.uri, sql_query: sql })
    })
    if (!res.ok) throw new Error("Explain failed")
    const data = await res.json()

    let recsHtml = ""
    if (data.index_recommendations?.length) {
      recsHtml = `<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border);">
        <span style="font-size:9.5px;font-weight:700;color:#22c55e;">⚡ Index Advice:</span>
        ${data.index_recommendations.map(r => `<pre class="sql-code" style="margin-top:3px;padding:4px;font-size:10px;"><code>${escapeHtml(r)}</code></pre>`).join("")}
      </div>`
    }

    if (content) {
      content.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;padding:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--panel);padding:6px 8px;border-radius:6px;border:1px solid var(--border);">
            <span style="font-weight:600;font-size:11px;">${escapeHtml(data.rating_label || "")}</span>
            <span class="col-tag" style="background:${data.performance_rating === "fast" ? "#065f46" : "#78350f"};color:#fff;">${escapeHtml((data.performance_rating || "").toUpperCase())}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10.5px;">
            <div style="background:var(--panel);padding:5px 8px;border-radius:4px;border:1px solid var(--border);">
              <span style="color:#9ca3af;font-size:9px;display:block;">Total Cost:</span>
              <strong>${data.total_cost}</strong>
            </div>
            <div style="background:var(--panel);padding:5px 8px;border-radius:4px;border:1px solid var(--border);">
              <span style="color:#9ca3af;font-size:9px;display:block;">Seq Scan:</span>
              <strong style="color:${data.has_seq_scan ? "#f59e0b" : "#22c55e"};">${data.has_seq_scan ? "Detected" : "None"}</strong>
            </div>
          </div>
          ${recsHtml}
        </div>
      `
    }
  } catch (err) {
    if (content) {
      content.innerHTML = `<div style="padding:10px;color:#f87171;font-size:11px;">EXPLAIN Error: ${escapeHtml(err.message)}</div>`
    }
  }
}

// ═══════════════════════════════════════════════
// EXPORT CSV
// ═══════════════════════════════════════════════
function exportCsvResults() {
  if (!lastQueryResults?.rows?.length) return
  const { columns, rows } = lastQueryResults
  let csv = columns.join(",") + "\n"
  rows.forEach(r => {
    csv += columns.map(c => `"${(r[c] === null ? "" : String(r[c])).replace(/"/g, '""')}"`).join(",") + "\n"
  })
  navigator.clipboard.writeText(csv)
  const btn = $("btnExportCsv")
  if (btn) {
    btn.textContent = "Copied"
    setTimeout(() => (btn.textContent = "CSV"), 1500)
  }
}

// ═══════════════════════════════════════════════
// RESET CHAT
// ═══════════════════════════════════════════════
function resetChat() {
  chatHistory = []
  const feed = $("messagesFeed")
  if (feed) {
    feed.innerHTML = ""
    feed.classList.add("hidden")
  }
  $("welcomeState")?.classList.remove("hidden")
  $("queryResultsDrawer")?.classList.add("hidden")
  $("explainDrawer")?.classList.add("hidden")
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
function escapeHtml(text) {
  if (typeof text !== "string") return ""
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}
