"use client"

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
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  FolderKanban,
  HardDrive,
  Home,
  Layers,
  Lock,
  LogOut,
  MessageSquareText,
  Plug,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDatabase } from "@/lib/databaseContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const {
    dbInfo,
    activeWorkspace,
    workspaces,
    setActiveWorkspaceId,
    setIsModalOpen,
    setIsWorkspaceModalOpen,
    disconnectDatabase,
  } = useDatabase()

  const workspaceViews = [
    {
      label: "Interactive Chat",
      href: "/Dashboard/chat",
      icon: MessageSquareText,
      badge: "AI",
      description: "Clarification engine",
    },
    {
      label: "Query Compiler",
      href: "/Dashboard",
      icon: Terminal,
      badge: "SQL",
      description: "Direct SQL generation",
    },
  ]

  const quickStarters = [
    {
      title: "Top Customers by Spend",
      tag: "Finance",
      tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      prompt: "Show top 5 customers by total order spend in 2024",
    },
    {
      title: "Low Stock Inventory",
      tag: "Inventory",
      tagColor: "bg-amber-50 text-amber-700 border-amber-200",
      prompt: "List products with stock below 20 units",
    },
    {
      title: "User Retention Cohorts",
      tag: "Growth",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200",
      prompt: "List users registered in last 60 days who haven't ordered yet",
    },
    {
      title: "Recent Completed Orders",
      tag: "Ops",
      tagColor: "bg-purple-50 text-purple-700 border-purple-200",
      prompt: "Completed orders from last 7 days with customer names",
    },
  ]

  return (
    <Sidebar className="border-r border-[--border] bg-[#f8faf8] text-[#141a17]">

      {/* ── Brand & Workspace Header ── */}
      <SidebarHeader className="border-b border-[--border] bg-white/90 px-3.5 py-3.5 backdrop-blur-md space-y-3">
        
        {/* Main Logo & Engine Status */}
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1b3324] to-[#122218] text-[#4ade80] shadow-sm ring-1 ring-white/15 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-[#141a17] tracking-tight leading-none">
                  QueryCraft
                </span>
                <span className="rounded bg-emerald-100/70 border border-emerald-200 px-1 py-0.2 text-[8.5px] font-bold text-emerald-800 uppercase tracking-wide">
                  v2.0
                </span>
              </div>
              <span className="block mt-0.5 text-[10px] font-semibold text-[#667e71] leading-tight truncate">
                PostgreSQL Studio
              </span>
            </div>
          </Link>

          {/* Engine indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5" title="LLM Engine: Llama 3.1 70B Active">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9.5px] font-bold text-emerald-700 font-mono">70B</span>
          </div>
        </div>

        {/* Workspace Card */}
        <div className="group relative rounded-xl border border-[--border] bg-[#fcfdfc] p-2.5 shadow-2xs transition-all duration-150 hover:border-[#b4d4be] hover:bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a9184]">
                Active Project
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="flex items-center gap-1 rounded-md bg-[#edf5ef] border border-[#cbe1d2] px-1.5 py-0.5 text-[9.5px] font-bold text-[#1b6b3a] hover:bg-[#d8eedd] transition-colors"
              title="Create or switch workspace"
            >
              <Plus className="size-2.5" />
              <span>New</span>
            </button>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-[#18281e] text-[#4ade80] shadow-xs">
              <FolderKanban className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-[#141a17] leading-none">
                {activeWorkspace.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="size-1.5 rounded-full bg-[#34c06a]" />
                <span className="text-[10px] font-medium text-[#6e8477]">
                  {activeWorkspace.environment || "Production"}
                </span>
                <span className="text-[#a0b5a8]">•</span>
                <span className="text-[10px] font-mono text-[#6e8477] truncate">
                  {dbInfo ? `${dbInfo.tables_count} tbls` : "No DB"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2.5 py-3 space-y-4">

        {/* ── Navigation: Workspace Views ── */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#799081]">
            Workspaces
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {workspaceViews.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-[#18291f] text-white shadow-xs"
                          : "text-[#2e4034] hover:bg-[#edf5ef] hover:text-[#141a17]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon
                          className={`size-4 shrink-0 transition-colors ${
                            isActive ? "text-[#4ade80]" : "text-[#5e7768] group-hover:text-[#18291f]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                          isActive
                            ? "bg-white/15 text-[#bbf7d0]"
                            : "bg-[#e5ede7] text-[#3d5947] group-hover:bg-[#d8eedd]"
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

        {/* ── Live Cloud Database Card ── */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7e9587]">
            <span>Cloud Database</span>
            {dbInfo && (
              <span className="flex items-center gap-1 text-[9.5px] font-semibold text-[#1b6b3a]">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {dbInfo ? (
              <div className="rounded-xl border border-[#b4dcbe] bg-gradient-to-b from-[#f2faf5] to-[#e7f6ed] p-3 space-y-2.5 shadow-2xs">
                
                {/* Engine Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-5 items-center justify-center rounded-md bg-[#18291f] text-[#4ade80]">
                      <Database className="size-3" />
                    </span>
                    <span className="text-[11.5px] font-bold text-[#144229]">PostgreSQL</span>
                  </div>
                  <Badge className="bg-white text-emerald-800 border-emerald-200 text-[9px] font-bold px-1.5 py-0">
                    SSL Active
                  </Badge>
                </div>

                {/* Host & Table Metrics */}
                <div className="space-y-1 rounded-lg bg-white/80 border border-[#cbe4d3] p-2 text-[11px] font-mono">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-sans font-semibold text-[#5a8069] uppercase">Host</span>
                    <span className="truncate max-w-[125px] font-bold text-[#14291c]" title={dbInfo.host}>{dbInfo.host}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-sans font-semibold text-[#5a8069] uppercase">Catalog</span>
                    <span className="truncate max-w-[125px] font-medium text-[#1f3d2a]">{dbInfo.database || "postgres"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-sans font-semibold text-[#5a8069] uppercase">Tables</span>
                    <span className="font-bold text-[#1b6b3a]">{dbInfo.tables_count} indexed</span>
                  </div>
                </div>

                {/* Quick DB Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-[#badbc4] bg-white py-1 text-[10.5px] font-bold text-[#1a5b35] hover:bg-[#ebf7ef] transition-colors shadow-3xs"
                  >
                    <RefreshCw className="size-2.5" />
                    Switch
                  </button>
                  <button
                    type="button"
                    onClick={disconnectDatabase}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50/70 py-1 text-[10.5px] font-bold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

              </div>
            ) : (
              <div className="rounded-xl border border-[--border] bg-white p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="flex size-7.5 items-center justify-center rounded-xl bg-[#18291f] text-[#4ade80] shadow-xs">
                    <Cloud className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#141a17] leading-tight">No Database Linked</p>
                    <p className="text-[10px] text-[#7a9184] leading-tight mt-0.5">Supabase, Neon, AWS RDS</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-7.5 gap-1.5 text-[11px] font-bold shadow-xs bg-[#18291f] hover:bg-[#233d2e]"
                >
                  <Plug className="size-3 text-[#4ade80]" />
                  <span>Connect Database</span>
                </Button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Quick Query Starters ── */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7e9587]">
            Prompt Library
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1">
              {quickStarters.map((item, idx) => (
                <Link
                  key={idx}
                  href="/Dashboard/chat"
                  className="group flex items-center justify-between rounded-xl p-2 text-[11.5px] font-medium text-[#2d3f33] transition-all duration-150 hover:bg-white hover:shadow-2xs hover:border-[--border] border border-transparent"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase shrink-0 ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="truncate leading-tight text-[#17261d] font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className="size-3 text-[#94b09e] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Safety & Integrity Widget ── */}
        <SidebarGroup className="p-0">
          <div className="rounded-xl border border-[#d2e7d7] bg-[#f0f9f3] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#145a32]">
                <ShieldCheck className="size-3.5 text-[#34c06a]" />
                <span>Production Guardrails</span>
              </div>
              <span className="rounded bg-emerald-100 border border-emerald-200 text-emerald-800 text-[8.5px] font-bold px-1 py-0.2">
                Active
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[10px] text-[#557864] pt-0.5 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-[#34c06a]" />
                <span>100% Read-Only SELECT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-[#34c06a]" />
                <span>Zero-Hallucination Grounding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-[#34c06a]" />
                <span>Auto-Limit 50 Defense</span>
              </div>
            </div>
          </div>
        </SidebarGroup>

      </SidebarContent>

      {/* ── Sidebar Footer ── */}
      <SidebarFooter className="border-t border-[--border] bg-white px-3 py-2.5">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              tooltip="Return to Landing Page"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-[#4a5e53] hover:bg-[#edf5ef] hover:text-[#141a17] transition-colors"
            >
              <Home className="size-3.5 text-[#6e8779]" />
              <span>Landing Page</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/Dashboard/chat" />}
              tooltip="Open Interactive AI Studio"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-[#4a5e53] hover:bg-[#edf5ef] hover:text-[#141a17] transition-colors"
            >
              <MessageSquareText className="size-3.5 text-[#6e8779]" />
              <span>Interactive Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}