'use client'

import React, { useState, useRef, useEffect } from "react"
import {
  Check,
  ChevronDown,
  Cloud,
  Database,
  FolderKanban,
  FolderPlus,
  Layers,
  MoreVertical,
  Plus,
  Radio,
  Server,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"
import { Badge } from "@/components/ui/badge"

export default function WorkspaceSwitcher({ className = "" }) {
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    deleteWorkspace,
    setIsWorkspaceModalOpen,
  } = useDatabase()

  const [isOpen, setIsOpen] = useState(false)
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
        return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" }
      case "Staging":
        return { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" }
      case "Development":
        return { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" }
      default:
        return { dot: "bg-gray-400", text: "text-gray-700", bg: "bg-gray-50 border-gray-200" }
    }
  }

  const activeEnv = getEnvConfig(activeWorkspace.environment || "Production")

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      
      {/* ── Professional Workspace Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all duration-150 active:scale-[0.98] ${
          isOpen
            ? "border-[#34c06a] bg-white shadow-sm ring-2 ring-[#34c06a]/15"
            : "border-border/80 bg-white/95 shadow-2xs hover:border-[#34c06a]/50 hover:bg-white hover:shadow-sm"
        }`}
      >
        {/* Workspace Icon Tile */}
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1b3324] to-[#122218] text-[#4ade80] shadow-2xs transition-transform duration-150 group-hover:scale-105">
          <FolderKanban className="size-3.5" />
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate max-w-[135px] text-[12.5px] font-bold text-[#141a17] leading-none">
              {activeWorkspace.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[9.5px] font-medium leading-none">
            <span className={`size-1.5 rounded-full shrink-0 ${activeEnv.dot}`} />
            <span className="text-[#5e7467] font-semibold">
              {activeWorkspace.environment || "Production"}
            </span>
            <span className="text-[#a0b5a8]">•</span>
            <span className="text-[#688071] font-mono">
              {activeWorkspace.dbInfo ? `${activeWorkspace.dbInfo.tables_count} tbls` : "No DB"}
            </span>
          </div>
        </div>

        {/* Animated Chevron */}
        <ChevronDown className={`size-3.5 text-[#738a7c] shrink-0 ml-1 transition-transform duration-200 ${
          isOpen ? "rotate-180 text-[#1b6b3a]" : "group-hover:text-[#141a17]"
        }`} />
      </button>

      {/* ── Elevated Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border/80 bg-white p-2.5 shadow-[0_16px_40px_-12px_rgba(20,35,25,0.2)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
          
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#edf3ee]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#799081]">
              Workspaces &amp; Projects
            </span>
            <span className="rounded-full bg-[#edf6f0] border border-[#cbe1d2] px-2 py-0.2 text-[9px] font-bold text-[#1b6b3a]">
              {workspaces.length} active
            </span>
          </div>

          {/* List of Workspaces */}
          <div className="max-h-64 overflow-y-auto space-y-1 py-1">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId
              const envCfg = getEnvConfig(ws.environment || "Production")

              return (
                <div
                  key={ws.id}
                  className={`group flex items-center justify-between rounded-xl p-2 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#edf8f1] to-[#e6f4eb] border border-[#b8dec4] shadow-2xs"
                      : "hover:bg-[#f3f7f4] border border-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkspaceId(ws.id)
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                  >
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                      isActive
                        ? "bg-[#18291f] text-[#4ade80]"
                        : "bg-[#e7f0e9] text-[#455c4d] group-hover:bg-[#dbe9de]"
                    }`}>
                      <FolderKanban className="size-3.5" />
                    </div>

                    <div className="truncate min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`truncate text-[12px] font-bold leading-tight ${
                          isActive ? "text-[#144229]" : "text-[#1d2d23]"
                        }`}>
                          {ws.name}
                        </span>
                        {isActive && <Check className="size-3 text-[#1b6b3a] shrink-0 stroke-[2.5]" />}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[9.5px]">
                        <span className={`rounded px-1.5 py-0.2 font-bold uppercase tracking-tight border text-[8.5px] ${envCfg.bg} ${envCfg.text}`}>
                          {ws.environment || "Production"}
                        </span>
                        <span className="text-[#96ab9e]">•</span>
                        <span className="text-[#647c6e] font-mono truncate">
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
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8b9b90] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
          <div className="border-t border-[#edf3ee] pt-1.5 px-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsWorkspaceModalOpen(true)
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#a8d4b8] bg-[#f5fbf7] py-2 text-xs font-bold text-[#1a6337] hover:bg-[#eaf6ee] hover:border-[#34c06a] transition-all shadow-3xs group"
            >
              <span className="flex size-4.5 items-center justify-center rounded-md bg-[#18291f] text-[#4ade80] group-hover:scale-110 transition-transform">
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

