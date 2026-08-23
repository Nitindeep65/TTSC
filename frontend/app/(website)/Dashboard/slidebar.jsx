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

export function AppSidebar() {
  const pathname = usePathname()
  const { dbInfo, setIsModalOpen, disconnectDatabase } = useDatabase()

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
    <Sidebar className="border-r border-[#dfe7df] bg-[#fbfdfb]">
      
      {/* Brand Header */}
      <SidebarHeader className="border-b border-[#dfe7df] px-4 py-4">
        <Link href="/" className="group flex items-center gap-3 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs transition-transform group-hover:scale-105">
            <Sparkles className="size-4.5" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-[#1f2d24]">Text to SQL</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#3aa363]">
              Cloud Studio
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="space-y-1">
        
        {/* Navigation Workspaces */}
        <SidebarGroup className="px-2.5 py-3">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Workspaces
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
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
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

        {/* Cloud Database Connector Widget (Replaces Schema Helper on Left) */}
        <SidebarGroup className="px-2.5 py-2">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Cloud DB Connector
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-1 pt-1">
              {dbInfo ? (
                /* Connected State Card */
                <div className="rounded-xl border border-[#cbe1d2] bg-[#f0faf3] p-3 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f663c]">
                      <span className="size-2 rounded-full bg-[#3ba565] animate-pulse" />
                      <span>Live Connected</span>
                    </div>
                    <span className="rounded bg-[#d5ecd9] px-1.5 py-0.5 text-[9px] font-bold text-[#1a5a33] uppercase">
                      Postgres
                    </span>
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
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="rounded-lg border border-[#c3ded0] bg-white px-2 py-1 text-[10px] font-semibold text-[#226841] hover:bg-[#e4f3ea] text-center shadow-3xs"
                    >
                      Switch DB
                    </button>
                    <button
                      type="button"
                      onClick={disconnectDatabase}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 text-center shadow-3xs"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                /* Unconnected State Promo Card */
                <div className="rounded-xl border border-[#dce8de] bg-white p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897]">
                      <Cloud className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1f2d24]">Connect Cloud DB</p>
                      <p className="text-[10px] text-[#718278]">Supabase, Neon, AWS RDS</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#55695e] leading-relaxed">
                    Hook your live PostgreSQL connection to ground queries in your live tables and schema constraints.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#1f2d24] py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#2d4937] transition"
                  >
                    <Plug className="size-3 text-[#71c897]" />
                    <span>Connect Live DB</span>
                  </button>
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
                  className="flex items-center justify-between rounded-lg border border-transparent p-2 text-xs font-medium text-[#3b4e42] transition hover:border-[#dfe8df] hover:bg-white hover:shadow-2xs"
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
          <div className="rounded-xl border border-[#e1e9e2] bg-[#f8fbf8] p-3 text-[11px] text-[#55675c] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#226b44]">
              <ShieldCheck className="size-3.5" />
              <span>Production Safety</span>
            </div>
            <ul className="space-y-0.5 text-[10px] text-[#6d7e74]">
              <li>• Read-only SELECT enforcement</li>
              <li>• Automatic LIMIT 50 protection</li>
              <li>• Zero-hallucination clarification</li>
            </ul>
          </div>
        </SidebarGroup>

      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-[#dfe7df] bg-[#f8fbf8] p-3">
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