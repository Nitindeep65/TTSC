"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  HelpCircle,
  Layers,
  Lock,
  Menu,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function QueryCraftLandingPage() {
  // Terminal scenario switcher state
  const [activeScenario, setActiveScenario] = useState("check")
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedIndexDdl, setCopiedIndexDdl] = useState(false)
  const [selectedClarifyChip, setSelectedClarifyChip] = useState("Completed Only")

  const copyToClipboard = (text, type = "snippet") => {
    if (!text) return
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
    if (type === "snippet") {
      setCopiedSnippet(true)
      setTimeout(() => setCopiedSnippet(false), 1800)
    } else if (type === "install") {
      setCopiedInstall(true)
      setTimeout(() => setCopiedInstall(false), 1800)
    } else if (type === "index") {
      setCopiedIndexDdl(true)
      setTimeout(() => setCopiedIndexDdl(false), 1800)
    }
  }

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Scroll listener for floating capsule navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Keyboard shortcut listener for Cmd+3 to open studio
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "3") {
        e.preventDefault()
        window.location.href = "/Dashboard"
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20 selection:text-teal-900 font-sans antialiased overflow-x-hidden relative">
      
      {/* ── VISIBLE BACKGROUND TEXTURES & TACTILE GRID (RICH TEXTURED WHITE CANVAS) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        
        {/* Ambient Top Light Illumination */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-teal-400/[0.12] via-emerald-400/[0.06] to-transparent blur-[140px]" />
        <div className="absolute top-[40%] -right-24 w-[600px] h-[500px] bg-indigo-500/[0.04] blur-[160px]" />
        <div className="absolute top-[65%] -left-24 w-[600px] h-[500px] bg-teal-500/[0.04] blur-[160px]" />

        {/* Texture Layer 1: Visible Precision Dot Matrix */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(rgba(71,85,105,0.22)_1.5px,transparent_1.5px)] bg-[size:24px_24px]" 
        />

        {/* Texture Layer 2: Visible Engineering Grid Mesh */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:72px_72px]" 
        />

        {/* Texture Layer 3: Tactile Paper/Canvas Micro-Noise Texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.065] mix-blend-multiply">
          <filter id="querycraft-paper-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" />
          </filter>
          <rect width="100%" height="100%" filter="url(#querycraft-paper-texture)" />
        </svg>

        {/* Soft Edge Vignette (Subtle edge softening) */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-white/40" />
      </div>

      {/* ── MODERN FLOATING CAPSULE / ISLAND NAVBAR ── */}
      <header className="fixed top-3 sm:top-4 inset-x-0 z-50 mx-auto max-w-5xl px-3 sm:px-6 w-full pointer-events-none">
        <div 
          className={`pointer-events-auto rounded-full border transition-all duration-300 flex items-center justify-between px-3.5 sm:px-4 py-2 ${
            isScrolled
              ? "bg-white/95 border-slate-300/90 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
              : "bg-white/85 border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          }`}
        >
          {/* Brand Logo & Live Engine Tag */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8.5 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/35 flex items-center justify-center text-teal-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
              <Database className="size-4 text-teal-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">QueryCraft</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-[10px] font-mono font-bold text-teal-700">
                <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                PG 14-17
              </span>
            </div>
          </Link>

          {/* Center Segmented Pill Navigation */}
          <nav className="hidden md:flex items-center rounded-full bg-slate-100/80 p-1 border border-slate-200/60 text-xs font-medium text-slate-600 shadow-2xs">
            <a href="#problem" className="px-3 py-1 rounded-full hover:text-slate-900 hover:bg-white transition-all">
              Why Generic AI Fails
            </a>
            <a href="#pillars" className="px-3 py-1 rounded-full hover:text-slate-900 hover:bg-white transition-all">
              5 Core Pillars
            </a>
            <a href="#how-it-works" className="px-3 py-1 rounded-full hover:text-slate-900 hover:bg-white transition-all">
              Architecture
            </a>
            <Link href="/docs/cli" className="px-3 py-1 rounded-full flex items-center gap-1.5 text-teal-700 hover:text-teal-800 hover:bg-white transition-all font-semibold">
              <Terminal className="size-3 text-teal-600" />
              <span>CLI &amp; MCP</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/docs/cli" className="hidden lg:inline-flex">
              <button
                type="button"
                className="h-8 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="size-3 text-teal-600" />
                <span>CLI Docs</span>
              </button>
            </Link>

            <Link href="/Dashboard">
              <button
                type="button"
                className="h-8.5 px-3.5 sm:px-4 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold tracking-tight shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch Studio</span>
                <kbd className="hidden sm:inline-block font-mono text-[9px] bg-white/20 px-1.5 py-0.2 rounded text-white font-bold">
                  ⌘3
                </kbd>
              </button>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden size-8.5 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Floating Mobile Dropdown Menu Card */}
        {isMobileMenuOpen && (
          <div className="pointer-events-auto md:hidden mt-2 p-4 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <a 
                href="#problem" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Why Generic AI Fails
              </a>
              <a 
                href="#pillars" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                5 Core Pillars
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Architecture &amp; Workflow
              </a>
              <Link 
                href="/docs/cli" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl flex items-center gap-2 text-teal-700 hover:bg-teal-50 transition-colors font-semibold"
              >
                <Terminal className="size-4 text-teal-600" />
                <span>CLI &amp; MCP Documentation</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PostgreSQL 14-17 Ready</span>
              </div>
              <Link href="/Dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm"
                >
                  Open Studio (⌘3)
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10">

        {/* ========================================================================= */}
        {/* SECTION 1: THE HERO (ABOVE THE FOLD)                                      */}
        {/* ========================================================================= */}
        <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Announcement Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/30 bg-teal-50/80 text-xs font-semibold text-teal-800 shadow-xs">
              <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Production AI Firewall &amp; Diagnostic Doctor</span>
              <span className="text-teal-500/40">·</span>
              <span className="text-teal-700 font-mono text-[11px]">PostgreSQL 14 - 17</span>
            </div>
          </div>

          {/* Headline & Subheadline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-slate-900 leading-[1.08]">
              The AI Firewall for{" "}
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                Production PostgreSQL.
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Safely query, diagnose, and optimize your database with AI. QueryCraft intercepts expensive sequential scans, auto-heals SQLSTATE errors, and grounds LLMs strictly in your live schema.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/Dashboard">
                <Button
                  size="lg"
                  className="h-11 px-6 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-tight shadow-lg shadow-slate-900/10 cursor-pointer"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>Launch Web Studio</span>
                  <kbd className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">
                    ⌘3
                  </kbd>
                </Button>
              </Link>

              <Link href="/docs/cli">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 px-5 gap-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs cursor-pointer"
                >
                  <Terminal className="size-4 text-teal-600" />
                  <span>Install CLI (<code className="text-teal-700 font-mono text-xs">querycraft setup</code>)</span>
                  <ArrowRight className="size-3.5 text-slate-500" />
                </Button>
              </Link>
            </div>

            {/* Terminal Copy Snippet Pill */}
            <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-600 shadow-2xs">
              <span className="text-teal-600 font-bold">$</span>
              <span className="font-medium text-slate-800">npm install -g querycraft &amp;&amp; querycraft auth login</span>
              <button
                type="button"
                onClick={() => copyToClipboard("npm install -g querycraft && querycraft auth login", "install")}
                className="ml-2 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Copy install command"
              >
                {copiedInstall ? <Check className="size-3.5 text-teal-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* ── SIMULATED TERMINAL WINDOW (THE HERO VISUAL - SLEEK DARK CONTRAST ON WHITE) ── */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto rounded-2xl border border-slate-800/90 bg-[#070b12] text-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.18)] overflow-hidden">
            
            {/* Terminal Window Header Bar */}
            <div className="h-10 px-4 border-b border-slate-800 bg-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-rose-500/80" />
                <div className="size-2.5 rounded-full bg-amber-500/80" />
                <div className="size-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[11px] font-mono text-slate-400 font-medium">
                  querycraft check — postgres://rds.production.internal:5432
                </span>
              </div>
              
              {/* Scenario Toggles */}
              <div className="flex items-center rounded-md border border-slate-800 bg-black/40 p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setActiveScenario("check")}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    activeScenario === "check" ? "bg-teal-500/20 text-teal-300 font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  check (Cost Guard)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScenario("doctor")}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    activeScenario === "doctor" ? "bg-teal-500/20 text-teal-300 font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  doctor (SQL Critic)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScenario("ask")}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    activeScenario === "ask" ? "bg-teal-500/20 text-teal-300 font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ask (Safe SQL)
                </button>
              </div>
            </div>

            {/* Terminal Body with Code Output */}
            <div className="p-5 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed space-y-3.5 overflow-x-auto">
              
              {activeScenario === "check" && (
                <>
                  <div className="text-slate-200 flex items-center gap-2">
                    <span className="text-teal-400 font-bold">$</span>
                    <span>querycraft check &quot;SELECT * FROM orders o JOIN line_items l ON TRUE WHERE l.status = &apos;pending&apos;;&quot;</span>
                  </div>

                  <div className="text-slate-500 text-[11px] flex items-center gap-2 pt-1">
                    <RefreshCw className="size-3 text-teal-400 animate-spin" />
                    <span>Dry-running EXPLAIN (FORMAT JSON, COSTS TRUE) on PostgreSQL 16.2 RDS...</span>
                  </div>

                  {/* Interception Warning Box */}
                  <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs">
                        <ShieldAlert className="size-3.5" />
                        [HIGH RISK] Compute Cost: 14,289.40 (Budget: &lt; 300.0)
                      </span>
                      <span className="text-rose-300 text-[11px] font-bold uppercase tracking-wider">
                        Execution Blocked By Firewall
                      </span>
                    </div>

                    <div className="text-rose-200 text-xs space-y-1">
                      <p>🚨 <strong>Unconstrained Cartesian Join:</strong> Table <code>line_items</code> joined without foreign key predicate (1.2M rows × 450k orders).</p>
                      <p>⚠️ <strong>Sequential Scan:</strong> Filter on unindexed column <code>line_items.status</code>.</p>
                    </div>
                  </div>

                  {/* Index Suggestion & Healed SQL */}
                  <div className="rounded-xl border border-teal-500/25 bg-teal-950/25 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-300 font-bold text-xs flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-teal-400" />
                        Targeted Index Suggestion &amp; Healed Remediation
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_line_items_status ON line_items(status);", "index")}
                        className="text-[11px] text-teal-300 hover:text-teal-200 underline cursor-pointer"
                      >
                        {copiedIndexDdl ? "Copied DDL" : "Copy DDL"}
                      </button>
                    </div>

                    <div className="bg-[#03060a] p-3.5 rounded-lg border border-teal-500/20 text-teal-200 text-[11.5px] space-y-1.5">
                      <p className="text-slate-500 font-sans text-[11px]">// 1. Recommended Index DDL:</p>
                      <p className="text-teal-300 font-semibold">CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_line_items_status ON line_items(status);</p>
                      <p className="text-slate-500 font-sans text-[11px] pt-1">// 2. Auto-Healed Query (Remediated Cost: 2.42 · -99.98%):</p>
                      <p className="text-emerald-400 font-semibold">SELECT * FROM orders o JOIN line_items l ON o.id = l.order_id WHERE l.status = &apos;pending&apos; LIMIT 50;</p>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-400 text-xs pt-1">
                      <CheckCircle2 className="size-3.5" />
                      <span>Status: Healed · [LOW RISK] · SET TRANSACTION READ ONLY Safe</span>
                    </div>
                  </div>
                </>
              )}

              {activeScenario === "doctor" && (
                <>
                  <div className="text-slate-200 flex items-center gap-2">
                    <span className="text-teal-400 font-bold">$</span>
                    <span>querycraft doctor &quot;SELECT cust_id, SUM(amount) FROM payments WHERE created_at &gt; NOW() - INTERVAL &apos;30 days&apos;;&quot;</span>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="size-3.5" />
                      <span>Intercepted Runtime Failure: SQLSTATE 42803 (grouping_error) &amp; 42703 (undefined_column)</span>
                    </div>
                    <p className="text-amber-200 text-xs">
                      PostgreSQL Catalog check: Column <code>cust_id</code> does not exist on table <code>payments</code> (valid match: <code>customer_id</code> UUID). Non-aggregated column missing from <code>GROUP BY</code>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-teal-500/25 bg-teal-950/25 p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                      <Sparkles className="size-3.5 text-teal-400" />
                      <span>SQL Doctor Critic Diagnosis (Attempt 1/3 Healed)</span>
                    </div>
                    <pre className="bg-[#03060a] p-3 rounded-lg text-emerald-300 text-[12px]">
                      <code>{`SELECT customer_id, SUM(amount) AS total_revenue
FROM payments
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY customer_id
ORDER BY total_revenue DESC
LIMIT 50;`}</code>
                    </pre>
                  </div>
                </>
              )}

              {activeScenario === "ask" && (
                <>
                  <div className="text-slate-200 flex items-center gap-2">
                    <span className="text-teal-400 font-bold">$</span>
                    <span>querycraft ask &quot;top 5 customers by order volume last quarter&quot;</span>
                  </div>

                  <div className="text-slate-400 text-xs">
                    Grounded strictly on live catalog (schema: <code>public</code> · 24 tables). Read-only transaction initialized.
                  </div>

                  <div className="bg-[#03060a] p-3.5 rounded-xl border border-slate-800 text-emerald-300 text-[12px] space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Generated PostgreSQL Query</span>
                      <span className="text-teal-400 font-semibold">[LOW RISK · Cost 14.8]</span>
                    </div>
                    <code>{`SELECT c.id, c.name, COUNT(o.id) AS total_orders
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= '2024-01-01' AND o.created_at < '2024-04-01'
GROUP BY c.id, c.name
ORDER BY total_orders DESC
LIMIT 5;`}</code>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Supported Cloud PostgreSQL Ribbon */}
          <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Engineered For Cloud PostgreSQL Environments
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600 text-xs font-mono font-medium">
              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Supabase
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="size-1.5 rounded-full bg-teal-500" /> Neon Serverless
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="size-1.5 rounded-full bg-amber-500" /> AWS RDS PostgreSQL
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="size-1.5 rounded-full bg-purple-500" /> CockroachDB
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="size-1.5 rounded-full bg-blue-500" /> Heroku Postgres
              </span>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: THE PROBLEM VS. THE SOLUTION                                   */}
        {/* ========================================================================= */}
        <section id="problem" className="py-20 sm:py-28 border-t border-slate-200 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-teal-700 border-teal-500/30 bg-teal-50 mb-4">
                The AI Database Reliability Gap
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-[-0.025em]">
                Why Generic AI Fails on Production Databases
              </h2>
              <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                Generic AI coding assistants guess schemas, write unconstrained queries that trigger massive cloud compute spikes, and fail silently on PostgreSQL syntax errors.
              </p>
            </div>

            {/* Comparison Grid: Problem vs Solution */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-7 items-stretch">
              
              {/* The Problem (Left Card) */}
              <Card className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs tracking-wider uppercase font-mono mb-4">
                    <ShieldAlert className="size-4.5 text-rose-600" />
                    <span>The Problem: Generic AI Assistants</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    Blind Guessing &amp; Runaway Infrastructure Spikes
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    LLMs without database guardrails hallucinate nonexistent tables, execute unconstrained joins that lock multi-million row production databases, and risk accidental data mutation.
                  </p>

                  <ul className="space-y-3.5 text-xs sm:text-[13px] text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <div>
                        <strong className="text-slate-900">Schema &amp; Typo Hallucinations:</strong> Invents column names (<code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">cust_id</code> vs <code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">customer_id</code>) triggering SQLSTATE <code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">42703</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <div>
                        <strong className="text-slate-900">Runaway Cloud Bills:</strong> Triggers full sequential scans and memory-intensive cross-joins across multi-million row tables.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <div>
                        <strong className="text-slate-900">Silent Cryptic Errors:</strong> Fails on missing <code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">GROUP BY</code> clauses (<code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">42803</code>) and incorrect type castings (<code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">22P02</code>).
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                      <div>
                        <strong className="text-slate-900">Accidental Mutations:</strong> Can inadvertently emit mutating DML/DDL (<code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">DELETE</code>, <code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">DROP</code>, <code className="text-rose-700 font-mono bg-rose-100/60 px-1 py-0.2 rounded">UPDATE</code>).
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-rose-200 flex items-center gap-2 text-[11px] font-mono text-rose-700 font-medium">
                  <AlertTriangle className="size-3.5" />
                  <span>Unbounded execution on live customer databases</span>
                </div>
              </Card>

              {/* The Solution (Right Card) */}
              <Card className="rounded-2xl border border-teal-300 bg-gradient-to-b from-teal-50/70 to-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs tracking-wider uppercase font-mono mb-4">
                    <ShieldCheck className="size-4.5 text-teal-600" />
                    <span>The Solution: QueryCraft Defensive Proxy</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    Pre-Flight Safety, EXPLAIN Guard &amp; Self-Healing
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    QueryCraft acts as a defensive proxy. It enforces <code className="text-teal-800 font-mono bg-teal-100/60 px-1 py-0.2 rounded">SET TRANSACTION READ ONLY</code>, dry-runs <code className="text-teal-800 font-mono bg-teal-100/60 px-1 py-0.2 rounded">EXPLAIN</code> costs, and auto-corrects errors <em>before</em> execution.
                  </p>

                  <ul className="space-y-3.5 text-xs sm:text-[13px] text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <div>
                        <strong className="text-slate-900">Zero-Hallucination Grounding:</strong> Introspects live PostgreSQL tables, UUIDs, JSONB, and foreign keys directly into the prompt.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <div>
                        <strong className="text-slate-900">Pre-Flight Cost Guard:</strong> Dry-runs AST plans with a 3-tier risk engine (<code className="text-teal-800 font-mono bg-teal-100/60 px-1 py-0.2 rounded">[LOW]</code>, <code className="text-amber-800 font-mono bg-amber-100/60 px-1 py-0.2 rounded">[MED]</code>, <code className="text-rose-800 font-mono bg-rose-100/60 px-1 py-0.2 rounded">[HIGH]</code>).
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <div>
                        <strong className="text-slate-900">SQL Doctor Critic Loop:</strong> Automatically catches and heals syntax and grouping errors with up to 3 self-healing retries.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="size-4.5 rounded bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                      <div>
                        <strong className="text-slate-900">Strict Read-Only &amp; LIMIT 50:</strong> Enforces 8000ms statement timeouts and guaranteed mutation prevention.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-teal-200 flex items-center gap-2 text-[11px] font-mono text-teal-800 font-medium">
                  <CheckCircle2 className="size-3.5 text-teal-600" />
                  <span>Production-safe AI database proxy with live EXPLAIN guard</span>
                </div>
              </Card>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 3: THE 5 CORE PILLARS (BENTO GRID LAYOUT)                         */}
        {/* ========================================================================= */}
        <section id="pillars" className="py-20 sm:py-28 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mx-auto text-center mb-16">
              <Badge variant="outline" className="px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-indigo-700 border-indigo-500/30 bg-indigo-50 mb-4">
                The 5 Core Pillars
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-[-0.025em]">
                Architected for Zero Hallucinations &amp; Infrastructure Safety
              </h2>
              <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                Five tightly coupled subsystems engineered to make AI queries as predictable and safe as a compiled binary.
              </p>
            </div>

            {/* Responsive Bento Grid with Shadcn Card wrappers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PILLAR 1: Pre-Flight Cost Guard (Large Card - Span 2) */}
              <Card className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-teal-700 text-xs font-mono font-semibold uppercase tracking-wider">
                      <Flame className="size-4 text-teal-600" />
                      <span>Pillar 01 · AI Firewall</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">LOW &lt;60</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">MED &lt;300</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">HIGH &gt;300</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Pre-Flight Cost Guard
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Never spike your AWS RDS bill again. QueryCraft dry-runs <code className="text-teal-800 font-mono bg-teal-50 px-1 py-0.2 rounded border border-teal-200">EXPLAIN (FORMAT JSON)</code>, estimates compute costs, and blocks runaway sequential scans with a 3-Tier Risk Engine (LOW/MED/HIGH).
                  </p>
                </div>

                {/* Visual Widget: Cost reduction bar */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-[#070b12] text-slate-100 p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                    <span>Baseline Scan vs Optimized Remediated Plan</span>
                    <span className="text-teal-400 font-bold">-99.8% Cost Reduction</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-2.5">
                      <span className="text-[10px] text-rose-400 uppercase font-bold">Unindexed Query</span>
                      <p className="text-sm sm:text-base font-bold text-rose-300 mt-1">Cost: 14,289.4</p>
                      <span className="text-[10px] text-rose-400">[HIGH RISK · Seq Scan]</span>
                    </div>
                    <div className="rounded-lg bg-teal-950/30 border border-teal-500/30 p-2.5">
                      <span className="text-[10px] text-teal-400 uppercase font-bold">QueryCraft Healed</span>
                      <p className="text-sm sm:text-base font-bold text-teal-300 mt-1">Cost: 2.42</p>
                      <span className="text-[10px] text-teal-400">[LOW RISK · Index Scan]</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* PILLAR 2: SQL Doctor (Critic Loop) (1 Card) */}
              <Card className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                    <Zap className="size-4 text-indigo-600" />
                    <span>Pillar 02 · Critic Agent</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    SQL Doctor (Critic Loop)
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Stop debugging cryptic errors. The SQL Doctor catches <code className="text-indigo-800 font-mono bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">42703</code> (missing columns) and <code className="text-indigo-800 font-mono bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">22P02</code> (type errors), diagnosing and self-healing the query up to 3 times automatically.
                  </p>
                </div>

                {/* Visual Widget: Code repair diff */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-[#070b12] text-slate-100 p-3.5 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>SQLSTATE 42703 Caught</span>
                    <span className="text-indigo-400 font-bold">Self-Healing 1/3</span>
                  </div>
                  <div className="text-rose-400 line-through">
                    SELECT cust_name, email FROM users
                  </div>
                  <div className="text-teal-300 flex items-center gap-1.5">
                    <ArrowRight className="size-3 text-teal-400" />
                    <span>SELECT customer_name, email FROM users</span>
                  </div>
                </div>
              </Card>

              {/* PILLAR 3: Universal MCP Server (1 Card) */}
              <Card className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                    <Cpu className="size-4 text-teal-600" />
                    <span>Pillar 03 · stdio JSON-RPC</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    Universal MCP Server
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Bring QueryCraft to your IDE. Exposes 6 native tools to Cursor and Claude Desktop over <code className="text-teal-800 font-mono bg-teal-50 px-1 py-0.2 rounded border border-teal-200">stdio</code> so your agent can safely query your database without leaving the editor.
                  </p>
                </div>

                {/* Visual Widget: Tool pill chips */}
                <div className="mt-6 space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Available MCP Tools:</div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10.5px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium">evaluate_and_heal_sql</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium">inspect_schema</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-teal-700 font-medium">generate_safe_sql</span>
                  </div>
                </div>
              </Card>

              {/* PILLAR 4: Zero-Hallucination Schema Grounding (1 Card) */}
              <Card className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                    <Layers className="size-4 text-emerald-600" />
                    <span>Pillar 04 · Live DDL Introspection</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    Zero-Hallucination Schema Grounding
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Stop the guessing game. QueryCraft introspects your live PostgreSQL schema—tables, UUIDs, JSONB, and Foreign Keys—to ensure the AI only writes valid SQL.
                  </p>
                </div>

                {/* Visual Widget: Schema inspector */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-[#070b12] p-3 font-mono text-[11px] space-y-1.5 text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">orders</span>
                    <span className="text-[9.5px] px-1.5 rounded bg-teal-500/20 text-teal-300 font-bold">UUID PK</span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <p>├─ customer_id (UUID, FK -&gt; customers.id)</p>
                    <p>├─ metadata (JSONB)</p>
                    <p>└─ created_at (TIMESTAMPTZ)</p>
                  </div>
                </div>
              </Card>

              {/* PILLAR 5: Interactive Clarification (1 Card) */}
              <Card className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                    <HelpCircle className="size-4 text-amber-600" />
                    <span>Pillar 05 · Conversational Loop</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    Interactive Clarification
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    No more blind assumptions. If a query is ambiguous, QueryCraft pauses and asks targeted questions using 1-tap interactive response chips.
                  </p>
                </div>

                {/* Visual Widget: Interactive chips */}
                <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50/50 p-3.5 space-y-2">
                  <span className="text-[10px] font-mono text-amber-800 uppercase font-bold">Paused for Filter Context:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Completed Only", "Last 30 Days", "Include Refunds"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSelectedClarifyChip(chip)}
                        className={`text-[10.5px] font-mono px-2 py-1 rounded transition-all cursor-pointer ${
                          selectedClarifyChip === chip
                            ? "bg-slate-900 text-white font-bold shadow-xs"
                            : "bg-white border border-amber-200 text-slate-700 hover:bg-amber-100"
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 4: HOW IT WORKS (STEP-BY-STEP DEVELOPER WORKFLOW)                 */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 sm:py-28 border-t border-slate-200 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mx-auto text-center mb-16">
              <Badge variant="outline" className="px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-teal-700 border-teal-500/30 bg-teal-50 mb-4">
                Developer Workflow
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-[-0.025em]">
                How QueryCraft Protects Your Production Database
              </h2>
              <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                From natural language query to safe, read-only results in under 500 milliseconds.
              </p>
            </div>

            {/* 4-Step Stepper Cards with Connecting Rail */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connecting rail on desktop */}
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-teal-500/40 via-indigo-500/40 to-emerald-500/40 pointer-events-none z-0" />
              
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all relative z-10 shadow-xs">
                <div>
                  <div className="size-8.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 font-mono font-bold text-xs flex items-center justify-center mb-4">
                    01
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Connect Your Database</h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    Securely link your Supabase, Neon, or RDS instance. (Credentials are stateless and never saved).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-teal-700 font-medium">
                  <Lock className="size-3 text-teal-600" />
                  <span>Stateless In-Memory Session</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all relative z-10 shadow-xs">
                <div>
                  <div className="size-8.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center mb-4">
                    02
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Ask or Let Your IDE Write</h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    Type a natural language prompt in the Web Studio or use Cursor via the MCP server.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 font-medium">
                  <Cpu className="size-3 text-indigo-600" />
                  <span>Web Studio or MCP stdio</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all relative z-10 shadow-xs">
                <div>
                  <div className="size-8.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-mono font-bold text-xs flex items-center justify-center mb-4">
                    03
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">The Firewall Inspects</h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    QueryCraft maps the schema, checks the <code className="text-amber-800 font-mono bg-amber-50 px-1 py-0.2 rounded border border-amber-200">EXPLAIN</code> cost, and flags missing indexes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-amber-700 font-medium">
                  <Flame className="size-3 text-amber-600" />
                  <span>3-Tier Compute Risk Analysis</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all relative z-10 shadow-xs">
                <div>
                  <div className="size-8.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center mb-4">
                    04
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Execute Safely</h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    The query runs under an 8000ms timeout limit with a strict <code className="text-emerald-800 font-mono bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">LIMIT 50</code> clamp, returning clean Markdown or a CSV export.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-medium">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  <span>Read-Only &amp; CSV Ready</span>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 5: FINAL CTA & FOOTER                                             */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 border-t border-slate-200 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-[-0.03em]">
              Start querying safely today.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
              Join engineers protecting their production PostgreSQL databases from runaway AI queries and cryptic syntax errors.
            </p>

            {/* Terminal Copy Snippet Box */}
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 p-1.5 rounded-xl border border-slate-800 bg-[#080c14] text-slate-100 shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-2 font-mono text-xs sm:text-sm text-slate-200">
                <span className="text-teal-400 font-bold">$</span>
                <span>npm install -g querycraft &amp;&amp; querycraft auth login</span>
              </div>
              <Button
                size="sm"
                onClick={() => copyToClipboard("npm install -g querycraft && querycraft auth login", "snippet")}
                className="w-full sm:w-auto h-9 px-4 bg-teal-400 hover:bg-teal-300 text-[#05070a] font-bold text-xs tracking-tight transition-all cursor-pointer shadow-md"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="size-3.5 mr-1 text-[#05070a]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 mr-1" />
                    <span>Copy Command</span>
                  </>
                )}
              </Button>
            </div>

            {/* Secondary CTAs */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs font-mono">
              <Link href="/Dashboard" className="text-teal-700 hover:text-teal-900 underline font-semibold">
                Launch Web Studio (⌘3) →
              </Link>
              <span className="text-slate-400">·</span>
              <Link href="/docs/cli" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Read Interactive CLI Docs
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── PROFESSIONAL DEVTOOL MULTI-COLUMN FOOTER ── */}
      <footer className="border-t border-slate-200 bg-slate-50/80 backdrop-blur-md pt-16 pb-12 text-slate-600 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Brand & Live Telemetry Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-12 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="size-8.5 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/35 flex items-center justify-center text-teal-700 shadow-2xs">
                <Database className="size-4.5 text-teal-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900 tracking-tight">QueryCraft</span>
                  <Badge variant="outline" className="h-4.5 px-1.5 py-0 text-[9.5px] font-mono font-bold uppercase tracking-wider border-teal-500/30 bg-teal-50 text-teal-700">
                    v2.0.0-mvp
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  The AI Firewall &amp; Diagnostic Doctor for Production PostgreSQL
                </p>
              </div>
            </div>

            {/* Live Operational Health Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 text-emerald-800 text-xs font-mono font-medium shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-700 font-semibold">PostgreSQL 14 – 17</span>
            </div>
          </div>

          {/* Middle Row: 4 Column Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-12 border-b border-slate-200 text-xs">
            
            {/* Column 1: Web Studio */}
            <div className="space-y-3">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-900">
                Web Studio
              </span>
              <ul className="space-y-2.5 text-slate-600 font-medium">
                <li>
                  <Link href="/Dashboard" className="hover:text-slate-900 transition-colors flex items-center justify-between">
                    <span>SQL Compiler Sandbox</span>
                    <kbd className="font-mono text-[9px] text-slate-400 bg-slate-200/60 px-1 rounded">⌘3</kbd>
                  </Link>
                </li>
                <li>
                  <Link href="/Dashboard/chat" className="hover:text-slate-900 transition-colors flex items-center justify-between">
                    <span>SQL Doctor Critic</span>
                    <kbd className="font-mono text-[9px] text-slate-400 bg-slate-200/60 px-1 rounded">⌘1</kbd>
                  </Link>
                </li>
                <li>
                  <Link href="/Dashboard/guard" className="hover:text-slate-900 transition-colors flex items-center justify-between">
                    <span>Pre-Flight Cost Guard</span>
                    <kbd className="font-mono text-[9px] text-slate-400 bg-slate-200/60 px-1 rounded">⌘2</kbd>
                  </Link>
                </li>
                <li>
                  <Link href="/Dashboard" className="hover:text-slate-900 transition-colors">
                    Zero-Hallucination Schema
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Developer Tooling */}
            <div className="space-y-3">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-900">
                Developer Tooling
              </span>
              <ul className="space-y-2.5 text-slate-600 font-medium">
                <li>
                  <Link href="/docs/cli" className="hover:text-slate-900 transition-colors flex items-center gap-1.5 text-teal-700 font-semibold">
                    <Terminal className="size-3 text-teal-600" />
                    <span>Interactive CLI Docs</span>
                  </Link>
                </li>
                <li>
                  <Link href="/docs/cli#mcp-server" className="hover:text-slate-900 transition-colors">
                    Universal MCP Server (Cursor)
                  </Link>
                </li>
                <li>
                  <Link href="/docs/cli#cheatsheet" className="hover:text-slate-900 transition-colors">
                    Command Cheat Sheet
                  </Link>
                </li>
                <li>
                  <Link href="/docs/cli#setup" className="hover:text-slate-900 transition-colors">
                    1-Click Setup (<code className="text-teal-700 font-mono text-[10px]">querycraft setup</code>)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Cloud PostgreSQL */}
            <div className="space-y-3">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-900">
                Supported Engines
              </span>
              <ul className="space-y-2.5 text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Supabase Database</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-teal-500" />
                  <span>Neon Serverless PG</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span>AWS RDS PostgreSQL</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-500" />
                  <span>CockroachDB &amp; Heroku</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Security & Protocols */}
            <div className="space-y-3">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-900">
                Safety Protocol
              </span>
              <ul className="space-y-2.5 text-slate-600 font-mono text-[11.5px]">
                <li className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>SET TRANSACTION READ ONLY</span>
                </li>
                <li className="text-slate-600 flex items-center gap-1.5">
                  <Lock className="size-3 text-slate-400" />
                  <span>Stateless Session Store</span>
                </li>
                <li className="text-slate-600 flex items-center gap-1.5">
                  <Zap className="size-3 text-amber-500" />
                  <span>8000ms Statement Timeout</span>
                </li>
                <li>
                  <a 
                    href="/api/settings" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
                  >
                    <span>Settings &amp; Telemetry API</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Shortcuts Hint */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-mono">
            <div>
              © 2026 QueryCraft Engine. Built for production PostgreSQL database safety.
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/Nitindeep65/TTSC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-slate-900 transition-colors"
              >
                <span>GitHub (TTSC)</span>
                <ExternalLink className="size-3 text-slate-400" />
              </a>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1 text-slate-500">
                <span>Shortcuts:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-700 font-bold text-[9.5px]">⌘1</kbd>
                <kbd className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-700 font-bold text-[9.5px]">⌘2</kbd>
                <kbd className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-700 font-bold text-[9.5px]">⌘3</kbd>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
