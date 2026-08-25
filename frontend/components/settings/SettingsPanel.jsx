"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  X,
  User,
  BarChart3,
  CreditCard,
  Settings2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  Loader2,
  Cpu,
  Database,
  Radio,
  Keyboard,
  Check,
  Server,
  Sliders,
  Activity,
  Layers,
  ArrowUpRight,
  RefreshCw,
  HardDrive,
  Copy,
  LogOut,
} from "lucide-react"
import { useSettings } from "@/lib/settingsContext"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL, settingsApi } from "@/lib/api"

const TABS = [
  { id: "account",     label: "Profile & Team",     icon: User,      badge: null },
  { id: "engine",      label: "AI Engine & Safety", icon: Cpu,       badge: "Llama 3.1" },
  { id: "preferences", label: "Shortcuts & Studio", icon: Keyboard,  badge: "Alt+Q" },
  { id: "usage",       label: "Usage & Metrics",    icon: BarChart3, badge: null },
  { id: "api",         label: "API & Server Health",icon: Server,    badge: "FastAPI" },
  { id: "billing",     label: "Plans & Quotas",     icon: CreditCard,badge: "Free" },
]

const ROLES = [
  "Data Architect",
  "Backend Engineer",
  "Full-Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
  "Product Manager",
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
    incrementUsage,
    resetAllSettings,
    fetchSettings,
  } = useSettings()

  const { activeWorkspace, dbInfo } = useDatabase()
  const { user: authUser, logout: authLogout } = useAuth()

  const [activeTab, setActiveTab] = useState("account")
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
    fontSize: settings.preferences?.fontSize || "12",
    defaultLimit: settings.preferences?.defaultLimit || 50,
    autoDoctor: settings.preferences?.autoDoctor ?? true,
    safeReadOnly: settings.preferences?.safeReadOnly ?? true,
  }))
  const [localApiBase, setLocalApiBase] = useState(() => settings.apiBase || API_BASE_URL)

  // Healthcheck Ping State
  const [pingStatus, setPingStatus] = useState(null) // { loading, ok, latency, message, error }
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
            theme: settings.preferences?.theme || "dark",
            fontSize: settings.preferences?.fontSize || "12",
            defaultLimit: settings.preferences?.defaultLimit || 50,
            autoDoctor: settings.preferences?.autoDoctor ?? true,
            safeReadOnly: settings.preferences?.safeReadOnly ?? true,
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

  function getEffectiveShortcut(id) {
    return settings.shortcuts?.[id] || DEFAULT_SHORTCUTS.find((s) => s.id === id)
  }

  // Ping Server Health Handler
  const handlePingServer = async () => {
    setPingStatus({ loading: true })
    try {
      const result = await settingsApi.pingHealth(localApiBase)
      setPingStatus({
        loading: false,
        ok: true,
        latency: result.latency,
        message: result.message || "FastAPI Backend is online & responsive",
      })
      showToast(`Server healthy (${result.latency}ms latency)`, "success")
    } catch (err) {
      setPingStatus({
        loading: false,
        ok: false,
        error: err.message || "Failed to reach server",
      })
      showToast("Server ping failed — verify URL and backend status", "error")
    }
  }

  if (!isOpen) return null

  const usage = settings.usage || {}
  const account = settings.account || {}
  const quotaPct = Math.min(100, Math.round(((usage.queries || 0) / 500) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-4xl bg-white rounded-2xl border border-[#dfe7df] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ maxHeight: "88vh", height: "640px" }}
      >
        {/* ── Left Navigation Sidebar ── */}
        <div className="w-full md:w-64 shrink-0 bg-[#f8faf8] border-b md:border-b-0 md:border-r border-[#e3ebe4] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#e3ebe4]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a] shadow-xs">
                  <Settings2 className="size-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[#141a17]">Preferences</h2>
                  <p className="text-[11px] text-[#718578] leading-none mt-0.5">Global Configuration</p>
                </div>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-[#d6e5d8] bg-white px-2.5 py-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${isSyncing ? "bg-amber-400 animate-ping" : "bg-[#34c06a]"}`} />
                <span className="text-[10.5px] font-medium text-[#4a5e53]">
                  {isSyncing ? "Syncing..." : "Cloud Synced"}
                </span>
              </div>
              <Badge variant="outline" className="px-1 py-0 text-[9px] font-mono text-[#256339] border-[#c0dec7] bg-[#f0f8f2]">
                Web &amp; Ext
              </Badge>
            </div>
          </div>

          {/* Nav Tab Buttons */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-left transition-all duration-150 ${
                    isActive
                      ? "bg-[#1f2d24] text-white shadow-xs"
                      : "text-[#4a5e53] hover:bg-[#eef5f0] hover:text-[#141a17]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 ${isActive ? "text-[#5de08a]" : "text-[#7b9283]"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? "bg-white/20 text-[#a5f3bc]"
                          : "bg-[#e5eee7] text-[#55695d]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Active Workspace Pill in Sidebar Footer */}
          <div className="p-3 border-t border-[#e3ebe4] bg-white">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: activeWorkspace?.color || "#3aa363" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-bold text-[#141a17] truncate">
                  {activeWorkspace?.name || "Default Workspace"}
                </p>
                <p className="text-[10px] text-[#718578] truncate">
                  {activeWorkspace?.environment || "Production"} · {dbInfo ? `${dbInfo.tables_count} tables` : "No DB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content Pane ── */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#e3ebe4] px-6 py-4 bg-white/90">
            <div>
              <h3 className="text-base font-bold text-[#141a17]">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h3>
              <p className="text-xs text-[#718578] mt-0.5">
                {activeTab === "account" && "Manage profile, identity, and active team workspace settings"}
                {activeTab === "engine" && "Fine-tune multi-agent Llama 3.1 70B NIM compilation and safety constraints"}
                {activeTab === "preferences" && "Customize keyboard hotkeys, Spotlight Copilot, and theme layout"}
                {activeTab === "usage" && "Track daily query generation quotas, critic heals, and memory snippets"}
                {activeTab === "api" && "Inspect FastAPI endpoints, healthcheck status, and test network latency"}
                {activeTab === "billing" && "Review developer quotas, usage limits, and team upgrade tiers"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onClose}
              className="text-[#718578] hover:text-[#141a17] hover:bg-[#eef5f0]"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-2">
                <Loader2 className="size-6 animate-spin text-[#34c06a]" />
                <p className="text-xs text-[#718578]">Loading settings from cloud...</p>
              </div>
            ) : (
              <>
                {/* ═════════════════════════════════════════════════════════ */}
                {/* 1. PROFILE & TEAM WORKSPACE                             */}
                {/* ═════════════════════════════════════════════════════════ */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    {/* User Identity Banner */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-[#dfe7df] bg-[#f8faf8]">
                      <div className="size-14 rounded-2xl bg-gradient-to-br from-[#0e3320] via-[#1b5c38] to-[#34c06a] flex items-center justify-center text-white text-[18px] font-black shadow-md shrink-0">
                        {(localAccount.displayName || "Q").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[15px] font-bold text-[#141a17] truncate">
                            {localAccount.displayName || "QueryCraft User"}
                          </h4>
                          <Badge variant="emerald" className="text-[9px] uppercase font-bold">
                            {account.plan === "pro" ? "Pro Plan" : "Developer Free"}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#718578] truncate mt-0.5">{localAccount.email || "demo@querycraft.dev"}</p>
                        <p className="text-[11px] text-[#2e7d4d] font-semibold mt-1">Role: {localAccount.role || "Data Architect"}</p>
                      </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="space-y-4 rounded-xl border border-[#dfe7df] p-4 bg-white">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">Profile Credentials</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11.5px] font-bold text-[#324538]">Display Name</label>
                          <input
                            type="text"
                            value={localAccount.displayName}
                            onChange={(e) => setLocalAccount((p) => ({ ...p, displayName: e.target.value }))}
                            className="w-full rounded-xl border border-[#dfe7df] bg-[#fbfdfb] px-3.5 py-2 text-[13px] text-[#141a17] outline-none focus:border-[#3aa363] focus:bg-white transition-all"
                            placeholder="e.g. Alex Rivera"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11.5px] font-bold text-[#324538]">Email Address</label>
                          <input
                            type="email"
                            value={localAccount.email}
                            onChange={(e) => setLocalAccount((p) => ({ ...p, email: e.target.value }))}
                            className="w-full rounded-xl border border-[#dfe7df] bg-[#fbfdfb] px-3.5 py-2 text-[13px] text-[#141a17] outline-none focus:border-[#3aa363] focus:bg-white transition-all"
                            placeholder="alex@company.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11.5px] font-bold text-[#324538]">Organizational Role</label>
                        <select
                          value={localAccount.role || "Data Architect"}
                          onChange={(e) => setLocalAccount((p) => ({ ...p, role: e.target.value }))}
                          className="w-full rounded-xl border border-[#dfe7df] bg-[#fbfdfb] px-3.5 py-2 text-[13px] text-[#141a17] outline-none focus:border-[#3aa363] focus:bg-white transition-all"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <Button
                          type="button"
                          onClick={() => {
                            saveAccount(localAccount)
                            showToast("Profile credentials saved and synced", "success")
                          }}
                          className="gap-2 font-bold text-xs bg-[#1f2d24] hover:bg-[#2e4235]"
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
                              showToast("Logged out successfully", "warning")
                              onClose()
                            }}
                            className="gap-1.5 font-bold text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <LogOut className="size-3.5" />
                            <span>Sign Out</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Active Workspace Overview Card */}
                    <div className="rounded-xl border border-[#dfe7df] p-4 bg-[#fafcfa] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">Active Workspace</h4>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {activeWorkspace?.environment || "Production"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="size-8 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
                          style={{ backgroundColor: activeWorkspace?.color || "#3aa363" }}
                        >
                          <Database className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-[#141a17] truncate">{activeWorkspace?.name || "E-Commerce Main"}</p>
                          <p className="text-[11px] font-mono text-[#718578] truncate">
                            {activeWorkspace?.connectionUri ? activeWorkspace.connectionUri.replace(/:[^:@]+@/, ":••••@") : "No database connection attached"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 2. AI ENGINE & SAFETY GUARDRAILS                        */}
                {/* ═════════════════════════════════════════════════════════ */}
                {activeTab === "engine" && (
                  <div className="space-y-6">
                    {/* Model Info Card */}
                    <div className="p-4 rounded-xl border border-[#cbe4d1] bg-[#edf7f0] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="size-4 text-[#1b6b3a]" />
                          <h4 className="text-[13px] font-bold text-[#144226]">Active LLM Compilation Model</h4>
                        </div>
                        <Badge variant="emerald" className="text-[9.5px] uppercase font-bold">NVIDIA NIM</Badge>
                      </div>
                      <p className="text-[12px] text-[#2c5f3e] leading-snug">
                        Powered by <strong>Llama 3.1 70B Instruct</strong> with specialized zero-hallucination Information Schema grounding and recursive AST verification.
                      </p>
                    </div>

                    {/* Guardrails Configuration */}
                    <div className="space-y-4 rounded-xl border border-[#dfe7df] p-4 bg-white">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">Production Safety Controls</h4>

                      {/* Read-Only Mode Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-[#f0f4f1]">
                        <div>
                          <p className="text-[12.5px] font-bold text-[#141a17]">Enforce Strict Read-Only Mode</p>
                          <p className="text-[11px] text-[#718578]">Blocks any destructive SQL (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `TRUNCATE`)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !localPreferences.safeReadOnly
                            setLocalPreferences((p) => ({ ...p, safeReadOnly: next }))
                            savePreferences({ ...localPreferences, safeReadOnly: next })
                            showToast(`Read-only enforcement ${next ? "enabled" : "disabled"}`)
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            localPreferences.safeReadOnly ? "bg-[#34c06a]" : "bg-zinc-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              localPreferences.safeReadOnly ? "translate-x-5" : "translate-x-0.5"
                            } mt-0.5`}
                          />
                        </button>
                      </div>

                      {/* SQL Doctor Auto Heal Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-[#f0f4f1]">
                        <div>
                          <p className="text-[12.5px] font-bold text-[#141a17]">SQL Doctor Critic Self-Healing</p>
                          <p className="text-[11px] text-[#718578]">Catches SQLSTATE runtime errors and automatically re-executes repaired queries (up to 3 retries)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !localPreferences.autoDoctor
                            setLocalPreferences((p) => ({ ...p, autoDoctor: next }))
                            savePreferences({ ...localPreferences, autoDoctor: next })
                            showToast(`Critic self-healing ${next ? "enabled" : "disabled"}`)
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            localPreferences.autoDoctor ? "bg-[#34c06a]" : "bg-zinc-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              localPreferences.autoDoctor ? "translate-x-5" : "translate-x-0.5"
                            } mt-0.5`}
                          />
                        </button>
                      </div>

                      {/* Default Result Row Limit */}
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-[12.5px] font-bold text-[#141a17]">Default Row Limit Defense</p>
                          <p className="text-[11px] text-[#718578]">Appends limit clause to prevent memory runaway scans</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[25, 50, 100].map((limit) => (
                            <button
                              key={limit}
                              type="button"
                              onClick={() => {
                                setLocalPreferences((p) => ({ ...p, defaultLimit: limit }))
                                savePreferences({ ...localPreferences, defaultLimit: limit })
                                showToast(`Default row limit set to ${limit}`)
                              }}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                                localPreferences.defaultLimit === limit
                                  ? "border-[#34c06a] bg-[#edf7f0] text-[#1b6b3a]"
                                  : "border-[#dfe7df] text-[#718578] hover:border-[#b8d4bc]"
                              }`}
                            >
                              {limit} rows
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 3. KEYBOARD SHORTCUTS & EXTENSION STUDIO                */}
                {/* ═════════════════════════════════════════════════════════ */}
                {activeTab === "preferences" && (
                  <div className="space-y-6">
                    {/* Global Hotkey Banner */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#cbe4d1] bg-[#edf7f0]">
                      <div>
                        <p className="text-[12.5px] font-bold text-[#144226]">Global Spotlight Copilot Shortcut</p>
                        <p className="text-[11px] text-[#2c5f3e]">
                          Trigger shadow-DOM query studio from any browser tab: <strong className="text-[#155e2d]">Alt + Q / Option + Q</strong>
                        </p>
                      </div>
                      <span className="text-[11px] font-mono font-black bg-white px-2.5 py-1 rounded-lg border border-[#badbbf] text-[#155e2d] shadow-2xs">
                        Alt + Q
                      </span>
                    </div>

                    {/* Interactive Shortcuts Table */}
                    <div className="space-y-3 rounded-xl border border-[#dfe7df] p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">Studio Keyboard Shortcuts</h4>
                        <button
                          type="button"
                          onClick={() => {
                            saveShortcuts({})
                            showToast("Keyboard shortcuts reset to defaults", "warning")
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#718578] hover:text-[#141a17] transition-colors"
                        >
                          <RotateCcw className="size-3" />
                          <span>Reset Defaults</span>
                        </button>
                      </div>

                      <p className="text-[11.5px] text-[#718578]">
                        Click on any keycap badge to record a custom combination:
                      </p>

                      <div className="space-y-1.5">
                        {DEFAULT_SHORTCUTS.map((def) => {
                          const eff = getEffectiveShortcut(def.id)
                          const isRec = recordingFor === def.id
                          return (
                            <div
                              key={def.id}
                              className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs transition-all ${
                                isRec
                                  ? "border-[#34c06a] bg-[#edf7f0] ring-2 ring-[#34c06a]/20"
                                  : "border-[#e5eee7] bg-[#fbfdfb] hover:border-[#badbbf]"
                              }`}
                            >
                              <span className="font-semibold text-[#293d30]">{def.label}</span>
                              <button
                                type="button"
                                onClick={() => setRecordingFor(isRec ? null : def.id)}
                                className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-colors ${
                                  isRec
                                    ? "bg-[#34c06a] text-white animate-pulse"
                                    : "bg-white border border-[#dfe7df] text-[#141a17] hover:border-[#34c06a]"
                                }`}
                              >
                                {isRec ? "Press Keys..." : `${eff.mod ? `${eff.mod} + ` : ""}${eff.key}`}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Extension Appearance */}
                    <div className="space-y-3 rounded-xl border border-[#dfe7df] p-4 bg-white">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">Extension Appearance</h4>

                      <div className="flex items-center justify-between py-1 border-b border-[#f0f4f1]">
                        <span className="text-[12px] font-semibold text-[#293d30]">Theme Variant</span>
                        <div className="flex gap-1.5">
                          {["dark", "dim", "light"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setLocalPreferences((p) => ({ ...p, theme: t }))
                                savePreferences({ ...localPreferences, theme: t })
                                showToast(`Theme updated to ${t}`)
                              }}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
                                (localPreferences.theme || "dark") === t
                                  ? "border-[#34c06a] bg-[#edf7f0] text-[#1b6b3a]"
                                  : "border-[#dfe7df] text-[#718578] hover:border-[#badbbf]"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-[12px] font-semibold text-[#293d30]">Font Size Scale</span>
                        <div className="flex gap-1.5">
                          {[
                            ["12", "Small (12px)"],
                            ["13", "Medium (13px)"],
                            ["14", "Large (14px)"],
                          ].map(([size, label]) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setLocalPreferences((p) => ({ ...p, fontSize: size }))
                                savePreferences({ ...localPreferences, fontSize: size })
                                showToast(`Font size set to ${size}px`)
                              }}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                (localPreferences.fontSize || "12") === size
                                  ? "border-[#34c06a] bg-[#edf7f0] text-[#1b6b3a]"
                                  : "border-[#dfe7df] text-[#718578] hover:border-[#badbbf]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 4. USAGE & ANALYTICS                                    */}
                {/* ═════════════════════════════════════════════════════════ */}
                {activeTab === "usage" && (
                  <div className="space-y-6">
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Queries Compiled", value: usage.queries || 0, color: "text-[#34c06a]", bg: "bg-[#edf7f0] border-[#d2e7d7]" },
                        { label: "Critic Heals", value: usage.heals || 0, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
                        { label: "Verified SQL", value: usage.verified || 0, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
                        { label: "Active DBs", value: 1, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
                      ].map((stat) => (
                        <div key={stat.label} className={`rounded-xl border p-4 text-center ${stat.bg}`}>
                          <p className={`text-[26px] font-black font-mono ${stat.color}`}>{stat.value}</p>
                          <p className="text-[11px] text-[#55695d] font-semibold mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Monthly Free Tier Quota Progress */}
                    <div className="rounded-xl border border-[#dfe7df] p-4 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-[12.5px] font-bold text-[#141a17]">Monthly AI Query Generation Quota</h4>
                          <p className="text-[11px] text-[#718578]">500 monthly queries included on free developer plan</p>
                        </div>
                        <span className="text-[12px] font-bold font-mono text-[#34c06a]">{usage.queries || 0} / 500 ({quotaPct}%)</span>
                      </div>

                      <div className="h-2.5 bg-[#eef3ef] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#34c06a] to-[#5de08a] transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(4, quotaPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Operational Latency & Timeouts */}
                    <div className="rounded-xl border border-[#dfe7df] p-4 bg-[#fafcfa] space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">Performance Thresholds</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#e5eee7] bg-white">
                          <span className="text-[#55695d]">DB Statement Timeout</span>
                          <span className="font-mono font-bold text-[#141a17]">8,000 ms</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#e5eee7] bg-white">
                          <span className="text-[#55695d]">EXPLAIN Cost Guard</span>
                          <span className="font-mono font-bold text-[#1b6b3a]">Cost &lt; 300</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 5. API CONFIG & SERVER HEALTH                           */}
                {/* ═════════════════════════════════════════════════════════ */}
                {activeTab === "api" && (
                  <div className="space-y-6">
                    {/* API Base Input Card */}
                    <div className="space-y-3 rounded-xl border border-[#dfe7df] p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#718578]">FastAPI Backend URL</h4>
                        <span className="text-[10px] text-[#718578]">Env: process.env.NEXT_PUBLIC_API_URL</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={localApiBase}
                          onChange={(e) => setLocalApiBase(e.target.value)}
                          className="flex-1 rounded-xl border border-[#dfe7df] bg-[#fbfdfb] px-3.5 py-2 text-[12.5px] font-mono text-[#141a17] outline-none focus:border-[#3aa363] focus:bg-white transition-all"
                          placeholder={API_BASE_URL}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            saveApiBase(localApiBase)
                            showToast("API URL saved and synced to extension", "success")
                          }}
                          className="gap-1.5 font-bold text-xs bg-[#1f2d24] hover:bg-[#2e4235]"
                        >
                          <Save className="size-3.5" />
                          <span>Save</span>
                        </Button>
                      </div>

                      {/* Interactive Healthcheck Ping Trigger */}
                      <div className="pt-2 flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePingServer}
                          disabled={pingStatus?.loading}
                          className="gap-1.5 text-xs font-bold text-[#1b6b3a] border-[#c5ddc9] hover:bg-[#edf7f0]"
                        >
                          {pingStatus?.loading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Activity className="size-3.5" />
                          )}
                          <span>Ping Backend Status</span>
                        </Button>

                        {pingStatus && !pingStatus.loading && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`size-2 rounded-full ${pingStatus.ok ? "bg-[#34c06a]" : "bg-red-500"}`} />
                            <span className={`font-semibold ${pingStatus.ok ? "text-[#1b6b3a]" : "text-red-600"}`}>
                              {pingStatus.ok ? `200 OK (${pingStatus.latency}ms)` : `Error: ${pingStatus.error}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Danger Zone: Reset Data */}
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-3">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                        <AlertTriangle className="size-4 text-red-600" />
                        <span>Danger Zone — Reset Settings &amp; Data</span>
                      </div>
                      <p className="text-[11.5px] text-red-600 leading-snug">
                        This action resets all local keyboard shortcuts, usage counters, and cached server URLs on both the dashboard and the Chrome extension.
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto font-bold text-xs"
                        onClick={() => {
                          if (confirm("Are you sure you want to reset all settings to defaults?")) {
                            resetAllSettings()
                            showToast("All settings reset to defaults", "warning")
                          }
                        }}
                      >
                        Reset All Settings to Factory Default
                      </Button>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 6. PLANS & BILLING                                      */}
                {/* ═════════════════════════════════════════════════════════ */}
                {activeTab === "billing" && (
                  <div className="space-y-6">
                    {/* Free Plan Card */}
                    <div className="p-4 rounded-xl border border-[#dfe7df] bg-[#fafcfa] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-bold text-[#141a17]">Developer Free Tier</h4>
                            <Badge variant="secondary" className="text-[9.5px] font-bold">Active</Badge>
                          </div>
                          <p className="text-[11px] text-[#718578] mt-0.5">Ideal for local development, schema exploration, and ad-hoc analytics</p>
                        </div>
                        <span className="text-[16px] font-black text-[#141a17]">$0<span className="text-[11px] font-normal text-[#718578]">/mo</span></span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4a5e53]">
                        {[
                          "500 AI queries / month",
                          "Multi-agent LangGraph workflow",
                          "PostgreSQL & MongoDB introspection",
                          "Critic self-healing loop",
                          "Local Chrome Spotlight Copilot",
                          "Verified query notebook",
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-[#34c06a] shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Upgrade Card */}
                    <div className="p-4 rounded-xl border border-[#4abe7a]/40 bg-gradient-to-br from-[#edf9f1] to-white space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-bold text-[#141a17]">Team Pro Studio</h4>
                            <Badge variant="emerald" className="text-[9.5px] uppercase font-bold">Recommended</Badge>
                          </div>
                          <p className="text-[11px] text-[#718578] mt-0.5">Unlimited team collaboration, custom semantic policy RAG, and SLA</p>
                        </div>
                        <span className="text-[18px] font-black text-[#1b6b3a]">$9<span className="text-[11px] font-normal text-[#718578]">/seat/mo</span></span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#324538]">
                        {[
                          "Unlimited AI queries",
                          "Priority NVIDIA NIM Llama 3.1 70B",
                          "Team semantic glossary sync",
                          "Multi-database schema monitoring",
                          "Automated index creation executor",
                          "Dedicated 99.9% uptime SLA",
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="size-3.5 text-[#1b6b3a] font-bold shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full gap-2 font-bold text-xs bg-[#1f2d24] hover:bg-[#2e4235] text-white">
                        <Sparkles className="size-3.5 text-[#5de08a]" />
                        <span>Upgrade to Team Pro — $9/month</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-60 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-xl border animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : toast.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-[#14261b] text-white border-[#274431]"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="size-4 text-red-500" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="size-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="size-4 text-[#5de08a]" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
