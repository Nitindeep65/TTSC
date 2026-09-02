"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Terminal, LogIn, LogOut, User, Database,
  Copy, Check, Download, Zap, Shield, Key,
  BookOpen, Menu, X, Search, Sparkles, Cpu,
  CheckCircle2, ArrowRight, ExternalLink, Hash,
  ChevronRight, Layers, Table, Play, Compass,
  Sliders, FileCode, CheckCheck, RefreshCw
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
    <div style={{ margin: "16px 0 24px", position: "relative" }}>
      <div style={{
        background: "#060913",
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
      }}>
        {/* Titlebar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          background: "rgba(255, 255, 255, 0.02)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", opacity: 0.6 }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#eab308", opacity: 0.6 }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", opacity: 0.6 }} />
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
              const isComment = line.trim().startsWith("#")
              const isPrompt  = line.trim().startsWith("$")
              const isSuccess = line.trim().startsWith("✅") || line.trim().startsWith("✓")
              const isOutput  = line.trim().startsWith("→") || line.trim().startsWith("│") || line.trim().startsWith("┌") || line.trim().startsWith("└") || line.trim().startsWith("├")

              let color = "#e2e8f0"
              if (isComment) color = "#64748b"
              else if (isSuccess) color = "#34d399"
              else if (isOutput) color = "#94a3b8"

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
      margin: "16px 0 24px",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: 10,
      overflow: "hidden",
      background: "rgba(255, 255, 255, 0.015)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
        <thead>
          <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
            <th style={{ padding: "10px 14px", color: "#94a3b8", fontWeight: 600 }}>Parameter / Flag</th>
            <th style={{ padding: "10px 14px", color: "#94a3b8", fontWeight: 600 }}>Type</th>
            <th style={{ padding: "10px 14px", color: "#94a3b8", fontWeight: 600 }}>Default</th>
            <th style={{ padding: "10px 14px", color: "#94a3b8", fontWeight: 600 }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none" }}>
              <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#34d399", fontWeight: 600 }}>
                {r.name}
              </td>
              <td style={{ padding: "10px 14px", color: "#94a3b8" }}>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>
                  {r.type}
                </span>
              </td>
              <td style={{ padding: "10px 14px", color: "#cbd5e1", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                {r.default || "—"}
              </td>
              <td style={{ padding: "10px 14px", color: "#94a3b8", lineHeight: 1.5 }}>
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
    category: "1. Getting Started",
    items: [
      { id: "overview",     label: "Overview & Architecture",  icon: Compass },
      { id: "installation", label: "Installation Options",     icon: Download },
      { id: "quickstart",   label: "3-Step Quickstart",        icon: CheckCheck },
    ],
  },
  {
    category: "2. Universal AI Integration",
    items: [
      { id: "setup",        label: "querycraft setup",          icon: Zap, badge: "1-Click" },
      { id: "mcp-server",   label: "Claude & Cursor MCP",      icon: Cpu, badge: "6 Tools" },
    ],
  },
  {
    category: "3. Query, Safety & Self-Healing",
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
    category: "4. Authentication & Security",
    items: [
      { id: "auth-login",   label: "querycraft auth login",     icon: LogIn, isCommand: true },
      { id: "auth-whoami",  label: "querycraft auth whoami",    icon: User, isCommand: true },
      { id: "auth-logout",  label: "querycraft auth logout",    icon: LogOut, isCommand: true },
    ],
  },
  {
    category: "5. Workspaces & Environments",
    items: [
      { id: "workspaces",   label: "workspaces list",           icon: Layers, isCommand: true },
    ],
  },
  {
    category: "6. Reference & Config",
    items: [
      { id: "env-vars",     label: "Environment Variables",     icon: Key },
      { id: "cheatsheet",   label: "Command Cheat Sheet",       icon: FileCode },
    ],
  },
]

function CLIReferenceInner() {
  const [activeSection, setActiveSection] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [installTab, setInstallTab] = useState("curl")
  const [mobileMenu, setMobileMenu] = useState(false)

  // Intersection observer
  useEffect(() => {
    const allIds = DOCS_NAV.flatMap(g => g.items.map(i => i.id))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )

    allIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 80
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
    setMobileMenu(false)
  }

  // Filtered nav
  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_NAV
    const q = searchQuery.toLowerCase()
    return DOCS_NAV.map(g => ({
      ...g,
      items: g.items.filter(item => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)),
    })).filter(g => g.items.length > 0)
  }, [searchQuery])

  return (
    <div style={{
      minHeight: "100vh",
      background: "#040711",
      color: "#e2e8f0",
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    }}>
      {/* ── Top Header Bar ──────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(4, 7, 17, 0.9)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #059669, #10b981)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.4)",
            }}>
              <Database size={16} color="#ffffff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
              QueryCraft
            </span>
          </Link>

          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>CLI & MCP Documentation</span>

          <span style={{
            fontSize: 11, fontWeight: 700,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            padding: "2px 8px", borderRadius: 20,
            marginLeft: 4,
          }}>
            v1.5.0
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
        maxWidth: 1360,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "270px 1fr",
        minHeight: "calc(100vh - 60px)",
      }} className="docs-layout-grid">

        {/* ── Sticky Sidebar ───────────────────────────────────────── */}
        <aside style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.07)",
          position: "sticky",
          top: 60,
          height: "calc(100vh - 60px)",
          overflowY: "auto",
          padding: "24px 16px 40px",
          background: "#040711",
        }} className={`docs-sidebar-nav ${mobileMenu ? "open" : ""}`}>

          {/* Search Filter */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={13} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search commands & docs..."
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

          {/* Navigation Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filteredNav.map((group, idx) => (
              <div key={idx}>
                <div style={{
                  fontSize: 11,
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
                    const isSelected = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: 7,
                          cursor: "pointer",
                          background: isSelected ? "rgba(16, 185, 129, 0.1)" : "transparent",
                          border: isSelected ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid transparent",
                          color: isSelected ? "#34d399" : "#94a3b8",
                          fontSize: 13,
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
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#34d399",
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

        {/* ── Main Content Area ────────────────────────────────────── */}
        <main style={{
          padding: "48px 64px 120px",
          maxWidth: 960,
          minWidth: 0,
        }} className="docs-main-content">

          {/* Hero Intro */}
          <div style={{ marginBottom: 54 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 600, color: "#34d399",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 20, padding: "3px 10px", marginBottom: 16,
            }}>
              <Terminal size={12} />
              <span>Official CLI Reference</span>
            </div>

            <h1 style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.8px",
              color: "#fff",
              marginBottom: 14,
              lineHeight: 1.2,
            }}>
              QueryCraft CLI & MCP Documentation
            </h1>
            <p style={{
              fontSize: 16,
              color: "#94a3b8",
              lineHeight: 1.7,
              maxWidth: 720,
            }}>
              Authenticate, introspect schemas, run natural language queries with Llama 3.1 70B, and hook directly into Claude Desktop, Cursor IDE, Antigravity, and ChatGPT.
            </p>

            {/* Quick Jumper Chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
              {[
                { label: "📦 Install", id: "installation" },
                { label: "⚡ 1-Click AI Hook", id: "setup" },
                { label: "🧠 Plain English (ask)", id: "ask" },
                { label: "🛡️ Cost Guard (check)", id: "check" },
                { label: "🩺 SQL Doctor (doctor)", id: "doctor" },
                { label: "⚡ Raw SQL (query)", id: "query" },
                { label: "🔌 Link Database (connect)", id: "connect" },
                { label: "🔑 OAuth Login", id: "auth-login" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(chip.id)}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 20, padding: "5px 12px",
                    fontSize: 12, color: "#cbd5e1",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; e.currentTarget.style.color = "#34d399" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#cbd5e1" }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CHAPTER 1: GETTING STARTED */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Chapter 1
            </div>
            <h2 id="overview" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
              Overview & Architecture
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              The QueryCraft CLI (`querycraft`) bridges your local development environment directly to your live database clusters and AI coding agents via the Model Context Protocol (MCP).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, margin: "24px 0" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ color: "#34d399", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🧠 Zero-Hallucination</div>
                <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Grounds prompts strictly in live introspected database schemas and types.</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🛡️ Pre-Flight Cost Guard</div>
                <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Dry-runs PostgreSQL EXPLAIN to detect expensive scans before execution.</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🔒 Tenant-Isolated</div>
                <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>OAuth tokens stored locally in `~/.querycraft/auth.json` with 600 permissions.</div>
              </div>
            </div>

            {/* Installation Section */}
            <h3 id="installation" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 40, marginBottom: 12 }}>
              Installation Options
            </h3>

            {/* Tabbed installer selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { id: "curl", label: "cURL 1-Liner (macOS/Linux)" },
                { id: "uv", label: "Python (UV / Pip)" },
                { id: "git", label: "Source / Local" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setInstallTab(tab.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 8,
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
{`# Install via UV (Recommended)
uv tool install --editable ./backend

# Install via Pip
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

            {/* Quick 3-Step Walkthrough */}
            <h3 id="quickstart" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 36, marginBottom: 14 }}>
              3-Step Quickstart
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>01</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Log in via Browser OAuth</div>
                  <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Run <InlineCode>querycraft auth login</InlineCode> to link your QueryCraft account in 1 tap.</div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>02</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Connect your Database (or use sandbox)</div>
                  <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Run <InlineCode>querycraft connect postgresql://user:pass@host/db</InlineCode> to link your live database.</div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>03</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Ask Questions in Plain English</div>
                  <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Run <InlineCode>querycraft ask &quot;show active users&quot;</InlineCode> to get instant SQL + table data.</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CHAPTER 2: UNIVERSAL AI ASSISTANTS */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Chapter 2
            </div>
            <h2 id="setup" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              1-Click Universal AI Setup (<InlineCode>querycraft setup</InlineCode>)
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Automatically detects installed AI tools on your system (Claude Desktop, Cursor IDE, Antigravity, Windsurf) and configures their Model Context Protocol (MCP) configuration in 1 millisecond.
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

            <h3 id="mcp-server" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 32, marginBottom: 10 }}>
              Model Context Protocol (MCP) Server Reference (v2.0-mvp)
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>
              QueryCraft exposes **6 native MCP tools** for LLMs (Claude, Cursor, Antigravity, Windsurf):
            </p>

            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: 12, overflow: "hidden", marginBottom: 20
            }}>
              {[
                { tool: "login_querycraft(email, api_key)", desc: "Authenticates user session and binds real database workspaces" },
                { tool: "list_workspaces()", desc: "Lists all database workspaces with environment tags and live connection status" },
                { tool: "switch_workspace(workspace_name)", desc: "Switches active database workspace for the current session" },
                { tool: "evaluate_and_heal_sql(sql_query, ...)", desc: "Pre-Flight Cost Guard analysis, auto-heals joins, executes read-only query safely" },
                { tool: "inspect_schema([workspace])", desc: "Returns live PostgreSQL tables, columns, data types, PKs and FKs in Markdown table" },
                { tool: "generate_safe_sql(prompt, ...)", desc: "Converts natural language to safe PostgreSQL SQL with 3-tier risk badge (LOW/MED/HIGH)" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", color: "#34d399", fontSize: 12, fontWeight: 600 }}>{row.tool}</code>
                  <span style={{ fontSize: 12, color: "#94a3b8", maxWidth: "55%" }}>{row.desc}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Manual Configuration JSON:</p>
            <CodeBlock title="claude_desktop_config.json / mcp.json" shell="json">
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

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CHAPTER 3: QUERY & INSPECTION COMMANDS */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Chapter 3
            </div>
            <h2 id="ask" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Query & Inspection Commands
            </h2>

            {/* querycraft ask */}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginTop: 24, marginBottom: 8 }}>
              querycraft ask &quot;&lt;prompt&gt;&quot;
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              Translates any natural language question to SQL using Llama 3.1 70B, evaluates safety with Pre-Flight Cost Guard, executes against your database workspace, and prints an aligned ASCII table.
            </p>

            <CodeBlock title="Natural Language Query" shell="zsh">
{`$ querycraft ask "show all active users"

  🧠 QueryCraft AI  [Workspace: Production | User: nitindeep65@gmail.com]
  Question: show all active users
  Thinking, grounding schema, evaluating safety...

  Generated SQL Query:
  SELECT * FROM users WHERE is_active = TRUE LIMIT 50;

  Executing query on database...

  Results (5 rows in 12.4ms):

  ┌──────────────────────────────────┬───────────────┬─────────────────────────────┬──────────┬───────────┐
  │ id                               │ name          │ email                       │ role     │ is_active │
  ├──────────────────────────────────┼───────────────┼─────────────────────────────┼──────────┼───────────┤
  │ e1a9b2c3-4d5e-6f7a-8b9c-0d1e2f.. │ Alex Rivera   │ alex.rivera@enterprise.com  │ customer │ True      │
  │ f2b0c3d4-5e6f-7a8b-9c0d-1e2f3a.. │ Sofia Davis   │ sofia.davis@cloudscale.io   │ customer │ True      │
  │ a3c1d4e5-6f7a-8b9c-0d1e-2f3a4b.. │ Marcus Vance  │ marcus.vance@fintech.co     │ admin    │ True      │
  │ b4d2e5f6-7a8b-9c0d-1e2f-3a4b5c.. │ Elena Rostova │ elena.rostova@datadrive.net │ customer │ True      │
  │ c5e3f6a7-8b9c-0d1e-2f3a-4b5c6d.. │ Liam Chen     │ liam.chen@techcorp.io       │ merchant │ True      │
  └──────────────────────────────────┴───────────────┴─────────────────────────────┴──────────┴───────────┘`}
            </CodeBlock>

            {/* querycraft check */}
            <h3 id="check" style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginTop: 36, marginBottom: 8 }}>
              querycraft check &quot;&lt;SQL&gt;&quot; [--threshold &lt;cost&gt;]
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              Runs Pre-Flight Cost Guard &amp; risk classification on any SQL query via PostgreSQL EXPLAIN. Detects full sequential scans on high-row tables and suggests <InlineCode>CREATE INDEX CONCURRENTLY</InlineCode> DDL.
            </p>

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

            {/* querycraft doctor */}
            <h3 id="doctor" style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginTop: 36, marginBottom: 8 }}>
              querycraft doctor &quot;&lt;SQL or Error Message&gt;&quot;
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              PostgreSQL SQL Doctor &amp; Self-Healing Agent. Evaluates PostgreSQL runtime SQLSTATE error codes (<InlineCode>42703</InlineCode>, <InlineCode>42P01</InlineCode>, <InlineCode>22P02</InlineCode>, <InlineCode>42803</InlineCode>), maps schema definitions, and outputs a verified healed query.
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
  SELECT id, name, email FROM users WHERE is_active = TRUE;

  ℹ The query was diagnosed and repaired to match the live schema.`}
            </CodeBlock>

            {/* querycraft query */}
            <h3 id="query" style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginTop: 36, marginBottom: 8 }}>
              querycraft query &quot;&lt;SQL&gt;&quot;
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              Executes raw read-only SQL queries directly against your connected database with execution latency measurement.
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

            {/* querycraft schema */}
            <h3 id="schema" style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginTop: 36, marginBottom: 8 }}>
              querycraft schema
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              Introspects tables, column data types, Primary Keys <InlineCode>[PK]</InlineCode>, and Foreign Key relations <InlineCode>[FK]</InlineCode>.
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

            {/* querycraft connect */}
            <h3 id="connect" style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginTop: 36, marginBottom: 8 }}>
              querycraft connect &lt;URI&gt; [--workspace &lt;name&gt;]
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              Links a live PostgreSQL, Supabase, Neon, RDS, or MongoDB Atlas cluster connection string to your workspace.
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
              { name: "uri", type: "string", default: "required", desc: "Full database connection string (postgresql://... or mongodb+srv://...)" },
              { name: "--workspace", type: "string", default: "Production", desc: "Target workspace tier (Production, Staging, Analytics)" },
            ]} />
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CHAPTER 4: AUTHENTICATION & SECURITY */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Chapter 4
            </div>
            <h2 id="auth-login" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Authentication & Tenant Security
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              GitHub-style (<InlineCode>gh auth login</InlineCode>) browser OAuth authentication. Spawns a local listener on port 9876, handles the token exchange, and stores credentials in <InlineCode>~/.querycraft/auth.json</InlineCode> with 600 file permissions.
            </p>

            <CodeBlock title="Browser OAuth Login" shell="zsh">
{`$ querycraft auth login

  🔑 Opening browser for authentication...
  Waiting for authentication on http://localhost:9876/callback...

  ✅ Logged in as: nitindeep65@gmail.com
  Session token saved to ~/.querycraft/auth.json (valid for 30 days)`}
            </CodeBlock>

            <h3 id="auth-whoami" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 32, marginBottom: 8 }}>
              querycraft auth whoami
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10 }}>
              Verifies current authenticated session token, user email, and backend status:
            </p>

            <CodeBlock title="Check Identity" shell="zsh">
{`$ querycraft auth whoami

  ✅ Logged in as: nitindeep65@gmail.com
  Session created: 2026-08-31  |  Expires: 2026-09-30
  Backend: http://localhost:8000`}
            </CodeBlock>

            <h3 id="auth-logout" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 32, marginBottom: 8 }}>
              querycraft auth logout
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10 }}>
              Clears and deletes stored session tokens from <InlineCode>~/.querycraft/auth.json</InlineCode>:
            </p>

            <CodeBlock title="Logout" shell="zsh">
{`$ querycraft auth logout

  👋 Logged out successfully. Stored credentials removed.`}
            </CodeBlock>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CHAPTER 5: WORKSPACES */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Chapter 5
            </div>
            <h2 id="workspaces" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Workspaces & Environments (<InlineCode>querycraft workspaces list</InlineCode>)
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Lists all database workspaces configured for your account, showing database engine, environment tier, and connection status.
            </p>

            <CodeBlock title="List Workspaces" shell="zsh">
{`$ querycraft workspaces list

  📁 Workspaces for nitindeep65@gmail.com (3 total):

  • Production (ws-default)  [ACTIVE]
    Engine: postgres  │  Environment: Production  │  Connected: Yes

  • Staging (ws-staging)
    Engine: postgres  │  Environment: Staging     │  Connected: Yes

  • Analytics (ws-analytics)
    Engine: mongodb   │  Environment: Analytics   │  Connected: No`}
            </CodeBlock>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CHAPTER 6: CONFIGURATION & CHEATSHEET */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Chapter 6
            </div>
            <h2 id="env-vars" style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Environment Variables & Reference
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Configure network endpoints and model parameters in your environment:
            </p>

            <ParamTable rows={[
              { name: "QUERYCRAFT_BACKEND_URL", type: "string", default: "http://localhost:8000", desc: "FastAPI microservice backend base URL" },
              { name: "QUERYCRAFT_FRONTEND_URL", type: "string", default: "http://localhost:3000", desc: "Next.js Web Studio and OAuth login receiver base URL" },
              { name: "NVIDIA_API_KEY", type: "string", default: "—", desc: "Optional API key for direct Llama 3.1 70B compilation via NVIDIA NIM" },
            ]} />

            {/* Quick Command Cheat Sheet */}
            <h3 id="cheatsheet" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 36, marginBottom: 14 }}>
              Command Cheat Sheet
            </h3>

            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: 12, overflow: "hidden",
            }}>
              {[
                { cmd: "querycraft setup", desc: "1-Click auto-configure Claude Desktop, Cursor & Antigravity" },
                { cmd: "querycraft ask \"<prompt>\"", desc: "Natural language English to SQL query with live table results" },
                { cmd: "querycraft check \"<SQL>\"", desc: "Pre-Flight Cost Guard & 3-tier risk analysis (LOW/MED/HIGH)" },
                { cmd: "querycraft doctor \"<error/SQL>\"", desc: "SQL Doctor self-healing agent & error code diagnosis" },
                { cmd: "querycraft query \"<SQL>\"", desc: "Execute raw read-only SQL directly with execution timing" },
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
                    padding: "12px 16px",
                    borderBottom: i < 8 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
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

          {/* Footer Navigation Cards */}
          <div style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            <Link
              href="/Dashboard"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                padding: "20px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
              }}
            >
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                Next Chapter
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
                <span>Web Dashboard Studio</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link
              href="/Dashboard/canvas"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                padding: "20px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
              }}
            >
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                Advanced Feature
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", gap: 6 }}>
                <span>Autonomous Canvas Mode</span>
                <ArrowRight size={14} />
              </div>
            </Link>
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
            padding: 24px 16px 80px !important;
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
