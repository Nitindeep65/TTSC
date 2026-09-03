"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import {
  BookOpen,
  Check,
  Code2,
  Database,
  ExternalLink,
  FolderKanban,
  FolderPlus,
  Github,
  Laptop,
  Layers,
  MessageSquareText,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  Terminal,
  Zap,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"
import { useSettings } from "@/lib/settingsContext"

export function CommandPalette({
  open,
  onOpenChange,
  onOpenSettings,
}) {
  const router = useRouter()
  const {
    dbInfo,
    setIsModalOpen,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    setIsWorkspaceModalOpen,
  } = useDatabase()
  const { savePreferences } = useSettings()

  const [query, setQuery] = useState("")

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpenChange])

  const handleNavigate = (path) => {
    router.push(path)
    onOpenChange(false)
  }

  const handleAction = (action) => {
    action()
    onOpenChange(false)
  }

  const setTheme = (t) => {
    const root = document.documentElement
    if (t === "dark") {
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
    } else if (t === "light") {
      root.classList.remove("dark")
      root.setAttribute("data-theme", "light")
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
      root.setAttribute("data-theme", isDark ? "dark" : "light")
    }
    try {
      localStorage.setItem("querycraft-theme", t)
      localStorage.setItem("querycraft-docs-theme", t)
    } catch {}
    if (savePreferences) {
      savePreferences({ theme: t })
    }
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-2xl border border-border bg-popover text-foreground shadow-2xl">
        <CommandInput
          placeholder="Type a command, studio, or search... (⌘K)"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[60vh] p-2 space-y-1">
          <CommandEmpty>No matching actions found.</CommandEmpty>

          {/* Navigation Group */}
          <CommandGroup heading="Studios & Navigation">
            <CommandItem
              onSelect={() => handleNavigate("/Dashboard")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="size-4 text-emerald-500" />
                <span className="font-semibold">SQL Compiler Sandbox</span>
              </div>
              <CommandShortcut>⌘3</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => handleNavigate("/Dashboard/guard")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span className="font-semibold">Pre-Flight Cost Guard (AI Firewall)</span>
              </div>
              <CommandShortcut>⌘2</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => handleNavigate("/Dashboard/chat")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquareText className="size-4 text-emerald-500" />
                <span className="font-semibold">SQL Doctor &amp; Clarification Chat</span>
              </div>
              <CommandShortcut>⌘1</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {/* Theme Switcher Group */}
          <CommandGroup heading="Appearance & Theme">
            <CommandItem
              onSelect={() => setTheme("light")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sun className="size-4 text-amber-500" />
                <span>Switch to Light Mode</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">☀ Light</span>
            </CommandItem>

            <CommandItem
              onSelect={() => setTheme("dark")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Moon className="size-4 text-emerald-400" />
                <span>Switch to Dark Mode</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">☾ Dark</span>
            </CommandItem>

            <CommandItem
              onSelect={() => setTheme("system")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Laptop className="size-4 text-sky-400" />
                <span>Sync with System Theme</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">💻 Auto</span>
            </CommandItem>
          </CommandGroup>

          {/* Database Actions */}
          <CommandGroup heading="Database & Actions">
            <CommandItem
              onSelect={() => handleAction(() => setIsModalOpen(true))}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Database className="size-4 text-emerald-500" />
                <span>{dbInfo ? "Manage PostgreSQL Connection" : "Connect Live Database (Supabase/Neon/RDS)"}</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleAction(() => setIsWorkspaceModalOpen(true))}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FolderPlus className="size-4 text-emerald-500" />
                <span>Create New Database Workspace</span>
              </div>
            </CommandItem>

            {onOpenSettings && (
              <CommandItem
                onSelect={() => handleAction(onOpenSettings)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Open Engine Settings &amp; Keybindings</span>
                </div>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            )}
          </CommandGroup>

          {/* Workspaces Group */}
          {workspaces?.length > 1 && (
            <CommandGroup heading="Switch Workspace">
              {workspaces.map((ws) => (
                <CommandItem
                  key={ws.id}
                  onSelect={() => {
                    setActiveWorkspaceId(ws.id)
                    onOpenChange(false)
                  }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="size-4 text-muted-foreground" />
                    <span className="font-semibold">{ws.name}</span>
                    <span className="text-[10px] text-muted-foreground">({ws.environment})</span>
                  </div>
                  {ws.id === activeWorkspaceId && <Check className="size-3.5 text-emerald-500" />}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Documentation & External */}
          <CommandGroup heading="Documentation & Resources">
            <CommandItem
              onSelect={() => handleNavigate("/docs/cli")}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="size-4 text-emerald-500" />
                <span>CLI &amp; MCP Documentation</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500">v2.0-mvp</span>
            </CommandItem>

            <CommandItem
              onSelect={() => {
                window.open("https://github.com/Nitindeep65/TTSC", "_blank")
                onOpenChange(false)
              }}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="size-4 text-muted-foreground" />
                <span>QueryCraft GitHub Repository</span>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
