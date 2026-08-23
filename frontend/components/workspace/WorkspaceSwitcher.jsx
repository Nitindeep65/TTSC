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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WorkspaceSwitcher({ className = "" }) {
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    deleteWorkspace,
    setIsWorkspaceModalOpen,
    setIsModalOpen,
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

  const getEnvBadgeVariant = (env) => {
    switch (env) {
      case "Production":
        return "emerald"
      case "Staging":
        return "amber"
      case "Development":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-border bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#17241c] shadow-2xs transition-all hover:bg-[#f1f6f2] hover:border-[#79b790]/60 active:scale-[0.98]"
      >
        <div className="flex size-5 items-center justify-center rounded-md bg-[#1f2d24] text-[#71c897] text-[10px] font-bold">
          <FolderKanban className="size-3" />
        </div>

        <div className="flex flex-col text-left">
          <span className="truncate max-w-[130px] font-bold leading-tight text-[#17241c]">
            {activeWorkspace.name}
          </span>
          <span className="text-[9px] font-medium text-[#65776c] flex items-center gap-1">
            <span className={`size-1.5 rounded-full ${
              activeWorkspace.dbInfo ? "bg-[#3ba565] animate-pulse" : "bg-gray-400"
            }`} />
            {activeWorkspace.dbInfo ? `${activeWorkspace.dbInfo.tables_count} tables` : "No DB connected"}
          </span>
        </div>

        <ChevronDown className="size-3 text-[#798b7f] shrink-0 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-border bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
          
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#eef3ef]">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f9084]">
              Workspaces / Projects
            </span>
            <span className="rounded bg-[#edf6f0] px-1.5 py-0.2 text-[9px] font-bold text-[#206642]">
              {workspaces.length} active
            </span>
          </div>

          {/* List of Workspaces */}
          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId
              return (
                <div
                  key={ws.id}
                  className={`group flex items-center justify-between rounded-xl p-2 text-xs transition-all ${
                    isActive
                      ? "bg-[#eaf4ed] font-semibold text-[#1e6138] border border-[#cbe1d2]"
                      : "text-[#3a4d40] hover:bg-[#f3f7f4] border border-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkspaceId(ws.id)
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <div className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? "bg-[#1f2d24] text-[#71c897]" : "bg-[#e8f1ea] text-[#42594a]"
                    }`}>
                      <FolderKanban className="size-3" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{ws.name}</span>
                        {isActive && <Check className="size-3 text-[#28734d] shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-[#697c70] font-normal">
                        <span className="font-semibold text-[#206642]">{ws.environment || "Production"}</span>
                        <span>•</span>
                        <span>{ws.dbInfo ? `${ws.dbInfo.tables_count} tbls` : "No DB"}</span>
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
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#8b9b90] hover:text-red-600 transition"
                      title="Delete Workspace"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom Action: Create Workspace */}
          <div className="border-t border-[#edf3ee] pt-1.5 px-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsWorkspaceModalOpen(true)
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#b6d9c4] bg-[#f8fcf9] py-2 text-xs font-semibold text-[#1e6138] hover:bg-[#ebf7f0] transition shadow-3xs"
            >
              <FolderPlus className="size-3.5 text-[#3aa363]" />
              <span>+ Create New Workspace</span>
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
