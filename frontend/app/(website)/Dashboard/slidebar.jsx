"use client"

import React, { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar"
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  Database,
  ExternalLink,
  Flame,
  FolderKanban,
  FolderPlus,
  HardDrive,
  History,
  Layers,
  LogOut,
  MessageSquareText,
  Plug,
  Plus,
  Puzzle,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Table,
  Table2,
  Terminal,
  Unplug,
  Wand2,
  X,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { useExtension } from "@/lib/extensionContext"
import { Button } from "@/components/ui/button"

const DEFAULT_RECENTS = [
  { query: "SELECT * FROM users LIMIT 50;", time: "Just now", type: "SQL" },
  { query: "Top counterparties by contract value", time: "10m ago", type: "Prompt" },
  { query: "Monthly revenue trend for last 6 months", time: "1h ago", type: "Prompt" },
  { query: "SELECT * FROM orders WHERE status = 'completed' LIMIT 50;", time: "3h ago", type: "SQL" },
]

export function AppSidebar({ onOpenSettings, onOpenMetrics, onSelectRecent }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isInstalled, openModal: openExtensionModal } = useExtension()
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    dbInfo,
    setIsModalOpen,
    setIsWorkspaceModalOpen,
    disconnectDatabase,
  } = useDatabase()

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  const [isTablesExpanded, setIsTablesExpanded] = useState(true)
  const [isRecentsExpanded, setIsRecentsExpanded] = useState(true)
  const [recents, setRecents] = useState(DEFAULT_RECENTS)
  const [v3Modal, setV3Modal] = useState(null) // "plugins" | "scheduled" | null
  const [copiedIndex, setCopiedIndex] = useState(null)

  // Load recent queries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tts_recent_queries_v2")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecents(parsed.slice(0, 5))
        }
      }
    } catch {}
  }, [])

  const handleCopyRecent = (e, text, idx) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 1800)
  }

  const handleRunRecent = (item) => {
    if (onSelectRecent) {
      onSelectRecent(item.query)
    } else {
      router.push(`/Dashboard/chat?prompt=${encodeURIComponent(item.query)}`)
    }
  }

  const userInitials = (user?.displayName || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <>
      <Sidebar className="border-r border-[--border] bg-[#f8faf8] text-[#141a17]">
        
        {/* ── Brand Header ── */}
        <SidebarHeader className="border-b border-[--border] bg-white px-3.5 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#1b3324] text-[#4ade80] shadow-xs ring-1 ring-white/15 transition-transform duration-150 group-hover:scale-105">
                <Database className="size-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[13.5px] font-bold text-[#141a17] tracking-tight">
                    QueryCraft
                  </span>
                  <span className="rounded bg-emerald-100/70 border border-emerald-200/80 px-1 py-0.2 text-[8px] font-bold text-emerald-800 uppercase">
                    Studio
                  </span>
                </div>
                <span className="block mt-0.5 text-[10px] text-[#667e71] font-medium leading-none">
                  Universal SQL &amp; NoSQL
                </span>
              </div>
            </Link>

            {/* Engine Status Pill */}
            <div className="flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5" title="Llama 3.1 70B via NVIDIA NIM">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-700 font-mono">70B</span>
            </div>
          </div>

          {/* ── Workspace Project Switcher & Creator ── */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-[#f2f7f3] hover:bg-[#eaf3ec] border border-[#d6e5d9] transition text-left cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="size-3 rounded-full shrink-0 ring-2 ring-white shadow-2xs"
                  style={{ backgroundColor: activeWorkspace?.color || "#3aa363" }}
                />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-[#141a17] truncate leading-tight">
                    {activeWorkspace?.name || "Default Workspace"}
                  </p>
                  <p className="text-[9.5px] text-[#698272] truncate leading-tight mt-0.5">
                    {activeWorkspace?.environment || "Production"} Project
                  </p>
                </div>
              </div>
              <ChevronDown className={`size-3.5 text-[#698272] shrink-0 transition-transform ${isWorkspaceDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu for Workspaces */}
            {isWorkspaceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-xl border border-[#d6e5d9] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-[#718578] uppercase tracking-wider border-b border-[#edf2ee]">
                  <span>Projects &amp; Workspaces</span>
                  <span>{workspaces?.length || 1} Total</span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {(workspaces || []).map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          setActiveWorkspaceId(ws.id)
                          setIsWorkspaceDropdownOpen(false)
                        }}
                        className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                          isSelected
                            ? "bg-[#eaf5ed] font-bold text-[#1b6b3a]"
                            : "text-[#324538] hover:bg-[#f3f7f4]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: ws.color || "#3aa363" }}
                          />
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {isSelected && <Check className="size-3 text-emerald-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-1 border-t border-[#edf2ee]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWorkspaceDropdownOpen(false)
                      setIsWorkspaceModalOpen(true)
                    }}
                    className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1b6b3a] bg-emerald-50/80 hover:bg-emerald-100 transition"
                  >
                    <Plus className="size-3.5" />
                    <span>Create New Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto px-2.5 py-3 space-y-4">

          {/* ── 1. Main Navigation ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#799081]">
              Studio Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                
                {/* Interactive Chat */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/Dashboard/chat" />}
                    isActive={pathname === "/Dashboard/chat"}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all ${
                      pathname === "/Dashboard/chat"
                        ? "bg-[#18291f] text-white shadow-xs"
                        : "text-[#2e4034] hover:bg-[#edf5ef] hover:text-[#141a17]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquareText
                        className={`size-4 shrink-0 ${
                          pathname === "/Dashboard/chat" ? "text-[#4ade80]" : "text-[#5e7768] group-hover:text-[#18291f]"
                        }`}
                      />
                      <span className="truncate">Interactive Chat</span>
                    </div>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 ${
                        pathname === "/Dashboard/chat"
                          ? "bg-white/15 text-[#bbf7d0]"
                          : "bg-[#e5ede7] text-[#3d5947]"
                      }`}
                    >
                      AI Agent
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Query Compiler */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/Dashboard" />}
                    isActive={pathname === "/Dashboard"}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all ${
                      pathname === "/Dashboard"
                        ? "bg-[#18291f] text-white shadow-xs"
                        : "text-[#2e4034] hover:bg-[#edf5ef] hover:text-[#141a17]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Terminal
                        className={`size-4 shrink-0 ${
                          pathname === "/Dashboard" ? "text-[#4ade80]" : "text-[#5e7768] group-hover:text-[#18291f]"
                        }`}
                      />
                      <span className="truncate">Query Compiler</span>
                    </div>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 ${
                        pathname === "/Dashboard"
                          ? "bg-white/15 text-[#bbf7d0]"
                          : "bg-[#e5ede7] text-[#3d5947]"
                      }`}
                    >
                      SQL / MQL
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Plugins (Coming Soon in V3) */}
                <SidebarMenuItem>
                  <button
                    type="button"
                    onClick={() => setV3Modal("plugins")}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#2e4034] hover:bg-[#edf5ef] hover:text-[#141a17] transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Puzzle className="size-4 shrink-0 text-[#5e7768] group-hover:text-[#18291f]" />
                      <span className="truncate">Plugins &amp; Adapters</span>
                    </div>
                    <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-bold bg-amber-100/80 text-amber-800 border border-amber-200">
                      V3 Soon
                    </span>
                  </button>
                </SidebarMenuItem>

                {/* Scheduled Workflows (Coming Soon in V3) */}
                <SidebarMenuItem>
                  <button
                    type="button"
                    onClick={() => setV3Modal("scheduled")}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#2e4034] hover:bg-[#edf5ef] hover:text-[#141a17] transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Calendar className="size-4 shrink-0 text-[#5e7768] group-hover:text-[#18291f]" />
                      <span className="truncate">Scheduled Jobs</span>
                    </div>
                    <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-bold bg-blue-100/80 text-blue-800 border border-blue-200">
                      V3 Soon
                    </span>
                  </button>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── 2. Recents Query History ── */}
          <SidebarGroup className="p-0">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#799081] flex items-center gap-1.5">
                <History className="size-3" />
                <span>Recents</span>
              </span>
              <button
                type="button"
                onClick={() => setIsRecentsExpanded(!isRecentsExpanded)}
                className="text-[#799081] hover:text-[#141a17] p-0.5 rounded"
              >
                {isRecentsExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              </button>
            </div>

            {isRecentsExpanded && (
              <SidebarGroupContent>
                <div className="space-y-1">
                  {recents.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRunRecent(item)}
                      className="group flex items-center justify-between rounded-xl p-2 text-[11px] font-medium text-[#2d3f33] hover:bg-white hover:shadow-2xs border border-transparent hover:border-[#dbe6dc] transition cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-1.5">
                        <p className="truncate font-mono text-[10.5px] text-[#1a2e22] font-semibold">
                          {item.query}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-[#718578] mt-0.5">
                          <span className="rounded bg-[#edf4ee] px-1 text-[8px] font-bold text-[#32523e]">
                            {item.type}
                          </span>
                          <span>{item.time}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleCopyRecent(e, item.query, idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#698272] hover:text-[#141a17] rounded hover:bg-[#eef5f0] transition shrink-0"
                        title="Copy Query"
                      >
                        {copiedIndex === idx ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

          {/* ── 3. Active Database & Live Schema ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7e9587]">
              <span>Active Database</span>
              {dbInfo && (
                <span className="flex items-center gap-1 text-[9px] font-semibold text-[#1b6b3a]">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              {dbInfo ? (
                <div className="rounded-xl border border-[#b8dec2] bg-[#f2faf5] p-2.5 space-y-2 shadow-2xs">
                  {/* Connected Host Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Database className="size-3.5 text-[#1b6b3a] shrink-0" />
                      <span className="text-[11.5px] font-bold text-[#144229] truncate" title={dbInfo.host}>
                        {dbInfo.host}
                      </span>
                    </div>
                    <span className="rounded bg-white border border-[#cbe4d3] px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#1a5b35]">
                      {dbInfo.tables_count} tables
                    </span>
                  </div>

                  {/* Collapsible Schema Table List */}
                  {dbInfo.tables?.length > 0 && (
                    <div className="rounded-lg bg-white border border-[#cbe4d3] p-1.5">
                      <button
                        type="button"
                        onClick={() => setIsTablesExpanded(!isTablesExpanded)}
                        className="flex items-center justify-between w-full text-[10px] font-bold text-[#446b52] hover:text-[#1b6b3a] px-1 py-0.5"
                      >
                        <span className="flex items-center gap-1">
                          <Table2 className="size-3 text-[#3aa363]" />
                          <span>Introspected Tables</span>
                        </span>
                        {isTablesExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                      </button>

                      {isTablesExpanded && (
                        <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto pr-1">
                          {dbInfo.tables.slice(0, 8).map((tbl, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded px-1.5 py-0.5 text-[10px] font-mono text-[#324f3c] hover:bg-[#ebf6ee]"
                            >
                              <span className="truncate">{tbl.table_name || tbl.name || tbl}</span>
                              <span className="text-[8.5px] text-[#86a894] font-sans">
                                {tbl.columns?.length ? `${tbl.columns.length} cols` : "table"}
                              </span>
                            </div>
                          ))}
                          {dbInfo.tables.length > 8 && (
                            <p className="text-[9px] text-[#719580] px-1.5 pt-0.5 font-sans">
                              +{dbInfo.tables.length - 8} more tables
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[#badbc4] bg-white py-1 text-[10.5px] font-semibold text-[#1a5b35] hover:bg-[#ebf7ef] transition"
                    >
                      <RefreshCw className="size-2.5" />
                      <span>Switch DB</span>
                    </button>
                    <button
                      type="button"
                      onClick={disconnectDatabase}
                      className="flex items-center justify-center size-6.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                      title="Disconnect Database"
                    >
                      <Unplug className="size-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[--border] bg-white p-3 space-y-2 text-center shadow-2xs">
                  <div className="flex justify-center">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#18291f] text-[#4ade80]">
                      <Cloud className="size-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold text-[#141a17]">No Database Connected</p>
                    <p className="text-[10px] text-[#7a9184]">PostgreSQL, MongoDB, MySQL, RDS</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-7 text-[11px] font-semibold bg-[#18291f] hover:bg-[#233d2e] text-white shadow-xs cursor-pointer"
                  >
                    <Plug className="size-3 text-[#4ade80] mr-1" />
                    <span>Connect Database</span>
                  </Button>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── 4. Developer Tools ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7e9587]">
              Tools &amp; Extensions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1">
                {/* Metrics Glossary */}
                {onOpenMetrics && (
                  <button
                    type="button"
                    onClick={onOpenMetrics}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[12px] font-medium text-[#2d3f33] hover:bg-white hover:shadow-2xs border border-transparent hover:border-[--border] transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Wand2 className="size-3.5 text-[#3aa363]" />
                      <span>Metrics Glossary</span>
                    </div>
                    <span className="text-[9px] font-semibold text-[#5e7768] bg-[#edf5ef] px-1.5 py-0.5 rounded">
                      RAG Rules
                    </span>
                  </button>
                )}

                {/* Chrome Spotlight Copilot */}
                <button
                  type="button"
                  onClick={() => openExtensionModal(true)}
                  className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[12px] font-medium text-[#2d3f33] hover:bg-white hover:shadow-2xs border border-transparent hover:border-[--border] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-emerald-600" />
                    <span>Spotlight Extension</span>
                  </div>
                  <kbd className="rounded bg-[#e8f1eb] px-1.5 py-0.5 font-mono text-[9px] text-[#245838]">
                    Cmd+Shift+K
                  </kbd>
                </button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>

        {/* ── Sidebar Footer: User Profile & Settings ── */}
        <SidebarFooter className="border-t border-[--border] bg-white px-3 py-2.5 space-y-1.5">
          
          {/* Settings Button */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-between w-full rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-[#4a5e53] hover:bg-[#edf5ef] hover:text-[#141a17] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="size-3.5 text-[#6e8779]" />
                <span>Settings</span>
              </div>
              <kbd className="font-mono text-[9px] text-[#718578] bg-[#f0f4f1] px-1 py-0.2 rounded">
                Cmd+,
              </kbd>
            </button>
          )}

          {/* User Account Tile */}
          <div className="pt-1.5 border-t border-[#edf2ee]">
            {user ? (
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#f7f9f7] border border-[#e4ece5]">
                <div className="flex items-center gap-2 min-w-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="size-6 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="size-6 rounded-lg bg-[#1a2920] text-[#5de08a] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-[#141a17] truncate leading-tight">
                      {user.displayName || "QueryCraft User"}
                    </p>
                    <p className="text-[9px] text-[#718578] truncate leading-tight">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="size-6 flex items-center justify-center rounded-lg text-[#718578] hover:text-red-600 hover:bg-red-50 transition shrink-0 cursor-pointer"
                >
                  <LogOut className="size-3" />
                </button>
              </div>
            ) : (
              <Link
                href="/Login"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-[#1f2d24] text-white text-[11px] font-bold hover:bg-[#2c4033] transition shadow-2xs"
              >
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </SidebarFooter>

      </Sidebar>

      {/* ── Coming Soon in V3 Modal ── */}
      {v3Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-[#2b4234] bg-[#0c130f] p-5 text-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f3025]">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  {v3Modal === "plugins" ? <Puzzle className="size-4" /> : <Calendar className="size-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {v3Modal === "plugins" ? "Plugins & Adapters" : "Scheduled Workflows"}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Coming in QueryCraft V3
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setV3Modal(null)}
                className="rounded-lg p-1 text-[#718579] hover:bg-[#142019] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {v3Modal === "plugins" ? (
                <>
                  <p className="text-xs text-[#87a090] leading-relaxed">
                    QueryCraft V3 will introduce an extensible plugin ecosystem to connect your data pipeline directly:
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: "dbt Cloud Integration", desc: "Sync semantic model metrics and lineage directly into QueryCraft." },
                      { name: "Snowflake & BigQuery Drivers", desc: "Execute grounded analytics on petabyte data warehouses." },
                      { name: "Slack / Teams Copilot Bot", desc: "Answer natural language team questions directly in Slack channels." },
                    ].map((p, i) => (
                      <div key={i} className="p-2.5 rounded-xl border border-[#1b2b20] bg-[#111c15] text-xs space-y-0.5">
                        <div className="font-bold text-emerald-300 flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-[9px] text-[#718579] uppercase">In Development</span>
                        </div>
                        <p className="text-[11px] text-[#87a090]">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#87a090] leading-relaxed">
                    Automate recurring data insights and database maintenance schedules:
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: "Daily KPI Summary Cron", desc: "Executes morning revenue & signups query and sends executive briefings." },
                      { name: "Real-Time Churn Anomaly Alert", desc: "Monitors contract expiration dates and triggers alert webhooks." },
                      { name: "Automated Index Health Sweep", desc: "Runs EXPLAIN across heavy queries to detect missing indexes." },
                    ].map((s, i) => (
                      <div key={i} className="p-2.5 rounded-xl border border-[#1b2b20] bg-[#111c15] text-xs space-y-0.5">
                        <div className="font-bold text-blue-300 flex items-center justify-between">
                          <span>{s.name}</span>
                          <span className="text-[9px] text-[#718579] uppercase">Scheduled Cron</span>
                        </div>
                        <p className="text-[11px] text-[#87a090]">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#1f3025] flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setV3Modal(null)}
                className="bg-[#1f3828] hover:bg-[#284a34] text-emerald-300 text-xs font-bold"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}