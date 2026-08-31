"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Terminal, LogIn, LogOut, User, Database,
  Copy, Check, ChevronRight, Download,
  Zap, Shield, Key, BookOpen, Menu, X,
} from "lucide-react"

// ─── tiny copy button ─────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
      style={{
        position: "absolute", top: 10, right: 10,
        background: "none", border: "1px solid #e5e7eb",
        borderRadius: 6, padding: "3px 7px", cursor: "pointer",
        color: "#9ca3af", display: "flex", alignItems: "center", gap: 4,
        fontSize: 11, transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.color = "#374151" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af" }}
    >
      {copied ? <Check size={11} style={{ color: "#059669" }} /> : <Copy size={11} />}
    </button>
  )
}

// ─── code block ──────────────────────────────────────────────────────────────
function Code({ children, title }) {
  const raw = children.trim()
  const lines = raw.split("\n")
  return (
    <div style={{ position: "relative", margin: "16px 0" }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", fontFamily: "monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </div>
      )}
      <div style={{
        background: "#0f172a", borderRadius: 10,
        border: "1px solid #1e293b", overflow: "hidden", position: "relative",
      }}>
        <CopyButton text={raw} />
        <pre style={{
          margin: 0, padding: "16px 48px 16px 18px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13, lineHeight: 1.75, overflowX: "auto",
        }}>
          {lines.map((line, i) => {
            const isComment  = line.trim().startsWith("#")
            const isPrompt   = line.trim().startsWith("$")
            const isSuccess  = line.trim().startsWith("✅") || line.trim().startsWith("✓")
            const isOutput   = line.trim().startsWith("→") || line.trim().startsWith("↓")
            const color = isComment ? "#475569" : isPrompt ? null : isSuccess ? "#34d399" : isOutput ? "#94a3b8" : "#cbd5e1"
            return (
              <div key={i} style={{ color }}>
                {isPrompt ? (
                  <><span style={{ color: "#34d399", userSelect: "none" }}>$</span><span style={{ color: "#e2e8f0" }}>{line.slice(1)}</span></>
                ) : line}
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}

// ─── inline code ─────────────────────────────────────────────────────────────
function IC({ children }) {
  return (
    <code style={{
      background: "#f1f5f9", border: "1px solid #e2e8f0",
      borderRadius: 4, padding: "1px 5px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em", color: "#0f172a",
    }}>
      {children}
    </code>
  )
}

// ─── callout ─────────────────────────────────────────────────────────────────
function Note({ type = "note", children }) {
  const styles = {
    note:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", icon: "💡" },
    warn:    { bg: "#fffbeb", border: "#fde68a", color: "#92400e", icon: "⚠️" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", icon: "✅" },
  }
  const s = styles[type]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: "12px 16px",
      fontSize: 13, color: s.color, lineHeight: 1.7,
      display: "flex", gap: 10, margin: "16px 0",
    }}>
      <span style={{ flexShrink: 0 }}>{s.icon}</span>
      <span>{children}</span>
    </div>
  )
}

// ─── sidebar items ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "installation",  label: "Installation",     icon: Download },
  { id: "login",         label: "auth login",       icon: LogIn },
  { id: "logout",        label: "auth logout",      icon: LogOut },
  { id: "whoami",        label: "auth whoami",      icon: User },
  { id: "workspaces",    label: "workspaces list",  icon: Database },
  { id: "mcp",           label: "MCP Integration",  icon: Zap },
  { id: "ai",            label: "AI & ChatGPT",     icon: Terminal },
  { id: "reference",     label: "Command Reference",icon: BookOpen },
  { id: "env",           label: "Environment Vars", icon: Key },
]

// ─── page ─────────────────────────────────────────────────────────────────────
function DocsPageInner() {
  const [active, setActive]     = useState("installation")
  const [mobileOpen, setMobile] = useState(false)

  // Intersection observer to highlight active section
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setMobile(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0f172a", fontFamily: "Inter, -apple-system, sans-serif" }}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #f1f5f9",
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
        height: 56, display: "flex", alignItems: "center",
        padding: "0 24px", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ width: 28, height: 28, background: "#0f172a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={14} color="#34d399" />
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>QueryCraft</span>
          </Link>
          <span style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 300 }}>/</span>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>CLI Reference</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
          >
            ← Back to Home
          </Link>
          <Link href="/Dashboard" style={{
            fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none",
            background: "#0f172a", borderRadius: 7, padding: "6px 14px",
          }}>
            Open Dashboard
          </Link>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobile(v => !v)}
            style={{ display: "none", background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: 5, cursor: "pointer" }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* ── Layout ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "calc(100vh - 56px)" }} className="docs-grid">

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: "1px solid #f1f5f9",
          position: "sticky", top: 56, height: "calc(100vh - 56px)",
          overflowY: "auto", padding: "32px 0",
        }} className={`docs-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
          <div style={{ padding: "0 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 8 }}>
              Commands
            </p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                  background: active === id ? "#f1f5f9" : "none",
                  border: "none",
                  color: active === id ? "#0f172a" : "#64748b",
                  fontSize: 13, fontWeight: active === id ? 600 : 400,
                  transition: "all 0.1s", marginBottom: 2,
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={e => { if (active !== id) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#374151" }}}
                onMouseLeave={e => { if (active !== id) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748b" }}}
              >
                <Icon size={13} style={{ flexShrink: 0, color: active === id ? "#059669" : "#94a3b8" }} />
                <span style={{ fontFamily: id !== "installation" && id !== "reference" && id !== "env" && id !== "mcp" && id !== "workspaces" ? "'JetBrains Mono', monospace" : "inherit", fontSize: id !== "installation" && id !== "reference" && id !== "env" && id !== "mcp" ? 12 : 13 }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Content ── */}
        <main style={{ padding: "48px 56px 96px", minWidth: 0 }} className="docs-main">

          {/* Page title */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
              <Terminal size={12} />
              <span>CLI Documentation</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 10, color: "#0f172a" }}>
              querycraft CLI
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, maxWidth: 560 }}>
              Authenticate, manage workspaces, and run AI-powered queries on your live databases — all from the terminal.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["No extra dependencies", "Works offline", "30-day sessions", "MCP auto-login"].map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", marginBottom: 48 }} />

          {/* ── INSTALLATION ── */}
          <section id="installation" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={Download} label="Installation" />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Clone the repo and run the one-click installer. It configures the backend, installs the <IC>querycraft</IC> global command, and sets up MCP for Antigravity, Cursor, and Claude Desktop.
            </p>
            <Code title="Step 1 — Clone & run setup">{`$ git clone https://github.com/yourname/querycraft.git
$ cd querycraft
$ bash setup-mcp.sh`}</Code>
            <Code title="Step 2 — Add to PATH (if needed)">{`$ echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
$ source ~/.zshrc`}</Code>
            <Code title="Step 3 — Verify">{`$ querycraft --help

# Output:
usage: querycraft [-h] <command> ...
  auth        Authentication commands
  workspaces  Workspace management commands`}</Code>
            <Note type="success">The installer auto-configures MCP for Antigravity, Cursor IDE, and Claude Desktop simultaneously.</Note>
          </section>

          <Divider />

          {/* ── LOGIN ── */}
          <section id="login" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={LogIn} label="querycraft auth login" mono />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Opens your browser to the QueryCraft sign-in page. After you authenticate, the page sends a session token back to your terminal automatically — no copy-pasting required.
            </p>
            <Code title="Basic">{`$ querycraft auth login`}</Code>
            <Code title="Force re-authentication">{`$ querycraft auth login --force`}</Code>
            <Code title="Full output">{`$ querycraft auth login

  🔐 QueryCraft CLI Login

  Opening browser for authentication...
  ✓ Listening on http://127.0.0.1:9876/callback

  [Browser opens → sign in with Email / Google / GitHub]

  ✅ Authenticated as: you@company.com
  ✅ Credentials saved to ~/.querycraft/auth.json

  3 workspace(s) found:
    ● Production  [POSTGRES]  ✅ Live connection
    ○ Staging     [POSTGRES]  ✅ Live connection
    ○ Analytics   [MONGODB]   ⚠ No URI set`}</Code>
            <Note type="note">
              Token is stored at <IC>~/.querycraft/auth.json</IC> with <IC>chmod 600</IC> permissions. Valid for <strong>30 days</strong>.
            </Note>

            {/* Flags table */}
            <FlagTable rows={[
              { flag: "--force", desc: "Re-authenticate even if a valid session already exists." },
            ]} />
          </section>

          <Divider />

          {/* ── LOGOUT ── */}
          <section id="logout" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={LogOut} label="querycraft auth logout" mono />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Deletes <IC>~/.querycraft/auth.json</IC> and ends the CLI session. The MCP server falls back to the <IC>default_user</IC> sandbox until you log in again.
            </p>
            <Code>{`$ querycraft auth logout

  ✅ Logged out of you@company.com
  Credentials removed from ~/.querycraft/auth.json`}</Code>
            <Note type="warn">
              Logout does <strong>not</strong> revoke the server-side token immediately. To revoke all sessions, go to <strong>Dashboard → Settings → Active Sessions → Revoke All</strong>.
            </Note>
          </section>

          <Divider />

          {/* ── WHOAMI ── */}
          <section id="whoami" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={User} label="querycraft auth whoami" mono />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Prints the currently authenticated account and session metadata.
            </p>
            <Code>{`$ querycraft auth whoami

  ✅ Logged in as: you@company.com
  Session created: 2026-08-31  |  Expires: 2026-09-30
  Backend: http://localhost:8000`}</Code>
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.8, marginTop: 16 }}>
              Returns exit code <IC>1</IC> when not logged in — safe for use in shell scripts:
            </p>
            <Code>{`$ querycraft auth whoami > /dev/null 2>&1 || querycraft auth login`}</Code>
          </section>

          <Divider />

          {/* ── WORKSPACES ── */}
          <section id="workspaces" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={Database} label="querycraft workspaces list" mono />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Lists all database workspaces tied to your account with their engine and live connection status.
            </p>
            <Code>{`$ querycraft workspaces list

  3 workspace(s) found:

    ● Production  [POSTGRES]  ✅ Live connection configured
    ○ Staging     [POSTGRES]  ✅ Live connection configured
    ○ Analytics   [MONGODB]   ⚠ No connection URI`}</Code>
            <Note type="note">
              A <IC>●</IC> bullet = active workspace. Connect or update URIs from the <strong>QueryCraft Dashboard → Workspaces</strong>. You can have unlimited workspaces per account.
            </Note>
          </section>

          <Divider />

          {/* ── MCP ── */}
          <section id="mcp" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={Zap} label="MCP Integration" />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              After running <IC>querycraft auth login</IC>, the MCP server reads <IC>~/.querycraft/auth.json</IC> on every startup. Your AI assistant is automatically authenticated.
            </p>
            <Code title="Ask your AI assistant (Antigravity / Cursor / Claude)">{`"List my available QueryCraft workspaces"
→ Shows Production, Staging, Analytics with status

"Switch to my Analytics workspace"
→ ✅ Active workspace set to: Analytics

"Check cost and run: SELECT * FROM users LIMIT 10;"
→ Evaluates EXPLAIN, heals if risky, runs query,
  returns data as a Markdown table`}</Code>
          </section>

          <Divider />

          {/* ── AI & CHATGPT ── */}
          <section id="ai" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={Terminal} label="AI Assistants & ChatGPT Setup" />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              QueryCraft works universally across <strong>Claude Desktop</strong>, <strong>ChatGPT</strong>, <strong>Cursor IDE</strong>, and <strong>Antigravity</strong>.
            </p>
            <Code title="Inspect all AI integrations">{`$ querycraft ai list`}</Code>
            <Code title="Output">{`  Claude Desktop App  [MCP (Model Context Protocol)]
    Status: ✅ Configured & Active
    Path:   ~/Library/Application Support/Claude/claude_desktop_config.json

  Cursor IDE  [MCP (Model Context Protocol)]
    Status: ✅ Configured & Active
    Path:   ~/.cursor/mcp.json

  ChatGPT (Custom GPT Actions & Web Plugins)
    Status: ✅ Ready via OpenAPI 3.1 & Plugin Manifest
    Action Schema: http://localhost:8000/api/gpt-action/openapi.json`}</Code>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginTop: 24, marginBottom: 8 }}>
              Connecting to ChatGPT Custom GPT
            </h3>
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
              1. Open <strong>chatgpt.com/create</strong> → go to <strong>Configure</strong> tab.<br/>
              2. Click <strong>Create new action</strong> → <strong>Import from URL</strong>.<br/>
              3. Paste: <IC>http://localhost:8000/api/gpt-action/openapi.json</IC> (or paste the JSON from <IC>docs/chatgpt_custom_action.json</IC>).
            </p>
            <Code title="Quick help command in CLI">{`$ querycraft ai chatgpt`}</Code>
          </section>

          <Divider />

          {/* ── REFERENCE ── */}
          <section id="reference" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={BookOpen} label="Command Reference" />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Command</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["querycraft auth login",          "Browser OAuth login. Saves 30-day session token."],
                  ["querycraft auth login --force",   "Force re-authentication even if already logged in."],
                  ["querycraft auth logout",          "Clear credentials and end session."],
                  ["querycraft auth whoami",          "Show current user, session dates, and backend URL."],
                  ["querycraft workspaces list",      "List all workspaces with engine and connection status."],
                  ["querycraft ai list",              "Check connection status of Claude, Cursor, ChatGPT, Antigravity."],
                  ["querycraft ai chatgpt",           "Display ChatGPT Custom Action setup instructions & schema URL."],
                  ["querycraft --help",               "Show global help."],
                  ["querycraft auth --help",          "Show auth subcommand help."],
                  ["querycraft workspaces --help",    "Show workspaces subcommand help."],
                  ["querycraft ai --help",            "Show AI integrations subcommand help."],
                ].map(([cmd, desc], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0f172a", whiteSpace: "nowrap" }}>{cmd}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b", lineHeight: 1.5 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <Divider />

          {/* ── ENV ── */}
          <section id="env" style={{ marginBottom: 56, scrollMarginTop: 76 }}>
            <SectionHead icon={Key} label="Environment Variables" />
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              Override CLI behavior with environment variables — useful for CI/CD, Docker, and team deployments.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Variable", "Default", "Description"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["QUERYCRAFT_USER_EMAIL",  '""',                      "Pre-sets user email. Skips browser login. Takes priority over auth.json."],
                  ["QUERYCRAFT_API_KEY",     '""',                      "Personal access token. Skips the OAuth flow entirely."],
                  ["QUERYCRAFT_BACKEND_URL", "http://localhost:8000",   "QueryCraft FastAPI backend URL."],
                  ["QUERYCRAFT_FRONTEND_URL","http://localhost:3000",   "QueryCraft web frontend URL (used during auth login)."],
                  ["LOCAL_DATABASE_URL",     '""',                      "Default DB URI injected into first workspace when no URI is set."],
                ].map(([v, d, desc], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7c3aed", whiteSpace: "nowrap" }}>{v}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{d}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b", lineHeight: 1.5 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Code title="Example — CI/CD (no browser)">{`# .env or docker-compose.yml
QUERYCRAFT_USER_EMAIL=ci-bot@company.com
QUERYCRAFT_API_KEY=qc_live_xxxxxxxxxxxxxxxx
QUERYCRAFT_BACKEND_URL=https://api.querycraft.ai`}</Code>
          </section>

        </main>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .docs-grid { grid-template-columns: 200px 1fr; }
        .docs-sidebar { display: block; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .docs-grid { grid-template-columns: 1fr !important; }
          .docs-sidebar { display: none; border: none; position: static; height: auto; padding: 16px 0; }
          .docs-sidebar.mobile-open { display: block !important; border-bottom: 1px solid #f1f5f9; }
          .docs-main { padding: 32px 20px 64px !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        section { outline: none; }
      `}</style>
    </div>
  )
}

// ─── small helpers ────────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, label, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <Icon size={16} style={{ color: "#059669", flexShrink: 0 }} />
      <h2 style={{
        fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0,
        fontFamily: mono ? "'JetBrains Mono', monospace" : "Inter, sans-serif",
        letterSpacing: mono ? "-0.3px" : "-0.2px",
      }}>
        {label}
      </h2>
    </div>
  )
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0 0 48px" }} />
}

function FlagTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 16, border: "1px solid #f1f5f9", borderRadius: 8, overflow: "hidden" }}>
      <thead>
        <tr style={{ background: "#f8fafc" }}>
          <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Flag</th>
          <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ flag, desc }, i) => (
          <tr key={i}>
            <td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7c3aed" }}>{flag}</td>
            <td style={{ padding: "8px 12px", color: "#64748b" }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
export default function CLIDocsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <p style={{ color: "#94a3b8", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Loading...</p>
      </div>
    }>
      <DocsPageInner />
    </Suspense>
  )
}
