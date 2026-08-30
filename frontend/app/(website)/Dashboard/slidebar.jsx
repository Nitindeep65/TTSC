"use client"

import React, { useState, useEffect, useMemo } from "react"
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
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Copy,
  Database,
  ExternalLink,
  Eye,
  History,
  Layers,
  LogOut,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Table2,
  Terminal,
  Unplug,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { Button } from "@/components/ui/button"
import TableDataProfilerModal from "@/components/database/TableDataProfilerModal"

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
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    dbInfo,
    connectionUri,
    setIsModalOpen,
    setIsWorkspaceModalOpen,
    disconnectDatabase,
  } = useDatabase()

  // Primary sidebar mode: "nav" (Navigation & Recents) or "schema" (Schema Explorer)
  const [activeTab, setActiveTab] = useState("nav")
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  const [recents, setRecents] = useState(DEFAULT_RECENTS)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [copiedColumn, setCopiedColumn] = useState(null)

  const [schemaSearch, setSchemaSearch] = useState("")
  const [expandedTables, setExpandedTables] = useState({})
  const [profileTable, setProfileTable] = useState(null)
  const [copiedDdl, setCopiedDdl] = useState(false)

  const handleExportDdl = () => {
    let ddl = dbInfo?.schema_sql || ""
    if (!ddl && dbInfo?.tables) {
      ddl = dbInfo.tables.map(tbl => {
        const name = tbl.table_name || tbl.name || tbl
        const cols = (tbl.columns || []).map(c => `  ${c.name || c.column_name} ${c.type || "TEXT"}`).join(",\n")
        return `CREATE TABLE ${name} (\n${cols}\n);`
      }).join("\n\n")
    }
    if (!ddl) ddl = "-- No schema DDL available"
    navigator.clipboard.writeText(ddl)
    setCopiedDdl(true)
    setTimeout(() => setCopiedDdl(false), 1800)
  }

  // Load recents from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tts_recent_queries_v2")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecents(parsed.slice(0, 6))
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

  const handleCopyText = (e, text, id) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedColumn(id)
    setTimeout(() => setCopiedColumn(null), 1800)
  }

  const handleRunRecent = (item) => {
    if (onSelectRecent) {
      onSelectRecent(item.query)
    } else {
      router.push(`/Dashboard/chat?prompt=${encodeURIComponent(item.query)}`)
    }
  }

  const toggleTableExpand = (tableName) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  // Filter tables and columns based on search
  const filteredTables = useMemo(() => {
    if (!dbInfo?.tables) return []
    if (!schemaSearch.trim()) return dbInfo.tables

    const q = schemaSearch.toLowerCase().trim()
    return dbInfo.tables.filter((tbl) => {
      const name = (tbl.table_name || tbl.name || tbl).toLowerCase()
      if (name.includes(q)) return true
      if (Array.isArray(tbl.columns)) {
        return tbl.columns.some((c) => {
          const colName = (c.column_name || c.name || c).toLowerCase()
          return colName.includes(q)
        })
      }
      return false
    })
  }, [dbInfo?.tables, schemaSearch])

  const userInitials = (user?.displayName || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <>
      <Sidebar className="border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
        
        {/* ── Brand Header & Workspace ── */}
        <SidebarHeader className="border-b border-border bg-card px-3.5 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform duration-150 group-hover:scale-105">
                <Database className="size-4 text-emerald-400" />
              </span>
              <div>
                <span className="block text-[13px] font-bold text-foreground tracking-tight leading-none">
                  QueryCraft
                </span>
                <span className="block mt-0.5 text-[9.5px] text-muted-foreground font-medium leading-none">
                  Enterprise SQL &amp; NoSQL
                </span>
              </div>
            </Link>

            {/* Live DB indicator dot */}
            {dbInfo && (
              <span className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected</span>
              </span>
            )}
          </div>

          {/* Workspace Project Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/60 hover:bg-muted border border-border transition text-left cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="size-2.5 rounded-full shrink-0 ring-1 ring-border"
                  style={{ backgroundColor: activeWorkspace?.color || "#3aa363" }}
                />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-foreground truncate leading-tight">
                    {activeWorkspace?.name || "Default Workspace"}
                  </p>
                  <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                    {activeWorkspace?.environment || "Production"} Project
                  </p>
                </div>
              </div>
              <ChevronDown className={`size-3.5 text-muted-foreground shrink-0 transition-transform ${isWorkspaceDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu for Workspaces */}
            {isWorkspaceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                  <span>Workspaces</span>
                  <span>{workspaces?.length || 1} Total</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-0.5">
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
                        className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left text-xs transition ${
                          isSelected
                            ? "bg-accent text-accent-foreground font-bold"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: ws.color || "#3aa363" }}
                          />
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {isSelected && <Check className="size-3 text-emerald-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWorkspaceDropdownOpen(false)
                      setIsWorkspaceModalOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                  >
                    <Plus className="size-3" />
                    <span>New Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Two Primary Tabs: Navigation vs Schema Explorer ── */}
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-muted/70 border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("nav")}
              className={`flex items-center justify-center gap-1.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "nav"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Terminal className="size-3.5" />
              <span>Navigation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("schema")}
              className={`flex items-center justify-center gap-1.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "schema"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Schema</span>
              {dbInfo?.tables_count ? (
                <span className="text-[9px] font-mono px-1 rounded bg-muted text-foreground">
                  {dbInfo.tables_count}
                </span>
              ) : null}
            </button>
          </div>
        </SidebarHeader>

        {/* ── Sidebar Content Body ── */}
        <SidebarContent className="p-3 space-y-4 overflow-y-auto flex-1">
          
          {/* ========================================================================= */}
          {/* TAB 1: NAVIGATION & RECENTS                                                */}
          {/* ========================================================================= */}
          {activeTab === "nav" && (
            <>
              {/* Primary + New Query Action */}
              <Link href="/Dashboard">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-center gap-2 h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs rounded-lg cursor-pointer"
                >
                  <Plus className="size-3.5 text-emerald-400" />
                  <span>New Query</span>
                </Button>
              </Link>

              {/* Canonical Studios Menu */}
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Studios
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {/* Chat */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/Dashboard/chat" />}
                        isActive={pathname === "/Dashboard/chat"}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          pathname === "/Dashboard/chat"
                            ? "bg-accent text-accent-foreground font-bold shadow-2xs"
                            : "text-foreground hover:bg-muted/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MessageSquareText className="size-4 text-emerald-600 shrink-0" />
                          <span className="truncate">Chat</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Canvas */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/Dashboard/canvas" />}
                        isActive={pathname === "/Dashboard/canvas"}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          pathname === "/Dashboard/canvas"
                            ? "bg-accent text-accent-foreground font-bold shadow-2xs"
                            : "text-foreground hover:bg-muted/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Sparkles className="size-4 text-emerald-600 shrink-0" />
                          <span className="truncate">Canvas</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Compiler */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/Dashboard" />}
                        isActive={pathname === "/Dashboard"}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          pathname === "/Dashboard"
                            ? "bg-accent text-accent-foreground font-bold shadow-2xs"
                            : "text-foreground hover:bg-muted/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Terminal className="size-4 text-emerald-600 shrink-0" />
                          <span className="truncate">Compiler</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Recents Query History */}
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <History className="size-3" />
                    <span>Recent Queries</span>
                  </span>
                  <span className="text-[9px] font-mono">{recents.length}</span>
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <div className="space-y-1">
                    {recents.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleRunRecent(item)}
                        className="group flex items-center justify-between rounded-lg p-2 text-xs hover:bg-card border border-transparent hover:border-border transition cursor-pointer shadow-2xs"
                      >
                        <div className="min-w-0 flex-1 pr-1.5">
                          <p className="truncate font-mono text-[11px] text-foreground font-medium">
                            {item.query}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9.5px] text-muted-foreground mt-0.5">
                            <span className="rounded bg-muted px-1 font-mono text-[8.5px] font-bold">
                              {item.type}
                            </span>
                            <span>{item.time}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyRecent(e, item.query, idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground rounded transition shrink-0"
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
              </SidebarGroup>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SCHEMA EXPLORER (DEDICATED SEARCHABLE DATA DICTIONARY)             */}
          {/* ========================================================================= */}
          {activeTab === "schema" && (
            <div className="space-y-2.5">
              {dbInfo ? (
                <>
                  {/* Schema Status & Export DDL Header */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Introspected
                    </span>
                    <button
                      type="button"
                      onClick={handleExportDdl}
                      className="text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-1.5 py-0.5 rounded border border-border transition cursor-pointer flex items-center gap-1"
                      title="Export live schema as SQL DDL"
                    >
                      {copiedDdl ? <Check className="size-2.5 text-emerald-500" /> : <Copy className="size-2.5" />}
                      <span>{copiedDdl ? "Copied DDL" : "Export DDL"}</span>
                    </button>
                  </div>

                  {/* Schema Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={schemaSearch}
                      onChange={(e) => setSchemaSearch(e.target.value)}
                      placeholder="Search tables & columns..."
                      className="w-full rounded-lg border border-border bg-card pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    />
                    {schemaSearch && (
                      <button
                        type="button"
                        onClick={() => setSchemaSearch("")}
                        className="absolute right-2 top-2 p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>

                  {/* Tables List */}
                  <div className="space-y-1">
                    {filteredTables.map((tbl, i) => {
                      const tableName = tbl.table_name || tbl.name || tbl
                      const columns = tbl.columns || []
                      const isExpanded = !!expandedTables[tableName]

                      return (
                        <div
                          key={i}
                          className="rounded-lg border border-border bg-card overflow-hidden transition"
                        >
                          {/* Table Header Row */}
                          <div
                            onClick={() => toggleTableExpand(tableName)}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Table2 className="size-3.5 text-emerald-600 shrink-0" />
                              <span className="font-mono text-xs font-semibold text-foreground truncate" title={tableName}>
                                {tableName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                                {columns.length ? `${columns.length} cols` : "tbl"}
                              </span>

                              {/* Sample 5 rows button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setProfileTable(tableName)
                                }}
                                title="Inspect 5-row sample preview & distinct distribution"
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
                              >
                                <Eye className="size-3" />
                              </button>

                              {/* Copy table name */}
                              <button
                                type="button"
                                onClick={(e) => handleCopyText(e, tableName, `tbl-${tableName}`)}
                                title="Copy table name"
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
                              >
                                {copiedColumn === `tbl-${tableName}` ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>

                              <div className="p-0.5 text-muted-foreground">
                                {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Columns List */}
                          {isExpanded && (
                            <div className="border-t border-border/80 bg-muted/20 px-2 py-1.5 space-y-1">
                              {columns.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground italic px-1">
                                  No column metadata introspected.
                                </p>
                              ) : (
                                columns.map((col, cIdx) => {
                                  const colName = col.column_name || col.name || col
                                  const colType = col.data_type || col.type || "VARCHAR"
                                  const colKey = `${tableName}-${colName}`

                                  return (
                                    <div
                                      key={cIdx}
                                      onClick={(e) => handleCopyText(e, colName, colKey)}
                                      className="flex items-center justify-between rounded px-1.5 py-0.5 text-[10.5px] hover:bg-muted transition cursor-pointer"
                                      title="Click to copy column name"
                                    >
                                      <span className="font-mono text-foreground truncate pr-2">
                                        {colName}
                                      </span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[8.5px] font-mono text-muted-foreground uppercase bg-muted/80 px-1 py-0.2 rounded">
                                          {colType}
                                        </span>
                                        {copiedColumn === colKey && (
                                          <Check className="size-2.5 text-emerald-600" />
                                        )}
                                      </div>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {filteredTables.length === 0 && (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No tables matching &quot;{schemaSearch}&quot;.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                      <Database className="size-2.5" />
                      Sandbox Mock
                    </span>
                  </div>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Sandbox Mode</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Connect PostgreSQL, MongoDB, or MySQL to introspect live schemas.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-8 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer"
                  >
                    <span>Connect Database</span>
                  </Button>
                </div>
              )}
            </div>
          )}

        </SidebarContent>

        {/* ── Sidebar Footer: Status & Settings ── */}
        <SidebarFooter className="border-t border-border bg-card px-3 py-2.5 space-y-2">
          {/* Active DB Switch / Manage Pill */}
          {dbInfo ? (
            <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="font-mono text-[11px] font-semibold text-emerald-900 truncate" title={dbInfo.host}>
                  {dbInfo.database || dbInfo.host}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100/80 rounded transition"
                >
                  Manage
                </button>
                <button
                  type="button"
                  onClick={disconnectDatabase}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                  title="Disconnect Database"
                >
                  <Unplug className="size-3" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Settings trigger */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-between w-full rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="size-3.5 text-muted-foreground" />
                <span>Settings</span>
              </div>
              <kbd className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                ⌘,
              </kbd>
            </button>
          )}

          {/* User Account / Logout */}
          <div className="pt-1.5 border-t border-border">
            {user ? (
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px] shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-foreground truncate leading-tight">
                      {user.displayName || "Developer"}
                    </p>
                    <p className="text-[9.5px] text-muted-foreground truncate leading-tight">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0 cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/Login"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-2xs"
              >
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </SidebarFooter>

      </Sidebar>

      {/* Table Data Profiler Modal */}
      {profileTable && (
        <TableDataProfilerModal
          isOpen={!!profileTable}
          onClose={() => setProfileTable(null)}
          tableName={profileTable}
          connectionUri={connectionUri}
        />
      )}
    </>
  )
}