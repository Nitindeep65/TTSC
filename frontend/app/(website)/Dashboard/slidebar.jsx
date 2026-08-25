"use client"

import React, { useState } from "react"
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
  ChevronDown,
  ChevronRight,
  Cloud,
  Database,
  ExternalLink,
  FolderKanban,
  HardDrive,
  LogOut,
  MessageSquareText,
  Plug,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Table2,
  Terminal,
  Unplug,
  Wand2,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { useExtension } from "@/lib/extensionContext"
import { Button } from "@/components/ui/button"

const QUICK_STARTERS = [
  {
    title: "Top Customers by Spend",
    tag: "SQL",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    href: "/Dashboard/chat",
  },
  {
    title: "Recent Completed Orders (7d)",
    tag: "Sales",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    href: "/Dashboard/chat",
  },
  {
    title: "Low Inventory Stock Alert",
    tag: "Ops",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
    href: "/Dashboard/chat",
  },
]

export function AppSidebar({ onOpenSettings, onOpenMetrics }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isInstalled, openModal: openExtensionModal } = useExtension()
  const {
    dbInfo,
    activeWorkspace,
    setIsModalOpen,
    setIsWorkspaceModalOpen,
    disconnectDatabase,
  } = useDatabase()

  const [isTablesExpanded, setIsTablesExpanded] = useState(true)

  const navItems = [
    {
      label: "Interactive Chat",
      href: "/Dashboard/chat",
      icon: MessageSquareText,
      badge: "AI Agent",
    },
    {
      label: "Query Compiler",
      href: "/Dashboard",
      icon: Terminal,
      badge: "SQL / MQL",
    },
  ]

  const userInitials = (user?.displayName || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <Sidebar className="border-r border-[--border] bg-[#f8faf8] text-[#141a17]">
      
      {/* ── Brand Header ── */}
      <SidebarHeader className="border-b border-[--border] bg-white px-3.5 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#1b3324] text-[#4ade80] shadow-xs ring-1 ring-white/15 transition-transform duration-150 group-hover:scale-105">
              <Sparkles className="size-4" />
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
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2.5 py-3 space-y-4">

        {/* ── 1. Main Navigation ── */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#799081]">
            Studio Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all ${
                        isActive
                          ? "bg-[#18291f] text-white shadow-xs"
                          : "text-[#2e4034] hover:bg-[#edf5ef] hover:text-[#141a17]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon
                          className={`size-4 shrink-0 ${
                            isActive ? "text-[#4ade80]" : "text-[#5e7768] group-hover:text-[#18291f]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 ${
                          isActive
                            ? "bg-white/15 text-[#bbf7d0]"
                            : "bg-[#e5ede7] text-[#3d5947]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── 2. Active Database & Live Schema ── */}
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
                    className="flex items-center justify-center size-6.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
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
                  className="w-full h-7 text-[11px] font-semibold bg-[#18291f] hover:bg-[#233d2e] text-white shadow-xs"
                >
                  <Plug className="size-3 text-[#4ade80] mr-1" />
                  <span>Connect Database</span>
                </Button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── 3. Developer Tools ── */}
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
                  className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[12px] font-medium text-[#2d3f33] hover:bg-white hover:shadow-2xs border border-transparent hover:border-[--border] transition text-left"
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
                className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[12px] font-medium text-[#2d3f33] hover:bg-white hover:shadow-2xs border border-transparent hover:border-[--border] transition text-left"
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

        {/* ── 4. Prompt Quick Starters ── */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7e9587]">
            Sample Prompts
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1">
              {QUICK_STARTERS.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl p-2 text-[11px] font-medium text-[#2d3f33] hover:bg-white hover:shadow-2xs border border-transparent hover:border-[--border] transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`rounded border px-1.5 py-0.2 text-[8.5px] font-bold uppercase shrink-0 ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="truncate font-semibold text-[#17261d]">
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className="size-3 text-[#94b09e] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
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
  )
}