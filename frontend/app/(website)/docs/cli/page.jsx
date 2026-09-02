"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Terminal, LogIn, LogOut, User, Database,
  Copy, Check, Download, Zap, Shield, Key,
  BookOpen, Menu, X, Search, Sparkles, Cpu,
  CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Hash,
  ChevronRight, Layers, Table, Play, Compass,
  Sliders, FileCode, CheckCheck, RefreshCw, AlertTriangle
} from "lucide-react"
import DocsAiCopilot from "@/components/docs/DocsAiCopilot"

// ─── Precision Copy Button ──────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      className="docs-copy-btn"
      style={{
        position: "absolute", top: 10, right: 10,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 6, padding: "4px 8px", cursor: "pointer",
        color: copied ? "#34d399" : "#94a3b8",
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 11, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        transition: "all 0.15s ease",
        backdropFilter: "blur(4px)",
        zIndex: 10,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)"
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"
        e.currentTarget.style.color = "#fff"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)"
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
        e.currentTarget.style.color = copied ? "#34d399" : "#94a3b8"
      }}
    >
      {copied ? (
        <>
          <Check size={12} style={{ color: "#34d399" }} />
          <span>Copied!</span>
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

// ─── Studio Code Block ──────────────────────────────────────────────────────
function CodeBlock({ children, title = "terminal", shell = "zsh" }) {
  const raw = children.trim()
  const lines = raw.split("\n")

  return (
    <div style={{ margin: "16px 0 20px", position: "relative" }}>
      <div style={{
        background: "#080d1a",
        borderRadius: 10,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.35)",
      }}>
        {/* Titlebar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: "rgba(255, 255, 255, 0.02)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", opacity: 0.6 }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#eab308", opacity: 0.6 }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", opacity: 0.6 }} />
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {title} {shell ? `(${shell})` : ""}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ position: "relative" }}>
          <CopyButton text={raw} />
          <pre style={{
            margin: 0,
            padding: "16px 18px",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 12.5,
            lineHeight: 1.65,
            overflowX: "auto",
            color: "#cbd5e1",
          }}>
            {lines.map((line, i) => {
              const isComment = line.trim().startsWith("#") || line.trim().startsWith("//") || line.trim().startsWith("--")
              const isPrompt  = line.trim().startsWith("$")
              const isSuccess = line.trim().startsWith("✅") || line.trim().startsWith("✓") || line.trim().startsWith("•")
              const isAlert   = line.trim().startsWith("⚠") || line.trim().startsWith("Risk Level") || line.trim().startsWith("SQLSTATE")

              let color = "#e2e8f0"
              if (isComment) color = "#64748b"
              else if (isSuccess) color = "#34d399"
              else if (isAlert) color = "#f59e0b"

              return (
                <div key={i} style={{ color }}>
                  {isPrompt ? (
                    <>
                      <span style={{ color: "#10b981", userSelect: "none", marginRight: 8, fontWeight: 700 }}>$</span>
                      <span style={{ color: "#f8fafc", fontWeight: 600 }}>{line.slice(1).trim()}</span>
                    </>
                  ) : (
                    line
                  )}
                </div>
              )
            })}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── Inline Code Tag ────────────────────────────────────────────────────────
function InlineCode({ children }) {
  return (
    <code style={{
      background: "rgba(16, 185, 129, 0.08)",
      border: "1px solid rgba(16, 185, 129, 0.2)",
      borderRadius: 5,
      padding: "2px 6px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.88em",
      color: "#34d399",
      fontWeight: 500,
    }}>
      {children}
    </code>
  )
}

// ─── Parameter Table ────────────────────────────────────────────────────────
function ParamTable({ rows }) {
  return (
    <div style={{
      margin: "16px 0 20px",
      borderRadius: 10,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(255, 255, 255, 0.015)",
      overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <th style={{ padding: "9px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Argument / Flag</th>
            <th style={{ padding: "9px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Type</th>
            <th style={{ padding: "9px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Default</th>
            <th style={{ padding: "9px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none" }}>
              <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#34d399", fontWeight: 600, fontSize: 12 }}>
                {r.name}
              </td>
              <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#a5b4fc", fontSize: 11.5 }}>
                {r.type}
              </td>
              <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", fontSize: 11.5 }}>
                {r.default || "—"}
              </td>
              <td style={{ padding: "10px 14px", color: "#cbd5e1", fontSize: 12.5, lineHeight: 1.5 }}>
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Organized Navigation Hierarchy ─────────────────────────────────────────
const DOCS_NAV = [
  {
    category: "Getting Started",
    items: [
      { id: "overview",     label: "Overview & Architecture",  icon: Compass, badge: "Core" },
      { id: "installation", label: "Installation Options",     icon: Download },
      { id: "quickstart",   label: "3-Step Quickstart",        icon: CheckCheck },
    ],
  },
  {
    category: "Universal AI Integration",
    items: [
      { id: "setup",        label: "querycraft setup",          icon: Zap, badge: "1-Click" },
      { id: "mcp-server",   label: "Claude & Cursor MCP",      icon: Cpu, badge: "6 Tools" },
    ],
  },
  {
    category: "Query, Safety & Self-Healing",
    items: [
      { id: "ask",          label: "querycraft ask",            icon: Sparkles, isCommand: true },
      { id: "check",        label: "querycraft check",          icon: Shield, isCommand: true, badge: "Cost Guard" },
      { id: "doctor",       label: "querycraft doctor",         icon: CheckCircle2, isCommand: true, badge: "Self-Heal" },
      { id: "query",        label: "querycraft query",          icon: Terminal, isCommand: true },
      { id: "schema",       label: "querycraft schema",         icon: Table, isCommand: true },
      { id: "connect",      label: "querycraft connect",        icon: Database, isCommand: true },
    ],
  },
  {
    category: "Authentication & Security",
    items: [
      { id: "auth-login",   label: "querycraft auth login",     icon: LogIn, isCommand: true },
      { id: "auth-whoami",  label: "querycraft auth whoami",    icon: User, isCommand: true },
      { id: "auth-logout",  label: "querycraft auth logout",    icon: LogOut, isCommand: true },
    ],
  },
  {
    category: "Workspaces & Environments",
    items: [
      { id: "workspaces",   label: "workspaces list",           icon: Layers, isCommand: true },
    ],
  },
  {
    category: "Reference & Config",
    items: [
      { id: "cheatsheet",   label: "Command Cheat Sheet",       icon: FileCode, badge: "Summary" },
      { id: "env-vars",     label: "Environment Variables",     icon: Key },
    ],
  },
]

// Flat list for sequential pagination
const ALL_PAGES = DOCS_NAV.flatMap(group =>
  group.items.map(item => ({
    ...item,
    category: group.category,
  }))
)

// Quick jumper shortcuts for popular pages
const QUICK_JUMP_CHIPS = [
  { label: "🧭 Overview", id: "overview" },
  { label: "📦 Install", id: "installation" },
  { label: "⚡ 1-Click Setup", id: "setup" },
  { label: "🧠 ask", id: "ask" },
  { label: "🛡️ check (Cost Guard)", id: "check" },
  { label: "🩺 doctor (Self-Heal)", id: "doctor" },
  { label: "💻 query", id: "query" },
  { label: "🔌 connect", id: "connect" },
  { label: "📋 Cheatsheet", id: "cheatsheet" },
]

function CLIReferenceInner() {
  const [activePageId, setActivePageId] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [installTab, setInstallTab] = useState("curl")
  const [mobileMenu, setMobileMenu] = useState(false)

  // Listen to hash changes for direct linking (e.g. /docs/cli#check)
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

  // Switch active page
  const navigateToPage = (id) => {
    setActivePageId(id)
    window.history.replaceState(null, "", `#${id}`)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Calculate current page and pagination
  const currentIndex = ALL_PAGES.findIndex(p => p.id === activePageId)
  const currentPage = ALL_PAGES[currentIndex] || ALL_PAGES[0]
  const prevPage = currentIndex > 0 ? ALL_PAGES[currentIndex - 1] : null
  const nextPage = currentIndex < ALL_PAGES.length - 1 ? ALL_PAGES[currentIndex + 1] : null

  // Filtered navigation list
  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_NAV
    const q = searchQuery.toLowerCase()
    return DOCS_NAV.map(g => ({
      ...g,
      items: g.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      ),
    })).filter(g => g.items.length > 0)
  }, [searchQuery])

  return (
    <div style={{
      minHeight: "100vh",
      background: "#040711",
      color: "#e2e8f0",
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    }}>

      {/* ── Top Fixed Navigation Bar ───────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: 60,
        background: "rgba(4, 7, 17, 0.88)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #10b981, #047857)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.35)",
            }}>
              <Terminal size={17} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
              QueryCraft
            </span>
          </Link>

          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>CLI &amp; MCP Documentation</span>

          <span style={{
            fontSize: 10.5, fontWeight: 700,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            padding: "2px 8px", borderRadius: 20,
            marginLeft: 4,
          }}>
            v2.0-mvp
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/"
            style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
          >
            Homepage
          </Link>
          <Link
            href="/Dashboard/chat"
            style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
          >
            SQL Doctor &amp; Chat
          </Link>
          <Link
            href="/Dashboard"
            style={{
              fontSize: 13, fontWeight: 600,
              color: "#fff", textDecoration: "none",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: 8, padding: "6px 14px",
            }}
          >
            Launch Web Studio
          </Link>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            style={{
              display: "none", background: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6, padding: 6, color: "#fff", cursor: "pointer",
            }}
            className="docs-mobile-btn"
          >
            {mobileMenu ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* ── Main Layout Grid ────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1380,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        minHeight: "calc(100vh - 60px)",
      }} className="docs-layout-grid">

        {/* ── Sticky Sidebar ───────────────────────────────────────── */}
        <aside style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.07)",
          position: "sticky",
          top: 60,
          height: "calc(100vh - 60px)",
          overflowY: "auto",
          padding: "20px 16px 40px",
          background: "#040711",
        }} className={`docs-sidebar-nav ${mobileMenu ? "open" : ""}`}>

          {/* Search Filter */}
          <div style={{ position: "relative", marginBottom: 18 }}>
            <Search size={13} color="#64748b" style={{ position: "absolute", left: 10, top: 9 }} />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 8,
                padding: "6px 12px 6px 30px",
                fontSize: 12,
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          {/* Navigation Category Groups */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredNav.map((group, idx) => (
              <div key={idx}>
                <div style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  marginBottom: 6,
                  paddingLeft: 8,
                }}>
                  {group.category}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isSelected = activePageId === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToPage(item.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: 7,
                          cursor: "pointer",
                          background: isSelected ? "rgba(16, 185, 129, 0.12)" : "transparent",
                          border: isSelected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                          color: isSelected ? "#34d399" : "#94a3b8",
                          fontSize: 12.5,
                          fontWeight: isSelected ? 600 : 400,
                          transition: "all 0.12s ease",
                          fontFamily: item.isCommand ? "'JetBrains Mono', monospace" : "inherit",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"
                            e.currentTarget.style.color = "#fff"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "transparent"
                            e.currentTarget.style.color = "#94a3b8"
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <Icon size={14} style={{ color: isSelected ? "#34d399" : "#64748b", flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.label}
                          </span>
                        </div>
                        {item.badge && (
                          <span style={{
                            fontSize: 9, fontWeight: 700,
                            background: isSelected ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.06)",
                            color: isSelected ? "#34d399" : "#64748b",
                            padding: "1px 5px",
                            borderRadius: 4,
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main Content Area (PAGE-WISE VIEW) ────────────────────── */}
        <main style={{
          padding: "36px 48px 80px",
          maxWidth: 960,
          minWidth: 0,
        }} className="docs-main-content">

          {/* Quick Jumper Pills Bar */}
          <div style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 14,
            marginBottom: 28,
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            {QUICK_JUMP_CHIPS.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => navigateToPage(chip.id)}
                style={{
                  background: activePageId === chip.id ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  border: activePageId === chip.id ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 11.5,
                  fontWeight: activePageId === chip.id ? 600 : 500,
                  color: activePageId === chip.id ? "#34d399" : "#94a3b8",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => {
                  if (activePageId !== chip.id) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                    e.currentTarget.style.color = "#fff"
                  }
                }}
                onMouseLeave={e => {
                  if (activePageId !== chip.id) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                    e.currentTarget.style.color = "#94a3b8"
                  }
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Breadcrumb Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#64748b",
            marginBottom: 16,
          }}>
            <span>Docs</span>
            <ChevronRight size={12} />
            <span style={{ color: "#94a3b8" }}>{currentPage.category}</span>
            <ChevronRight size={12} />
            <span style={{ color: "#34d399", fontWeight: 600 }}>{currentPage.label}</span>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PAGE ROUTER                                                 */}
          {/* ═══════════════════════════════════════════════════════════ */}

          {/* PAGE: OVERVIEW */}
          {activePageId === "overview" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  Overview &amp; Architecture
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  PostgreSQL Safety Layer
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>
                The QueryCraft CLI (<InlineCode>querycraft</InlineCode>) is a terminal-native PostgreSQL safety firewall, query runner, and Model Context Protocol (MCP) server. It prevents hallucinations, intercepts expensive full table scans before execution, and auto-heals SQLSTATE errors.
              </p>

              {/* 3 Core Pillars */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, margin: "24px 0" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                  <div style={{ color: "#34d399", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🧠 Zero-Hallucination</div>
                  <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Grounds prompts strictly in live introspected PostgreSQL schemas, UUID types, and foreign keys.</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                  <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🛡️ Pre-Flight Cost Guard</div>
                  <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Dry-runs PostgreSQL EXPLAIN (FORMAT JSON, COSTS TRUE) to score 3-tier risk (LOW/MED/HIGH).</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🩺 SQL Doctor Critic</div>
                  <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Diagnoses runtime SQLSTATE errors (42703, 42803, 42P01) and self-heals queries automatically.</div>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 32, marginBottom: 12 }}>
                Quick Terminal Example
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
            </div>
          )}

          {/* PAGE: INSTALLATION */}
          {activePageId === "installation" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  Installation Options
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Universal Installer
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                QueryCraft CLI is distributed as a standalone binary or Python tool. Choose your preferred installation method:
              </p>

              {/* Tabbed installer selector */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[
                  { id: "curl", label: "cURL 1-Liner (Recommended)" },
                  { id: "uv", label: "Python (UV / Pip)" },
                  { id: "git", label: "Source / Local Git" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInstallTab(tab.id)}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: installTab === tab.id ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                      border: installTab === tab.id ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      color: installTab === tab.id ? "#34d399" : "#94a3b8",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
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

              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 28, marginBottom: 12 }}>
                Verify Installation
              </h2>
              <CodeBlock title="Check Version" shell="zsh">
{`$ querycraft --version
querycraft v2.0-mvp

$ querycraft --help
QueryCraft — AI-Powered PostgreSQL Safety & Intelligence Engine`}
              </CodeBlock>
            </div>
          )}

          {/* PAGE: QUICKSTART */}
          {activePageId === "quickstart" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  3-Step Quickstart
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Under 2 Minutes
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>
                Get up and running with QueryCraft CLI and hook it into your development workflow in three quick steps.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px", display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>01</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Log in via Browser OAuth</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                      Run <InlineCode>querycraft auth login</InlineCode> to link your QueryCraft account in 1 tap via your browser.
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px", display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>02</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Connect your Database (or use Demo Sandbox)</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                      Run <InlineCode>querycraft connect postgresql://user:pass@host/db</InlineCode> to introspect live tables and constraints.
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px", display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>03</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Ask Questions or 1-Click Configure Cursor / Claude</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                      Run <InlineCode>querycraft setup</InlineCode> to connect AI coding editors, or run <InlineCode>querycraft ask &quot;show top customers&quot;</InlineCode>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE: SETUP */}
          {activePageId === "setup" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft setup
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  1-Click Auto Config
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Automatically detects installed AI tools on your system (<strong style={{ color: "#fff" }}>Claude Desktop</strong>, <strong style={{ color: "#fff" }}>Cursor IDE</strong>, <strong style={{ color: "#fff" }}>Antigravity</strong>, and <strong style={{ color: "#fff" }}>Windsurf</strong>) and configures their Model Context Protocol (MCP) server configuration in 1 millisecond.
              </p>

              <CodeBlock title="Run 1-Click AI Configuration" shell="zsh">
{`$ querycraft setup

  🔍 Detecting installed AI assistants & IDEs...
  ✓ Claude Desktop: Configured (~/Library/Application Support/Claude/claude_desktop_config.json)
  ✓ Cursor IDE: Configured (~/.cursor/mcp.json)
  ✓ Antigravity: Configured (~/.gemini/config/mcp_config.json)

  🎉 3 AI tools configured successfully!
  Restart your editor or Claude to start querying databases naturally.`}
              </CodeBlock>

              <ParamTable rows={[
                { name: "--force", type: "flag", default: "false", desc: "Overwrite existing configurations without confirmation" },
                { name: "--target", type: "string", default: "all", desc: "Target specific tool: claude, cursor, antigravity, windsurf" },
              ]} />
            </div>
          )}

          {/* PAGE: MCP-SERVER */}
          {activePageId === "mcp-server" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  Claude &amp; Cursor MCP Server
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  6 Native Tools · JSON-RPC 2.0
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                QueryCraft acts as a universal Model Context Protocol (MCP) server over <InlineCode>stdio</InlineCode>, giving coding agents safe, grounded access to PostgreSQL databases.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 24, marginBottom: 12 }}>
                6 Standardized MCP Tools
              </h2>

              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: 10, overflow: "hidden", marginBottom: 24
              }}>
                {[
                  { tool: "login_querycraft(email, api_key)", desc: "Authenticates user session and binds real database workspaces" },
                  { tool: "list_workspaces()", desc: "Lists all database workspaces with environment tags and live connection status" },
                  { tool: "switch_workspace(workspace_name)", desc: "Switches active database workspace for the current session" },
                  { tool: "evaluate_and_heal_sql(sql_query, ...)", desc: "Pre-Flight Cost Guard analysis, auto-heals joins, executes read-only query safely" },
                  { tool: "inspect_schema([workspace])", desc: "Returns live PostgreSQL tables, columns, data types, PKs and FKs in Markdown table" },
                  { tool: "generate_safe_sql(prompt, ...)", desc: "Converts natural language to safe PostgreSQL SQL with 3-tier risk badge (LOW/MED/HIGH)" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <code style={{ fontFamily: "'JetBrains Mono', monospace", color: "#34d399", fontSize: 12, fontWeight: 600 }}>{row.tool}</code>
                    <span style={{ fontSize: 12, color: "#94a3b8", maxWidth: "55%" }}>{row.desc}</span>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 24, marginBottom: 8 }}>
                Manual Configuration JSON
              </h2>
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
            </div>
          )}

          {/* PAGE: ASK */}
          {activePageId === "ask" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft ask &quot;&lt;prompt&gt;&quot;
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Natural Language to SQL
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Translates any plain English question to safe SQL using Llama 3.1 70B, evaluates compute cost with Pre-Flight Cost Guard, executes safely with LIMIT 50 injection, and displays an aligned ASCII results table.
              </p>

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

              <ParamTable rows={[
                { name: "prompt", type: "string", default: "required", desc: "Natural language question in plain English" },
                { name: "--workspace", type: "string", default: "active", desc: "Specify target workspace tier (e.g. Production, Staging)" },
                { name: "--json", type: "flag", default: "false", desc: "Output raw JSON payload instead of formatted table" },
              ]} />
            </div>
          )}

          {/* PAGE: CHECK (COST GUARD) */}
          {activePageId === "check" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft check &quot;&lt;SQL&gt;&quot;
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Pre-Flight Cost Guard
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Runs Pre-Flight Cost Guard &amp; risk classification on any SQL query using PostgreSQL EXPLAIN. Classifies risk into 3 tiers (<InlineCode>LOW</InlineCode>, <InlineCode>MEDIUM</InlineCode>, <InlineCode>HIGH</InlineCode>), detects sequential table scans, and suggests index DDL.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, margin: "18px 0" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 8, padding: "12px" }}>
                  <div style={{ color: "#34d399", fontWeight: 700, fontSize: 13 }}>[LOW RISK]</div>
                  <div style={{ color: "#94a3b8", fontSize: 11.5, marginTop: 4 }}>Cost &lt; 60. Safe index scans, bounded rows.</div>
                </div>
                <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 8, padding: "12px" }}>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13 }}>[MEDIUM RISK]</div>
                  <div style={{ color: "#94a3b8", fontSize: 11.5, marginTop: 4 }}>Cost 60-300 or Seq Scan on moderate table.</div>
                </div>
                <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: 8, padding: "12px" }}>
                  <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13 }}>[HIGH RISK]</div>
                  <div style={{ color: "#94a3b8", fontSize: 11.5, marginTop: 4 }}>Cost &gt; 300, large Seq Scan, or cartesian join.</div>
                </div>
              </div>

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

              <ParamTable rows={[
                { name: "sql_query", type: "string", default: "required", desc: "Raw SQL query string to evaluate with EXPLAIN" },
                { name: "--threshold", type: "float", default: "60.0", desc: "Custom maximum compute cost threshold" },
                { name: "--workspace", type: "string", default: "active", desc: "Target database workspace" },
              ]} />
            </div>
          )}

          {/* PAGE: DOCTOR (SQL DOCTOR) */}
          {activePageId === "doctor" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft doctor &quot;&lt;error/SQL&gt;&quot;
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  SQL Doctor Self-Healing
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                PostgreSQL SQL Doctor &amp; Self-Healing Critic Agent. Evaluates PostgreSQL runtime SQLSTATE error codes (<InlineCode>42703</InlineCode>, <InlineCode>42P01</InlineCode>, <InlineCode>22P02</InlineCode>, <InlineCode>42803</InlineCode>), maps schema definitions, and outputs a verified repaired query.
              </p>

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

              <ParamTable rows={[
                { name: "error_or_sql", type: "string", default: "required", desc: "PostgreSQL error message, SQLSTATE code, or failing SQL query" },
                { name: "--workspace", type: "string", default: "active", desc: "Database workspace to introspect schema for healing" },
              ]} />
            </div>
          )}

          {/* PAGE: QUERY */}
          {activePageId === "query" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft query &quot;&lt;SQL&gt;&quot;
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Raw SQL Execution
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Executes raw read-only SQL queries directly against your connected database with latency measurement and clean ASCII table rendering.
              </p>

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

              <ParamTable rows={[
                { name: "sql", type: "string", default: "required", desc: "Read-only SQL query (SELECT, WITH only)" },
                { name: "--workspace", type: "string", default: "active", desc: "Workspace to execute query on" },
                { name: "--json", type: "flag", default: "false", desc: "Return results formatted as raw JSON array" },
              ]} />
            </div>
          )}

          {/* PAGE: SCHEMA */}
          {activePageId === "schema" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft schema
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Live Schema Introspection
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Introspects tables, column data types, Primary Keys <InlineCode>[PK]</InlineCode>, and Foreign Key relations <InlineCode>[FK]</InlineCode> directly from the database information schema.
              </p>

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

              <ParamTable rows={[
                { name: "--table", type: "string", default: "all", desc: "Inspect specific table only" },
                { name: "--workspace", type: "string", default: "active", desc: "Target database workspace" },
              ]} />
            </div>
          )}

          {/* PAGE: CONNECT */}
          {activePageId === "connect" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft connect &lt;URI&gt;
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Link Cloud Database
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Links a live PostgreSQL, Supabase, Neon, RDS, or CockroachDB database connection string to your active workspace.
              </p>

              <CodeBlock title="Connect Live Database" shell="zsh">
{`$ querycraft connect postgresql://postgres:pass@db.supabase.co:5432/postgres --workspace Production

  🔌 Connecting Database...
  Target Workspace: Production
  Testing connection and introspecting schema...

  ✓ Database Connected Successfully!
  Host: db.supabase.co  │  Database: postgres
  Introspected: 12 tables`}
              </CodeBlock>

              <ParamTable rows={[
                { name: "uri", type: "string", default: "required", desc: "Full database connection string (postgresql://...)" },
                { name: "--workspace", type: "string", default: "Production", desc: "Target workspace tier (Production, Staging, Analytics)" },
              ]} />
            </div>
          )}

          {/* PAGE: AUTH-LOGIN */}
          {activePageId === "auth-login" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft auth login
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Browser OAuth Handshake
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                GitHub CLI-style (<InlineCode>gh auth login</InlineCode>) browser OAuth authentication. Spawns a local listener on port 9876, handles the token exchange, and stores credentials in <InlineCode>~/.querycraft/auth.json</InlineCode> with 600 file permissions.
              </p>

              <CodeBlock title="Browser OAuth Login" shell="zsh">
{`$ querycraft auth login

  🔑 Opening browser for authentication...
  Waiting for authentication on http://localhost:9876/callback...

  ✅ Logged in as: nitindeep65@gmail.com
  Session token saved to ~/.querycraft/auth.json (valid for 30 days)`}
              </CodeBlock>

              <ParamTable rows={[
                { name: "--force", type: "flag", default: "false", desc: "Re-authenticate even if an active session already exists" },
              ]} />
            </div>
          )}

          {/* PAGE: AUTH-WHOAMI */}
          {activePageId === "auth-whoami" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft auth whoami
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Identity Check
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Verifies your current authenticated session token, user email, and backend status.
              </p>

              <CodeBlock title="Check Identity" shell="zsh">
{`$ querycraft auth whoami

  ✅ Logged in as: nitindeep65@gmail.com
  Session created: 2026-08-31  |  Expires: 2026-09-30
  Backend: http://localhost:8000`}
              </CodeBlock>
            </div>
          )}

          {/* PAGE: AUTH-LOGOUT */}
          {activePageId === "auth-logout" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft auth logout
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Session Teardown
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Clears and deletes stored session tokens from <InlineCode>~/.querycraft/auth.json</InlineCode>.
              </p>

              <CodeBlock title="Logout" shell="zsh">
{`$ querycraft auth logout

  👋 Logged out successfully. Stored credentials removed.`}
              </CodeBlock>
            </div>
          )}

          {/* PAGE: WORKSPACES */}
          {activePageId === "workspaces" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  querycraft workspaces list
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Multi-Tenant Workspaces
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Lists all database workspaces configured for your account, showing database engine, environment tier, and connection status.
              </p>

              <CodeBlock title="List Workspaces" shell="zsh">
{`$ querycraft workspaces list

  📁 Workspaces for nitindeep65@gmail.com (2 total):

  • Production (ws-default)  [ACTIVE]
    Engine: postgres  │  Environment: Production  │  Connected: Yes

  • Staging (ws-staging)
    Engine: postgres  │  Environment: Staging     │  Connected: Yes`}
              </CodeBlock>
            </div>
          )}

          {/* PAGE: CHEATSHEET */}
          {activePageId === "cheatsheet" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  Command Cheat Sheet
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Quick Reference
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                A concise reference card of all QueryCraft CLI commands:
              </p>

              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: 10, overflow: "hidden",
              }}>
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
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 16px",
                      borderBottom: i < 10 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                    }}
                  >
                    <code style={{ fontFamily: "'JetBrains Mono', monospace", color: "#34d399", fontSize: 12.5, fontWeight: 600 }}>
                      {row.cmd}
                    </code>
                    <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                      {row.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE: ENV-VARS */}
          {activePageId === "env-vars" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
                  Environment Variables
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 12 }}>
                  Configuration
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                Configure endpoints and runtime settings via environment variables in your shell or CI/CD pipelines:
              </p>

              <ParamTable rows={[
                { name: "QUERYCRAFT_BACKEND_URL", type: "string", default: "http://localhost:8000", desc: "FastAPI microservice backend base URL" },
                { name: "QUERYCRAFT_FRONTEND_URL", type: "string", default: "http://localhost:3000", desc: "Next.js Web Studio and OAuth receiver base URL" },
                { name: "POSTGRES_URL", type: "string", default: "—", desc: "Optional direct PostgreSQL connection string fallback" },
                { name: "READ_ONLY_ENFORCED", type: "boolean", default: "true", desc: "Strictly block destructive DDL/DML mutations" },
                { name: "AUTO_LIMIT", type: "number", default: "50", desc: "Default row limit injected if none specified in prompt" },
              ]} />
            </div>
          )}

          {/* ── Page-Wise Sequential Pagination Footer ─────────────────── */}
          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}>
            {prevPage ? (
              <button
                type="button"
                onClick={() => navigateToPage(prevPage.id)}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
                  e.currentTarget.style.color = "#34d399"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
                  e.currentTarget.style.color = "#cbd5e1"
                }}
              >
                <ArrowLeft size={14} />
                <span>Previous: {prevPage.label}</span>
              </button>
            ) : <div />}

            {nextPage ? (
              <button
                type="button"
                onClick={() => navigateToPage(nextPage.id)}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
                  e.currentTarget.style.color = "#34d399"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
                  e.currentTarget.style.color = "#cbd5e1"
                }}
              >
                <span>Next: {nextPage.label}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateToPage("overview")}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#34d399",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span>Back to Overview</span>
                <RefreshCw size={13} />
              </button>
            )}
          </div>

        </main>
      </div>

      {/* Floating Craft AI Docs Copilot */}
      <DocsAiCopilot />

      <style jsx global>{`
        @media (max-width: 768px) {
          .docs-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .docs-sidebar-nav {
            display: none !important;
          }
          .docs-sidebar-nav.open {
            display: block !important;
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            height: calc(100vh - 60px) !important;
            z-index: 50 !important;
          }
          .docs-main-content {
            padding: 20px 16px 60px !important;
          }
          .docs-mobile-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function CLIReferencePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#040711", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading CLI documentation...
      </div>
    }>
      <CLIReferenceInner />
    </Suspense>
  )
}
