'use client'

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Ban,
  Brain,
  CheckCircle2,
  ChevronDown,
  Database,
  HelpCircle,
  Layers,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  ShieldOff,
  XCircle,
  Zap,
} from "lucide-react"

const problems = [
  {
    icon: HelpCircle,
    label: "Blind Guessing & Ambiguity",
    pain: "Standard single-turn models guess dates, dimensions, metrics, and status filters without asking, producing plausible-looking but inaccurate queries.",
    color: "text-red-400",
    bg: "bg-red-950/40 border-red-900/50",
    dot: "bg-red-500",
  },
  {
    icon: Brain,
    label: "Schema & Typo Hallucinations",
    pain: "LLMs invent non-existent column names like users.total_spend or misspell similar table and column names without checking live database DDL.",
    color: "text-orange-400",
    bg: "bg-orange-950/40 border-orange-900/50",
    dot: "bg-orange-500",
  },
  {
    icon: ShieldOff,
    label: "Runtime Failures & Cryptic Errors",
    pain: "Queries fail in production due to missing GROUP BY clauses, column type mismatches, or SQLSTATE syntax errors with no automated recovery path.",
    color: "text-amber-400",
    bg: "bg-amber-950/40 border-amber-900/50",
    dot: "bg-amber-500",
  },
  {
    icon: Ban,
    label: "Dangerous Sequential Scans & Spikes",
    pain: "Unconstrained queries trigger expensive full sequential table scans or cross-join memory spikes on multi-million row production databases with zero pre-execution cost analysis.",
    color: "text-rose-400",
    bg: "bg-rose-950/40 border-rose-900/50",
    dot: "bg-rose-500",
  },
  {
    icon: ScrollText,
    label: "Accidental Data Mutations",
    pain: "Generic AI code assistants can output destructive INSERT, UPDATE, DELETE, or DROP statements that modify production state without safety guards.",
    color: "text-red-400",
    bg: "bg-red-950/40 border-red-900/50",
    dot: "bg-red-500",
  },
]

const solutions = [
  {
    icon: MessageSquareText,
    label: "Conversational Clarification Loop",
    fix: "Evaluates prompt ambiguity and pauses to ask targeted clarifying questions with 1-tap interactive response chips before compilation.",
    dot: "bg-emerald-500",
  },
  {
    icon: Database,
    label: "Live PostgreSQL Schema Grounding",
    fix: "Automatically introspects live Information Schemas (UUIDs, JSONB, FKs) and typo-maps entity names strictly against valid tables.",
    dot: "bg-emerald-500",
  },
  {
    icon: Zap,
    label: "SQL Doctor Self-Healing Loop",
    fix: "Intercepts runtime errors, maps SQLSTATE codes (42703, 42P01, 22P02, 42803), and auto-repairs queries with up to 3 critic retries.",
    dot: "bg-emerald-500",
  },
  {
    icon: ShieldCheck,
    label: "Pre-Flight Cost Guard & Risk Scoring",
    fix: "Dry-runs PostgreSQL EXPLAIN (COSTS TRUE), scores risk (LOW/MED/HIGH), detects sequential scans, and suggests CREATE INDEX DDL.",
    dot: "bg-emerald-500",
  },
  {
    icon: Layers,
    label: "Strict Read-Only AST Guard + LIMIT 50",
    fix: "Zero-mutation AST filter blocks destructive DDL/DML and enforces safe read-only execution with 8000ms timeouts.",
    dot: "bg-emerald-500",
  },
]

const brokenSql = `-- What generic AI generates:
SELECT * FROM customers
WHERE status = 'active'
ORDER BY total_spend DESC;
-- ↑ 'total_spend' column doesn't exist!
-- ↑ Missing JOIN on order_items
-- ↑ No LIMIT — full table scan`

const healedSql = `-- QueryCraft after live schema verification:
SELECT u.id, u.name,
  SUM(oi.quantity * oi.unit_price) AS spend
FROM users u
  JOIN orders o ON u.id = o.user_id
  JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name
ORDER BY spend DESC
LIMIT 50; -- auto-added`

