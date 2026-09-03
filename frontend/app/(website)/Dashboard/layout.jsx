"use client"

import { useState, useEffect, useRef } from "react"
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
  BookOpen,
  Check,
  ChevronDown,
  Cloud,
  Command as CommandIcon,
  Database,
  ExternalLink,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  MessageSquareText,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Terminal,
  Unplug,
  User,
  Zap,
} from "lucide-react"
import { DatabaseProvider, useDatabase } from "@/lib/databaseContext"
import { SettingsProvider, useSettings } from "@/lib/settingsContext"
import { ExtensionProvider, useExtension } from "@/lib/extensionContext"
import { useAuth } from "@/lib/authContext"
import ConnectDatabaseModal from "@/components/database/ConnectDatabaseModal"
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal"
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher"
import SettingsPanel from "@/components/settings/SettingsPanel"
import ExtensionPromptModal from "@/components/extension/ExtensionPromptModal"
import OnboardingModal from "@/components/onboarding/OnboardingModal"
import SpotlightTooltip from "@/components/onboarding/SpotlightTooltip"
import { TourProvider, useTour } from "@/lib/tourContext"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/shell/CommandPalette"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

// ─── Compact Header Theme Selector ───────────────────────────────────────────
function HeaderThemeSwitcher() {
  const { settings, savePreferences } = useSettings()
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const saved = settings?.preferences?.theme || localStorage.getItem("querycraft-theme") || "dark"
    setTheme(saved)
  }, [settings?.preferences?.theme])

  const setAppTheme = (newTheme) => {
    setTheme(newTheme)
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
    } else if (newTheme === "light") {
      root.classList.remove("dark")
      root.setAttribute("data-theme", "light")
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
      root.setAttribute("data-theme", isDark ? "dark" : "light")
    }
    try {
      localStorage.setItem("querycraft-theme", newTheme)
      localStorage.setItem("querycraft-docs-theme", newTheme)
    } catch {}
    if (savePreferences) {
      savePreferences({ theme: newTheme })
    }
  }

  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shadow-2xs">
      <button
        type="button"
        onClick={() => setAppTheme("light")}
        className={`p-1 rounded-md transition-all ${
          theme === "light"
            ? "bg-background text-amber-500 shadow-2xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Light Mode (☀)"
        aria-label="Light mode"
      >
        <Sun size={13} />
      </button>
      <button
        type="button"
        onClick={() => setAppTheme("system")}
        className={`p-1 rounded-md transition-all ${
          theme === "system"
            ? "bg-background text-sky-500 shadow-2xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="System Preference (💻)"
        aria-label="System theme"
      >
        <Laptop size={13} />
      </button>
      <button
        type="button"
        onClick={() => setAppTheme("dark")}
        className={`p-1 rounded-md transition-all ${
          theme === "dark"
            ? "bg-background text-emerald-400 shadow-2xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Dark Mode (☾)"
        aria-label="Dark mode"
      >
        <Moon size={13} />
      </button>
    </div>
  )
}

// ─── Compact Database Status Popover ─────────────────────────────────────────
function DatabaseStatusControl() {
  const { dbInfo, setIsModalOpen, disconnectDatabase } = useDatabase()
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!dbInfo) {
    return (
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition shadow-2xs cursor-pointer"
        title="Connect database to ground schema"
      >
        <span className="size-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
        <Cloud className="size-3.5" />
        <span className="text-[11px]">Connect DB</span>
      </button>
    )
  }

  const dbType = dbInfo.db_type ? dbInfo.db_type.toUpperCase() : "POSTGRES"
  const host = dbInfo.host || "localhost"
  const tablesCount = dbInfo.tables_count || 0

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition shadow-2xs cursor-pointer"
        title="Click to view database connection telemetry"
      >
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-mono text-[11px] font-bold text-foreground">
          {dbType}
        </span>
        <span className="text-muted-foreground/60 text-[10px]">·</span>
        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9.5px] font-mono font-bold">
          {tablesCount} tbls
        </span>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-border bg-popover p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-emerald-500" />
              <span className="font-bold text-xs text-foreground">Database Context</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px]">Engine</span>
              <span className="font-mono text-[11px] font-semibold text-foreground">{dbType}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px]">Host</span>
              <span className="font-mono text-[11px] text-foreground truncate max-w-[140px]" title={host}>
                {host}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px]">Introspected Tables</span>
              <span className="font-mono text-[11px] text-foreground font-semibold">{tablesCount} tables</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px]">Security</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Lock size={10} />
                <span>SSL Active</span>
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsModalOpen(true)
              }}
              className="flex-1 py-1 px-2 rounded-md bg-muted hover:bg-accent text-[11px] font-medium text-foreground transition text-center"
            >
              Re-introspect
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                disconnectDatabase()
              }}
              className="flex items-center justify-center gap-1 py-1 px-2 rounded-md hover:bg-destructive/15 text-[11px] font-medium text-destructive transition"
              title="Disconnect database"
            >
              <Unplug size={12} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardNavbar({ onOpenSettings, onOpenCommandPalette }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isTourActive, currentStep } = useTour()
  const { isInstalled, openModal } = useExtension()

  const isChat = pathname?.startsWith("/Dashboard/chat")
  const isCompiler = pathname === "/Dashboard"
  const isGuard = pathname?.startsWith("/Dashboard/guard")

  // MVP Keyboard shortcuts: ⌘1 (Chat), ⌘2 (Guard), ⌘3 (Compiler), ⌘, (Settings)
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
          router.push("/Dashboard/guard")
        } else if (e.key === "3") {
          e.preventDefault()
          router.push("/Dashboard")
        } else if (e.key === ",") {
          e.preventDefault()
          onOpenSettings()
        }
      }
    }
    window.addEventListener("keydown", handleViewShortcuts)
    return () => window.removeEventListener("keydown", handleViewShortcuts)
  }, [router, onOpenSettings])

  const userInitials = (user?.displayName || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card/85 px-3 sm:px-5 backdrop-blur-md min-w-0 max-w-full">
      
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

      {/* ── ZONE 2: CENTER (Studio Switcher: Chat ⌘1 | Cost Guard ⌘2 | Compiler ⌘3) ── */}
      <nav className="flex items-center rounded-xl border border-border bg-muted/40 p-1 text-xs font-semibold shadow-2xs">
        <Link
          href="/Dashboard/chat"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isChat
              ? "bg-background text-foreground shadow-2xs border border-border/70"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          }`}
          title="SQL Doctor & Clarification Chat Studio (⌘1)"
        >
          <MessageSquareText className="size-3.5 text-emerald-500" />
          <span>Chat</span>
          <kbd className="hidden lg:inline font-mono text-[9px] opacity-60 ml-0.5">⌘1</kbd>
        </Link>

        <Link
          href="/Dashboard/guard"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isGuard
              ? "bg-background text-foreground shadow-2xs border border-border/70"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          }`}
          title="Pre-Flight Cost Guard AI Firewall (⌘2)"
        >
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Cost Guard</span>
          <kbd className="hidden lg:inline font-mono text-[9px] opacity-60 ml-0.5">⌘2</kbd>
        </Link>

        <Link
          href="/Dashboard"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 ${
            isCompiler
              ? "bg-background text-foreground shadow-2xs border border-border/70"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          }`}
          title="SQL Compiler Sandbox (⌘3)"
        >
          <Terminal className="size-3.5 text-emerald-500" />
          <span>Compiler</span>
          <kbd className="hidden lg:inline font-mono text-[9px] opacity-60 ml-0.5">⌘3</kbd>
        </Link>
      </nav>

      {/* ── ZONE 3: RIGHT (Docs + Search + DB Status + Theme + Profile) ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* CLI & MCP Docs Quick Link */}
        <Link
          href="/docs/cli"
          className="hidden xl:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-card/60 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition shadow-2xs"
          title="CLI & MCP Documentation"
        >
          <BookOpen className="size-3.5 text-emerald-500" />
          <span className="text-[11px] font-medium">CLI Docs</span>
        </Link>

        {/* Command Palette Trigger Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-card/60 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition shadow-2xs cursor-pointer"
          title="Search views, database schema, commands (⌘K)"
        >
          <Search className="size-3.5" />
          <span className="text-[11px] font-medium">Search...</span>
          <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-[9.5px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Theme Segmented Switcher */}
        <HeaderThemeSwitcher />

        {/* Database Status Context Control */}
        <DatabaseStatusControl />

        {/* User Profile & Global Dropdown */}
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
              <CommandIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Command Palette</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘K</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="size-3.5 text-muted-foreground" />
              <span>Settings &amp; Engine</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘,</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => openModal(!isInstalled)}>
              <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isInstalled ? "Copilot Extension Active" : "Get Chrome Extension"}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => window.location.assign("/docs/cli")}>
              <BookOpen className="size-3.5 text-muted-foreground" />
              <span>CLI &amp; MCP Documentation</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => window.location.assign("/")}>
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              <span>Back to Landing Page</span>
            </DropdownMenuItem>

            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive hover:text-destructive">
                  <LogOut className="size-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </>
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
      />
      <SidebarInset className="bg-background min-w-0 max-w-full overflow-x-hidden flex-1">
        <DashboardNavbar
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
      />

      {/* Modals */}
      <ConnectDatabaseModal />
      <CreateWorkspaceModal />

      {/* Shared Settings Panel */}
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