'use client'

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  HelpCircle,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/authContext"

/* ── DEMO DATA ─────────────────────────────────────────────────────────── */
const DEMO_SCENARIOS = {
  clarification: {
    tabLabel: "Clarification",
    dialect: "PostgreSQL",
    userPrompt: "Show top customers by total spend",
    clarifyQuestion: "Should I filter for completed orders only and calculate spend from order_items?",
    chips: ["Completed Orders Only", "Top 5 by Spend", "All Time"],
    selectedChip: "Top 5 by Spend",
    query: `SELECT u.id, u.name,
  SUM(oi.quantity * oi.unit_price) AS total_spend
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name
ORDER BY total_spend DESC
LIMIT 5;`,
    rows: [
      { col1: "Acme Corp", col2: "$24,500", col3: "#1" },
      { col1: "Global Logistics", col2: "$18,200", col3: "#2" },
      { col1: "Stripe Inc", col2: "$14,890", col3: "#3" },
    ],
  },
  cost_guard: {
    tabLabel: "Cost Guard",
    dialect: "PostgreSQL",
    userPrompt: "Filter completed orders over $500 without index",
    clarifyQuestion: "Pre-Flight Cost Guard: Estimated cost 48.8 with Sequential Scan on orders. Risk: MEDIUM.",
    chips: ["Analyze Cost", "Seq Scan Alert", "Index Suggestion"],
    selectedChip: "Index Suggestion",
    query: `-- Risk Level: [MEDIUM RISK]
-- Cost: 48.8 | Scan: Sequential Scan
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total_status 
  ON orders(status, total_amount);

SELECT id, user_id, total_amount, status 
FROM orders 
WHERE status = 'completed' AND total_amount > 500
LIMIT 50;`,
    rows: [
      { col1: "idx_orders_total_status", col2: "Cost: 48.8 → 3.2", col3: "-93% compute" },
      { col1: "Plan Rows: 20", col2: "Scan: Index Scan", col3: "Safe" },
    ],
  },
  doctor: {
    tabLabel: "SQL Doctor",
    dialect: "PostgreSQL",
    userPrompt: "Fix: SELECT u.name, o.total FROM users u JOIN orders o GROUP BY u.name;",
    clarifyQuestion: "SQL Doctor diagnosed SQLSTATE 42803 (must appear in GROUP BY or aggregate function).",
    chips: ["Auto-Heal", "SQLSTATE 42803", "Verified Safe"],
    selectedChip: "Auto-Heal",
    query: `-- Diagnosed SQLSTATE 42803: Missing aggregation on o.total_amount
SELECT u.name, SUM(o.total_amount) AS total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.name
ORDER BY total_spent DESC
LIMIT 50;`,
    rows: [
      { col1: "Root Cause", col2: "Missing SUM() aggregator", col3: "Healed" },
      { col1: "Status", col2: "SQLSTATE 42803 fixed", col3: "Verified" },
    ],
  },
}

const ENGINES = [
  { label: "Supabase", color: "#3ECF8E" },
  { label: "Neon", color: "#00E699" },
  { label: "AWS RDS", color: "#FF9900" },
  { label: "CockroachDB", color: "#6933FF" },
  { label: "PostgreSQL", color: "#336791" },
  { label: "Heroku PG", color: "#79589F" },
]

const TRUST_METRICS = [
  { value: "< 12ms", label: "Avg. pre-flight EXPLAIN check" },
  { value: "0", label: "Schema hallucinations" },
  { value: "3-Tier", label: "Risk classification system" },
]

