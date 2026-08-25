"use client"

import { useState, useEffect } from "react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar"
import { AppSidebar } from "./slidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Cloud,
  Database,
  Loader2,
  MessageSquareText,
  Settings,
  Sparkles,
  Terminal,
  Wand2,
  Zap,
} from "lucide-react"
import { DatabaseProvider, useDatabase } from "@/lib/databaseContext"
import { SettingsProvider, useSettings } from "@/lib/settingsContext"
import { ExtensionProvider, useExtension } from "@/lib/extensionContext"
import { useAuth } from "@/lib/authContext"
import ConnectDatabaseModal from "@/components/database/ConnectDatabaseModal"
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal"
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher"
import MetricGlossaryModal from "@/components/semantic/MetricGlossaryModal"
import SettingsPanel from "@/components/settings/SettingsPanel"
import ExtensionPromptModal from "@/components/extension/ExtensionPromptModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function DashboardNavbar({ onOpenMetrics, onOpenSettings }) {
  const pathname = usePathname()
  const { dbInfo, setIsModalOpen } = useDatabase()
  const { isInstalled, openModal } = useExtension()

  const isQueryTester = pathname === "/Dashboard"
  const isChat = pathname === "/Dashboard/chat"

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="h-5 w-px bg-border" />
        <WorkspaceSwitcher />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">

        {/* Metric Glossary */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenMetrics}
          className="gap-1.5 font-semibold text-xs text-[#206642] hidden sm:flex"
          title="Open Custom Business Metrics & Rules"
        >
          <Wand2 className="size-3.5 text-[#3aa363]" />
          <span>Metrics Glossary</span>
        </Button>

        {/* Chrome Extension Status / Try Extension */}
        {isInstalled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openModal(false)}
            className="gap-1.5 font-semibold text-xs border-emerald-500/40 bg-emerald-50 text-[#14532d] hover:bg-emerald-100 hidden lg:flex"
            title="QueryCraft Chrome Extension is installed. Press Cmd+Shift+K anywhere on the web."
          >
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <Zap className="size-3.5 text-emerald-600" />
            <span>Copilot Active</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openModal(true)}
            className="gap-1.5 font-semibold text-xs border-emerald-600/30 bg-[#f0f9f3] text-[#164e2d] hover:bg-[#e2f3e8] hover:border-emerald-600/50 shadow-2xs hidden sm:flex"
            title="Open on any page with Cmd+Shift+K — Try QueryCraft Chrome Extension"
          >
            <Sparkles className="size-3.5 text-emerald-600" />
            <span>Try Extension</span>
            <span className="rounded bg-emerald-600/10 px-1 py-0.2 text-[9px] font-mono text-emerald-800">
              Cmd+Shift+K
            </span>
          </Button>
        )}

        {/* DB Status */}
        <Button
          type="button"
          suppressHydrationWarning
          variant={dbInfo ? "secondary" : "default"}
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 font-semibold text-xs shadow-2xs"
          title="Connect your cloud PostgreSQL database"
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

        {/* View Switcher */}
        <div className="flex items-center rounded-xl border border-border bg-[#f8fbf8] p-1 text-xs">
          <Link
            href="/Dashboard"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all duration-150 ${isQueryTester
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
              }`}
          >
            <Terminal className="size-3.5" />
            <span>Tester</span>
          </Link>
          <Link
            href="/Dashboard/chat"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all duration-150 ${isChat
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
              }`}
          >
            <MessageSquareText className="size-3.5" />
            <span>Live Chat</span>
          </Link>
        </div>

        {/* Settings Button — triggers shared settings panel */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
          className="gap-1.5 font-semibold text-xs text-[#4a5e53] border-[#e0e8e2] hover:bg-[#edf5ef] hover:text-[#1a2920]"
          title="Settings (Cmd+,) — synced with extension"
        >
          <Settings className="size-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </Button>

        {/* Back to Landing */}
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

function DashboardShell({ children }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Route protection: If authentication state is resolved and no user is signed in, redirect to /Login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/Login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f8faf8] space-y-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#4ade80] shadow-md animate-pulse">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-[#5e7467]">Verifying authentication...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <SidebarInset className="bg-background">
        <DashboardNavbar
          onOpenMetrics={() => setIsMetricModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        {children}
      </SidebarInset>

      {/* Modals */}
      <ConnectDatabaseModal />
      <CreateWorkspaceModal />
      <MetricGlossaryModal
        isOpen={isMetricModalOpen}
        onClose={() => setIsMetricModalOpen(false)}
      />

      {/* Shared Settings Panel (synced with Chrome Extension) */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Extension Promotion / Setup Modal */}
      <ExtensionPromptModal />
    </SidebarProvider>
  )
}

export default function Layout({ children }) {
  return (
    <DatabaseProvider>
      {/* SettingsProvider & ExtensionProvider wrap dashboard components */}
      <SettingsProvider>
        <ExtensionProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
        </ExtensionProvider>
      </SettingsProvider>
    </DatabaseProvider>
  )
}