"use client"

import { useState, useEffect, useRef } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  Cpu,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Flame,
  FolderKanban,
  FolderPlus,
  HardDrive,
  HelpCircle,
  Keyboard,
  Laptop,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Moon,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Server,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Table2,
  Terminal,
  Trash2,
  TrendingUp,
  User,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react"
import { useSettings } from "@/lib/settingsContext"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL, settingsApi } from "@/lib/api"

const SECTIONS = [
  {
    title: "1. General & AI",
    items: [
      { id: "general", label: "Appearance & Theme", icon: Sun, badge: "Theme" },
      { id: "engine", label: "AI Engine & Doctor", icon: Cpu, badge: "70B NIM" },
      { id: "editor", label: "Studio & Formatting", icon: SlidersHorizontal, badge: null },
    ],
  },
  {
    title: "2. Database & Security",
    items: [
      { id: "safety", label: "Database Safety", icon: ShieldCheck, badge: "Read-Only" },
    ],
  },
  {
    title: "3. Workspaces & Keybindings",
    items: [
      { id: "workspaces", label: "Projects & Workspaces", icon: FolderKanban, badge: null },
      { id: "shortcuts", label: "Keybindings & Copilot", icon: Keyboard, badge: "⌘K" },
    ],
  },
  {
    title: "4. Account & Billing",
    items: [
      { id: "usage", label: "Usage & Quotas", icon: BarChart3, badge: "Quota" },
      { id: "plans", label: "Plans & Billing", icon: CreditCard, badge: "Free" },
      { id: "account", label: "Profile & Cloud Sync", icon: User, badge: null },
    ],
  },
]

const TABS = SECTIONS.flatMap((s) => s.items)

const ROLES = [
  "Data Architect",
  "Backend Engineer",
  "Full-Stack Developer",
  "Data Analyst / BI",
  "DevOps / SRE",
  "Product Manager",
  "Founder / Exec",
]

