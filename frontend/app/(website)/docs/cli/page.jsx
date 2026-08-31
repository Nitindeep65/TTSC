"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Terminal, LogIn, LogOut, User, Database,
  Copy, Check, Download, Zap, Shield, Key,
  BookOpen, Menu, X, Search, Sparkles, Cpu,
  CheckCircle2, ArrowRight, ExternalLink, Hash,
  ChevronRight, Layers, Table, Play, Compass
} from "lucide-react"

// ─── Precision Copy Button ──────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      className="docs-copy-btn"
      style={{
        position: "absolute", top: 12, right: 12,
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

// ─── macOS / Studio Code Block ──────────────────────────────────────────────
function CodeBlock({ children, title = "terminal", shell = "zsh" }) {
  const raw = children.trim()
  const lines = raw.split("\n")

  return (
    <div style={{ margin: "20px 0", position: "relative" }}>
      <div style={{
        background: "#080d1a",
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.09)",
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
      }}>
        {/* Terminal Titlebar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308", opacity: 0.7 }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", opacity: 0.7 }} />
            <span style={{
              marginLeft: 10,
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {title} {shell ? `(${shell})` : ""}
            </span>
          </div>
        </div>

        {/* Code Content */}
        <div style={{ position: "relative" }}>
          <CopyButton text={raw} />
          <pre style={{
            margin: 0,
            padding: "18px 20px",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 1.7,
            overflowX: "auto",
            color: "#cbd5e1",
          }}>
            {lines.map((line, i) => {
              const isComment = line.trim().startsWith("#")
              const isPrompt  = line.trim().startsWith("$")
              const isSuccess = line.trim().startsWith("✅") || line.trim().startsWith("✓")
              const isOutput  = line.trim().startsWith("→") || line.trim().startsWith("│") || line.trim().startsWith("┌") || line.trim().startsWith("└") || line.trim().startsWith("├")
              const isHighlight = line.includes("SELECT") || line.includes("querycraft")

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

// ─── Editorial Callout ──────────────────────────────────────────────────────
function Callout({ type = "tip", title, children }) {
  const configs = {
    tip:     { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", titleColor: "#34d399", icon: Sparkles },
    note:    { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)", titleColor: "#60a5fa", icon: Shield },
    warning: { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", titleColor: "#fbbf24", icon: Key },
  }
  const cfg = configs[type] || configs.tip
  const Icon = cfg.icon

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: "16px 18px",
      margin: "20px 0",
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <Icon size={14} color={cfg.titleColor} />
      </div>
      <div>
        {title && (
          <div style={{ fontSize: 13, fontWeight: 700, color: cfg.titleColor, marginBottom: 4 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.65 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Parameter Table ────────────────────────────────────────────────────────
function ParamTable({ rows }) {
  return (
    <div style={{
      margin: "18px 0",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 10,
      overflow: "hidden",
      background: "rgba(255, 255, 255, 0.02)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
        <thead>
          <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
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
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4 }}>
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

// ─── Sidebar Navigation Hierarchy ───────────────────────────────────────────
const NAV_GROUPS = [
  {
    category: "Getting Started",
    items: [
      { id: "overview",     label: "Overview",            icon: Compass },
      { id: "installation", label: "Installation",        icon: Download },
      { id: "setup",        label: "querycraft setup",     icon: Zap, badge: "1-Click" },
    ],
  },
  {
    category: "Core Engine",
    items: [
      { id: "ask",          label: "querycraft ask",       icon: Sparkles, isCommand: true },
      { id: "query",        label: "querycraft query",     icon: Terminal, isCommand: true },
      { id: "schema",       label: "querycraft schema",    icon: Table, isCommand: true },
      { id: "connect",      label: "querycraft connect",   icon: Database, isCommand: true },
    ],
  },
  {
    category: "Authentication",
    items: [
      { id: "auth-login",   label: "auth login",           icon: LogIn, isCommand: true },
      { id: "auth-whoami",  label: "auth whoami",          icon: User, isCommand: true },
      { id: "auth-logout",  label: "auth logout",          icon: LogOut, isCommand: true },
    ],
  },
  {
    category: "AI & Integrations",
    items: [
      { id: "mcp",          label: "Claude & Cursor MCP",  icon: Cpu },
      { id: "chatgpt",      label: "ChatGPT Custom GPT",   icon: ExternalLink },
      { id: "env",          label: "Environment Config",   icon: Key },
    ],
  },
]

function CLIReferenceInner() {
  const [activeSection, setActiveSection] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)

  // Intersection observer
  useEffect(() => {
    const allIds = NAV_GROUPS.flatMap(g => g.items.map(i => i.id))
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
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS
    const q = searchQuery.toLowerCase()
    return NAV_GROUPS.map(g => ({
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
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(4, 7, 17, 0.85)",
        backdropFilter: "blur(12px)",
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
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>CLI & MCP Docs</span>

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
            style={{
              fontSize: 13, color: "#94a3b8", textDecoration: "none",
              transition: "color 0.15s",
            }}
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
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)"
            }}
          >
            Launch Studio
          </Link>

          {/* Mobile Menu Button */}
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

      {/* ── Main 2-Column Documentation Grid ────────────────────────── */}
      <div style={{
        maxWidth: 1320,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "calc(100vh - 60px)",
      }} className="docs-layout-grid">

        {/* ── Left Sidebar Navigation ──────────────────────────────── */}
        <aside style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.07)",
          position: "sticky",
          top: 60,
          height: "calc(100vh - 60px)",
          overflowY: "auto",
          padding: "24px 16px 40px",
          background: "#040711",
        }} className={`docs-sidebar-nav ${mobileMenu ? "open" : ""}`}>

          {/* Search Quick Filter */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={13} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Filter commands..."
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
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {filteredGroups.map((group, idx) => (
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

        {/* ── Main Documentation Content ────────────────────────────── */}
        <main style={{
          padding: "48px 64px 120px",
          maxWidth: 960,
          minWidth: 0,
        }} className="docs-main-content">

          {/* Page Intro Header */}
          <div style={{ marginBottom: 54 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 600, color: "#34d399",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 20, padding: "3px 10px", marginBottom: 16,
            }}>
              <Terminal size={12} />
              <span>Official CLI & Native AI Specification</span>
            </div>

            <h1 style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.8px",
              color: "#fff",
              marginBottom: 14,
              lineHeight: 1.2,
            }}>
              QueryCraft CLI
            </h1>
            <p style={{
              fontSize: 16,
              color: "#94a3b8",
              lineHeight: 1.7,
              maxWidth: 720,
            }}>
              The high-performance command-line client for QueryCraft. Authenticate via GitHub-style browser OAuth, connect live PostgreSQL and MongoDB databases, execute grounded natural language queries with Llama 3.1 70B, and hook directly into Claude, Cursor, and ChatGPT in 1 click.
            </p>
          </div>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: Overview */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="overview" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Overview & Architecture
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              The QueryCraft CLI (`querycraft`) operates as both an interactive database terminal and an MCP (Model Context Protocol) engine. It connects your local dev environment to your QueryCraft serverless or microservice backend, guaranteeing strict tenant isolation and zero data hallucinations.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ color: "#34d399", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🧠 Llama 3.1 70B Grounding</div>
                <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Grounded strictly in your live introspected DDL schemas and table relationships.</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🛡️ Pre-Flight Cost Guard</div>
                <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Dry-runs EXPLAIN cost estimation before executing on production clusters.</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px" }}>
                <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>⚡ 1-Click Universal AI</div>
                <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>Instantly configures Claude Desktop, Cursor IDE, Antigravity, and Windsurf.</div>
              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: Installation */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="installation" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Installation
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Install the CLI globally on your workstation using the universal installer script or via Python:
            </p>

            <CodeBlock title="Quick Install (macOS / Linux)" shell="bash">
{`# 1-Line Universal Installer (Auto-links binary to /usr/local/bin/querycraft)
curl -fsSL https://raw.githubusercontent.com/Nitindeep65/TTSC/main/setup-mcp.sh | bash`}
            </CodeBlock>

            <p style={{ fontSize: 14, color: "#94a3b8", margin: "16px 0 8px" }}>
              Or install directly using Python package managers:
            </p>

            <CodeBlock title="UV / Pipx Installation" shell="bash">
{`# Via UV (Fastest)
uv tool install --editable ./backend

# Via Pip
pip install -e ./backend`}
            </CodeBlock>

            <Callout type="tip" title="Verify Installation">
              Verify the binary is available in your PATH by running: <InlineCode>querycraft --help</InlineCode>
            </Callout>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: querycraft setup */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="setup" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                querycraft setup
              </h2>
              <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                1-Click AI Hook
              </span>
            </div>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Automatically detects installed AI assistants on your computer (Claude Desktop, Cursor IDE, Antigravity, Windsurf) and configures their Model Context Protocol (MCP) servers in 1 millisecond.
            </p>

            <CodeBlock title="Run Universal AI Setup" shell="zsh">
{`$ querycraft setup

  🔍 Detecting installed AI assistants & IDEs...
  ✓ Claude Desktop: Configured (~/Library/Application Support/Claude/claude_desktop_config.json)
  ✓ Cursor IDE: Configured (~/.cursor/mcp.json)
  ✓ Antigravity: Configured (~/.gemini/config/mcp_config.json)

  🎉 3 AI tools configured successfully!
  Restart your editor or Claude to start querying databases naturally.`}
            </CodeBlock>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: querycraft ask */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="ask" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              querycraft ask <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 400 }}>&quot;&lt;natural language prompt&gt;&quot;</span>
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Translate any plain English question into PostgreSQL / MongoDB queries, verify execution safety with EXPLAIN cost estimation, run the query against your connected workspace, and print a formatted ASCII table directly in your terminal.
            </p>

            <CodeBlock title="Natural Language Query" shell="zsh">
{`$ querycraft ask "show all active users registered this year"

  🧠 QueryCraft AI  [Workspace: Production | User: nitindeep65@gmail.com]
  Question: show all active users registered this year
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
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: querycraft query */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="query" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              querycraft query <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 400 }}>&quot;&lt;SQL&gt;&quot;</span>
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Execute raw, read-only SQL queries directly against your active workspace database with sub-millisecond execution measurement and structured terminal table output.
            </p>

            <CodeBlock title="Execute Raw SQL" shell="zsh">
{`$ querycraft query "SELECT id, name, email, role FROM users LIMIT 3;"

  ⚡ QueryCraft SQL Execution  [Workspace: Production]
  Executing: SELECT id, name, email, role FROM users LIMIT 3;

  Results (3 rows in 10.2ms):

  ┌──────────────────────────────────┬───────────────┬─────────────────────────────┬──────────┐
  │ id                               │ name          │ email                       │ role     │
  ├──────────────────────────────────┼───────────────┼─────────────────────────────┼──────────┤
  │ e1a9b2c3-4d5e-6f7a-8b9c-0d1e2f.. │ Alex Rivera   │ alex.rivera@enterprise.com  │ customer │
  │ f2b0c3d4-5e6f-7a8b-9c0d-1e2f3a.. │ Sofia Davis   │ sofia.davis@cloudscale.io   │ customer │
  │ a3c1d4e5-6f7a-8b9c-0d1e-2f3a4b.. │ Marcus Vance  │ marcus.vance@fintech.co     │ admin    │
  └──────────────────────────────────┴───────────────┴─────────────────────────────┴──────────┘`}
            </CodeBlock>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: querycraft schema */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="schema" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              querycraft schema
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Introspects and displays all tables, column types, primary keys <InlineCode>[PK]</InlineCode>, and foreign key relations <InlineCode>[FK]</InlineCode> for the current active database workspace.
            </p>

            <CodeBlock title="Introspect Database Schema" shell="zsh">
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
    └─ status: VARCHAR(50)

  • products  (8 columns) — Catalog items available for purchase
    └─ id: UUID [PK]
    └─ name: VARCHAR(255)
    └─ price: NUMERIC(10,2)`}
            </CodeBlock>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: querycraft connect */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="connect" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              querycraft connect <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 400 }}>&lt;URI&gt;</span>
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Links a live PostgreSQL, Supabase, Neon, AWS RDS, CockroachDB, or MongoDB Atlas cluster connection string directly to your workspace.
            </p>

            <CodeBlock title="Connect Live Database" shell="zsh">
{`$ querycraft connect postgresql://postgres:secret@db.supabase.co:5432/postgres --workspace Production

  🔌 Connecting Database...
  Target Workspace: Production
  Testing connection and introspecting schema...

  ✓ Database Connected Successfully!
  Host: db.supabase.co  │  Database: postgres
  Introspected: 12 tables`}
            </CodeBlock>

            <ParamTable rows={[
              { name: "uri", type: "string", default: "required", desc: "Full database connection string (postgresql://... or mongodb+srv://...)" },
              { name: "--workspace", type: "string", default: "Production", desc: "Target workspace name (Production, Staging, Analytics)" },
            ]} />
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: Authentication */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="auth-login" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Authentication: auth login & whoami
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              The QueryCraft CLI uses GitHub-style (<InlineCode>gh auth login</InlineCode>) browser OAuth authentication. It starts a local listener on port 9876, prompts you in the browser to sign in with Google, GitHub, or Email, and stores an encrypted session token with 600 system permissions.
            </p>

            <CodeBlock title="Browser OAuth Login" shell="zsh">
{`$ querycraft auth login

  🔑 Opening browser for authentication...
  Waiting for authentication on http://localhost:9876/callback...

  ✅ Logged in as: nitindeep65@gmail.com
  Session token saved to ~/.querycraft/auth.json (valid for 30 days)`}
            </CodeBlock>

            <h3 id="auth-whoami" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 32, marginBottom: 10 }}>
              querycraft auth whoami
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>
              Check current logged-in identity and session expiry status:
            </p>

            <CodeBlock title="Check Identity" shell="zsh">
{`$ querycraft auth whoami

  ✅ Logged in as: nitindeep65@gmail.com
  Session created: 2026-08-31  |  Expires: 2026-09-30
  Backend: http://localhost:8000`}
            </CodeBlock>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: MCP Integration */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="mcp" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Claude Desktop & Cursor MCP Integration
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              QueryCraft exposes a standard Model Context Protocol (MCP) server so that AI assistants can autonomously inspect schemas, analyze query costs, and execute safe queries on your behalf.
            </p>

            <CodeBlock title="claude_desktop_config.json" shell="json">
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

            <Callout type="tip" title="Auto-Configured">
              Running <InlineCode>querycraft setup</InlineCode> automatically populates this config file for you.
            </Callout>
          </section>

          {/* ───────────────────────────────────────────────────────── */}
          {/* SECTION: Environment Config */}
          {/* ───────────────────────────────────────────────────────── */}
          <section id="env" style={{ marginBottom: 64, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Environment Variables
            </h2>
            <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.7 }}>
              Override default network endpoints and model configurations via environment variables in your <InlineCode>~/.zshrc</InlineCode> or <InlineCode>.env</InlineCode> file:
            </p>

            <ParamTable rows={[
              { name: "QUERYCRAFT_BACKEND_URL", type: "string", default: "http://localhost:8000", desc: "Base URL for the QueryCraft FastAPI backend microservice" },
              { name: "QUERYCRAFT_FRONTEND_URL", type: "string", default: "http://localhost:3000", desc: "Base URL for the Next.js Web Studio and OAuth login receiver" },
              { name: "NVIDIA_API_KEY", type: "string", default: "—", desc: "Optional API key for direct Llama 3.1 70B compilation via NVIDIA NIM" },
            ]} />
          </section>

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