/* ── COMPONENT ─────────────────────────────────────────────────────────── */
export default function Hero() {
  const { user } = useAuth()
  const [activeScenario, setActiveScenario] = useState("clarification")
  const current = DEMO_SCENARIOS[activeScenario]

  return (
    <section
      className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
      id="about"
    >
      {/* ── Subtle background grid ── */}
      <div
        className="pointer-events-none absolute inset-0 grid-overlay-light fade-mask-radial opacity-50"
        aria-hidden="true"
      />

      {/* ── Ambient glow ── */}
      <div
        className="pointer-events-none absolute -top-40 right-0 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-20 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[560px] items-center gap-10 lg:grid-cols-2 lg:gap-14">

          {/* ── LEFT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-2xl space-y-7"
          >

            {/* Announce badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <a
                href="#mcp"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Sparkles className="size-3 text-emerald-600" />
                <span>MCP Server — Now compatible with Cursor & Claude Desktop</span>
                <ArrowRight className="size-3 text-emerald-600" />
              </a>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-[#0f172a]">
                Stop guessing.{" "}
                <br className="hidden sm:inline" />
                <span className="gradient-text">Safeguard your PostgreSQL.</span>
              </h1>
              <p className="text-lg font-medium text-slate-500 leading-relaxed max-w-lg">
                The AI safety &amp; intelligence layer that validates, optimizes, and protects production databases before execution.
              </p>
            </div>

            {/* Sub-description */}
            <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl">
              Connect <strong className="font-semibold text-slate-700">Supabase</strong>,{" "}
              <strong className="font-semibold text-slate-700">Neon</strong>,{" "}
              <strong className="font-semibold text-slate-700">AWS RDS</strong>, or{" "}
              <strong className="font-semibold text-slate-700">PostgreSQL</strong>. QueryCraft
              introspects live schemas, detects dangerous sequential scans, classifies risk (LOW/MED/HIGH),
              heals SQLSTATE errors with the SQL Doctor, and provides native MCP &amp; CLI toolchains.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/Dashboard/chat">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-bold text-sm bg-[#0f172a] hover:bg-slate-800 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <MessageSquareText className="size-4 text-emerald-400" />
                  <span>Launch Chat Studio</span>
                  <ArrowRight className="size-3.5 text-emerald-400" />
                </Button>
              </Link>

              <Link href="/Dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-semibold text-sm border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-[1.02] transition-all duration-200"
                >
                  <Terminal className="size-4 text-emerald-500" />
                  <span>Query Compiler Sandbox</span>
                </Button>
              </Link>
            </div>

            {/* Trust metrics row */}
            <div className="flex items-center gap-6 pt-1 border-t border-slate-100">
              {TRUST_METRICS.map((m, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900 tabular-nums leading-none">{m.value}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Engine logos strip */}
            <div className="space-y-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Connect any database in 30 seconds
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {ENGINES.map((e) => (
                  <span
                    key={e.label}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-xs"
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: e.color }}
                    />
                    {e.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: Demo Studio ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[520px] lg:ml-auto"
          >
            {/* Glow ring behind card */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-100/60 to-emerald-50/40 blur-2xl pointer-events-none" />

            {/* Studio card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">

              {/* macOS title bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="ml-2 font-mono text-[10.5px] text-slate-400">
                  QueryCraft Studio — Live Grounded
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Scenario tab switcher */}
              <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-3 py-2">
                {Object.entries(DEMO_SCENARIOS).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveScenario(key)}
                    className={`relative px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeScenario === key
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/70"
                    }`}
                  >
                    {activeScenario === key && (
                      <motion.span
                        layoutId="hero-tab-indicator"
                        className="absolute inset-0 rounded-md bg-white border border-slate-200 shadow-sm -z-0"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{s.tabLabel}</span>
                  </button>
                ))}
                <span className="ml-auto font-mono text-[10px] font-semibold text-slate-400">
                  {current.dialect}
                </span>
              </div>

              {/* Chat thread area */}
              <div className="p-4 space-y-3 min-h-[360px] text-xs">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScenario}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0f172a] px-3.5 py-2.5 text-white font-medium text-[12px] shadow-sm">
                        {current.userPrompt}
                      </div>
                    </div>

                    {/* Clarification bubble */}
                    <div className="flex gap-2.5 justify-start">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0f172a] text-emerald-400 shadow-xs">
                        <Bot className="size-3.5" />
                      </div>
                      <div className="max-w-[90%] rounded-2xl rounded-tl-sm border-l-[3px] border-l-amber-400 border border-amber-100 bg-amber-50 p-3 space-y-2 shadow-xs">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-amber-800">
                          <HelpCircle className="size-3.5 text-amber-500" />
                          Clarification — Paused before compiling
                        </div>
                        <p className="text-[11.5px] text-amber-900 leading-relaxed font-medium">
                          {current.clarifyQuestion}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {current.chips.map((chip, ci) => (
                            <span
                              key={ci}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                                chip === current.selectedChip
                                  ? "bg-amber-200 border-amber-400 text-amber-950"
                                  : "bg-white border-amber-200 text-amber-700"
                              }`}
                            >
                              {chip}{chip === current.selectedChip && " ✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Generated query */}
                    <div className="flex gap-2.5 justify-start w-full">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0f172a] text-emerald-400 shadow-xs">
                        <Bot className="size-3.5" />
                      </div>
                      <div className="w-full space-y-2.5 rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700">
                            <ShieldCheck className="size-3.5 text-emerald-500" />
                            {current.dialect} · Verified Read-Only
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            LIMIT 5
                          </span>
                        </div>

                        {/* Code block */}
                        <div className="code-window">
                          <pre className="code-window-body text-[10.5px]">
                            <code>{current.query}</code>
                          </pre>
                        </div>

                        {/* Result preview table */}
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-3 py-1.5">
                            <span className="font-mono text-[9.5px] font-bold text-slate-400">RESULT PREVIEW</span>
                            <span className="text-[9px] font-semibold text-emerald-600">3 of 5 rows</span>
                          </div>
                          {current.rows.map((r, ri) => (
                            <div
                              key={ri}
                              className={`flex items-center justify-between px-3 py-1.5 font-mono text-[10px] ${
                                ri % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                              }`}
                            >
                              <span className="font-medium text-slate-700 truncate">{r.col1}</span>
                              <div className="flex items-center gap-3 shrink-0 ml-2">
                                <span className="font-bold text-emerald-700">{r.col2}</span>
                                <span className="text-slate-400">{r.col3}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer CTA */}
              <div className="border-t border-slate-100 bg-slate-50/60 p-3">
                <Link href="/Dashboard/chat">
                  <Button
                    size="sm"
                    className="w-full gap-2 text-xs font-bold bg-[#0f172a] hover:bg-slate-800 text-white shadow-xs"
                  >
                    <Zap className="size-3.5 text-emerald-400" />
                    <span>Open Live in Chat Studio</span>
                    <ArrowRight className="size-3.5 text-emerald-400" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}