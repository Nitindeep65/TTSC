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
import OnboardingModal from "@/components/onboarding/OnboardingModal"
import SpotlightTooltip from "@/components/onboarding/SpotlightTooltip"
import { TourProvider, useTour } from "@/lib/tourContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function DashboardNavbar({ onOpenMetrics, onOpenSettings }) {
  const pathname = usePathname()
  const { dbInfo, setIsModalOpen } = useDatabase()
  const { isInstalled, openModal } = useExtension()
  const { isTourActive, currentStep } = useTour()

  const isQueryTester = pathname === "/Dashboard"
  const isChat = pathname === "/Dashboard/chat"

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 w-full shrink-0 items-center justify-between border-b border-border bg-white/95 px-3 sm:px-6 backdrop-blur-md min-w-0 max-w-full overflow-x-hidden">
      {/* Left: Sidebar trigger & Workspace Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial pr-2">
        <SidebarTrigger className="size-8 shrink-0 text-[#1f2d24] hover:bg-[#edf5ef]" />
        <div className="hidden xs:block h-4 sm:h-5 w-px bg-border shrink-0" />
        <div
          id="tour-connect-db"
          className={`min-w-0 flex-1 sm:flex-initial transition-all duration-300 ${
            isTourActive && currentStep === 3
              ? "relative z-[60] ring-4 ring-emerald-500 rounded-xl bg-white shadow-2xl p-0.5"
              : ""
          }`}
        >
          <WorkspaceSwitcher />
        </div>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

        {/* Metric Glossary (Desktop / Tablet) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenMetrics}
          className="gap-1.5 font-semibold text-xs text-[#206642] hidden xl:flex h-8"
          title="Open Custom Business Metrics & Rules"
        >
          <Wand2 className="size-3.5 text-[#3aa363]" />
          <span>Metrics Glossary</span>
        </Button>

        {/* Chrome Extension Status / Try Extension (Large screen) */}
        {isInstalled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openModal(false)}
            className="gap-1.5 font-semibold text-xs border-emerald-500/40 bg-emerald-50 text-[#14532d] hover:bg-emerald-100 hidden 2xl:flex h-8"
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
            className="gap-1.5 font-semibold text-xs border-emerald-600/30 bg-[#f0f9f3] text-[#164e2d] hover:bg-[#e2f3e8] hover:border-emerald-600/50 shadow-2xs hidden 2xl:flex h-8"
            title="Open on any page with Cmd+Shift+K — Try QueryCraft Chrome Extension"
          >
            <Sparkles className="size-3.5 text-emerald-600" />
            <span>Try Extension</span>
            <span className="rounded bg-emerald-600/10 px-1 py-0.2 text-[9px] font-mono text-emerald-800">
              Cmd+Shift+K
            </span>
          </Button>
        )}

        {/* DB Status / Connect DB Pill */}
        <Button
          type="button"
          suppressHydrationWarning
          variant={dbInfo ? "secondary" : "default"}
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 font-semibold text-xs shadow-2xs h-8 px-2 sm:px-3"
          title={dbInfo ? `Connected to ${dbInfo.host} (${dbInfo.tables_count} tables)` : "Connect your cloud database"}
        >
          {dbInfo ? (
            <>
              <span className="size-2 rounded-full bg-[#3ba565] animate-pulse shrink-0" />
              <Database className="size-3.5 text-[#3ba565] shrink-0" />
              <span className="hidden lg:inline font-mono truncate max-w-[120px]">{dbInfo.host}</span>
              <span className="hidden sm:inline lg:hidden font-medium">DB</span>
              <Badge variant="emerald" className="px-1.5 py-0 text-[9px] bg-white">
                {dbInfo.tables_count} <span className="hidden xs:inline">tbls</span>
              </Badge>
            </>
          ) : (
            <>
              <Cloud className="size-3.5 text-[#71c897] shrink-0" />
              <span className="hidden sm:inline">Connect DB</span>
              <span className="sm:hidden text-xs">Connect</span>
            </>
          )}
        </Button>

        {/* View Switcher: Tester / Live Chat */}
        <div className="flex items-center rounded-xl border border-border bg-[#f8fbf8] p-0.5 text-xs">
          <Link
            href="/Dashboard"
            className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 font-semibold transition-all duration-150 ${isQueryTester
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
              }`}
            title="Query Compiler Tester"
          >
            <Terminal className="size-3.5" />
            <span className="hidden sm:inline">Tester</span>
          </Link>
          <Link
            href="/Dashboard/chat"
            className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 font-semibold transition-all duration-150 ${isChat
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#eef4ef] hover:text-[#1f2d24]"
              }`}
            title="Interactive Multi-Turn AI Chat"
          >
            <MessageSquareText className="size-3.5" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
        </div>

        {/* Settings Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
          className="gap-1.5 font-semibold text-xs text-[#4a5e53] border-[#e0e8e2] hover:bg-[#edf5ef] hover:text-[#1a2920] h-8 px-2 sm:px-3"
          title="Settings (Cmd+,) — synced with extension"
        >
          <Settings className="size-3.5" />
          <span className="hidden md:inline">Settings</span>
        </Button>

        {/* Back to Landing */}
        <Link href="/" className="hidden sm:block">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-semibold text-xs text-[#32483a] h-8 px-2 sm:px-3"
            title="Back to Landing Page"
          >
            <ArrowLeft className="size-3.5 text-[#5e7065]" />
            <span className="hidden md:inline">Home</span>
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
  const [showOnboarding, setShowOnboarding] = useState(false)

  // First-time user onboarding detection
  useEffect(() => {
    try {
      const isComplete = localStorage.getItem("querycraft_onboarding_complete")
      if (!isComplete || isComplete === "false") {
        setShowOnboarding(true)
      }
    } catch (e) {}
  }, [])

  const handleOnboardingComplete = ({ role } = {}) => {
    try {
      localStorage.setItem("querycraft_onboarding_complete", "true")
      if (role) {
        localStorage.setItem("querycraft_user_role", role)
      }
    } catch (e) {}
    setShowOnboarding(false)
  }

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
      <AppSidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMetrics={() => setIsMetricModalOpen(true)}
      />
      <SidebarInset className="bg-background min-w-0 max-w-full overflow-x-hidden flex-1">
        <DashboardNavbar
          onOpenMetrics={() => setIsMetricModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <div className="w-full max-w-full min-w-0 overflow-x-hidden flex-1">
          {children}
        </div>
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

      {/* First-Time User Onboarding Modal Flow */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Interactive Spotlight Tour Overlay & Tooltip */}
      <SpotlightTooltip />
    </SidebarProvider>
  )
}

export default function Layout({ children }) {
  return (
    <DatabaseProvider>
      {/* SettingsProvider, ExtensionProvider & TourProvider wrap dashboard components */}
      <SettingsProvider>
        <ExtensionProvider>
          <TourProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
          </TourProvider>
        </ExtensionProvider>
      </SettingsProvider>
    </DatabaseProvider>
  )
}