export default function SettingsPanel({ isOpen, onClose }) {
  const {
    settings,
    isLoading,
    isSyncing,
    DEFAULT_SHORTCUTS,
    saveAccount,
    savePreferences,
    saveShortcuts,
    saveApiBase,
    resetAllSettings,
    fetchSettings,
  } = useSettings()

  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    deleteWorkspace,
    setIsWorkspaceModalOpen,
    dbInfo,
  } = useDatabase()

  const { user: authUser, logout: authLogout } = useAuth()

  const [activeTab, setActiveTab] = useState("engine")
  const [toast, setToast] = useState(null)
  const [recordingFor, setRecordingFor] = useState(null)

  // Local Editable Form States
  const [localAccount, setLocalAccount] = useState(() => ({
    displayName: authUser?.displayName || settings.account?.displayName || "QueryCraft User",
    email: authUser?.email || settings.account?.email || "demo@querycraft.dev",
    role: settings.account?.role || "Data Architect",
  }))

  const [localPreferences, setLocalPreferences] = useState(() => ({
    theme: settings.preferences?.theme || "dark",
    model: settings.preferences?.model || "llama-3.1-70b-instruct",
    temperature: settings.preferences?.temperature ?? 0.0,
    clarificationLevel: settings.preferences?.clarificationLevel || "balanced",
    autoDoctor: settings.preferences?.autoDoctor ?? true,
    schemaPruning: settings.preferences?.schemaPruning ?? true,
    safeReadOnly: settings.preferences?.safeReadOnly ?? true,
    statementTimeout: settings.preferences?.statementTimeout || 8000,
    defaultLimit: settings.preferences?.defaultLimit || 50,
    costWarningThreshold: settings.preferences?.costWarningThreshold || 300,
    sqlKeywordCasing: settings.preferences?.sqlKeywordCasing || "uppercase",
    defaultDialect: settings.preferences?.defaultDialect || "postgresql",
    csvDelimiter: settings.preferences?.csvDelimiter || "comma",
    soundFeedback: settings.preferences?.soundFeedback ?? true,
  }))

  const handleThemeChange = (newTheme) => {
    setLocalPreferences((p) => ({ ...p, theme: newTheme }))
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
    } else if (newTheme === "light") {
      root.classList.remove("dark")
      root.setAttribute("data-theme", "light")
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
      root.setAttribute("data-theme", isDark ? "dark" : "light")
    }
    try {
      localStorage.setItem("querycraft-theme", newTheme)
      localStorage.setItem("querycraft-docs-theme", newTheme)
    } catch {}
    savePreferences({ theme: newTheme })
    showToast(`Theme updated to ${newTheme}`, "success")
  }

  const [localApiBase, setLocalApiBase] = useState(() => settings.apiBase || API_BASE_URL)
  const overlayRef = useRef(null)

  // Sync state with authUser
  useEffect(() => {
    if (authUser) {
      setLocalAccount((prev) => ({
        ...prev,
        displayName: authUser.displayName || prev.displayName,
        email: authUser.email || prev.email,
      }))
    }
  }, [authUser])

  // Sync state on open or remote update
  useEffect(() => {
    let ignore = false
    if (isOpen) {
      fetchSettings().then((remoteSettings) => {
        if (!ignore) {
          setLocalAccount({
            displayName: authUser?.displayName || remoteSettings?.account?.displayName || settings.account?.displayName || "QueryCraft User",
            email: authUser?.email || remoteSettings?.account?.email || settings.account?.email || "demo@querycraft.dev",
            role: remoteSettings?.account?.role || settings.account?.role || "Data Architect",
          })
          setLocalPreferences({
            model: remoteSettings?.preferences?.model || settings.preferences?.model || "llama-3.1-70b-instruct",
            temperature: remoteSettings?.preferences?.temperature ?? settings.preferences?.temperature ?? 0.0,
            clarificationLevel: remoteSettings?.preferences?.clarificationLevel || settings.preferences?.clarificationLevel || "balanced",
            autoDoctor: remoteSettings?.preferences?.autoDoctor ?? settings.preferences?.autoDoctor ?? true,
            schemaPruning: remoteSettings?.preferences?.schemaPruning ?? settings.preferences?.schemaPruning ?? true,
            safeReadOnly: remoteSettings?.preferences?.safeReadOnly ?? settings.preferences?.safeReadOnly ?? true,
            statementTimeout: remoteSettings?.preferences?.statementTimeout || settings.preferences?.statementTimeout || 8000,
            defaultLimit: remoteSettings?.preferences?.defaultLimit || settings.preferences?.defaultLimit || 50,
            costWarningThreshold: remoteSettings?.preferences?.costWarningThreshold || settings.preferences?.costWarningThreshold || 300,
            sqlKeywordCasing: remoteSettings?.preferences?.sqlKeywordCasing || settings.preferences?.sqlKeywordCasing || "uppercase",
            defaultDialect: remoteSettings?.preferences?.defaultDialect || settings.preferences?.defaultDialect || "postgresql",
            csvDelimiter: remoteSettings?.preferences?.csvDelimiter || settings.preferences?.csvDelimiter || "comma",
            soundFeedback: remoteSettings?.preferences?.soundFeedback ?? settings.preferences?.soundFeedback ?? true,
          })
          setLocalApiBase(settings.apiBase || API_BASE_URL)
        }
      })
    }
    return () => {
      ignore = true
    }
  }, [isOpen, fetchSettings, settings, authUser])

  // Keyboard shortcut recording listener
  useEffect(() => {
    if (!recordingFor) return
    const handler = (e) => {
      if (["Meta", "Control", "Shift", "Alt"].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      const mod = e.metaKey ? "Cmd" : e.ctrlKey ? "Ctrl" : ""
      const key = e.key === " " ? "Space" : e.key.toUpperCase()
      const updated = { ...settings.shortcuts, [recordingFor]: { mod, key } }
      saveShortcuts(updated)
      setRecordingFor(null)
      showToast("Shortcut updated and synced to extension", "success")
    }
    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [recordingFor, settings.shortcuts, saveShortcuts])

  // Escape to close panel
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !recordingFor) onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, recordingFor])

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function handleSavePreferences() {
    savePreferences(localPreferences)
    showToast("Preferences saved & synchronized to cloud", "success")
  }

  if (!isOpen) return null

  const usage = settings.usage || { queries: 28, heals: 5, verified: 12 }
  const queriesUsed = usage.queries || 28
  const maxQueries = 500
  const quotaPercent = Math.min(100, Math.round((queriesUsed / maxQueries) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/65 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92dvh] h-[660px] bg-card text-foreground rounded-2xl border border-border shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── Left Navigation Sidebar ── */}
        <div className="w-full md:w-64 shrink-0 bg-muted/30 border-b md:border-b-0 md:border-r border-border flex flex-col">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-border flex items-center justify-between md:block">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/100/15 text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
                <Settings2 className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-[14px] font-bold text-foreground leading-none">Studio Settings</h2>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-none mt-0.5 hidden xs:block">
                  AI &amp; Database Controls
                </p>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-1.5 md:mt-3 rounded-lg border border-border bg-card px-2.5 py-1 shadow-2xs">
              <span className={`size-2 rounded-full shrink-0 ${isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-500/100"}`} />
              <span className="text-[10px] font-medium text-muted-foreground">
                {isSyncing ? "Syncing..." : "Cloud Synced"}
              </span>
            </div>
          </div>

          {/* Navigation Tabs grouped by 4 Sections */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-1.5 md:p-2 gap-1 md:space-y-2.5 shrink-0 md:flex-1 no-scrollbar">
            {SECTIONS.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="hidden md:block px-2 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  {sec.title}
                </p>
                <div className="flex md:flex-col gap-1">
                  {sec.items.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-all duration-150 shrink-0 whitespace-nowrap md:whitespace-normal md:w-full cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`size-3.5 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span
                            className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded hidden sm:inline ml-2 ${
                              isActive
                                ? "bg-white/20 text-emerald-200"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Active Workspace Pill in Footer */}
          <div className="hidden md:block p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: activeWorkspace?.color || "#3aa363" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-bold text-foreground truncate">
                  {activeWorkspace?.name || "Default Workspace"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {activeWorkspace?.environment || "Production"} · {dbInfo ? `${dbInfo.tables_count} tables` : "No DB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content Pane ── */}
        <div className="flex-1 flex flex-col bg-card overflow-hidden min-w-0">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-3.5 bg-card/90 shrink-0">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "general" && "Customize theme mode, typography scale, UI density, and audio feedback"}
                {activeTab === "engine" && "Configure LLM compiler, strictness temperature, and SQL Doctor Critic healing"}
                {activeTab === "safety" && "Enforce read-only safety, statement execution timeouts, and row limit protection"}
                {activeTab === "editor" && "Fine-tune SQL keyword casing, export delimiters, and audio feedback"}
                {activeTab === "usage" && "Track monthly query compilation quotas, SQL Doctor auto-heals, and execution metrics"}
                {activeTab === "plans" && "Manage subscription plan, team seats, and developer quota limits"}
                {activeTab === "shortcuts" && "Customize Spotlight Copilot global hotkeys and execution bindings"}
                {activeTab === "workspaces" && "Manage multiple project workspaces, environments, and catalogs"}
                {activeTab === "account" && "Manage profile, identity, and reset local configuration"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="px-6 py-2 bg-emerald-500/100/10 border-b border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>{toast.msg}</span>
            </div>
          )}

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
            
            {/* ═════════════════════════════════════════════════════════ */}
            {/* 0. APPEARANCE & THEME                                     */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "general" && (
              <div className="space-y-4">
                {/* Theme Selector */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Theme Mode</h4>
                    <p className="text-[11px] text-muted-foreground">Select your preferred dashboard visual theme</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleThemeChange("light")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer gap-2 ${
                        localPreferences.theme === "light"
                          ? "border-emerald-500 bg-emerald-500/100/10 text-foreground font-bold shadow-2xs"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Sun className="size-5 text-amber-500" />
                      <span>Light Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange("system")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer gap-2 ${
                        localPreferences.theme === "system"
                          ? "border-emerald-500 bg-emerald-500/100/10 text-foreground font-bold shadow-2xs"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Laptop className="size-5 text-sky-500" />
                      <span>System Sync</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange("dark")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer gap-2 ${
                        localPreferences.theme === "dark"
                          ? "border-emerald-500 bg-emerald-500/100/10 text-foreground font-bold shadow-2xs"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Moon className="size-5 text-emerald-400" />
                      <span>Dark Mode</span>
                    </button>
                  </div>
                </div>

                {/* Sound Feedback Toggle */}
                <div className="rounded-xl border border-border p-4 bg-card flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Subtle Sound Feedback</h4>
                    <p className="text-[11px] text-muted-foreground">Audio confirmation on query execution and SQL Doctor heals</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.soundFeedback}
                    onChange={(e) => {
                      const val = e.target.checked
                      setLocalPreferences((p) => ({ ...p, soundFeedback: val }))
                      savePreferences({ soundFeedback: val })
                      showToast(`Audio feedback ${val ? "enabled" : "disabled"}`, "success")
                    }}
                    className="size-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
            
            {/* ═════════════════════════════════════════════════════════ */}
            {/* 1. AI ENGINE & CRITIC DOCTOR                              */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "engine" && (
              <div className="space-y-4">
                
                {/* Active Model Selector */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Primary LLM Model</h4>
                      <p className="text-[11px] text-muted-foreground">Grounded query compiler &amp; intent evaluator</p>
                    </div>
                    <Badge variant="emerald" className="text-[9px] uppercase font-bold">
                      NVIDIA NIM Hosted
                    </Badge>
                  </div>

                  <select
                    value={localPreferences.model}
                    onChange={(e) => setLocalPreferences((p) => ({ ...p, model: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-emerald-500"
                  >
                    <option value="llama-3.1-70b-instruct">meta/llama-3.1-70b-instruct (Recommended · High Accuracy)</option>
                    <option value="llama-3.3-70b-instruct">meta/llama-3.3-70b-instruct (Latest Fast Inference)</option>
                    <option value="llama-3.1-8b-instruct">meta/llama-3.1-8b-instruct (Ultra-Low Latency)</option>
                  </select>
                </div>

                {/* Determinism / Temperature Slider */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Compilation Strictness (Temperature)</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Lower values produce strictly deterministic SQL matching live column names.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      {localPreferences.temperature.toFixed(1)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.1"
                    value={localPreferences.temperature}
                    onChange={(e) => setLocalPreferences((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>0.0 (Deterministic SQL)</span>
                    <span>0.2 (Balanced Analytical)</span>
                    <span>0.5 (Creative Exploration)</span>
                  </div>
                </div>

                {/* Auto-Healing Critic & Schema Pruning */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border p-3.5 bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Zap className="size-3.5 text-emerald-600" />
                        <span>SQL Doctor Auto-Heal</span>
                      </h4>
                      <input
                        type="checkbox"
                        checked={localPreferences.autoDoctor}
                        onChange={(e) => setLocalPreferences((p) => ({ ...p, autoDoctor: e.target.checked }))}
                        className="size-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Intercepts SQLSTATE execution errors (`42703`, `42P01`, `42803`) and uses Critic Agent to auto-repair queries.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border p-3.5 bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Database className="size-3.5 text-emerald-600" />
                        <span>Dynamic Schema Pruning</span>
                      </h4>
                      <input
                        type="checkbox"
                        checked={localPreferences.schemaPruning}
                        onChange={(e) => setLocalPreferences((p) => ({ ...p, schemaPruning: e.target.checked }))}
                        className="size-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Prunes irrelevant tables on large 50+ table schemas with token-overlap RAG to prevent LLM context overflow.
                    </p>
                  </div>
                </div>

                {/* Proactive Clarification Level */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Clarification Trigger Sensitivity</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Controls when the engine pauses to ask 1-tap clarifying questions vs compiling immediately.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: "aggressive", label: "High Sensitivity", desc: "Always asks on multi-table queries" },
                      { id: "balanced", label: "Balanced (Default)", desc: "Asks on ambiguous filters/metrics" },
                      { id: "minimal", label: "Direct Compile", desc: "Guesses safe defaults immediately" },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setLocalPreferences((p) => ({ ...p, clarificationLevel: lvl.id }))}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          localPreferences.clarificationLevel === lvl.id
                            ? "border-emerald-600 bg-emerald-500/10/70 text-emerald-950 font-semibold"
                            : "border-border bg-background text-muted-foreground hover:bg-card"
                        }`}
                      >
                        <span className="block text-xs font-bold">{lvl.label}</span>
                        <span className="block text-[10px] text-muted-foreground mt-0.5 leading-tight">{lvl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePreferences} className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="size-3.5" />
                    <span>Save AI Settings</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 2. DATABASE SAFETY GUARDS & LIMITS                        */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "safety" && (
              <div className="space-y-4">
                
                {/* Read-Only Lock Banner */}
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/100/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 dark:text-emerald-400">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <span>Read-Only Transaction Enforcement</span>
                    </div>
                    <Badge variant="emerald" className="text-[9px] uppercase font-bold">
                      Guaranteed Safe
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    QueryCraft appends `SET TRANSACTION READ ONLY` to all live PostgreSQL connections. All mutating operations (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `TRUNCATE`) are strictly rejected.
                  </p>
                </div>

                {/* Execution Statement Timeout & Row Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                    <label className="block text-xs font-bold text-foreground">
                      Statement Execution Timeout
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Cancels runaway scans or heavy queries before locking tables.
                    </p>
                    <select
                      value={localPreferences.statementTimeout}
                      onChange={(e) => setLocalPreferences((p) => ({ ...p, statementTimeout: parseInt(e.target.value) }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-emerald-500"
                    >
                      <option value={5000}>5,000 ms (5 seconds)</option>
                      <option value={8000}>8,000 ms (8 seconds · Recommended)</option>
                      <option value={15000}>15,000 ms (15 seconds)</option>
                      <option value={30000}>30,000 ms (30 seconds max)</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                    <label className="block text-xs font-bold text-foreground">
                      Default Safe LIMIT Clamp
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Appends safe read-only limit to prevent huge memory buffers.
                    </p>
                    <select
                      value={localPreferences.defaultLimit}
                      onChange={(e) => setLocalPreferences((p) => ({ ...p, defaultLimit: parseInt(e.target.value) }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-emerald-500"
                    >
                      <option value={25}>25 rows</option>
                      <option value={50}>50 rows (Standard)</option>
                      <option value={100}>100 rows</option>
                      <option value={250}>250 rows</option>
                      <option value={500}>500 rows</option>
                    </select>
                  </div>
                </div>

                {/* EXPLAIN Cost Warning Limit */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">EXPLAIN Cost Alert Threshold</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Warns if PostgreSQL EXPLAIN cost exceeds threshold and suggests CREATE INDEX CONCURRENTLY.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {localPreferences.costWarningThreshold} cost units
                    </span>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={localPreferences.costWarningThreshold}
                    onChange={(e) => setLocalPreferences((p) => ({ ...p, costWarningThreshold: parseInt(e.target.value) }))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePreferences} className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="size-3.5" />
                    <span>Save Safety Settings</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 3. STUDIO, FORMATTING & EXPORT                           */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "editor" && (
              <div className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SQL Keyword Casing */}
                  <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                    <label className="block text-xs font-bold text-foreground">
                      SQL Keyword Casing
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Format generated SQL keywords style.
                    </p>
                    <select
                      value={localPreferences.sqlKeywordCasing}
                      onChange={(e) => setLocalPreferences((p) => ({ ...p, sqlKeywordCasing: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-emerald-500"
                    >
                      <option value="uppercase">UPPERCASE (SELECT, FROM, WHERE)</option>
                      <option value="lowercase">lowercase (select, from, where)</option>
                    </select>
                  </div>

                  {/* CSV Export Delimiter */}
                  <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                    <label className="block text-xs font-bold text-foreground">
                      CSV Export Delimiter
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Format used when clicking Export CSV in charts.
                    </p>
                    <select
                      value={localPreferences.csvDelimiter}
                      onChange={(e) => setLocalPreferences((p) => ({ ...p, csvDelimiter: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-emerald-500"
                    >
                      <option value="comma">Comma separated (,) [Standard]</option>
                      <option value="tab">Tab separated (\t) [TSV / Excel]</option>
                      <option value="semicolon">Semicolon separated (;) [European]</option>
                    </select>
                  </div>
                </div>

                {/* Audio / Sound Feedback */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Volume2 className="size-3.5 text-emerald-600" />
                        <span>Haptic Sound Effects</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Plays subtle audio feedback when queries execute or auto-heal successfully.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPreferences.soundFeedback}
                      onChange={(e) => setLocalPreferences((p) => ({ ...p, soundFeedback: e.target.checked }))}
                      className="size-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePreferences} className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="size-3.5" />
                    <span>Save Studio Settings</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 4. USAGE & QUOTAS                                         */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "usage" && (
              <div className="space-y-4">
                
                {/* Monthly Quota Banner */}
                <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#f0faf3] to-[#e8f6ed] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Monthly AI Compilation Quota
                      </span>
                      <h4 className="text-lg font-extrabold text-[#112419]">
                        {queriesUsed} / {maxQueries} Queries Used
                      </h4>
                    </div>
                    <Badge variant="emerald" className="text-xs font-bold px-3 py-1">
                      {100 - quotaPercent}% Remaining
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#d6ebdd]">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#557864] font-mono">
                      <span>{queriesUsed} queries compiled</span>
                      <span>Resets in 18 days</span>
                    </div>
                  </div>
                </div>

                {/* Key Usage Statistics Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total Queries
                    </span>
                    <p className="text-xl font-extrabold text-foreground">{queriesUsed}</p>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">100% read-only</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Auto-Heals
                    </span>
                    <p className="text-xl font-extrabold text-foreground">{usage.heals || 5}</p>
                    <span className="text-[10px] text-amber-700 font-semibold">Critic Doctor</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Verified Snippets
                    </span>
                    <p className="text-xl font-extrabold text-foreground">{usage.verified || 12}</p>
                    <span className="text-[10px] text-blue-700 font-semibold">Few-shot RAG</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Live Schemas
                    </span>
                    <p className="text-xl font-extrabold text-foreground">{dbInfo?.tables_count || 5}</p>
                    <span className="text-[10px] text-[#2f6643] font-semibold">Introspected</span>
                  </div>
                </div>

                {/* Engine Activity Velocity */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Dialect Usage Distribution</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-[#324538]">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#3ecf8e]" />
                        <span>PostgreSQL (Supabase / Neon / RDS)</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">68%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-[#324538]">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#00ed64]" />
                        <span>MongoDB Atlas (NoSQL Aggregations)</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">22%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-[#324538]">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#00758f]" />
                        <span>MySQL / MariaDB</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">10%</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 5. PLANS & BILLING                                        */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "plans" && (
              <div className="space-y-4">
                
                {/* Active Plan Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">Developer Free Tier</h4>
                      <Badge variant="emerald" className="text-[9px] uppercase font-bold">
                        Active Plan
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      500 queries/month · Unlimited Live Schemas · Read-Only Sandboxed
                    </p>
                  </div>

                  <span className="text-lg font-extrabold text-[#1b6b3a] font-mono">$0 / mo</span>
                </div>

                {/* Plan Tier Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  
                  {/* Free Tier */}
                  <div className="rounded-2xl border-2 border-emerald-500 bg-background p-4 space-y-3 shadow-2xs relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Developer Free</h4>
                        <p className="text-xs text-muted-foreground">For individual engineers &amp; hackers</p>
                      </div>
                      <span className="rounded bg-emerald-100 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5">
                        Current
                      </span>
                    </div>

                    <div className="text-2xl font-black text-foreground">
                      $0 <span className="text-xs font-normal text-muted-foreground">/ month</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#324538]">
                      {[
                        "500 AI SQL & NoSQL queries / month",
                        "Llama 3.1 70B live schema grounding",
                        "Chrome Spotlight Copilot (Cmd+Shift+K)",
                        "Up to 3 Project Workspaces",
                        "SQL Doctor Critic auto-healing",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="size-3.5 text-emerald-600 font-bold shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Team Pro Tier */}
                  <div className="rounded-2xl border border-[#2b4234] bg-[#0c1410] text-white p-4 space-y-3 shadow-md relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Zap className="size-4 text-amber-400" />
                          <span>Team Pro</span>
                        </h4>
                        <p className="text-xs text-[#87a090]">For fast-moving data teams</p>
                      </div>
                      <span className="rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] px-2 py-0.5">
                        Popular
                      </span>
                    </div>

                    <div className="text-2xl font-black text-white">
                      $19 <span className="text-xs font-normal text-[#87a090]">/ seat / month</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#d0ded5]">
                      {[
                        "Unlimited AI SQL & NoSQL queries",
                        "Dedicated high-speed GPU inference",
                        "Unlimited project workspaces & team notebooks",
                        "V3 Scheduled Cron workflows & Slack alerts",
                        "Priority 24/7 SLA & dedicated support",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="size-3.5 text-emerald-400 font-bold shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      onClick={() => showToast("Upgrade link triggered. Contacting Stripe checkout...", "success")}
                      className="w-full mt-2 font-bold text-xs bg-emerald-500/100 hover:bg-emerald-400 text-black shadow-sm cursor-pointer"
                    >
                      <span>Upgrade to Team Pro</span>
                      <ArrowRight className="size-3.5 ml-1" />
                    </Button>
                  </div>

                </div>

              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 6. KEYBINDINGS & COPILOT HOTKEYS                         */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "shortcuts" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Keyboard className="size-4 text-emerald-600" />
                    <span>Developer Hotkeys</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Click on any shortcut to re-bind it. Shortcuts sync automatically to the Spotlight Copilot Chrome Extension.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "spotlight", label: "Open Spotlight In-Situ Copilot", default: "Cmd+Shift+K" },
                    { id: "runQuery", label: "Execute Query in Sandbox", default: "Cmd+Enter" },
                    { id: "openSettings", label: "Open Studio Settings Panel", default: "Cmd+," },
                    { id: "clearChat", label: "Clear Chat Conversation", default: "Cmd+K" },
                  ].map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-emerald-500/40 transition"
                    >
                      <div>
                        <span className="text-xs font-bold text-foreground">{sc.label}</span>
                      </div>
                      <kbd className="font-mono text-xs font-bold text-[#1b6b3a] bg-[#eaf5ed] border border-[#c2e2cc] px-2 py-1 rounded-md shadow-2xs">
                        {sc.default}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 7. PROJECTS & WORKSPACES                                 */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "workspaces" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Project Workspaces</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Organize different databases and credentials per client or project.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsWorkspaceModalOpen(true)}
                    className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-500/100 text-white"
                  >
                    <Plus className="size-3.5" />
                    <span>New Workspace</span>
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {(workspaces || []).map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId
                    return (
                      <div
                        key={ws.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10/50 shadow-2xs"
                            : "border-border bg-card hover:border-[#b8d4c1]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="size-3.5 rounded-full shrink-0 ring-2 ring-white shadow-2xs"
                            style={{ backgroundColor: ws.color || "#3aa363" }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground truncate">{ws.name}</span>
                              <span className="rounded bg-[#edf4ee] border border-[#d6e5d9] px-1.5 py-0.2 text-[9px] font-bold text-muted-foreground">
                                {ws.environment || "Production"}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                              {ws.connectionUri ? ws.connectionUri.replace(/:[^:@]+@/, ":••••@") : "No connection string attached"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => setActiveWorkspaceId(ws.id)}
                              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/25 bg-card hover:bg-emerald-500/10 transition cursor-pointer"
                            >
                              Switch To
                            </button>
                          )}
                          {workspaces.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteWorkspace(ws.id)}
                              className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Delete Workspace"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════ */}
            {/* 8. PROFILE & CLOUD SYNCHRONIZATION                       */}
            {/* ═════════════════════════════════════════════════════════ */}
            {activeTab === "account" && (
              <div className="space-y-4">
                
                {/* Profile Card */}
                <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-[#122e1d] to-[#1f4d30] text-[#5de08a] flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                    {(localAccount.displayName || "Q").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {localAccount.displayName || "QueryCraft User"}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{localAccount.email}</p>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 px-2 py-0.5 rounded mt-1">
                      {localAccount.role}
                    </span>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-3 rounded-xl border border-border p-4 bg-card">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#324538]">Display Name</label>
                      <input
                        type="text"
                        value={localAccount.displayName}
                        onChange={(e) => setLocalAccount((p) => ({ ...p, displayName: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#324538]">Email Address</label>
                      <input
                        type="email"
                        value={localAccount.email}
                        onChange={(e) => setLocalAccount((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#324538]">Role</label>
                    <select
                      value={localAccount.role}
                      onChange={(e) => setLocalAccount((p) => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        saveAccount(localAccount)
                        showToast("Profile updated & saved", "success")
                      }}
                      className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Save className="size-3.5" />
                      <span>Save Profile</span>
                    </Button>

                    {authUser && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          authLogout()
                          showToast("Signed out successfully", "warning")
                          onClose()
                        }}
                        className="gap-1.5 font-bold text-xs text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="size-3.5" />
                        <span>Sign Out</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Reset to Factory Defaults */}
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-red-800">Reset Local Preferences</h4>
                    <p className="text-[11px] text-red-700">Restore factory default models, timeouts, and limits.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Reset all settings to default values?")) {
                        resetAllSettings()
                        showToast("Settings reset to defaults", "warning")
                      }
                    }}
                    className="text-xs font-bold text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Reset Defaults
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
