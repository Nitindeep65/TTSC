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
  MessageSquareText,
  Sparkles,
  Terminal,
  Database,
  Layers,
  Settings,
  BookOpen,
  Plus,
  Home,
  Copy,
  FolderKanban,
  Check,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"

export function CommandPalette({
  open,
  onOpenChange,
  onOpenSettings,
  onOpenMetrics,
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

  const [query, setQuery] = useState("")
  const [recents, setRecents] = useState([])

  // Load recent queries from localStorage when palette opens
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem("tts_recent_queries_v2")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setRecents(parsed.slice(0, 4))
          }
        }
      } catch {}
    }
  }, [open])

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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput
          placeholder="Search commands, views, schema, or settings... (⌘K)"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No matching commands found.</CommandEmpty>

          {/* Navigation Group */}
          <CommandGroup heading="Views & Studios">
            <CommandItem onSelect={() => handleNavigate("/Dashboard/chat")}>
              <div className="flex items-center gap-2.5">
                <MessageSquareText className="size-4 text-emerald-600" />
                <span>Chat</span>
                <span className="text-[11px] text-muted-foreground">Conversational SQL Assistant</span>
              </div>
              <CommandShortcut>G C</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleNavigate("/Dashboard/canvas")}>
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-emerald-600" />
                <span>Canvas</span>
                <span className="text-[11px] text-muted-foreground">Multi-Agent Dashboard Studio</span>
              </div>
              <CommandShortcut>G V</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleNavigate("/Dashboard")}>
              <div className="flex items-center gap-2.5">
                <Terminal className="size-4 text-emerald-600" />
                <span>Compiler</span>
                <span className="text-[11px] text-muted-foreground">Query Execution Sandbox</span>
              </div>
              <CommandShortcut>G X</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleNavigate("/")}>
              <div className="flex items-center gap-2.5">
                <Home className="size-4 text-muted-foreground" />
                <span>Landing Page</span>
              </div>
            </CommandItem>
          </CommandGroup>

          {/* Recent Queries Group */}
          {recents && recents.length > 0 && (
            <CommandGroup heading="Recent Queries">
              {recents.map((item, idx) => (
                <CommandItem
                  key={idx}
                  onSelect={() => handleNavigate(`/Dashboard/chat?prompt=${encodeURIComponent(item.query)}`)}
                >
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Terminal className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="font-mono text-[11px] truncate text-foreground">{item.query}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-sans shrink-0">{item.time || "Recent"}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Database Group */}
          <CommandGroup heading="Database & Schema">
            <CommandItem onSelect={() => handleAction(() => setIsModalOpen(true))}>
              <div className="flex items-center gap-2.5">
                <Database className="size-4 text-emerald-600" />
                <span>{dbInfo ? "Manage Database Connection" : "Connect Database"}</span>
                {dbInfo && (
                  <span className="text-[11px] text-muted-foreground">
                    Connected: {dbInfo.database || dbInfo.host}
                  </span>
                )}
              </div>
              <CommandShortcut>⌘ D</CommandShortcut>
            </CommandItem>

            {dbInfo && (
              <CommandItem onSelect={() => handleNavigate("/Dashboard/chat?prompt=Show%20all%20tables%20and%20row%20counts")}>
                <div className="flex items-center gap-2.5">
                  <Layers className="size-4 text-emerald-600" />
                  <span>Inspect Schema &amp; Row Counts</span>
                </div>
              </CommandItem>
            )}
          </CommandGroup>

          {/* Workspaces Group */}
          <CommandGroup heading="Workspaces">
            {(workspaces || []).map((ws) => (
              <CommandItem
                key={ws.id}
                onSelect={() => handleAction(() => setActiveWorkspaceId(ws.id))}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ws.color || "#3aa363" }}
                  />
                  <span>{ws.name}</span>
                  <span className="text-[11px] text-muted-foreground">({ws.environment})</span>
                </div>
                {ws.id === activeWorkspaceId && <Check className="size-3.5 text-emerald-600" />}
              </CommandItem>
            ))}

            <CommandItem onSelect={() => handleAction(() => setIsWorkspaceModalOpen(true))}>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Plus className="size-4" />
                <span>Create New Workspace</span>
              </div>
            </CommandItem>
          </CommandGroup>

          {/* Tools & Settings */}
          <CommandGroup heading="Tools & Settings">
            {onOpenMetrics && (
              <CommandItem onSelect={() => handleAction(onOpenMetrics)}>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="size-4 text-emerald-600" />
                  <span>Semantic KPI Glossary</span>
                </div>
                <CommandShortcut>⌘ G</CommandShortcut>
              </CommandItem>
            )}

            {onOpenSettings && (
              <CommandItem onSelect={() => handleAction(onOpenSettings)}>
                <div className="flex items-center gap-2.5">
                  <Settings className="size-4 text-emerald-600" />
                  <span>Settings &amp; Engine Preferences</span>
                </div>
                <CommandShortcut>⌘ ,</CommandShortcut>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
