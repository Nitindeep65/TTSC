"use client"

import { useState, useEffect, useRef } from "react"
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
} from "lucide-react"
import { useSettings } from "@/lib/settingsContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TABS = [
  { id: "account",     label: "Account",     icon: User },
  { id: "usage",       label: "Usage",       icon: BarChart3 },
  { id: "billing",     label: "Billing",     icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Settings2 },
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

  const [activeTab, setActiveTab]     = useState("account")
  const [toast, setToast]             = useState(null)
  const [recordingFor, setRecordingFor] = useState(null)
  const [localAccount, setLocalAccount] = useState({ displayName: "", email: "" })
  const [localApiBase, setLocalApiBase] = useState("")
  const overlayRef = useRef(null)

  // Sync local editable state when settings load
  useEffect(() => {
    setLocalAccount({
      displayName: settings.account?.displayName || "",
      email:       settings.account?.email       || "",
    })
    setLocalApiBase(settings.apiBase || "http://127.0.0.1:8000")
  }, [settings])

  // Refresh on open
  useEffect(() => { if (isOpen) fetchSettings() }, [isOpen, fetchSettings])

  // Keyboard shortcut recording
  useEffect(() => {
    if (!recordingFor) return
    const handler = (e) => {
      if (["Meta","Control","Shift","Alt"].includes(e.key)) return
      e.preventDefault(); e.stopPropagation()
      const mod = e.metaKey ? "Cmd" : e.ctrlKey ? "Ctrl" : ""
      const key = e.key === " " ? "Space" : e.key
      const updated = { ...settings.shortcuts, [recordingFor]: { mod, key } }
      saveShortcuts(updated)
      setRecordingFor(null)
      showToast("Shortcut saved & synced to extension")
    }
    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [recordingFor, settings.shortcuts, saveShortcuts])

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && !recordingFor) onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, recordingFor])

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function getEffectiveShortcut(id) {
    return settings.shortcuts?.[id] || DEFAULT_SHORTCUTS.find(s => s.id === id)
  }

  if (!isOpen) return null

  const usage   = settings.usage   || {}
  const prefs   = settings.preferences || {}
  const account = settings.account || {}
  const quotaPct = Math.min(100, Math.round(((usage.queries || 0) / 500) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-[#e0e8e2] shadow-2xl flex overflow-hidden animate-scale-in"
           style={{ maxHeight: "88vh" }}>

        {/* ── Left Nav Column ── */}
        <div className="w-48 shrink-0 bg-[#f8faf8] border-r border-[#e0e8e2] flex flex-col">
          <div className="p-4 border-b border-[#e0e8e2]">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#1a2920] text-[#5de08a]">
                <Settings2 className="size-3.5" />
              </div>
              <span className="text-[13px] font-bold text-[#141a17]">Settings</span>
            </div>
            <p className="text-[10.5px] text-[#8a9e93] mt-1.5 leading-snug">
              Synced with extension
              {isSyncing && <span className="ml-1 text-[#34c06a]">· saving…</span>}
            </p>
          </div>

          <nav className="flex-1 p-2 space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-left transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-[#1a2920] text-white"
                    : "text-[#4a5e53] hover:bg-[#edf5ef] hover:text-[#1a2920]"
                }`}
              >
                <tab.icon className={`size-4 shrink-0 ${activeTab === tab.id ? "text-[#5de08a]" : "text-[#6a8275]"}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Sync status footer */}
          <div className="p-3 border-t border-[#e0e8e2]">
            <div className="flex items-center gap-1.5 text-[10.5px] text-[#8a9e93]">
              <div className="size-1.5 rounded-full bg-[#34c06a]" />
              <span>Live sync active</span>
            </div>
            <p className="text-[9.5px] text-[#b0c0b7] mt-0.5">Extension ↔ Dashboard</p>
          </div>
        </div>

        {/* ── Right Content Column ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e0e8e2] bg-white shrink-0">
            <h2 className="text-[14px] font-bold text-[#141a17]">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="size-8 text-[#8a9e93]">
              <X className="size-4" />
            </Button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-5 animate-spin text-[#34c06a]" />
              </div>
            ) : (

              <>
                {/* ══ ACCOUNT ══ */}
                {activeTab === "account" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-[#e0e8e2] bg-[#f8faf8]">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-[#0e3320] to-[#22c55e] flex items-center justify-center text-white text-[16px] font-black shadow-sm">
                        {(account.displayName || "Q").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-[#141a17]">{account.displayName || "QueryCraft User"}</p>
                        <p className="text-[11.5px] text-[#8a9e93]">{account.email || "demo@querycraft.dev"}</p>
                        <Badge className="mt-1 bg-[#edf5ef] text-[#1b5c38] border-[#c5ddc9] text-[9.5px] font-bold px-2 py-0">
                          {account.plan === "pro" ? "Pro Plan" : "Free Plan"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl border border-[#e0e8e2]">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93]">Profile</p>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#667872]">Display Name</label>
                        <input
                          type="text"
                          value={localAccount.displayName}
                          onChange={e => setLocalAccount(p => ({ ...p, displayName: e.target.value }))}
                          className="w-full rounded-xl border border-[#e0e8e2] bg-white px-3.5 py-2.5 text-[13px] text-[#141a17] outline-none focus:border-[#4abe7a] transition-colors"
                          placeholder="Your display name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#667872]">Email</label>
                        <input
                          type="email"
                          value={localAccount.email}
                          onChange={e => setLocalAccount(p => ({ ...p, email: e.target.value }))}
                          className="w-full rounded-xl border border-[#e0e8e2] bg-white px-3.5 py-2.5 text-[13px] text-[#141a17] outline-none focus:border-[#4abe7a] transition-colors"
                          placeholder="you@example.com"
                        />
                      </div>
                      <Button
                        onClick={() => { saveAccount(localAccount); showToast("Account saved & synced to extension") }}
                        className="w-full h-9 gap-2 font-semibold"
                        size="sm"
                      >
                        <Save className="size-3.5" /> Save Account
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-red-600">Danger Zone</p>
                      <p className="text-[11.5px] text-red-600">This resets all settings on both the dashboard and the Chrome extension.</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full h-8 font-semibold text-[11.5px]"
                        onClick={() => { if (confirm("Reset all settings?")) { resetAllSettings(); showToast("Settings reset to defaults", "warning") } }}
                      >
                        Reset All Settings &amp; Data
                      </Button>
                    </div>
                  </div>
                )}

                {/* ══ USAGE ══ */}
                {activeTab === "usage" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Queries Run",  value: usage.queries  || 0, color: "text-[#34c06a]" },
                        { label: "Auto-Heals",   value: usage.heals    || 0, color: "text-blue-500"  },
                        { label: "Verified SQL",  value: usage.verified || 0, color: "text-amber-500" },
                        { label: "DBs Connected", value: 1,                  color: "text-purple-500" },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-xl border border-[#e0e8e2] bg-[#f8faf8] p-4 text-center">
                          <p className={`text-[28px] font-black font-mono ${stat.color}`}>{stat.value}</p>
                          <p className="text-[11px] text-[#8a9e93] mt-0.5 font-medium">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl border border-[#e0e8e2] space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93]">Monthly Quota</p>
                        <span className="text-[11px] font-semibold text-[#34c06a]">{quotaPct}% used</span>
                      </div>
                      <div className="h-2 bg-[#e8ede9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#34c06a] to-[#1f7a47] rounded-full transition-all duration-500"
                          style={{ width: `${quotaPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#8a9e93]">
                        <span>{usage.queries || 0} queries used</span>
                        <span>500 / month (Free)</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[#e0e8e2] space-y-2">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93] mb-1">Counters are shared with the extension</p>
                      <div className="flex items-center gap-2 text-[12px] text-[#4a5e53]">
                        <div className="size-1.5 rounded-full bg-[#34c06a]" />
                        Queries increment when you send a message in Chat (web or extension)
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#4a5e53]">
                        <div className="size-1.5 rounded-full bg-blue-500" />
                        Heals increment when the Critic agent auto-repairs a query
                      </div>
                    </div>
                  </div>
                )}

                {/* ══ BILLING ══ */}
                {activeTab === "billing" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-[#e0e8e2] bg-[#f8faf8] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-[#141a17]">Free Plan</span>
                        <Badge className="bg-[#edf5ef] text-[#1b5c38] border-[#c5ddc9] font-bold">Active</Badge>
                      </div>
                      <ul className="space-y-1.5 text-[12.5px] text-[#4a5e53]">
                        {[
                          [true, "500 AI queries / month"],
                          [true, "Up to 3 database profiles"],
                          [true, "Self-Healing Critic engine"],
                          [true, "EXPLAIN Performance Guard"],
                          [false,"Verified Memory (unlimited)"],
                          [false,"Custom metric glossary export"],
                          [false,"Team workspace sharing"],
                        ].map(([ok, text], i) => (
                          <li key={i} className={`flex items-center gap-2 ${ok ? "" : "opacity-40"}`}>
                            {ok
                              ? <CheckCircle2 className="size-3.5 text-[#34c06a] shrink-0" />
                              : <X className="size-3.5 text-[#8a9e93] shrink-0" />
                            }
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-[#4abe7a]/30 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-bold text-[#141a17]">Pro Plan</span>
                          <p className="text-[11px] text-[#8a9e93] mt-0.5">Unlimited access + team features</p>
                        </div>
                        <span className="text-[16px] font-black text-[#34c06a]">$9<span className="text-[11px] font-normal text-[#8a9e93]">/mo</span></span>
                      </div>
                      <ul className="space-y-1.5 text-[12.5px] text-[#4a5e53]">
                        {[
                          "Unlimited AI queries",
                          "Unlimited database profiles",
                          "Priority backend access",
                          "Full Verified SQL memory",
                          "Metric glossary export (JSON/CSV)",
                          "Team workspace sharing",
                        ].map((text, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-[#34c06a] shrink-0" />
                            {text}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full h-9 font-bold text-[12.5px] gap-2">
                        <Sparkles className="size-3.5 text-[#5de08a]" />
                        Upgrade to Pro — $9/month
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-[#e0e8e2]">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93] mb-2">Payment Method</p>
                      <p className="text-[12px] text-[#8a9e93] text-center py-4">No payment method on file. Upgrade above to add one.</p>
                    </div>
                  </div>
                )}

                {/* ══ PREFERENCES ══ */}
                {activeTab === "preferences" && (
                  <div className="space-y-4">

                    {/* ── Keyboard Shortcuts ── */}
                    <div className="p-4 rounded-xl border border-[#e0e8e2] space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93]">Keyboard Shortcuts</p>
                        <button
                          type="button"
                          onClick={() => { saveShortcuts({}); showToast("Shortcuts reset & synced to extension") }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#8a9e93] hover:text-[#1a2920] transition-colors"
                        >
                          <RotateCcw className="size-3" /> Reset Defaults
                        </button>
                      </div>

                      {/* Global Chrome Open Shortcut info */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-[#34c06a]/20 bg-[#edf7f0]">
                        <div>
                          <p className="text-[12px] font-bold text-[#141a17]">Global Browser Extension Hotkey</p>
                          <p className="text-[11px] text-[#4a5e53]">Opens QueryCraft from any tab: <strong className="text-[#1b6b3a]">Alt+Q / Option+Q</strong></p>
                        </div>
                        <span className="text-[10.5px] font-mono font-bold bg-white px-2 py-1 rounded-md border border-[#c5ddc9] text-[#1b6b3a]">
                          Alt + Q
                        </span>
                      </div>

                      <p className="text-[11.5px] text-[#8a9e93] leading-snug">
                        Click <strong>Change ✎</strong> or press on a badge → type new key combo → saves immediately and <strong className="text-[#34c06a]">syncs to Chrome extension</strong>.
                      </p>

                      <div className="space-y-1.5">
                        {DEFAULT_SHORTCUTS.map(def => {
                          const eff = getEffectiveShortcut(def.id)
                          const isRec = recordingFor === def.id
                          return (
                            <div
                              key={def.id}
                              className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all duration-150 ${
                                isRec
                                  ? "border-[#4abe7a] bg-[#edf7f0] shadow-sm ring-2 ring-[#4abe7a]/20"
                                  : "border-[#e0e8e2] bg-white hover:border-[#b8d4bc]"
                              }`}
                            >
                              <span className="text-[12.5px] font-medium text-[#2a4035]">{def.label}</span>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setRecordingFor(isRec ? null : def.id)}
                                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-all duration-150 ${
                                    isRec
                                      ? "border-[#34c06a] bg-[#edf7f0] text-[#1b6b3a] animate-pulse"
                                      : "border-[#e0e8e2] bg-[#f8faf8] text-[#4a5e53] hover:border-[#34c06a] hover:text-[#1b6b3a]"
                                  }`}
                                  title="Click to rebind shortcut"
                                >
                                  {isRec ? (
                                    <span className="text-[11px] font-bold text-[#34c06a]">Press keys…</span>
                                  ) : (
                                    <>
                                      {eff?.mod && (
                                        <span className="font-mono text-[10.5px] font-bold rounded-md border border-[#d5e0d8] bg-white px-1.5 py-0.5">{eff.mod}</span>
                                      )}
                                      <span className="font-mono text-[10.5px] font-bold rounded-md border border-[#d5e0d8] bg-white px-1.5 py-0.5">{eff?.key}</span>
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => setRecordingFor(isRec ? null : def.id)}
                                  className="text-[11px] font-semibold text-[#667872] hover:text-[#1b6b3a] px-1.5 py-0.5 rounded transition-colors"
                                >
                                  {isRec ? "Cancel" : "Change ✎"}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* ── API Base ── */}
                    <div className="p-4 rounded-xl border border-[#e0e8e2] space-y-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93]">Backend API URL</p>
                      <p className="text-[11.5px] text-[#8a9e93]">Changing this syncs to the extension too.</p>
                      <input
                        type="text"
                        value={localApiBase}
                        onChange={e => setLocalApiBase(e.target.value)}
                        className="w-full rounded-xl border border-[#e0e8e2] bg-white px-3.5 py-2.5 text-[12.5px] font-mono text-[#141a17] outline-none focus:border-[#4abe7a] transition-colors"
                        placeholder="http://127.0.0.1:8000"
                      />
                      <Button
                        onClick={() => { saveApiBase(localApiBase); showToast("API URL saved & synced to extension") }}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 font-semibold text-[11.5px] text-[#1b6b3a]"
                      >
                        Save API URL
                      </Button>
                    </div>

                    {/* ── Appearance ── */}
                    <div className="p-4 rounded-xl border border-[#e0e8e2] space-y-4">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93]">Appearance</p>

                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-[#2a4035]">Extension Theme</span>
                        <div className="flex gap-1.5">
                          {["dark","dim","light"].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => { savePreferences({ ...prefs, theme: t }); showToast(`Theme set to ${t} — synced to extension`) }}
                              className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold capitalize transition-all duration-150 ${
                                (prefs.theme || "dark") === t
                                  ? "border-[#34c06a] bg-[#edf7f0] text-[#1b6b3a]"
                                  : "border-[#e0e8e2] text-[#667872] hover:border-[#b8d4bc]"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-[#2a4035]">Extension Font Size</span>
                        <div className="flex gap-1.5">
                          {[["12","S"],["13","M"],["14","L"]].map(([size, label]) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => { savePreferences({ ...prefs, fontSize: size }); showToast(`Font size ${label} — synced to extension`) }}
                              className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all duration-150 ${
                                (prefs.fontSize || "12") === size
                                  ? "border-[#34c06a] bg-[#edf7f0] text-[#1b6b3a]"
                                  : "border-[#e0e8e2] text-[#667872] hover:border-[#b8d4bc]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── Startup ── */}
                    <div className="p-4 rounded-xl border border-[#e0e8e2] space-y-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#8a9e93]">Extension Startup</p>
                      {[
                        { key: "compactOnStart", label: "Launch extension in compact mode" },
                        { key: "autoFocus",       label: "Auto-focus input on extension open" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-[12.5px] font-medium text-[#2a4035]">{label}</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!prefs[key]}
                            onClick={() => {
                              const updated = { ...prefs, [key]: !prefs[key] }
                              savePreferences(updated)
                              showToast("Preference synced to extension")
                            }}
                            className={`relative h-5 w-9 rounded-full border transition-all duration-200 ${
                              prefs[key]
                                ? "bg-[#34c06a] border-[#34c06a]"
                                : "bg-[#e0e8e2] border-[#e0e8e2]"
                            }`}
                          >
                            <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all duration-200 ${prefs[key] ? "left-4" : "left-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-xl border px-4 py-2.5 shadow-xl text-[13px] font-semibold animate-fade-up ${
          toast.type === "warning"
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-[#1a2920] text-white border-[#2e4035]"
        }`}>
          {toast.type === "warning"
            ? <AlertTriangle className="size-4 text-amber-500" />
            : <CheckCircle2 className="size-4 text-[#5de08a]" />
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}
