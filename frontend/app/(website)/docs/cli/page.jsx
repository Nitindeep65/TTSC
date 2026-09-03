"use client"

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react"
import Link from "next/link"
import {
  Terminal, LogIn, LogOut, User, Database,
  Copy, Check, Download, Zap, Shield, Key,
  Menu, X, Search, Sparkles, Cpu,
  CheckCircle2, ArrowRight, ArrowLeft,
  ChevronRight, Layers, Table, Compass,
  FileCode, CheckCheck, RefreshCw,
  Sun, Moon, Laptop, AlertTriangle, Info,
  Lock, ShieldAlert, Code2, CornerDownLeft, Command,
  ExternalLink,
} from "lucide-react"
import DocsAiCopilot from "@/components/docs/DocsAiCopilot"

// ─── Organized Navigation Hierarchy (17 Modular Pages Across 6 Chapters) ────
const DOCS_NAV = [
  {
    category: "Getting Started",
    items: [
      { id: "overview",     label: "Overview & Architecture",  icon: Compass, badge: "Core", desc: "Architecture, 3 pillars & PostgreSQL safety layer" },
      { id: "installation", label: "Installation Options",     icon: Download, desc: "cURL 1-liner, UV, pip, and source build" },
      { id: "quickstart",   label: "3-Step Quickstart",        icon: CheckCheck, badge: "2 Min", desc: "Fast onboarding: authenticate, connect & query" },
    ],
  },
  {
    category: "Universal AI Integration",
    items: [
      { id: "setup",        label: "querycraft setup",          icon: Zap, badge: "1-Click", isCommand: true, desc: "Auto-detect and configure Cursor, Claude, Antigravity" },
      { id: "mcp-server",   label: "Claude & Cursor MCP",      icon: Cpu, badge: "6 Tools", desc: "Model Context Protocol JSON-RPC 2.0 stdio server" },
    ],
  },
  {
    category: "Query, Safety & Self-Healing",
    items: [
      { id: "ask",          label: "querycraft ask",            icon: Sparkles, isCommand: true, badge: "Natural Lang", desc: "Compile English to safe SQL with cost evaluation" },
      { id: "check",        label: "querycraft check",          icon: Shield, isCommand: true, badge: "Cost Guard", desc: "Pre-Flight Cost Guard and 3-tier risk scoring" },
      { id: "doctor",       label: "querycraft doctor",         icon: CheckCircle2, isCommand: true, badge: "Self-Heal", desc: "SQL Doctor critic diagnosing PostgreSQL SQLSTATEs" },
      { id: "query",        label: "querycraft query",          icon: Terminal, isCommand: true, desc: "Direct read-only SQL execution with latency timing" },
      { id: "schema",       label: "querycraft schema",         icon: Table, isCommand: true, desc: "Introspect tables, data types, PKs and foreign keys" },
      { id: "connect",      label: "querycraft connect",        icon: Database, isCommand: true, desc: "Connect live PostgreSQL, Supabase, Neon, or RDS" },
    ],
  },
  {
    category: "Authentication & Security",
    items: [
      { id: "auth-login",   label: "querycraft auth login",     icon: LogIn, isCommand: true, desc: "GitHub-style browser OAuth flow on port 9876" },
      { id: "auth-whoami",  label: "querycraft auth whoami",    icon: User, isCommand: true, desc: "Verify active session token and connected workspace" },
      { id: "auth-logout",  label: "querycraft auth logout",    icon: LogOut, isCommand: true, desc: "Clear local credentials from ~/.querycraft/auth.json" },
    ],
  },
  {
    category: "Workspaces & Environments",
    items: [
      { id: "workspaces",   label: "workspaces list",           icon: Layers, isCommand: true, desc: "Manage multi-tenant database workspaces" },
    ],
  },
  {
    category: "Reference & Configuration",
    items: [
      { id: "cheatsheet",   label: "Command Cheat Sheet",       icon: FileCode, badge: "Summary", desc: "Complete reference table of all CLI commands" },
      { id: "env-vars",     label: "Environment Variables",     icon: Key, desc: "Backend URLs, statement timeouts, and auto-limit flags" },
    ],
  },
]

// Flat list for sequential pagination and global lookup
const ALL_PAGES = DOCS_NAV.flatMap(group =>
  group.items.map(item => ({
    ...item,
    category: group.category,
  }))
)

// Quick jumper shortcuts for popular commands
const QUICK_JUMP_CHIPS = [
  { label: "ask", id: "ask", icon: Sparkles },
  { label: "check", id: "check", icon: Shield },
  { label: "doctor", id: "doctor", icon: CheckCircle2 },
  { label: "query", id: "query", icon: Terminal },
  { label: "schema", id: "schema", icon: Table },
  { label: "connect", id: "connect", icon: Database },
  { label: "setup", id: "setup", icon: Zap },
  { label: "cheatsheet", id: "cheatsheet", icon: FileCode },
]

// ─── Table of Contents Anchor Generator ─────────────────────────────────────
function getPageSections(pageId) {
  switch (pageId) {
    case "overview":
      return [
        { id: "overview-intro", label: "Overview" },
        { id: "core-pillars", label: "The 3 Pillars" },
        { id: "quick-demo", label: "Terminal Demo" },
      ]
    case "installation":
      return [
        { id: "install-options", label: "Installation Methods" },
        { id: "verify-install", label: "Verify Setup" },
      ]
    case "quickstart":
      return [
        { id: "step-1", label: "Step 1: Auth Login" },
        { id: "step-2", label: "Step 2: Connect Database" },
        { id: "step-3", label: "Step 3: Query & AI Setup" },
      ]
    case "setup":
    case "mcp-server":
      return [
        { id: "overview-section", label: "Overview" },
        { id: "usage-section", label: "Usage Syntax" },
        { id: "options-section", label: "Options & Flags" },
        { id: "tools-section", label: "MCP Tool Definitions" },
      ]
    default:
      return [
        { id: "overview-section", label: "Overview" },
        { id: "when-to-use", label: "When to Use" },
        { id: "usage-section", label: "Usage Syntax" },
        { id: "options-section", label: "Arguments & Flags" },
        { id: "examples-section", label: "Examples & Output" },
        { id: "safety-section", label: "Safety Rails" },
        { id: "related-section", label: "Related Commands" },
      ]
  }
}

// ─── Precision Copy Button ──────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      className="docs-copy-btn"
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-500" />
          <span className="text-emerald-500 font-semibold">Copied ✓</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

