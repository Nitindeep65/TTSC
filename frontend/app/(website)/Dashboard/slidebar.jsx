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
  ChevronRight,
  Cloud,
  Database,
  FolderKanban,
  Home,
  Layers,
  Lock,
  LogOut,
  MessageSquareText,
  Plug,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
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

  const workspaceItems = [
    {
      label: "Interactive Chat",
      href: "/Dashboard/chat",
      icon: MessageSquareText,
      badge: "AI Multi-turn",
      description: "Clarification engine",
    },
    {
      label: "Query Compiler",
      href: "/Dashboard",
      icon: Terminal,
      badge: "Single-turn",
      description: "Direct SQL generation",
    },
  ]

  const quickStarters = [
    { title: "Top Customers by Spend", prompt: "Show top 5 customers by total order spend in 2024" },
    { title: "Low Stock Inventory", prompt: "List products with stock below 20 units" },
    { title: "Recent Completed Orders", prompt: "Completed orders from last 7 days with customer names" },
    { title: "Revenue by Category", prompt: "Total revenue per product category as a bar chart" },
  ]

  return (
    <Sidebar className="border-r border-[--border] bg-[#f8faf8]">

      {/* ── Brand Header ── */}
      <SidebarHeader className="border-b border-[--border] px-4 py-4 space-y-3">
        <Link href="/" className="group flex items-center gap-3 px-0.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a] shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
            <Sparkles className="size-4.5" />
          </span>
          <div>
            <span className="block text-[13px] font-bold text-[#141a17] leading-none tracking-tight">Text to SQL</span>
            <span className="block mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#34c06a]">
              Cloud Studio
            </span>
          </div>
        </Link>

        {/* Active Workspace Pill */}
        <div className="rounded-xl border border-[--border] bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8a9e93]">
              Active Project
            </span>
            <button
              type="button"
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="flex items-center gap-1 rounded-md bg-[#edf5ef] px-2 py-0.5 text-[10px] font-bold text-[#1b5c38] hover:bg-[#d8eedd] transition-colors duration-150"
              title="Create new workspace"
            >
              <Plus className="size-2.5" />
              New
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#1a2920] text-[#5de08a]">
              <FolderKanban className="size-3.5" />
            </div>
            <span className="truncate text-[12.5px] font-semibold text-[#141a17] leading-none">
              {activeWorkspace.name}
            </span>
            <Badge className="ml-auto shrink-0 bg-[#eaf2ec] text-[#1b5c38] border-[#c5ddc9] text-[9px] font-semibold px-1.5 py-0">
              {activeWorkspace.environment || "Production"}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">

        {/* ── Navigation ── */}
        <SidebarGroup className="px-3 pt-4 pb-2">
          <SidebarGroupLabel className="px-1.5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#8a9e93]">
            Workspace Views
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {workspaceItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      tooltip={item.description}
                      isActive={isActive}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-[#1a2920] text-white shadow-sm"
                          : "text-[#394a3f] hover:bg-[#edf5ef] hover:text-[#1a2920]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className={`size-4 shrink-0 ${isActive ? "text-[#5de08a]" : "text-[#67817a]"}`} />
                        <div className="min-w-0">
                          <span className="block truncate leading-none">{item.label}</span>
                          <span className={`block text-[10px] font-normal leading-none mt-0.5 ${isActive ? "text-[#9dd9b2]" : "text-[#8a9e93]"}`}>
                            {item.description}
                          </span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold ${
                        isActive ? "bg-white/15 text-[#b3eac8]" : "bg-[#e3ede6] text-[#3a5442]"
                      }`}>
                        {item.badge}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Database Connector ── */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-1.5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#8a9e93]">
            Cloud Database
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-0.5">
              {dbInfo ? (
                <div className="rounded-xl border border-[#b8dbca] bg-gradient-to-b from-[#edfaf2] to-[#e3f5ea] p-3 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full dot-live block" />
                      <span className="text-[11.5px] font-bold text-[#1a5235]">Live Connected</span>
                    </div>
                    <Badge className="bg-white/80 text-[#1b6b3a] border-[#aadcbb] text-[9px] font-bold px-1.5">
                      PostgreSQL
                    </Badge>
                  </div>

                  <div className="space-y-1 rounded-lg bg-white/60 p-2 font-mono text-[11px]">
                    {[
                      ["Host", dbInfo.host],
                      ["Database", dbInfo.database],
                      ["Tables", `${dbInfo.tables_count} live`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-sans font-medium text-[#6f9e80] uppercase">{k}</span>
                        <span className="truncate max-w-[110px] font-semibold text-[#1a3c28]">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-[#c3dece]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                      className="h-7 text-[10.5px] font-semibold text-[#1b6b3a] bg-white/80 border-[#b9d8c4] hover:bg-white"
                    >
                      Switch DB
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={disconnectDatabase}
                      className="h-7 text-[10.5px] font-semibold"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[--border] bg-white p-3.5 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a] shadow-xs">
                      <Cloud className="size-4" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#141a17] leading-none">No database connected</p>
                      <p className="text-[10.5px] text-[#7a9184] mt-0.5">Supabase · Neon · RDS · Local</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-8 gap-2 text-[11.5px] font-semibold"
                  >
                    <Plug className="size-3.5 text-[#5de08a]" />
                    Connect Cloud Database
                  </Button>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Quick Starters ── */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-1.5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#8a9e93]">
            Quick Starters
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1 px-0.5">
              {quickStarters.map((item, idx) => (
                <Link
                  key={idx}
                  href="/Dashboard/chat"
                  className="group flex items-center justify-between rounded-lg p-2.5 text-[12px] font-medium text-[#3b4e42] transition-all duration-150 hover:bg-white hover:shadow-sm hover:border-[--border] border border-transparent"
                >
                  <span className="truncate leading-none">{item.title}</span>
                  <ChevronRight className="size-3.5 text-[#94b09e] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Safety Badge ── */}
        <SidebarGroup className="px-3 py-2 pb-4">
          <div className="rounded-xl border border-[--border] bg-[#f3f8f4] p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#1b6b3a]">
              <ShieldCheck className="size-3.5" />
              <span>Workspace Isolation</span>
            </div>
            <ul className="space-y-1 text-[10.5px] text-[#6e8a79] leading-relaxed">
              <li className="flex items-center gap-1.5"><span className="text-[#34c06a]">✓</span> Distinct cloud DB credentials</li>
              <li className="flex items-center gap-1.5"><span className="text-[#34c06a]">✓</span> Independent schema grounding</li>
              <li className="flex items-center gap-1.5"><span className="text-[#34c06a]">✓</span> Read-only query execution</li>
            </ul>
          </div>
        </SidebarGroup>

      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-[--border] bg-[#f3f7f4] px-3 py-2.5">
        <SidebarMenu className="gap-0.5">
          {[
            { href: "/", icon: Home, label: "Return to Home" },
            { href: "/Login", icon: LogOut, label: "Sign In / Register" },
          ].map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                tooltip={item.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-[#4a5e53] hover:bg-[#e6ede8] hover:text-[#1a2920] transition-colors duration-150"
              >
                <item.icon className="size-4 text-[#6a8275]" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}