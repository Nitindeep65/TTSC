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

function DashboardNavbar() {
  const pathname = usePathname()
  const { dbInfo, setIsModalOpen } = useDatabase()

  const isQueryTester = pathname === "/Dashboard"
  const isChat = pathname === "/Dashboard/chat"

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#e3e8e2] bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="h-5 w-px bg-[#e3e8e2]" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#1f2d24]">Text to SQL Intelligence</p>
          <p className="text-[11px] text-[#6f7e75]">
            {dbInfo ? (
              <span className="text-[#216b44] font-medium">Connected to {dbInfo.host}</span>
            ) : (
              "PostgreSQL Cloud Query Engine"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Cloud DB Connection Status / Trigger Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-2xs transition ${
            dbInfo
              ? "border border-[#bfe2cc] bg-[#eef8f2] text-[#1c6037] hover:bg-[#e4f3ea]"
              : "border border-[#206642] bg-[#1f2d24] text-white hover:bg-[#314f3b]"
          }`}
          title="Connect your cloud PostgreSQL database (Supabase, Neon, AWS RDS)"
        >
          {dbInfo ? (
            <>
              <span className="size-2 rounded-full bg-[#3ba565] animate-pulse" />
              <Database className="size-3.5 text-[#3ba565]" />
              <span className="hidden md:inline font-mono">{dbInfo.host}</span>
              <span className="md:hidden">DB Connected</span>
              <span className="rounded bg-[#d5ecd9] px-1.5 py-0.2 text-[10px] text-[#1a5a33]">
                {dbInfo.tables_count} tbls
              </span>
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
        </button>

        <div className="flex items-center rounded-xl border border-[#dfe7df] bg-[#f8fbf8] p-1 text-xs">
          <Link
            href="/Dashboard"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
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
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              isChat
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
            }`}
          >
            <MessageSquareText className="size-3.5" />
            <span>Live Chat</span>
          </Link>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfddd0] bg-white px-3 py-1.5 text-xs font-semibold text-[#32483a] shadow-2xs transition hover:bg-[#f1f6f2]"
          title="Back to Landing Page"
        >
          <ArrowLeft className="size-3.5 text-[#5e7065]" />
          <span className="hidden sm:inline">Landing</span>
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
        <SidebarInset className="bg-[#f7f8f5]">
          <DashboardNavbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
      <ConnectDatabaseModal />
    </DatabaseProvider>
  )
}