// ─── Terminal / Code Block Component ────────────────────────────────────────
function CodeBlock({ children, title = "terminal", shell = "zsh" }) {
  const raw = (typeof children === "string" ? children : "").trim()
  const lines = raw.split("\n")

  return (
    <div className="docs-code-container my-4">
      <div className="docs-code-header">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
          <span className="ml-2 font-mono text-[11px] font-semibold tracking-wide text-muted-foreground">
            {title} {shell ? `(${shell})` : ""}
          </span>
        </div>
        <CopyButton text={raw} />
      </div>

      <div className="docs-code-body">
        <pre className="m-0 p-4 font-mono text-[12.5px] leading-relaxed overflow-x-auto">
          {lines.map((line, i) => {
            const isComment = line.trim().startsWith("#") || line.trim().startsWith("//") || line.trim().startsWith("--")
            const isPrompt  = line.trim().startsWith("$")
            const isSuccess = line.trim().startsWith("✅") || line.trim().startsWith("✓") || line.trim().startsWith("•")
            const isAlert   = line.trim().startsWith("⚠") || line.trim().startsWith("Risk Level") || line.trim().startsWith("SQLSTATE") || line.trim().startsWith("Pre-Flight Risk")

            let lineClass = "text-slate-300 dark:text-slate-200"
            if (isComment) lineClass = "text-slate-500 dark:text-slate-500 italic"
            else if (isSuccess) lineClass = "text-emerald-400 dark:text-emerald-400 font-medium"
            else if (isAlert) lineClass = "text-amber-400 dark:text-amber-300 font-medium"

            return (
              <div key={i} className={lineClass}>
                {isPrompt ? (
                  <div className="flex items-start">
                    <span className="text-emerald-500 dark:text-emerald-400 select-none mr-2 font-bold">$</span>
                    <span className="text-slate-100 dark:text-slate-50 font-semibold">{line.slice(1).trim()}</span>
                  </div>
                ) : (
                  line || " "
                )}
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}

// ─── Inline Code Tag ────────────────────────────────────────────────────────
function InlineCode({ children }) {
  return (
    <code className="docs-inline-code">
      {children}
    </code>
  )
}

// ─── Callout Block (Tip, Note, Warning, Security) ───────────────────────────
function Callout({ type = "note", title, children }) {
  const configs = {
    tip: {
      border: "border-emerald-500/30 dark:border-emerald-500/30",
      bg: "bg-emerald-500/5 dark:bg-emerald-950/20",
      titleColor: "text-emerald-700 dark:text-emerald-400",
      icon: Sparkles,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    note: {
      border: "border-sky-500/30 dark:border-sky-500/30",
      bg: "bg-sky-500/5 dark:bg-sky-950/20",
      titleColor: "text-sky-700 dark:text-sky-400",
      icon: Info,
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    warning: {
      border: "border-amber-500/30 dark:border-amber-500/30",
      bg: "bg-amber-500/5 dark:bg-amber-950/20",
      titleColor: "text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    security: {
      border: "border-teal-500/30 dark:border-teal-500/30",
      bg: "bg-teal-500/5 dark:bg-teal-950/20",
      titleColor: "text-teal-700 dark:text-teal-400",
      icon: ShieldAlert,
      iconColor: "text-teal-600 dark:text-teal-400",
    },
  }

  const c = configs[type] || configs.note
  const IconComponent = c.icon

  return (
    <div className={`docs-callout my-4 rounded-lg border p-4 ${c.border} ${c.bg}`}>
      <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider mb-1.5">
        <IconComponent size={14} className={c.iconColor} />
        <span className={c.titleColor}>{title || type.toUpperCase()}</span>
      </div>
      <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  )
}

// ─── Command Metadata Row ───────────────────────────────────────────────────
function CommandMeta({ command, category, purpose, safety }) {
  return (
    <div className="docs-command-meta my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border bg-muted/30 border-border">
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Command</div>
        <div className="font-mono text-xs font-semibold text-foreground mt-0.5">{command}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Category</div>
        <div className="text-xs font-medium text-foreground mt-0.5">{category}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Purpose</div>
        <div className="text-xs font-medium text-foreground mt-0.5">{purpose}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Safety Level</div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
          <Shield size={12} />
          <span>{safety || "Read-Only"}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Parameter Table ────────────────────────────────────────────────────────
function ParamTable({ rows }) {
  if (!rows || rows.length === 0) return null
  return (
    <div className="docs-table-wrapper my-4 rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <th className="py-2.5 px-4">Argument / Option</th>
            <th className="py-2.5 px-4">Type</th>
            <th className="py-2.5 px-4">Default</th>
            <th className="py-2.5 px-4">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              <td className="py-3 px-4 font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-sky-600 dark:text-sky-300">
                {r.type}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                {r.default || "—"}
              </td>
              <td className="py-3 px-4 text-xs text-foreground/90 leading-relaxed">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Related Commands Section ───────────────────────────────────────────────
function RelatedCommands({ items, onNavigate }) {
  if (!items || items.length === 0) return null
  return (
    <div className="docs-related-section my-6 pt-6 border-t border-border">
      <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
        Related Commands
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onNavigate(it.id)}
            className="flex flex-col items-start p-3 rounded-lg border border-border bg-card/60 hover:bg-muted/40 hover:border-emerald-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                {it.name}
              </span>
              <ChevronRight size={13} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {it.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Quick Search Modal Component (⌘K / Ctrl+K) ─────────────────────────────
function SearchModal({ isOpen, onClose, onSelect, navGroups }) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  const results = useMemo(() => {
    if (!query.trim()) {
      return ALL_PAGES.slice(0, 10)
    }
    const q = query.toLowerCase()
    return ALL_PAGES.filter(
      p =>
        p.label.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault()
        onSelect(results[selectedIndex].id)
        onClose()
      } else if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex, onSelect, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search CLI commands, chapters, options... (↑↓ to navigate, Esc to close)"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-border/30">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No documentation pages matching &quot;{query}&quot;
            </div>
          ) : (
            results.map((item, i) => {
              const isSelected = i === selectedIndex
              const IconComp = item.icon || Terminal
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComp size={15} className={isSelected ? "text-emerald-500" : "text-muted-foreground"} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-foreground">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {item.desc || item.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-muted-foreground/70">{item.category}</span>
                    <CornerDownLeft size={12} className={isSelected ? "text-emerald-500" : "opacity-0"} />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">QueryCraft CLI v2.0</span>
        </div>
      </div>
    </div>
  )
}

// ─── Theme Switcher Component (Light, Dark, System) ─────────────────────────
function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("system")
    else setTheme("dark")
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs"
      title={`Theme: ${theme} (click to toggle)`}
      aria-label="Toggle light, dark, and system theme"
    >
      {theme === "dark" && <Moon size={14} className="text-emerald-400" />}
      {theme === "light" && <Sun size={14} className="text-amber-500" />}
      {theme === "system" && <Laptop size={14} className="text-sky-400" />}
      <span className="capitalize text-[11px] font-medium hidden sm:inline">{theme}</span>
    </button>
  )
}

// ─── Inner Documentation Engine ─────────────────────────────────────────────
function CLIReferenceInner() {
  const [activePageId, setActivePageId] = useState("overview")
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [sidebarFilter, setSidebarFilter] = useState("")
  const [installTab, setInstallTab] = useState("curl")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("dark")

  // Theme synchronization with HTML document and localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("querycraft-docs-theme") || "dark"
      setTheme(savedTheme)
    } catch {
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (t) => {
      if (t === "dark") {
        root.classList.add("dark")
        root.setAttribute("data-theme", "dark")
      } else if (t === "light") {
        root.classList.remove("dark")
        root.setAttribute("data-theme", "light")
      } else {
        // System preference
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (isDark) {
          root.classList.add("dark")
          root.setAttribute("data-theme", "dark")
        } else {
          root.classList.remove("dark")
          root.setAttribute("data-theme", "light")
        }
      }
    }

    applyTheme(theme)
    try {
      localStorage.setItem("querycraft-docs-theme", theme)
    } catch {}

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") applyTheme("system")
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  // Listen to hash changes for deep linking (e.g. /docs/cli#check)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && ALL_PAGES.some(p => p.id === hash)) {
        setActivePageId(hash)
      }
    }
    handleHash()
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, ArrowLeft, ArrowRight, /)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return

      // ⌘K or Ctrl+K or / opens Search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchModalOpen(prev => !prev)
      } else if (e.key === "/" && !searchModalOpen) {
        e.preventDefault()
        setSearchModalOpen(true)
      } else if (e.key === "ArrowLeft" && !searchModalOpen) {
        const curIdx = ALL_PAGES.findIndex(p => p.id === activePageId)
        if (curIdx > 0) {
          navigateToPage(ALL_PAGES[curIdx - 1].id)
        }
      } else if (e.key === "ArrowRight" && !searchModalOpen) {
        const curIdx = ALL_PAGES.findIndex(p => p.id === activePageId)
        if (curIdx < ALL_PAGES.length - 1) {
          navigateToPage(ALL_PAGES[curIdx + 1].id)
        }
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [activePageId, searchModalOpen])

  // Switch active page cleanly
  const navigateToPage = (id) => {
    setActivePageId(id)
    window.history.replaceState(null, "", `#${id}`)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Calculate current page and pagination
  const currentIndex = ALL_PAGES.findIndex(p => p.id === activePageId)
  const currentPage = ALL_PAGES[currentIndex] || ALL_PAGES[0]
  const prevPage = currentIndex > 0 ? ALL_PAGES[currentIndex - 1] : null
  const nextPage = currentIndex < ALL_PAGES.length - 1 ? ALL_PAGES[currentIndex + 1] : null

  // Sidebar filter
  const filteredNav = useMemo(() => {
    if (!sidebarFilter.trim()) return DOCS_NAV
    const q = sidebarFilter.toLowerCase()
    return DOCS_NAV.map(g => ({
      ...g,
      items: g.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q))
      ),
    })).filter(g => g.items.length > 0)
  }, [sidebarFilter])

  // Contextual sections for the Right Sidebar Table of Contents
  const currentSections = useMemo(() => getPageSections(activePageId), [activePageId])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-800 dark:selection:text-emerald-300 font-sans transition-colors duration-200">
      
      {/* ─── Compact Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Terminal size={15} />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">QueryCraft</span>
          </Link>

          <span className="text-muted-foreground/40 text-xs">/</span>
          <span className="text-xs font-semibold text-muted-foreground truncate">CLI Documentation</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
            v2.0-mvp
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-all"
            title="Search documentation (⌘K)"
          >
            <Search size={13} />
            <span className="hidden md:inline font-sans">Search docs...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground">⌘K</kbd>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Direct Studio Launch Link */}
          <Link
            href="/Dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm shadow-emerald-600/25 transition-all"
          >
            <span>Launch Studio</span>
            <kbd className="text-[9px] bg-black/25 px-1 rounded font-mono font-bold">⌘3</kbd>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label="Toggle documentation navigation"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* ─── 3-Zone Desktop Grid Layout ────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_220px] min-h-[calc(100vh-56px)]">

        {/* ─── ZONE 1: Persistent Left Sidebar Navigation ─────────────────── */}
        <aside className={`docs-sidebar md:block ${mobileMenuOpen ? "block fixed inset-x-0 top-14 bottom-0 z-50 bg-background overflow-y-auto p-4" : "hidden"} border-r border-border p-4 md:sticky md:top-14 md:h-[calc(100vh-56px)] md:overflow-y-auto bg-card/40 md:bg-transparent`}>
          {/* Filter input */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter commands..."
              value={sidebarFilter}
              onChange={e => setSidebarFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background/80 text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Chapter Groups */}
          <nav className="space-y-4">
            {filteredNav.map((group, idx) => (
              <div key={idx}>
                <div className="text-[10.5px] uppercase font-bold tracking-wider text-muted-foreground mb-1.5 px-2">
                  {group.category}
                </div>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isSelected = activePageId === item.id
                    const IconComponent = item.icon || Terminal
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToPage(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border-l-2 border-emerald-500"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-normal"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent size={14} className={isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70"} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ─── ZONE 2: Main Documentation Content (Max ~780px centered) ──── */}
        <main className="min-w-0 px-4 sm:px-8 py-8 max-w-[800px] mx-auto w-full">

          {/* Quick Command Jumper Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-border/60 scrollbar-none">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
              Quick Jump:
            </span>
            {QUICK_JUMP_CHIPS.map(chip => {
              const isSelected = activePageId === chip.id
              const ChipIcon = chip.icon
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => navigateToPage(chip.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono shrink-0 transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/30"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <ChipIcon size={11} />
                  <span>{chip.label}</span>
                </button>
              )
            })}
          </div>

          {/* Subtle Hierarchical Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">QueryCraft</Link>
            <ChevronRight size={11} />
            <span>CLI Docs</span>
            <ChevronRight size={11} />
            <span>{currentPage.category}</span>
            <ChevronRight size={11} />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentPage.label}</span>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MODULAR PAGE RENDERER (17 PAGES)                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* PAGE: OVERVIEW */}
          {activePageId === "overview" && (
            <article className="space-y-6">
              <header id="overview-intro">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Overview &amp; Architecture
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    PostgreSQL Safety Layer
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  The QueryCraft CLI (<InlineCode>querycraft</InlineCode>) is an autonomous developer firewall, Text-to-SQL query engine, and Model Context Protocol (MCP) server for production PostgreSQL databases. It replaces blind guessing with dry-run cost estimation, schema grounding, and self-healing error repair.
                </p>
              </header>

              <div id="core-pillars" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg border border-border bg-card/60 space-y-1.5">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Zero-Hallucination</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Grounds prompts strictly in introspected PostgreSQL schemas, UUID types, and foreign key relationships.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card/60 space-y-1.5">
                  <div className="text-sky-600 dark:text-sky-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Pre-Flight Cost Guard</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dry-runs PostgreSQL EXPLAIN to score query risk (LOW / MED / HIGH) and intercept unindexed sequential scans.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card/60 space-y-1.5">
                  <div className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>SQL Doctor Critic</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Diagnoses PostgreSQL SQLSTATE runtime codes (42703, 42803, 42P01) and self-heals broken queries.
                  </p>
                </div>
              </div>

              <section id="quick-demo">
                <h2 className="text-base font-bold text-foreground mb-2">
                  Interactive Terminal Snapshot
                </h2>
                <CodeBlock title="querycraft ask demo" shell="zsh">
{`$ querycraft ask "show active users by spend"

  🧠 QueryCraft AI  [Workspace: Production | User: nitindeep65@gmail.com]
  Grounding live schema... Evaluating safety with Cost Guard...

  Generated SQL:
  SELECT u.id, u.name, SUM(o.total_amount) AS total_spent
  FROM users u
  JOIN orders o ON u.id = o.user_id
  WHERE u.is_active = TRUE
  GROUP BY u.id, u.name
  ORDER BY total_spent DESC
  LIMIT 50;

  Pre-Flight Risk: [LOW RISK] (Cost: 14.2 | Index Scan)
  Results (5 rows in 11.2ms)`}
                </CodeBlock>
              </section>

              <Callout type="tip" title="Recommended Next Step">
                Ready to set up QueryCraft? Continue to <button onClick={() => navigateToPage("installation")} className="underline font-semibold text-emerald-600 dark:text-emerald-400">Installation Options</button> or run <InlineCode>querycraft setup</InlineCode> for 1-click Cursor/Claude auto-configuration.
              </Callout>
            </article>
          )}

          {/* PAGE: INSTALLATION */}
          {activePageId === "installation" && (
            <article className="space-y-6">
              <header id="install-options">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  Installation Options
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  QueryCraft CLI is distributed as a standalone terminal binary or Python UV tool. Choose your preferred installation method:
                </p>
              </header>

              {/* Tabbed installer selector */}
              <div className="flex gap-2 border-b border-border pb-2">
                {[
                  { id: "curl", label: "cURL 1-Liner (Recommended)" },
                  { id: "uv", label: "Python (UV / Pip)" },
                  { id: "git", label: "Source / Local Git" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInstallTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      installTab === tab.id
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {installTab === "curl" && (
                <CodeBlock title="Universal Shell Installer" shell="bash">
{`# Downloads, builds, and symlinks /usr/local/bin/querycraft
curl -fsSL https://raw.githubusercontent.com/Nitindeep65/TTSC/main/setup-mcp.sh | bash`}
                </CodeBlock>
              )}

              {installTab === "uv" && (
                <CodeBlock title="Python Package Manager" shell="bash">
{`# Install via UV (Fastest)
uv tool install --editable ./backend

# Or install via Pip
pip install -e ./backend`}
                </CodeBlock>
              )}

              {installTab === "git" && (
                <CodeBlock title="Local Git Clone" shell="bash">
{`git clone https://github.com/Nitindeep65/TTSC.git
cd TTSC/backend
uv run querycraft --help`}
                </CodeBlock>
              )}

              <section id="verify-install">
                <h2 className="text-base font-bold text-foreground mb-2">
                  Verify Installation
                </h2>
                <CodeBlock title="Check Version" shell="zsh">
{`$ querycraft --version
querycraft v2.0-mvp

$ querycraft --help
QueryCraft — AI-Powered PostgreSQL Safety & Intelligence Engine`}
                </CodeBlock>
              </section>
            </article>
          )}

          {/* PAGE: QUICKSTART */}
          {activePageId === "quickstart" && (
            <article className="space-y-6">
              <header id="step-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  3-Step Quickstart
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Get up and running with QueryCraft CLI and hook it into your development workflow in under 2 minutes.
                </p>
              </header>

              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-border bg-card/60 flex items-start gap-4">
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">01</span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Log in via Browser OAuth</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Run <InlineCode>querycraft auth login</InlineCode> to link your QueryCraft account in 1 tap via your browser. Credentials are saved locally with <InlineCode>chmod 600</InlineCode>.
                    </p>
                  </div>
                </div>

                <div id="step-2" className="p-4 rounded-lg border border-border bg-card/60 flex items-start gap-4">
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">02</span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Connect your Database</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Run <InlineCode>querycraft connect postgresql://user:pass@host/db</InlineCode> to introspect live tables, column types, and constraints.
                    </p>
                  </div>
                </div>

                <div id="step-3" className="p-4 rounded-lg border border-border bg-card/60 flex items-start gap-4">
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">03</span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Ask Questions or Hook Up AI Editors</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Run <InlineCode>querycraft setup</InlineCode> to auto-configure Claude Desktop and Cursor, or run <InlineCode>querycraft ask &quot;show top customers&quot;</InlineCode> directly in your terminal.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* PAGE: SETUP */}
          {activePageId === "setup" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft setup
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Automatically detects installed AI tools on your system (Claude Desktop, Cursor IDE, Antigravity, and Windsurf) and writes their Model Context Protocol (MCP) server configuration automatically.
                </p>
              </header>

              <CommandMeta
                command="querycraft setup"
                category="AI Integration"
                purpose="1-Click MCP auto-configuration"
                safety="Zero DB Mutation"
              />

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="Run 1-Click AI Configuration" shell="zsh">
{`$ querycraft setup

  🔍 Detecting installed AI assistants & IDEs...
  ✓ Claude Desktop: Configured (~/Library/Application Support/Claude/claude_desktop_config.json)
  ✓ Cursor IDE: Configured (~/.cursor/mcp.json)
  ✓ Antigravity: Configured (~/.gemini/config/mcp_config.json)

  🎉 3 AI tools configured successfully!
  Restart your editor or Claude to start querying databases naturally.`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "--force", type: "flag", default: "false", desc: "Overwrite existing configurations without prompting" },
                  { name: "--target", type: "string", default: "all", desc: "Target specific tool: claude, cursor, antigravity, windsurf" },
                ]} />
              </section>

              <RelatedCommands
                items={[
                  { id: "mcp-server", name: "MCP Server", desc: "Inspect 6 native MCP tools and JSON specs" },
                  { id: "ask", name: "querycraft ask", desc: "Query databases using natural language in terminal" },
                ]}
                onNavigate={navigateToPage}
              />
            </article>
          )}

          {/* PAGE: MCP-SERVER */}
          {activePageId === "mcp-server" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  Claude &amp; Cursor MCP Server
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  QueryCraft acts as a native Model Context Protocol (MCP) server over <InlineCode>stdio</InlineCode> using JSON-RPC 2.0. It gives coding assistants safe, read-only access to PostgreSQL databases without credential leaks.
                </p>
              </header>

              <section id="tools-section">
                <h2 className="text-base font-bold text-foreground mb-2">6 Standardized Native MCP Tools</h2>
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                  {[
                    { tool: "login_querycraft(email, api_key)", desc: "Authenticates user session and binds real database workspaces" },
                    { tool: "list_workspaces()", desc: "Lists all database workspaces with environment tags and live connection status" },
                    { tool: "switch_workspace(workspace_name)", desc: "Switches active database workspace for the current session" },
                    { tool: "evaluate_and_heal_sql(sql_query, ...)", desc: "Pre-Flight Cost Guard analysis, auto-heals joins, executes read-only query safely" },
                    { tool: "inspect_schema([workspace])", desc: "Returns live PostgreSQL tables, columns, data types, PKs and FKs in Markdown table" },
                    { tool: "generate_safe_sql(prompt, ...)", desc: "Converts natural language to safe PostgreSQL SQL with 3-tier risk badge (LOW/MED/HIGH)" },
                  ].map((row, i) => (
                    <div key={i} className="p-3 bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <code className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{row.tool}</code>
                      <span className="text-xs text-muted-foreground sm:max-w-[50%]">{row.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Manual Configuration JSON</h2>
                <CodeBlock title="claude_desktop_config.json / .cursor/mcp.json" shell="json">
{`{
  "mcpServers": {
    "querycraft": {
      "command": "querycraft",
      "args": ["ai", "mcp-stdio"],
      "env": {
        "QUERYCRAFT_BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}`}
                </CodeBlock>
              </section>
            </article>
          )}

          {/* PAGE: ASK */}
          {activePageId === "ask" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft ask &quot;&lt;prompt&gt;&quot;
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Translates plain English questions into safe SQL using Llama 3.1 70B, evaluates compute cost with Pre-Flight Cost Guard, executes safely with LIMIT 50 injection, and displays an aligned ASCII results table.
                </p>
              </header>

              <CommandMeta
                command='querycraft ask "<prompt>"'
                category="Text-to-SQL"
                purpose="Natural language querying"
                safety="Read-Only + LIMIT 50"
              />

              <section id="when-to-use">
                <Callout type="tip" title="When to use this command">
                  Use <InlineCode>querycraft ask</InlineCode> when you need instant database answers in your terminal without writing manual joins or looking up column names. Queries are automatically schema-grounded and checked against Cost Guard before execution.
                </Callout>
              </section>

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="Basic Syntax" shell="bash">
{`querycraft ask "<prompt>" [--workspace <name>] [--json]`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "prompt", type: "string", default: "required", desc: "Natural language question in plain English" },
                  { name: "--workspace", type: "string", default: "active", desc: "Target workspace tier (e.g. Production, Staging)" },
                  { name: "--json", type: "flag", default: "false", desc: "Output raw JSON payload instead of formatted table" },
                ]} />
              </section>

              <section id="examples-section">
                <h2 className="text-base font-bold text-foreground mb-2">Realistic Example &amp; Output</h2>
                <CodeBlock title="Natural Language Query" shell="zsh">
{`$ querycraft ask "show top 3 customers by completed order value"

  🧠 QueryCraft AI  [Workspace: Production | User: nitindeep65@gmail.com]
  Question: show top 3 customers by completed order value
  Thinking, grounding schema, evaluating safety...

  Generated SQL Query:
  SELECT u.name, SUM(o.total_amount) AS total_spent
  FROM users u
  JOIN orders o ON u.id = o.user_id
  WHERE o.status = 'completed'
  GROUP BY u.name
  ORDER BY total_spent DESC
  LIMIT 3;

  Executing query on database...

  Results (3 rows in 14.8ms):

  ┌─────────────────────────────┬───────────────┐
  │ name                        │ total_spent   │
  ├─────────────────────────────┼───────────────┤
  │ Alex Rivera                 │ $48,200.00    │
  │ Sofia Davis                 │ $31,500.00    │
  │ Marcus Vance                │ $19,450.00    │
  └─────────────────────────────┴───────────────┘`}
                </CodeBlock>
              </section>

              <section id="safety-section">
                <Callout type="security" title="Safety Guarantee">
                  Non-aggregating queries are clamped to a safe <InlineCode>LIMIT 50</InlineCode>. Destructive statements (<InlineCode>INSERT</InlineCode>, <InlineCode>UPDATE</InlineCode>, <InlineCode>DROP</InlineCode>) are blocked immediately before dispatch.
                </Callout>
              </section>

              <RelatedCommands
                items={[
                  { id: "check", name: "querycraft check", desc: "Analyze SQL query costs before running" },
                  { id: "query", name: "querycraft query", desc: "Run raw read-only SQL directly" },
                ]}
                onNavigate={navigateToPage}
              />
            </article>
          )}

          {/* PAGE: CHECK (COST GUARD) */}
          {activePageId === "check" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft check &quot;&lt;SQL&gt;&quot;
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Runs Pre-Flight Cost Guard &amp; risk classification on any SQL query using PostgreSQL EXPLAIN. Classifies compute risk into 3 tiers (<InlineCode>LOW</InlineCode>, <InlineCode>MEDIUM</InlineCode>, <InlineCode>HIGH</InlineCode>), detects full sequential table scans, and suggests index creation DDL.
                </p>
              </header>

              <CommandMeta
                command='querycraft check "<SQL>"'
                category="Pre-Flight Cost Guard"
                purpose="AST cost evaluation & scan inspection"
                safety="EXPLAIN Dry-Run (No Data Mutation)"
              />

              <section id="when-to-use">
                <Callout type="tip" title="When to use this command">
                  Run <InlineCode>querycraft check</InlineCode> in CI/CD pipelines, migration scripts, or before dispatching ad-hoc analytics queries on multi-million row production databases. It catches unindexed sequential scans without running mutating queries.
                </Callout>
              </section>

              {/* 3-Tier Risk Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">[LOW RISK]</div>
                  <div className="text-[11.5px] text-muted-foreground mt-1">Cost &lt; 60. Safe index scans, bounded rows.</div>
                </div>
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">[MEDIUM RISK]</div>
                  <div className="text-[11.5px] text-muted-foreground mt-1">Cost 60–300 or Seq Scan on moderate table (&gt;1,000 rows).</div>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">[HIGH RISK]</div>
                  <div className="text-[11.5px] text-muted-foreground mt-1">Cost &gt; 300, unindexed Seq Scan on large table, or Cartesian join.</div>
                </div>
              </div>

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="Cost Guard Syntax" shell="bash">
{`querycraft check "<SQL>" [--threshold <cost>] [--workspace <name>]`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "sql_query", type: "string", default: "required", desc: "Raw SQL query string to evaluate with EXPLAIN" },
                  { name: "--threshold", type: "float", default: "60.0", desc: "Custom maximum compute cost threshold" },
                  { name: "--workspace", type: "string", default: "active", desc: "Target database workspace" },
                ]} />
              </section>

              <section id="examples-section">
                <h2 className="text-base font-bold text-foreground mb-2">Output &amp; Suggested Index DDL</h2>
                <CodeBlock title="Pre-Flight Cost Guard Check" shell="zsh">
{`$ querycraft check "SELECT * FROM orders WHERE total_amount > 100;"

  🛡️ QueryCraft Cost Guard  [User: nitindeep65@gmail.com]
  Query: SELECT * FROM orders WHERE total_amount > 100;
  Analyzing AST, running EXPLAIN cost planner, detecting sequential scans...

  Risk Level: [MEDIUM RISK - REVIEW RECOMMENDED]
  Estimated Cost: 48.8
  Scan Type: Sequential Scan
  Plan Rows: 20
  Action: CLEAN

  Suggested Index DDL:
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);`}
                </CodeBlock>
              </section>

              <section id="safety-section">
                <Callout type="security" title="Separation of Concerns">
                  QueryCraft never replaces your DML/SELECT queries with DDL. Index suggestions are displayed as targeted copyable advice without altering the original query.
                </Callout>
              </section>

              <RelatedCommands
                items={[
                  { id: "doctor", name: "querycraft doctor", desc: "Diagnose and auto-heal runtime query errors" },
                  { id: "query", name: "querycraft query", desc: "Execute raw read-only queries with timing" },
                ]}
                onNavigate={navigateToPage}
              />
            </article>
          )}

          {/* PAGE: DOCTOR */}
          {activePageId === "doctor" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft doctor &quot;&lt;error/SQL&gt;&quot;
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  PostgreSQL SQL Doctor &amp; Self-Healing Critic Agent. Evaluates runtime SQLSTATE error codes (<InlineCode>42703</InlineCode>, <InlineCode>42P01</InlineCode>, <InlineCode>22P02</InlineCode>, <InlineCode>42803</InlineCode>, <InlineCode>42601</InlineCode>), matches introspected schemas, and outputs a verified repaired query.
                </p>
              </header>

              <CommandMeta
                command='querycraft doctor "<error/SQL>"'
                category="Self-Healing Critic"
                purpose="SQLSTATE error diagnosis & auto-repair"
                safety="Read-Only Schema Verification"
              />

              <section id="when-to-use">
                <Callout type="tip" title="When to use this command">
                  Use <InlineCode>querycraft doctor</InlineCode> whenever a query fails with a cryptic PostgreSQL error like <InlineCode>column does not exist</InlineCode> or <InlineCode>must appear in the GROUP BY clause</InlineCode>. The Critic agent maps your actual schema and fixes the syntax automatically.
                </Callout>
              </section>

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="SQL Doctor Syntax" shell="bash">
{`querycraft doctor "<error_message_or_sql>" [--workspace <name>]`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "error_or_sql", type: "string", default: "required", desc: "PostgreSQL error message, SQLSTATE code, or failing SQL query" },
                  { name: "--workspace", type: "string", default: "active", desc: "Database workspace to introspect schema for healing" },
                ]} />
              </section>

              <section id="examples-section">
                <h2 className="text-base font-bold text-foreground mb-2">Self-Healing Diagnosis Example</h2>
                <CodeBlock title="SQL Doctor Auto-Healing" shell="zsh">
{`$ querycraft doctor "column users.full_name does not exist"

  🩺 QueryCraft SQL Doctor
  Input: column users.full_name does not exist
  Diagnosing SQLSTATE error code, mapping schema, generating verified repair...

  Status: Diagnosed
  SQLSTATE Code: 42703 (undefined_column)
  Root Cause: Users table defines 'name' rather than 'full_name'.
  Affected Entities: users, full_name

  Healed SQL Query:
  SELECT id, name, email FROM users WHERE is_active = TRUE LIMIT 50;

  ℹ The query was diagnosed and repaired to match the live schema.`}
                </CodeBlock>
              </section>

              <RelatedCommands
                items={[
                  { id: "check", name: "querycraft check", desc: "Pre-Flight Cost Guard analysis" },
                  { id: "schema", name: "querycraft schema", desc: "Inspect valid table column definitions" },
                ]}
                onNavigate={navigateToPage}
              />
            </article>
          )}

          {/* PAGE: QUERY */}
          {activePageId === "query" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft query &quot;&lt;SQL&gt;&quot;
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Executes raw read-only SQL queries directly against your connected database with latency measurement and clean ASCII table rendering.
                </p>
              </header>

              <CommandMeta
                command='querycraft query "<SQL>"'
                category="Execution"
                purpose="Direct raw SQL runner"
                safety="Enforced Read-Only (8000ms Timeout)"
              />

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="Query Syntax" shell="bash">
{`querycraft query "<SQL>" [--workspace <name>] [--json]`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "sql", type: "string", default: "required", desc: "Read-only SQL query (SELECT, WITH only)" },
                  { name: "--workspace", type: "string", default: "active", desc: "Workspace to execute query on" },
                  { name: "--json", type: "flag", default: "false", desc: "Return results formatted as raw JSON array" },
                ]} />
              </section>

              <section id="examples-section">
                <h2 className="text-base font-bold text-foreground mb-2">Execution Example</h2>
                <CodeBlock title="Raw SQL Query" shell="zsh">
{`$ querycraft query "SELECT id, name, email FROM users LIMIT 3;"

  ⚡ QueryCraft SQL Execution  [Workspace: Production]
  Executing: SELECT id, name, email FROM users LIMIT 3;

  Results (3 rows in 9.8ms):

  ┌──────────────────────────────────┬───────────────┬─────────────────────────────┐
  │ id                               │ name          │ email                       │
  ├──────────────────────────────────┼───────────────┼─────────────────────────────┤
  │ e1a9b2c3-4d5e-6f7a-8b9c-0d1e2f.. │ Alex Rivera   │ alex.rivera@enterprise.com  │
  │ f2b0c3d4-5e6f-7a8b-9c0d-1e2f3a.. │ Sofia Davis   │ sofia.davis@cloudscale.io   │
  │ a3c1d4e5-6f7a-8b9c-0d1e-2f3a4b.. │ Marcus Vance  │ marcus.vance@fintech.co     │
  └──────────────────────────────────┴───────────────┴─────────────────────────────┘`}
                </CodeBlock>
              </section>
            </article>
          )}

          {/* PAGE: SCHEMA */}
          {activePageId === "schema" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft schema
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Introspects tables, column data types, Primary Keys <InlineCode>[PK]</InlineCode>, and Foreign Key relations <InlineCode>[FK]</InlineCode> directly from the database Information Schema.
                </p>
              </header>

              <CommandMeta
                command="querycraft schema"
                category="Introspection"
                purpose="Catalog exploration & type mapping"
                safety="Read-Only Information Schema"
              />

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="Schema Syntax" shell="bash">
{`querycraft schema [--table <name>] [--workspace <name>]`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "--table", type: "string", default: "all", desc: "Inspect specific table only" },
                  { name: "--workspace", type: "string", default: "active", desc: "Target database workspace" },
                ]} />
              </section>

              <section id="examples-section">
                <h2 className="text-base font-bold text-foreground mb-2">Introspection Output</h2>
                <CodeBlock title="Introspect Schema" shell="zsh">
{`$ querycraft schema

  📋 Introspecting Database Schema...  [User: nitindeep65@gmail.com]

  Database Type: Cloud PostgreSQL (Supabase / Neon / AWS RDS)
  Total Tables: 5

  • users  (8 columns) — Registered user accounts and credentials
    └─ id: UUID [PK]
    └─ email: VARCHAR(255)
    └─ name: VARCHAR(100)
    └─ role: VARCHAR(50)
    └─ is_active: BOOLEAN

  • orders  (7 columns) — Customer transactions and purchase orders
    └─ id: UUID [PK]
    └─ user_id: UUID [FK]
    └─ total_amount: NUMERIC(12,2)
    └─ status: VARCHAR(50)`}
                </CodeBlock>
              </section>
            </article>
          )}

          {/* PAGE: CONNECT */}
          {activePageId === "connect" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft connect &lt;URI&gt;
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Links a live PostgreSQL, Supabase, Neon, AWS RDS, or CockroachDB database connection string to your active workspace with automatic password encoding.
                </p>
              </header>

              <CommandMeta
                command="querycraft connect <URI>"
                category="Connectivity"
                purpose="Database workspace linking"
                safety="Connection validation & SSL test"
              />

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Syntax</h2>
                <CodeBlock title="Connect Syntax" shell="bash">
{`querycraft connect postgresql://user:password@host:5432/dbname [--workspace <name>]`}
                </CodeBlock>
              </section>

              <section id="options-section">
                <h2 className="text-base font-bold text-foreground mb-2">Arguments &amp; Flags</h2>
                <ParamTable rows={[
                  { name: "uri", type: "string", default: "required", desc: "Full database connection string (postgresql://...)" },
                  { name: "--workspace", type: "string", default: "Production", desc: "Target workspace tier (Production, Staging, Analytics)" },
                ]} />
              </section>

              <section id="examples-section">
                <h2 className="text-base font-bold text-foreground mb-2">Connection Output</h2>
                <CodeBlock title="Connect Live Database" shell="zsh">
{`$ querycraft connect postgresql://postgres:pass@db.supabase.co:5432/postgres --workspace Production

  🔌 Connecting Database...
  Target Workspace: Production
  Testing connection and introspecting schema...

  ✓ Database Connected Successfully!
  Host: db.supabase.co  │  Database: postgres
  Introspected: 12 tables`}
                </CodeBlock>
              </section>
            </article>
          )}

          {/* PAGE: AUTH-LOGIN */}
          {activePageId === "auth-login" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft auth login
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  GitHub CLI-style (<InlineCode>gh auth login</InlineCode>) browser OAuth authentication. Spawns a local listener on port 9876, handles the token handshake, and stores credentials in <InlineCode>~/.querycraft/auth.json</InlineCode> with 600 file permissions.
                </p>
              </header>

              <CommandMeta
                command="querycraft auth login"
                category="Security"
                purpose="Browser OAuth Handshake"
                safety="chmod 600 token storage"
              />

              <section id="usage-section">
                <h2 className="text-base font-bold text-foreground mb-2">Usage Example</h2>
                <CodeBlock title="Browser OAuth Login" shell="zsh">
{`$ querycraft auth login

  🔑 Opening browser for authentication...
  Waiting for authentication on http://localhost:9876/callback...

  ✅ Logged in as: nitindeep65@gmail.com
  Session token saved to ~/.querycraft/auth.json (valid for 30 days)`}
                </CodeBlock>
              </section>

              <ParamTable rows={[
                { name: "--force", type: "flag", default: "false", desc: "Re-authenticate even if an active session already exists" },
              ]} />
            </article>
          )}

          {/* PAGE: AUTH-WHOAMI */}
          {activePageId === "auth-whoami" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft auth whoami
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Verifies your current authenticated session token, user email, expiration timestamp, and active backend endpoint.
                </p>
              </header>

              <CodeBlock title="Check Identity" shell="zsh">
{`$ querycraft auth whoami

  ✅ Logged in as: nitindeep65@gmail.com
  Session created: 2026-08-31  |  Expires: 2026-09-30
  Backend: http://localhost:8000`}
              </CodeBlock>
            </article>
          )}

          {/* PAGE: AUTH-LOGOUT */}
          {activePageId === "auth-logout" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft auth logout
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Clears and deletes stored session credentials from <InlineCode>~/.querycraft/auth.json</InlineCode>.
                </p>
              </header>

              <CodeBlock title="Logout" shell="zsh">
{`$ querycraft auth logout

  👋 Logged out successfully. Stored credentials removed.`}
              </CodeBlock>
            </article>
          )}

          {/* PAGE: WORKSPACES */}
          {activePageId === "workspaces" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  querycraft workspaces list
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Lists all database workspaces configured for your user account, showing database engine, environment tier, and active connection status.
                </p>
              </header>

              <CodeBlock title="List Workspaces" shell="zsh">
{`$ querycraft workspaces list

  📁 Workspaces for nitindeep65@gmail.com (2 total):

  • Production (ws-default)  [ACTIVE]
    Engine: postgres  │  Environment: Production  │  Connected: Yes

  • Staging (ws-staging)
    Engine: postgres  │  Environment: Staging     │  Connected: Yes`}
              </CodeBlock>
            </article>
          )}

          {/* PAGE: CHEATSHEET */}
          {activePageId === "cheatsheet" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  Command Cheat Sheet
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  A concise reference card of all QueryCraft CLI commands and their primary roles:
                </p>
              </header>

              <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                {[
                  { cmd: "querycraft setup", desc: "1-Click auto-configure Claude Desktop, Cursor & Antigravity" },
                  { cmd: "querycraft ask \"<prompt>\"", desc: "Natural language English to safe SQL with live table results" },
                  { cmd: "querycraft check \"<SQL>\"", desc: "Pre-Flight Cost Guard & 3-tier risk analysis (LOW/MED/HIGH)" },
                  { cmd: "querycraft doctor \"<error/SQL>\"", desc: "SQL Doctor self-healing agent & error code diagnosis" },
                  { cmd: "querycraft query \"<SQL>\"", desc: "Execute raw read-only SQL directly with latency timing" },
                  { cmd: "querycraft schema", desc: "Introspect tables, data types, primary keys, and foreign keys" },
                  { cmd: "querycraft connect <URI>", desc: "Connect live PostgreSQL (Supabase, Neon, AWS RDS, CockroachDB)" },
                  { cmd: "querycraft auth login", desc: "GitHub-style browser OAuth login on port 9876" },
                  { cmd: "querycraft auth whoami", desc: "Check current logged-in identity and session status" },
                  { cmd: "querycraft auth logout", desc: "Clear stored credentials and session tokens" },
                  { cmd: "querycraft workspaces list", desc: "List all database workspaces configured for your user" },
                ].map((row, i) => (
                  <div key={i} className="p-3 bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors">
                    <code className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{row.cmd}</code>
                    <span className="text-xs text-muted-foreground">{row.desc}</span>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* PAGE: ENV-VARS */}
          {activePageId === "env-vars" && (
            <article className="space-y-6">
              <header id="overview-section">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  Environment Variables
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Configure backend endpoints and runtime safety parameters in your shell or CI/CD pipelines:
                </p>
              </header>

              <ParamTable rows={[
                { name: "QUERYCRAFT_BACKEND_URL", type: "string", default: "http://localhost:8000", desc: "FastAPI microservice backend base URL" },
                { name: "QUERYCRAFT_FRONTEND_URL", type: "string", default: "http://localhost:3000", desc: "Next.js Web Studio and OAuth receiver base URL" },
                { name: "POSTGRES_URL", type: "string", default: "—", desc: "Optional direct PostgreSQL connection string fallback" },
                { name: "READ_ONLY_ENFORCED", type: "boolean", default: "true", desc: "Strictly block destructive DDL/DML mutations" },
                { name: "AUTO_LIMIT", type: "number", default: "50", desc: "Default row limit injected if none specified in prompt" },
              ]} />
            </article>
          )}

          {/* ─── Compact Previous / Next Navigation Footer ──────────────── */}
          <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
            {prevPage ? (
              <button
                type="button"
                onClick={() => navigateToPage(prevPage.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card/60 hover:bg-muted hover:border-emerald-500/40 text-xs font-medium text-foreground transition-all group"
              >
                <ArrowLeft size={13} className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Previous</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{prevPage.label}</div>
                </div>
              </button>
            ) : <div />}

            {nextPage ? (
              <button
                type="button"
                onClick={() => navigateToPage(nextPage.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card/60 hover:bg-muted hover:border-emerald-500/40 text-xs font-medium text-foreground transition-all group"
              >
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Next</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{nextPage.label}</div>
                </div>
                <ArrowRight size={13} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateToPage("overview")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-all"
              >
                <span>Back to Overview</span>
                <RefreshCw size={12} />
              </button>
            )}
          </footer>

        </main>

        {/* ─── ZONE 3: Right Sidebar ("On This Page" Table of Contents) ───── */}
        <aside className="hidden lg:block border-l border-border p-5 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto text-xs bg-card/20">
          <div className="font-bold text-[10.5px] uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Code2 size={12} className="text-emerald-500" />
            <span>On This Page</span>
          </div>

          <nav className="space-y-1.5">
            {currentSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block py-1 px-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors truncate"
              >
                {sec.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-border space-y-3">
            <div className="text-[10.5px] uppercase font-bold tracking-wider text-muted-foreground">
              Community &amp; Code
            </div>
            <a
              href="https://github.com/Nitindeep65/TTSC"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              <ExternalLink size={12} />
              <span>GitHub Repository</span>
            </a>
            <Link
              href="/Dashboard/chat"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-emerald-500 transition-colors text-xs"
            >
              <Sparkles size={12} />
              <span>SQL Doctor Chat</span>
            </Link>
            <Link
              href="/Dashboard/guard"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-emerald-500 transition-colors text-xs"
            >
              <Shield size={12} />
              <span>Cost Guard Studio</span>
            </Link>
          </div>
        </aside>

      </div>

      {/* Global Search Modal (⌘K / Ctrl+K) */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelect={navigateToPage}
        navGroups={DOCS_NAV}
      />

      {/* Floating Grounded Craft AI Docs Copilot Widget */}
      <DocsAiCopilot />

      {/* Embedded Modern Styling for Code Blocks, Tables, and Scrollbars */}
      <style jsx global>{`
        .docs-code-container {
          border-radius: 8px;
          border: 1px solid var(--border);
          overflow: hidden;
          background-color: #0b101b;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        :root[data-theme="light"] .docs-code-container {
          background-color: #0f172a;
          border-color: #cbd5e1;
        }
        .docs-code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        :root[data-theme="light"] .docs-code-header {
          background: rgba(0, 0, 0, 0.25);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        .docs-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .docs-copy-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .docs-inline-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.88em;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 5px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .dark .docs-inline-code {
          color: #34d399;
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

// ─── Exported Default Page Wrapper with React Suspense ──────────────────────
export default function CLIReferencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center font-sans text-xs">
        Loading QueryCraft CLI documentation...
      </div>
    }>
      <CLIReferenceInner />
    </Suspense>
  )
}
