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
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  ExternalLink,
  FolderKanban,
  FolderPlus,
  History,
  Home,
  Layers,
  Lock,
  LogOut,
  MessageSquareText,
  Plug,
  Plus,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Unplug,
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
      badge: "Multi-turn",
    },
    {
      label: "Query Compiler",
      href: "/Dashboard",
      icon: Terminal,
      badge: "Single-turn",
    },
  ]

  const quickStarters = [
    { title: "Top Customers by Spend", prompt: "Show top 5 customers by total order spend in 2024" },
    { title: "Low Stock Inventory", prompt: "List available products with stock quantity below 20 ordered by price ASC" },
    { title: "Recent Completed Orders", prompt: "Find completed orders from the last 7 days with customer names and total amount" },
    { title: "Category Revenue", prompt: "Calculate total revenue generated per product category in 2024" },
  ]

  return (
    <Sidebar className="border-r border-border bg-[#fbfdfb]">
      
      {/* Brand & Active Workspace Header */}
      <SidebarHeader className="border-b border-border px-3 py-3.5 space-y-2">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight px-1">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="size-4" />
          </span>
          <div>
            <span className="block text-xs font-bold text-[#17241c] font-sans">Text to SQL</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#3aa363]">
              Cloud Studio
            </span>
          </div>
        </Link>

        {/* Current Active Workspace Project Badge Card */}
        <div className="rounded-xl border border-border bg-white p-2.5 shadow-3xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f9084]">
              Active Project
            </span>
            <button
              type="button"
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="flex items-center gap-1 rounded bg-[#f0f6f2] px-1.5 py-0.5 text-[9px] font-bold text-[#1e6138] hover:bg-[#deefe2] transition"
              title="Create new workspace"
            >
              <Plus className="size-2.5" />
              <span>New</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[#1f2d24] text-[#71c897]">
                <FolderKanban className="size-3" />
              </div>
              <span className="truncate font-bold text-xs text-[#17241c]">
                {activeWorkspace.name}
              </span>
            </div>

            <Badge variant="secondary" className="text-[9px] font-semibold px-1.5 py-0 shrink-0">
              {activeWorkspace.environment || "Production"}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-1">
        
        {/* Navigation Workspaces */}
        <SidebarGroup className="px-2.5 py-3">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Workspaces Views
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {workspaceItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      tooltip={item.label}
                      isActive={isActive}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-[#1f2d24] text-white shadow-xs"
                          : "text-[#394a3f] hover:bg-[#eef4ef]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={`size-4 ${isActive ? "text-[#71c897]" : "text-[#5b6e61]"}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
                          isActive
                            ? "bg-white/20 text-[#b3eac8]"
                            : "bg-[#e8f1eb] text-[#335340]"
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

        {/* Cloud Database Connector Widget for Active Workspace */}
        <SidebarGroup className="px-2.5 py-2">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Database for {activeWorkspace.name}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-1 pt-1">
              {dbInfo ? (
                /* Connected State Card */
                <div className="rounded-xl border border-[#cbe1d2] bg-[#f0faf3] p-3 shadow-2xs space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f663c]">
                      <span className="size-2 rounded-full bg-[#3ba565] animate-pulse" />
                      <span>Live Connected</span>
                    </div>
                    <Badge variant="emerald" className="text-[9px] font-bold uppercase px-1.5 py-0 bg-white">
                      Postgres
                    </Badge>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-[#30503d]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-[#6f907b] font-sans font-medium">Host:</span>
                      <span className="truncate max-w-[120px] font-semibold">{dbInfo.host}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-[#6f907b] font-sans font-medium">Database:</span>
                      <span className="font-semibold">{dbInfo.database}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-[#6f907b] font-sans font-medium">Tables:</span>
                      <span className="font-semibold text-[#216b44]">{dbInfo.tables_count} live tables</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#d8ebdd]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                      className="h-7 text-[10px] font-semibold text-[#226841] bg-white hover:bg-[#e4f3ea]"
                    >
                      Switch DB
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={disconnectDatabase}
                      className="h-7 text-[10px] font-semibold"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                /* Unconnected State Promo Card */
                <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897]">
                      <Cloud className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1f2d24]">No DB in this project</p>
                      <p className="text-[10px] text-[#718278]">Connect specific database</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#55695e] leading-relaxed">
                    Attach a dedicated Supabase, Neon, or RDS connection string to this workspace.
                  </p>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full gap-1.5 text-xs font-semibold"
                  >
                    <Plug className="size-3 text-[#71c897]" />
                    <span>Connect DB</span>
                  </Button>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Query Templates */}
        <SidebarGroup className="px-2.5 py-2">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Quick Starters
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1 px-1 pt-1">
              {quickStarters.map((item, idx) => (
                <Link
                  key={idx}
                  href="/Dashboard/chat"
                  className="flex items-center justify-between rounded-lg border border-transparent p-2 text-xs font-medium text-[#3b4e42] transition-all hover:border-border hover:bg-white hover:shadow-2xs"
                >
                  <span className="truncate">{item.title}</span>
                  <ChevronRight className="size-3 text-[#87998e] shrink-0" />
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Safety & Compliance Badge */}
        <SidebarGroup className="px-2.5 py-2">
          <div className="rounded-xl border border-border bg-[#f8fbf8] p-3 text-[11px] text-[#55675c] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#226b44]">
              <ShieldCheck className="size-3.5" />
              <span>Workspace Isolation</span>
            </div>
            <ul className="space-y-0.5 text-[10px] text-[#6d7e74]">
              <li>• Distinct cloud DB credentials</li>
              <li>• Independent schema grounding</li>
              <li>• Read-only query execution</li>
            </ul>
          </div>
        </SidebarGroup>

      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-border bg-[#f8fbf8] p-3">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} tooltip="Return to Landing">
              <Home className="size-4 text-[#5e7165]" />
              <span className="text-xs font-medium">Return to Landing</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/Login" />} tooltip="Sign In / Register">
              <LogOut className="size-4 text-[#5e7165]" />
              <span className="text-xs font-medium">Sign In / Register</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}