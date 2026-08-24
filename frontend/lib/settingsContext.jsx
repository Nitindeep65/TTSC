"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const API = "http://127.0.0.1:8000"

const DEFAULT_SETTINGS = {
  account:     { displayName: "QueryCraft User", email: "demo@querycraft.dev", plan: "free" },
  preferences: { theme: "dark", fontSize: "12", compactOnStart: false, autoFocus: true },
  shortcuts:   {},
  apiBase:     "http://127.0.0.1:8000",
  usage:       { queries: 0, heals: 0, verified: 0 },
}

const DEFAULT_SHORTCUTS = [
  { id: "openDB",      label: "Switch Database",       mod: "Cmd",  key: "K" },
  { id: "tabChat",     label: "Go to Chat",            mod: "Cmd",  key: "1" },
  { id: "tabSchema",   label: "Go to Schema",          mod: "Cmd",  key: "2" },
  { id: "tabMetrics",  label: "Go to Metrics",         mod: "Cmd",  key: "3" },
  { id: "tabDBs",      label: "Go to Databases",       mod: "Cmd",  key: "4" },
  { id: "compact",     label: "Toggle Compact Mode",   mod: "Cmd",  key: "M" },
  { id: "openSettings",label: "Open Settings",         mod: "Cmd",  key: "," },
  { id: "clearChat",   label: "Clear Chat",            mod: "Cmd",  key: "Backspace" },
  { id: "closeAll",    label: "Close Panels",          mod: "",     key: "Escape" },
]

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // ── FETCH from backend on mount ──────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/settings/`)
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch {
      // Backend offline — use defaults silently
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  // ── PUSH patch to backend ────────────────────────────────────────────────
  const pushSettings = useCallback(async (patch) => {
    setIsSyncing(true)
    try {
      const res = await fetch(`${API}/api/settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        const updated = await res.json()
        setSettings(updated)
        return updated
      }
    } catch {
      // Offline — update local state only
      setSettings(prev => {
        const next = { ...prev }
        for (const [k, v] of Object.entries(patch)) {
          if (typeof v === "object" && v !== null && !Array.isArray(v)) {
            next[k] = { ...prev[k], ...v }
          } else {
            next[k] = v
          }
        }
        return next
      })
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // ── Convenience updaters ─────────────────────────────────────────────────
  const saveAccount     = (account)     => pushSettings({ account })
  const savePreferences = (preferences) => pushSettings({ preferences })
  const saveShortcuts   = (shortcuts)   => pushSettings({ shortcuts })
  const saveApiBase     = (apiBase)     => pushSettings({ apiBase })

  const incrementUsage = useCallback(async (field) => {
    try {
      await fetch(`${API}/api/settings/usage/increment?field=${field}`, { method: "POST" })
      await fetchSettings()
    } catch {
      setSettings(prev => ({
        ...prev,
        usage: { ...prev.usage, [field]: (prev.usage[field] || 0) + 1 }
      }))
    }
  }, [fetchSettings])

  const resetAllSettings = async () => {
    try {
      const res = await fetch(`${API}/api/settings/reset`, { method: "DELETE" })
      if (res.ok) setSettings(await res.json())
    } catch {
      setSettings(DEFAULT_SETTINGS)
    }
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      isLoading,
      isSyncing,
      DEFAULT_SHORTCUTS,
      fetchSettings,
      saveAccount,
      savePreferences,
      saveShortcuts,
      saveApiBase,
      incrementUsage,
      resetAllSettings,
      pushSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>")
  return ctx
}
