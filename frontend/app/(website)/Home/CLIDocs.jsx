"use client"

import { useState } from "react"
import {
  Terminal, LogIn, LogOut, User, Database, Copy, Check,
  ChevronRight, Download, BookOpen, Zap, Shield, Globe,
  ArrowRight, Package, Key, RefreshCw, List,
} from "lucide-react"

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={handle}
      title="Copy"
      className="copy-btn"
      aria-label="Copy code snippet"
    >
      {copied ? <Check size={12} className="copy-check" /> : <Copy size={12} />}
    </button>
  )
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({ children, lang = "bash", title, highlight }) {
  const lines = children.trim().split("\n")
  return (
    <div className="codeblock">
      {title && (
        <div className="codeblock-header">
          <span className="codeblock-title">{title}</span>
          <CopyBtn text={children.trim()} />
        </div>
      )}
      {!title && <CopyBtn text={children.trim()} />}
      <pre className="codeblock-pre">
        {lines.map((line, i) => {
          const isHighlight = highlight?.includes(i + 1)
          const isComment = line.trim().startsWith("#")
          const isPrompt = line.trim().startsWith("$")
          const isOutput = line.trim().startsWith("✅") || line.trim().startsWith("✓") || line.trim().startsWith("↓") || line.trim().startsWith("→")
          return (
            <div key={i} className={`codeblock-line ${isHighlight ? "codeblock-line--highlight" : ""}`}>
              {isComment ? (
                <span className="tok-comment">{line}</span>
              ) : isPrompt ? (
                <>
                  <span className="tok-prompt">$</span>
                  <span className="tok-cmd">{line.slice(1)}</span>
                </>
              ) : isOutput ? (
                <span className="tok-output">{line}</span>
              ) : (
                <span className="tok-plain">{line}</span>
              )}
            </div>
          )
        })}
      </pre>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function DocSection({ id, icon: Icon, badge, title, sub, children }) {
  return (
    <section id={id} className="doc-section">
      <div className="doc-section-header">
        <div className="doc-section-icon-wrap">
          <Icon size={18} />
        </div>
        <div>
          {badge && <span className="doc-badge">{badge}</span>}
          <h2 className="doc-section-title">{title}</h2>
          {sub && <p className="doc-section-sub">{sub}</p>}
        </div>
      </div>
      <div className="doc-section-body">{children}</div>
    </section>
  )
}

// ─── Command reference row ────────────────────────────────────────────────────
function CmdRow({ cmd, desc, flags }) {
  return (
    <div className="cmd-row">
      <div className="cmd-row-left">
        <code className="cmd-code">{cmd}</code>
        {flags?.map(f => (
          <span key={f} className="cmd-flag">{f}</span>
        ))}
      </div>
      <p className="cmd-desc">{desc}</p>
    </div>
  )
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "install",    label: "Installation",   icon: Download },
  { id: "login",      label: "Login",          icon: LogIn },
  { id: "logout",     label: "Logout",         icon: LogOut },
  { id: "whoami",     label: "Who Am I",       icon: User },
  { id: "workspaces", label: "Workspaces",     icon: Database },
  { id: "mcp",        label: "MCP Integration",icon: Zap },
  { id: "reference",  label: "Full Reference", icon: BookOpen },
  { id: "env",        label: "Env Config",     icon: Key },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function CLIDocsSection() {
  const [activeNav, setActiveNav] = useState("install")

  const scrollTo = (id) => {
    setActiveNav(id)
    document.getElementById(`doc-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="cli-docs-root" id="cli-docs">
      <style>{`
        /* ── Layout ── */
        .cli-docs-root {
          background: #070e0a;
          color: #e2e8f0;
          padding: 80px 0;
          font-family: Inter, -apple-system, sans-serif;
        }
        .cli-docs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── Page header ── */
        .cli-docs-hero {
          text-align: center;
          margin-bottom: 64px;
        }
        .cli-docs-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.25);
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #6ee7b7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
        .cli-docs-heading {
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 800;
          letter-spacing: -1px;
          color: #fff;
          margin-bottom: 12px;
          line-height: 1.1;
        }
        .cli-docs-heading span { color: #34d399; }
        .cli-docs-subheading {
          color: #6b7280;
          font-size: 16px;
          max-width: 560px;
          margin: 0 auto 32px;
          line-height: 1.7;
        }

        /* ── Quick install strip ── */
        .cli-quick-install {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 12px;
          padding: 12px 20px;
          max-width: 480px;
          margin: 0 auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
        }
        .cli-quick-install-prompt { color: #34d399; }
        .cli-quick-install-cmd { color: #e2e8f0; flex: 1; }

        /* ── Two-column layout ── */
        .cli-docs-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 800px) {
          .cli-docs-layout { grid-template-columns: 1fr; }
          .cli-docs-sidebar { display: none; }
        }

        /* ── Sidebar ── */
        .cli-docs-sidebar {
          position: sticky;
          top: 80px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 12px;
        }
        .sidebar-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #374151;
          padding: 8px 10px 4px;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.15s;
          border: 1px solid transparent;
        }
        .sidebar-item:hover { background: rgba(255,255,255,0.04); color: #d1d5db; }
        .sidebar-item.active {
          background: rgba(52,211,153,0.08);
          border-color: rgba(52,211,153,0.2);
          color: #34d399;
        }

        /* ── Doc sections ── */
        .doc-section {
          margin-bottom: 56px;
          scroll-margin-top: 80px;
        }
        .doc-section-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .doc-section-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34d399;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .doc-badge {
          display: inline-block;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 5px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          color: #a5b4fc;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .doc-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #f9fafb;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }
        .doc-section-sub {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }
        .doc-section-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ── Prose ── */
        .doc-p { color: #9ca3af; font-size: 14px; line-height: 1.8; }
        .doc-p code {
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.15);
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: #6ee7b7;
        }
        .doc-note {
          display: flex;
          gap: 10px;
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #c7d2fe;
          line-height: 1.6;
        }
        .doc-warn {
          display: flex;
          gap: 10px;
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #fde68a;
          line-height: 1.6;
        }
        .doc-success {
          display: flex;
          gap: 10px;
          background: rgba(52,211,153,0.06);
          border: 1px solid rgba(52,211,153,0.18);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #6ee7b7;
          line-height: 1.6;
        }

        /* ── Code block ── */
        .codeblock {
          position: relative;
          background: #020c06;
          border: 1px solid rgba(52,211,153,0.12);
          border-radius: 12px;
          overflow: hidden;
        }
        .codeblock-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 14px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .codeblock-title {
          font-size: 11px;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: 'JetBrains Mono', monospace;
        }
        .codeblock-pre {
          padding: 16px 18px;
          margin: 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.75;
        }
        .codeblock-line { display: block; }
        .codeblock-line--highlight {
          background: rgba(52,211,153,0.06);
          border-left: 2px solid #34d399;
          padding-left: 12px;
          margin: 0 -18px;
          padding-right: 18px;
        }
        .tok-prompt { color: #34d399; margin-right: 8px; user-select: none; }
        .tok-cmd { color: #e2e8f0; }
        .tok-comment { color: #374151; font-style: italic; }
        .tok-output { color: #4ade80; }
        .tok-plain { color: #9ca3af; }
        .copy-btn {
          position: absolute;
          top: 10px;
          right: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 4px 7px;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.15s;
          line-height: 0;
        }
        .codeblock-header + .codeblock-pre + .copy-btn,
        .codeblock-header ~ .copy-btn { top: auto; bottom: 10px; }
        .copy-btn:hover { background: rgba(52,211,153,0.1); color: #34d399; border-color: rgba(52,211,153,0.3); }
        .copy-check { color: #34d399; }

        /* ── Command reference ── */
        .cmd-table {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }
        .cmd-row {
          display: grid;
          grid-template-columns: 280px 1fr;
          align-items: center;
          gap: 16px;
          padding: 13px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.1s;
        }
        .cmd-row:last-child { border-bottom: none; }
        .cmd-row:hover { background: rgba(255,255,255,0.02); }
        .cmd-row-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .cmd-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #34d399;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.18);
          border-radius: 6px;
          padding: 3px 8px;
          white-space: nowrap;
        }
        .cmd-flag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #a5b4fc;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 5px;
          padding: 2px 6px;
        }
        .cmd-desc { color: #6b7280; font-size: 13px; line-height: 1.5; }
        @media (max-width: 600px) {
          .cmd-row { grid-template-columns: 1fr; }
        }

        /* ── Step list ── */
        .steps { display: flex; flex-direction: column; gap: 0; }
        .step {
          display: flex;
          gap: 16px;
          padding-bottom: 24px;
          position: relative;
        }
        .step:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 17px;
          top: 36px;
          bottom: 0;
          width: 1px;
          background: rgba(52,211,153,0.15);
        }
        .step-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.25);
          color: #34d399;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-body { flex: 1; }
        .step-title { font-size: 14px; font-weight: 700; color: #f9fafb; margin-bottom: 6px; }
        .step-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }

        /* ── Env table ── */
        .env-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .env-table th {
          text-align: left;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          color: #4b5563;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .env-table td {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: top;
        }
        .env-table tr:last-child td { border-bottom: none; }
        .env-table tr:hover td { background: rgba(255,255,255,0.015); }
        .env-key { font-family: 'JetBrains Mono', monospace; color: #a5b4fc; font-size: 12px; }
        .env-val { font-family: 'JetBrains Mono', monospace; color: #6b7280; font-size: 11px; }
        .env-desc { color: #6b7280; line-height: 1.5; }
        .env-req {
          display: inline-block;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 10px;
          color: #fca5a5;
          font-weight: 600;
        }
        .env-opt {
          display: inline-block;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 10px;
          color: #6ee7b7;
          font-weight: 600;
        }
      `}</style>

      <div className="cli-docs-container">
        {/* Hero */}
        <div className="cli-docs-hero">
          <div className="cli-docs-badge">
            <Terminal size={11} />
            CLI Reference v1.0
          </div>
          <h1 className="cli-docs-heading">
            <span>querycraft</span> CLI Documentation
          </h1>
          <p className="cli-docs-subheading">
            Authenticate, manage workspaces, and run AI-powered queries on your live databases — all from the terminal.
          </p>
          {/* Quick install strip */}
          <div className="cli-quick-install">
            <span className="cli-quick-install-prompt">$</span>
            <span className="cli-quick-install-cmd">bash &lt;(curl -fsSL https://querycraft.ai/install.sh)</span>
            <CopyBtn text="bash <(curl -fsSL https://querycraft.ai/install.sh)" />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="cli-docs-layout">

          {/* Sidebar */}
          <nav className="cli-docs-sidebar">
            <div className="sidebar-label">On this page</div>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`sidebar-item ${activeNav === id ? "active" : ""}`}
                onClick={() => scrollTo(id)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div>

            {/* ── INSTALL ── */}
            <div id="doc-install">
              <DocSection id="install" icon={Download} badge="Step 1" title="Installation" sub="One-command setup — no extra dependencies needed beyond Python 3.10+.">
                <div className="steps">
                  <div className="step">
                    <div className="step-num">1</div>
                    <div className="step-body">
                      <div className="step-title">Clone the repo & run setup</div>
                      <div className="step-desc">This installs everything: backend dependencies, MCP config, and the global <code className="doc-p code">querycraft</code> CLI command.</div>
                      <CodeBlock title="Terminal">{`$ git clone https://github.com/yourname/querycraft.git
$ cd querycraft
$ bash setup-mcp.sh`}</CodeBlock>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">2</div>
                    <div className="step-body">
                      <div className="step-title">Add to PATH (if needed)</div>
                      <div className="step-desc">The installer places the <code className="doc-p code">querycraft</code> wrapper at <code className="doc-p code">~/.local/bin</code>. Add it to your shell profile if it's not already on PATH.</div>
                      <CodeBlock title="~/.zshrc or ~/.bashrc">{`$ echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
$ source ~/.zshrc`}</CodeBlock>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">3</div>
                    <div className="step-body">
                      <div className="step-title">Verify installation</div>
                      <CodeBlock title="Terminal">{`$ querycraft --help

# Expected output:
usage: querycraft [-h] <command> ...
  auth        Authentication commands
  workspaces  Workspace management commands`}</CodeBlock>
                    </div>
                  </div>
                </div>
                <div className="doc-success">
                  <Check size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  The installer automatically configures your MCP server for Antigravity, Cursor IDE, and Claude Desktop in one go.
                </div>
              </DocSection>
            </div>

            {/* ── LOGIN ── */}
            <div id="doc-login">
              <DocSection id="login" icon={LogIn} badge="Auth" title="querycraft auth login" sub="Opens your browser, signs you in on the QueryCraft website, and saves a 30-day session token locally.">
                <CodeBlock title="Basic login">{`$ querycraft auth login`}</CodeBlock>
                <p className="doc-p">
                  This command starts a local callback server on <code>localhost:9876</code>, opens your browser to the QueryCraft sign-in page, and waits. After you sign in (with Email, Google, or GitHub), the page sends the session token back to your terminal automatically.
                </p>
                <CodeBlock title="Full login flow output">{`$ querycraft auth login

  🔐 QueryCraft CLI Login

  Opening browser for authentication...
  ✓ Listening on http://127.0.0.1:9876/callback

  [Browser opens → you sign in]

  ✅ Authenticated as: you@company.com
  ✅ Credentials saved to ~/.querycraft/auth.json

  3 workspace(s) found:
    ● Production    [POSTGRES]  ✅ Live connection configured
    ○ Staging       [POSTGRES]  ✅ Live connection configured
    ○ Analytics     [MONGODB]   ✅ Live connection configured`}</CodeBlock>
                <CodeBlock title="Force re-authentication">{`$ querycraft auth login --force

# Re-authenticates even if you are already logged in`}</CodeBlock>
                <div className="doc-note">
                  <Globe size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>The session token is stored in <code>~/.querycraft/auth.json</code> with <code>chmod 600</code> permissions. It is valid for <strong>30 days</strong> and is automatically refreshed when you log in again.</span>
                </div>
              </DocSection>
            </div>

            {/* ── LOGOUT ── */}
            <div id="doc-logout">
              <DocSection id="logout" icon={LogOut} badge="Auth" title="querycraft auth logout" sub="Clears your stored credentials and ends the local CLI session.">
                <CodeBlock title="Logout">{`$ querycraft auth logout`}</CodeBlock>
                <p className="doc-p">
                  This deletes <code>~/.querycraft/auth.json</code> and removes the active session from the MCP server. After logout, any MCP tool calls will fall back to the <code>default_user</code> sandbox context until you log in again.
                </p>
                <CodeBlock title="Logout output">{`$ querycraft auth logout

  ✅ Logged out of you@company.com
  Credentials removed from ~/.querycraft/auth.json`}</CodeBlock>
                <div className="doc-warn">
                  <Shield size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Logging out does <strong>not</strong> revoke the token on the server immediately. To revoke all active sessions, go to <strong>QueryCraft Dashboard → Settings → Active Sessions</strong> and click "Revoke All".</span>
                </div>
              </DocSection>
            </div>

            {/* ── WHOAMI ── */}
            <div id="doc-whoami">
              <DocSection id="whoami" icon={User} badge="Auth" title="querycraft auth whoami" sub="Displays your currently authenticated account and session details.">
                <CodeBlock title="Check current user">{`$ querycraft auth whoami`}</CodeBlock>
                <CodeBlock title="Output">{`  ✅ Logged in as: you@company.com
  Session created: 2026-08-31  |  Expires: 2026-09-30
  Backend: http://localhost:8000`}</CodeBlock>
                <p className="doc-p">
                  Returns a <code>1</code> exit code if you are not logged in, making it safe to use in shell scripts and CI pipelines.
                </p>
                <CodeBlock title="Shell script usage">{`# Check auth before running queries
if querycraft auth whoami > /dev/null 2>&1; then
  echo "Authenticated, proceeding..."
else
  querycraft auth login
fi`}</CodeBlock>
              </DocSection>
            </div>

            {/* ── WORKSPACES ── */}
            <div id="doc-workspaces">
              <DocSection id="workspaces" icon={Database} badge="Workspaces" title="querycraft workspaces list" sub="Lists all database workspaces tied to your logged-in account.">
                <CodeBlock title="List workspaces">{`$ querycraft workspaces list`}</CodeBlock>
                <CodeBlock title="Output">{`  3 workspace(s) found:

    ● Production    [POSTGRES]  ✅ Live connection configured
    ○ Staging       [POSTGRES]  ✅ Live connection configured
    ○ Analytics     [MONGODB]   ⚠ No connection URI`}</CodeBlock>
                <p className="doc-p">
                  A <code>●</code> bullet means the workspace is currently active. A <code>○</code> is inactive. Connect or update a workspace's database URI from the <strong>QueryCraft Web Dashboard → Workspaces</strong>.
                </p>
                <div className="doc-note">
                  <Database size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>You can have <strong>unlimited workspaces</strong> — each with a different database engine, connection URL, and environment tag (Production, Staging, Analytics, etc.).</span>
                </div>
              </DocSection>
            </div>

            {/* ── MCP ── */}
            <div id="doc-mcp">
              <DocSection id="mcp" icon={Zap} badge="MCP" title="MCP Integration" sub="After login, Antigravity and Cursor automatically detect your account — no extra configuration needed.">
                <p className="doc-p">
                  The QueryCraft MCP server reads <code>~/.querycraft/auth.json</code> on every startup. Once you run <code>querycraft auth login</code>, your AI assistant is permanently authenticated.
                </p>
                <CodeBlock title="Ask your AI assistant">{`# In Antigravity or Cursor chat:
"List my available QueryCraft workspaces"
→ Shows Production, Staging, Analytics with live status

"Switch to my Analytics workspace"
→ ✓ Active workspace set to: Analytics

"Check compute cost and run: SELECT * FROM users LIMIT 10;"
→ Evaluates EXPLAIN cost, heals if dangerous, runs query,
  returns data as a Markdown table`}</CodeBlock>
                <div className="doc-success">
                  <Zap size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <strong>Zero config after login.</strong> Your session is bound to the MCP server automatically. You never need to type your email in chat again.
                </div>
                <CodeBlock title="Restart MCP server after first login">{`# Restart your IDE or run setup again to pick up new auth
$ bash setup-mcp.sh`}</CodeBlock>
              </DocSection>
            </div>

            {/* ── FULL REFERENCE ── */}
            <div id="doc-reference">
              <DocSection id="reference" icon={BookOpen} title="Full Command Reference">
                <div className="cmd-table">
                  <CmdRow cmd="querycraft setup"          desc="1-Click universal auto-config for Claude Desktop, Cursor IDE, Antigravity, and Windsurf MCP." />
                  <CmdRow cmd="querycraft ask"            flags={["\"<prompt>\""]} desc="Natural language English to safe PostgreSQL SQL with EXPLAIN cost check and table results." />
                  <CmdRow cmd="querycraft check"          flags={["\"<SQL>\"", "[--threshold <cost>]"]} desc="Pre-Flight Cost Guard: Evaluates EXPLAIN cost, detects sequential scans, and suggests index DDL." />
                  <CmdRow cmd="querycraft doctor"         flags={["\"<error or SQL>\""]} desc="SQL Doctor self-healing agent: Diagnoses PostgreSQL SQLSTATE error codes and generates verified repairs." />
                  <CmdRow cmd="querycraft query"          flags={["\"<SQL>\""]} desc="Execute raw read-only SQL queries directly against your connected database with latency metrics." />
                  <CmdRow cmd="querycraft schema"         desc="Introspect tables, column data types, Primary Keys [PK], and Foreign Keys [FK]." />
                  <CmdRow cmd="querycraft connect"        flags={["<URI>", "[--workspace <name>]"]} desc="Connect and link a live PostgreSQL database (Supabase, Neon, AWS RDS) to a workspace." />
                  <CmdRow cmd="querycraft auth login"    flags={["[--force]"]} desc="Open browser and authenticate via QueryCraft website. Use --force to re-authenticate even if already logged in." />
                  <CmdRow cmd="querycraft auth logout"   desc="Clear stored credentials and end CLI session." />
                  <CmdRow cmd="querycraft auth whoami"   desc="Show current logged-in email, session creation date, and expiry." />
                  <CmdRow cmd="querycraft workspaces list" desc="List all database workspaces for your account with connection status." />
                  <CmdRow cmd="querycraft --help"        desc="Show global help and available commands." />
                </div>
              </DocSection>
            </div>

            {/* ── ENV CONFIG ── */}
            <div id="doc-env">
              <DocSection id="env" icon={Key} badge="Advanced" title="Environment Variables" sub="Override CLI behavior with environment variables — useful for CI/CD, Docker, and team deployments.">
                <div className="cmd-table">
                  <table className="env-table">
                    <thead>
                      <tr>
                        <th style={{ width: "220px" }}>Variable</th>
                        <th style={{ width: "130px" }}>Default</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="env-key">QUERYCRAFT_USER_EMAIL</span></td>
                        <td><span className="env-val">""</span></td>
                        <td className="env-desc">Pre-sets the user email. Skips browser login. Useful for Docker containers and CI/CD pipelines. Takes priority over <code>auth.json</code>. <span className="env-opt">optional</span></td>
                      </tr>
                      <tr>
                        <td><span className="env-key">QUERYCRAFT_API_KEY</span></td>
                        <td><span className="env-val">""</span></td>
                        <td className="env-desc">Personal access token for API authentication. Skips the browser OAuth flow entirely. <span className="env-opt">optional</span></td>
                      </tr>
                      <tr>
                        <td><span className="env-key">QUERYCRAFT_BACKEND_URL</span></td>
                        <td><span className="env-val">http://localhost:8000</span></td>
                        <td className="env-desc">URL of the QueryCraft FastAPI backend. Change this when connecting to a remote or cloud-deployed backend. <span className="env-opt">optional</span></td>
                      </tr>
                      <tr>
                        <td><span className="env-key">QUERYCRAFT_FRONTEND_URL</span></td>
                        <td><span className="env-val">http://localhost:3000</span></td>
                        <td className="env-desc">URL of the QueryCraft web frontend. The browser will open this during <code>auth login</code>. <span className="env-opt">optional</span></td>
                      </tr>
                      <tr>
                        <td><span className="env-key">LOCAL_DATABASE_URL</span></td>
                        <td><span className="env-val">""</span></td>
                        <td className="env-desc">Default connection URI injected into your first workspace when no workspace URI is set. Useful for local development. <span className="env-opt">optional</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <CodeBlock title="Example: CI/CD usage (no browser)">{`# .env or docker-compose.yml
QUERYCRAFT_USER_EMAIL=ci-bot@company.com
QUERYCRAFT_API_KEY=qc_live_xxxxxxxxxxxxxxxx
QUERYCRAFT_BACKEND_URL=https://api.querycraft.ai`}</CodeBlock>
                <CodeBlock title="Example: mcp_config.json (permanent auto-login)">{`{
  "mcpServers": {
    "querycraft-cost-guard": {
      "command": "/path/to/.venv/bin/python",
      "args": ["-m", "app.mcp_server"],
      "cwd": "/path/to/querycraft/backend",
      "env": {
        "QUERYCRAFT_USER_EMAIL": "you@company.com"
      }
    }
  }
}`}</CodeBlock>
              </DocSection>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
