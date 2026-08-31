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
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
  Zap,
  Search,
  User,
  LogOut,
  ChevronDown,
  BookOpen,
  Command as CommandIcon,
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
import { CommandPalette } from "@/components/shell/CommandPalette"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

function DashboardNavbar({ onOpenMetrics, onOpenSettings, onOpenCommandPalette }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { dbInfo, setIsModalOpen } = useDatabase()
  const { isInstalled, openModal } = useExtension()
  const { isTourActive, currentStep } = useTour()

  const isChat = pathname?.startsWith("/Dashboard/chat")
  const isCanvas = pathname?.startsWith("/Dashboard/canvas")
  const isCompiler = pathname === "/Dashboard"
  const isGuard = pathname?.startsWith("/Dashboard/guard")

  // Ergonomic keyboard shortcuts: ⌘1 (Chat), ⌘2 (Canvas), ⌘3 (Compiler), ⌘4 (Guard)
  useEffect(() => {
    const handleViewShortcuts = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName) || e.target.isContentEditable) {
        return
      }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "1") {
          e.preventDefault()
          router.push("/Dashboard/chat")
        } else if (e.key === "2") {
          e.preventDefault()
          router.push("/Dashboard/canvas")
        } else if (e.key === "3") {
          e.preventDefault()
          router.push("/Dashboard")
        } else if (e.key === "4") {
          e.preventDefault()
          router.push("/Dashboard/guard")
        }
      }
    }
    window.addEventListener("keydown", handleViewShortcuts)
    return () => window.removeEventListener("keydown", handleViewShortcuts)
  }, [router])

  const userInitials = (user?.displayName || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card/90 px-3 sm:px-5 backdrop-blur-md min-w-0 max-w-full">
      {/* ── ZONE 1: LEFT (Sidebar + Brand + Workspace Switcher) ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="size-8 shrink-0 text-foreground hover:bg-accent rounded-lg" />
        <div className="hidden sm:block h-4 w-px bg-border shrink-0" />
        <div
          id="tour-connect-db"
          className={`min-w-0 transition-all duration-200 ${
            isTourActive && currentStep === 3
              ? "relative z-[60] ring-4 ring-emerald-500 rounded-xl bg-card shadow-2xl p-0.5"
              : ""
          }`}
        >
          <WorkspaceSwitcher />
        </div>
      </div>

      {/* ── ZONE 2: CENTER (Canonical Segmented Switcher: Chat | Canvas | Compiler | Guard) ── */}
      <div className="flex items-center rounded-xl border border-border bg-muted/60 p-0.5 text-xs font-semibold shadow-2xs">
        <Link
          href="/Dashboard/chat"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isChat
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Interactive Conversational AI Assistant (⌘1)"
        >
          <MessageSquareText className="size-3.5" />
          <span>Chat</span>
        </Link>

        <Link
          href="/Dashboard/canvas"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isCanvas
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Autonomous Multi-Agent Dashboard Studio (⌘2)"
        >
          <Sparkles className="size-3.5 text-emerald-400" />
          <span>Canvas</span>
        </Link>

        <Link
          href="/Dashboard"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isCompiler
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Natural Language Query Compiler (⌘3)"
        >
          <Terminal className="size-3.5" />
          <span>Compiler</span>
        </Link>

        <Link
          href="/Dashboard/guard"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isGuard
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Pre-Flight Cost Guard AI Firewall (⌘4)"
        >
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Cost Guard</span>
        </Link>
      </div>

      {/* ── ZONE 3: RIGHT (DB Status + ⌘K Palette + User Menu) ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Command Palette Trigger Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:border-border-hover hover:text-foreground transition shadow-2xs"
          title="Search views, database schema, commands (⌘K)"
        >
          <Search className="size-3.5" />
          <span className="text-[11px] font-medium">Search...</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[9.5px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Connected DB Status Pill — High Visibility Database Context */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-lg border text-xs font-semibold transition shadow-2xs cursor-pointer ${
            dbInfo
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
              : "border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title={dbInfo ? `Connected to ${dbInfo.db_type || "PostgreSQL"} at ${dbInfo.host} (${dbInfo.tables_count} live tables)` : "No database connected — click to connect"}
        >
          {dbInfo ? (
            <>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {dbInfo.db_type ? dbInfo.db_type.toUpperCase() : "POSTGRES"}
                </span>
                <span className="hidden lg:inline text-muted-foreground text-[10px]">·</span>
                <span className="hidden lg:inline font-mono text-[11px] text-muted-foreground truncate max-w-[100px]">
                  {dbInfo.host || "localhost"}
                </span>
              </div>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {dbInfo.tables_count} tbl
              </span>
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
              <Cloud className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-[11px]">Connect DB</span>
            </>
          )}
        </button>

        {/* User Profile & Global Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/60 text-xs font-bold text-foreground hover:bg-accent transition shadow-2xs">
            {userInitials}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground truncate">
                  {user?.displayName || "Developer Account"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate normal-case">
                  {user?.email || "Local Session"}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onOpenCommandPalette}>
              <CommandIcon className="size-3.5 text-emerald-600" />
              <span>Command Palette</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘K</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="size-3.5 text-muted-foreground" />
              <span>Settings &amp; Engine</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘,</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onOpenMetrics}>
              <BookOpen className="size-3.5 text-muted-foreground" />
              <span>Metrics Glossary</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘G</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => openModal(!isInstalled)}>
              <Zap className="size-3.5 text-emerald-600" />
              <span>{isInstalled ? "Copilot Extension Active" : "Get Chrome Extension"}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => window.location.assign("/")}>
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              <span>Back to Landing Page</span>
            </DropdownMenuItem>

            {user && (
              <DropdownMenuItem onClick={logout} className="text-destructive hover:text-destructive">
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function DashboardShell({ children }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
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
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background space-y-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Verifying authentication...</p>
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
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <div className="w-full max-w-full min-w-0 overflow-x-hidden flex-1">
          {children}
        </div>
      </SidebarInset>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMetrics={() => setIsMetricModalOpen(true)}
      />

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