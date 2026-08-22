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
  BarChart3,
  Database,
  Home,
  LogOut,
  MessageSquareText,
  Sparkles,
  Terminal,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()

  const workspaceItems = [
    { label: "Query Tester", href: "/Dashboard", icon: Terminal },
    { label: "Interactive Chat", href: "/Dashboard/chat", icon: MessageSquareText },
  ]

  const schemaItems = [
    { label: "users", href: "/Dashboard", desc: "id, name, email, role" },
    { label: "orders", href: "/Dashboard", desc: "id, user_id, total_amount" },
    { label: "order_items", href: "/Dashboard", desc: "order_id, product_id, qty" },
    { label: "products", href: "/Dashboard", desc: "category, stock, price" },
  ]

  return (
    <Sidebar className="border-r border-[#dfe7df] bg-white">
      <SidebarHeader className="border-b border-[#dfe7df] px-4 py-4">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex size-8.5 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-xs transition-transform group-hover:scale-105">
            <Sparkles className="size-4" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-[#1f2d24]">Text to SQL</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#4ca873]">
              Postgres Studio
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-3">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Workspaces
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={isActive ? "bg-[#eaf4ed] font-semibold text-[#206642]" : "text-[#47574d] hover:bg-[#f2f6f3]"}
                    >
                      <Link href={item.href} className="flex items-center gap-2.5">
                        <item.icon className={`size-4 ${isActive ? "text-[#28734d]" : "text-[#627368]"}`} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 py-2">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#819287]">
            Schema Reference
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1.5 px-2 pt-1">
              {schemaItems.map((tbl) => (
                <div
                  key={tbl.label}
                  className="rounded-lg border border-[#e4ece5] bg-[#fbfdfb] p-2 transition hover:border-[#4ca873]/40"
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1f2d24]">
                    <Database className="size-3 text-[#4ca873]" />
                    {tbl.label}
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#718278]">{tbl.desc}</p>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#dfe7df] bg-[#f8fbf8] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home page">
              <Link href="/" className="flex items-center gap-2 text-xs text-[#526358] hover:text-[#1f2d24]">
                <Home className="size-4" />
                <span>Return to Landing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Account">
              <Link href="/Login" className="flex items-center gap-2 text-xs text-[#526358] hover:text-[#1f2d24]">
                <LogOut className="size-4" />
                <span>Sign In / Register</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}