export default function ProblemSection() {
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <section
      className="relative overflow-hidden bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      id="problem"
    >
      {/* Subtle grid overlay on dark */}
      <div
        className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-100"
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-4 mb-16 lg:mb-20"
        >
          <p className="section-kicker text-emerald-500 justify-center">
            <AlertTriangle className="size-3.5" />
            The Universal AI Database Problem
          </p>

          <h2 className="text-white">
            Generic AI guesses schemas.{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text-light">QueryCraft verifies.</span>
          </h2>

          <p className="text-base leading-relaxed text-slate-400 max-w-2xl mx-auto">
            Whether your data lives in relational PostgreSQL tables or MongoDB document collections,
            standard LLMs hallucinate fields and assume silent defaults. QueryCraft brings live schema
            grounding to all your data engines.
          </p>
        </motion.div>

        {/* Before / After grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-6 xl:gap-10 mb-14">

          {/* BEFORE column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-red-950/60 border border-red-900/50">
                <XCircle className="size-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-red-500">Without QueryCraft</p>
                <p className="text-sm font-semibold text-slate-200">What goes wrong in SQL & NoSQL</p>
              </div>
            </div>

            <div className="space-y-2">
              {problems.map((p, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                  className={`w-full text-left group flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                    activeIndex === idx
                      ? "border-red-700/60 bg-red-950/40 shadow-lg shadow-red-950/20"
                      : "border-white/8 bg-white/4 hover:border-red-800/40 hover:bg-red-950/20"
                  }`}
                >
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${p.bg}`}>
                    <p.icon className={`size-4 ${p.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-200">{p.label}</p>
                      <ChevronDown
                        className={`size-4 shrink-0 text-slate-600 transition-transform duration-200 ${
                          activeIndex === idx ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs text-slate-400 leading-relaxed overflow-hidden transition-all duration-300 ${
                        activeIndex === idx ? "mt-1.5 max-h-24 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {p.pain}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Broken SQL example */}
            <div className="code-window mt-3">
              <div className="code-window-header">
                <span className="code-window-dot bg-[#ff5f57]" />
                <span className="code-window-dot bg-[#febc2e]" />
                <span className="code-window-dot bg-[#28c840]" />
                <span className="ml-2 font-mono text-[10px] text-red-400/80">
                  Unverified AI Output — Breaks in Production
                </span>
              </div>
              <pre className="code-window-body text-[11px] text-red-300/80">
                <code>{brokenSql}</code>
              </pre>
            </div>
          </motion.div>

          {/* AFTER column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-900/50">
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-emerald-500">With QueryCraft</p>
                <p className="text-sm font-semibold text-slate-200">Universal Multi-Engine Verification</p>
              </div>
            </div>

            <div className="space-y-2">
              {solutions.map((s, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-3.5 rounded-xl border border-white/8 bg-emerald-950/20 p-4 hover:border-emerald-800/40 hover:bg-emerald-950/30 transition-all duration-200"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-900/60 bg-emerald-950/60">
                    <s.icon className="size-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{s.label}</p>
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{s.fix}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Healed SQL example */}
            <div className="code-window mt-3">
              <div className="code-window-header">
                <span className="code-window-dot bg-[#ff5f57]" />
                <span className="code-window-dot bg-[#febc2e]" />
                <span className="code-window-dot bg-[#28c840]" />
                <span className="ml-2 font-mono text-[10px] text-emerald-400/70">
                  QueryCraft — Grounded & Verified SQL
                </span>
                <span className="ml-auto flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400 font-bold border border-emerald-900/50">
                  <CheckCircle2 className="size-2.5" />
                  VERIFIED
                </span>
              </div>
              <pre className="code-window-body text-[11px] text-emerald-300/90">
                <code>{healedSql}</code>
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Bottom call-out bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-medium text-slate-300">
              QueryCraft bridges <strong className="font-semibold text-white">Relational SQL and NoSQL Document databases</strong> with a single conversational clarification interface that guarantees zero hallucination.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Universal SQL & NoSQL Support
          </span>
        </motion.div>

      </div>
    </section>
  )
}
