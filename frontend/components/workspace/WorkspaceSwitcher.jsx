'use client'

import React, { useState, useRef, useEffect, useMemo } from "react"
import {
  Check,
  ChevronDown,
  Cloud,
  Database,
  FolderKanban,
  FolderPlus,
  Layers,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"

export default function WorkspaceSwitcher({ className = "" }) {
  const {
    workspaces = [],
    activeWorkspaceId,
    activeWorkspace = {},
    setActiveWorkspaceId,
    deleteWorkspace,
    setIsWorkspaceModalOpen,
  } = useDatabase()

  const [isOpen, setIsOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState("")
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getEnvConfig = (env) => {
    switch (env) {
      case "Production":
        return { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
      case "Staging":
        return { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
      case "Development":
        return { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" }
      default:
        return { dot: "bg-slate-400", text: "text-muted-foreground", bg: "bg-muted border-border" }
    }
  }

  const activeEnv = getEnvConfig(activeWorkspace.environment || "Production")

  const filteredWorkspaces = useMemo(() => {
    if (!filterQuery.trim()) return workspaces
    const q = filterQuery.toLowerCase()
    return workspaces.filter(
      (w) =>
        (w.name || "").toLowerCase().includes(q) ||
        (w.environment || "").toLowerCase().includes(q)
    )
  }, [workspaces, filterQuery])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      
      {/* ── Premium Workspace Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 transition-all duration-150 active:scale-[0.98] max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] ${
          isOpen
            ? "border-emerald-500/40 bg-card shadow-sm ring-2 ring-emerald-500/15"
            : "border-border bg-card/75 hover:bg-muted/60 hover:border-border-hover shadow-2xs"
        }`}
      >
        {/* Workspace Icon Tile */}
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs transition-transform duration-150 group-hover:scale-105">
          <FolderKanban className="size-3.5" />
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col text-left min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <span suppressHydrationWarning className="truncate text-xs font-bold text-foreground leading-tight">
              {activeWorkspace.name || "Default Workspace"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9.5px] font-medium leading-tight mt-0.5">
            <span className={`size-1.5 rounded-full shrink-0 ${activeEnv.dot}`} />
            <span suppressHydrationWarning className="text-muted-foreground font-semibold truncate">
              {activeWorkspace.environment || "Production"}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown className={`size-3.5 text-muted-foreground shrink-0 ml-0.5 transition-transform duration-200 ${
          isOpen ? "rotate-180 text-emerald-500" : "group-hover:text-foreground"
        }`} />
      </button>

      {/* ── Elevated Command-Style Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border border-border bg-popover p-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
          
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Workspaces &amp; Environments
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              {workspaces.length} active
            </span>
          </div>

          {/* Search Filter for Workspaces */}
          {workspaces.length > 2 && (
            <div className="relative px-1">
              <Search className="absolute left-3 top-2.5 size-3 text-muted-foreground" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full rounded-lg border border-border bg-card pl-7 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* List of Workspaces */}
          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {filteredWorkspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId
              const envCfg = getEnvConfig(ws.environment || "Production")

              return (
                <div
                  key={ws.id}
                  className={`group flex items-center justify-between rounded-xl p-2 transition-all ${
                    isActive
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-foreground"
                      : "hover:bg-muted/50 border border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkspaceId(ws.id)
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}>
                      <FolderKanban className="size-3.5" />
                    </div>

                    <div className="truncate min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold leading-tight text-foreground">
                          {ws.name}
                        </span>
                        {isActive && <Check className="size-3 text-emerald-500 shrink-0 stroke-[2.5]" />}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[9.5px]">
                        <span className={`rounded px-1.5 py-0.2 font-bold uppercase tracking-tight border text-[8.5px] ${envCfg.bg} ${envCfg.text}`}>
                          {ws.environment || "Production"}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="text-muted-foreground font-mono truncate">
                          {ws.dbInfo ? `${ws.dbInfo.tables_count} tables` : "No cloud DB"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Delete Workspace Button (if > 1 workspace) */}
                  {workspaces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete workspace "${ws.name}"?`)) {
                          deleteWorkspace(ws.id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                      title="Delete Workspace"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom Action: Create Workspace */}
          <div className="border-t border-border pt-1.5 px-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsWorkspaceModalOpen(true)
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-emerald-500/50 bg-muted/30 hover:bg-muted/60 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all shadow-3xs group cursor-pointer"
            >
              <span className="flex size-4.5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Plus className="size-3" />
              </span>
              <span>Create New Workspace</span>
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
