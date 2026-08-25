"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { settingsApi, API_BASE_URL } from "@/lib/api"

const DEFAULT_SETTINGS = {
  account:     { displayName: "QueryCraft User", email: "demo@querycraft.dev", plan: "free" },
  preferences: { theme: "dark", fontSize: "12", compactOnStart: false, autoFocus: true },
  shortcuts:   {},
  apiBase:     API_BASE_URL,
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

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsApi.getSettings()
      setSettings((prev) => ({ ...prev, ...data }))
      return data
    } catch {
      // Backend offline — use defaults silently
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await settingsApi.getSettings()
        if (!ignore) {
          setSettings((prev) => ({ ...prev, ...data }))
        }
      } catch {
        // Backend offline — use defaults silently
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // ── PUSH patch to backend ────────────────────────────────────────────────
  const pushSettings = useCallback(async (patch) => {
    setIsSyncing(true)
    try {
      const updated = await settingsApi.updateSettings(patch)
      setSettings(updated)
      return updated
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
      await settingsApi.incrementUsage(field)
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
      const reset = await settingsApi.resetSettings()
      setSettings(reset)
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
