"use client"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar"
import { AppSidebar } from "./slidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  Cloud,
  Database,
  Layers,
  MessageSquareText,
  Plug,
  Sparkles,
  Terminal,
} from "lucide-react"
import { DatabaseProvider, useDatabase } from "@/lib/databaseContext"
import ConnectDatabaseModal from "@/components/database/ConnectDatabaseModal"
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal"
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function DashboardNavbar() {
  const pathname = usePathname()
  const { dbInfo, setIsModalOpen, activeWorkspace } = useDatabase()

  const isQueryTester = pathname === "/Dashboard"
  const isChat = pathname === "/Dashboard/chat"

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="h-5 w-px bg-border" />
        
        {/* Workspace Switcher in Navbar */}
        <WorkspaceSwitcher />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Cloud DB Connection Status / Trigger Button */}
        <Button
          type="button"
          variant={dbInfo ? "secondary" : "default"}
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 font-semibold text-xs shadow-2xs"
          title="Connect your cloud PostgreSQL database (Supabase, Neon, AWS RDS)"
        >
          {dbInfo ? (
            <>
              <span className="size-2 rounded-full bg-[#3ba565] animate-pulse" />
              <Database className="size-3.5 text-[#3ba565]" />
              <span className="hidden md:inline font-mono">{dbInfo.host}</span>
              <span className="md:hidden">DB Connected</span>
              <Badge variant="emerald" className="px-1.5 py-0 text-[9px] bg-white">
                {dbInfo.tables_count} tbls
              </Badge>
            </>
          ) : (
            <>
              <Cloud className="size-3.5 text-[#71c897]" />
              <span>Connect Cloud DB</span>
              <span className="hidden lg:inline rounded bg-white/20 px-1 py-0.2 text-[9px] text-[#b3eac8]">
                Supabase / Neon / RDS
              </span>
            </>
          )}
        </Button>

        {/* View Switcher: Tester vs Chat */}
        <div className="flex items-center rounded-xl border border-border bg-[#f8fbf8] p-1 text-xs">
          <Link
            href="/Dashboard"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all duration-150 ${
              isQueryTester
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
            }`}
          >
            <Terminal className="size-3.5" />
            <span>Tester</span>
          </Link>

          <Link
            href="/Dashboard/chat"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all duration-150 ${
              isChat
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
            }`}
          >
            <MessageSquareText className="size-3.5" />
            <span>Live Chat</span>
          </Link>
        </div>

        {/* Return to Landing */}
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-semibold text-xs text-[#32483a]"
            title="Back to Landing Page"
          >
            <ArrowLeft className="size-3.5 text-[#5e7065]" />
            <span className="hidden sm:inline">Landing</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default function Layout({ children }) {
  return (
    <DatabaseProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <DashboardNavbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
      <ConnectDatabaseModal />
      <CreateWorkspaceModal />
    </DatabaseProvider>
  )
}