'use client'

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Cpu,
  Database,
  HelpCircle,
  Layers,
  Lock,
  Pause,
  Play,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react"

const STAGES = [
  {
    id: "grounding",
    num: "01",
    shortName: "Schema Grounding",
    tag: "Catalog Grounding",
    icon: Database,
    oneLiner: "Zero hallucinations via live PostgreSQL catalog introspection",
    title: "Stage 01: Live Schema Grounding",
    headline: "Introspects live information schemas before compilation.",
    summary:
      "QueryCraft introspects your database's live tables, column types (UUID, JSONB, NUMERIC), and PK/FK foreign key graphs. Prompts are grounded strictly on verified catalog entities so the model never guesses or invents tables.",
    checks: ["Rejects non-existent columns", "Resolves exact FK JOIN paths", "Zero schema hallucinations"],
    simulator: {
      type: "grounding",
      prompt: "calculate total revenue by customer country",
      tables: ["customers (id, name, country)", "orders (id, customer_id, total, status)"],
      status: "Verified 2 / 24 tables · Foreign Keys linked",
    },
  },
  {
    id: "clarification",
    num: "02",
    shortName: "Ambiguity Clarifier",
    tag: "Safety Clamps",
    icon: HelpCircle,
    oneLiner: "1-tap clarification chips instead of blind guessing + read-only rails",
    title: "Stage 02: Ambiguity Clarification",
    headline: "Pauses compilation when business dimensions are missing.",
    summary:
      "Instead of guessing date ranges or metric aggregations, QueryCraft pauses and offers 1-tap clarification chips. Simultaneously, it injects 'SET TRANSACTION READ ONLY' and bounds execution with 'LIMIT 50'.",
    checks: ["1-tap interactive response chips", "SET TRANSACTION READ ONLY", "Safe LIMIT 50 result clamp"],
    simulator: {
      type: "clarify",
      question: "Which time window should be included?",
      chips: ["Past 30 Days", "Past Quarter", "Completed Only", "All Time"],
      rails: "SET TRANSACTION READ ONLY; LIMIT 50;",
    },
  },
  {
    id: "cost_guard",
    num: "03",
    shortName: "Pre-Flight Cost Guard",
    tag: "AI Firewall",
    icon: Activity,
    oneLiner: "Dry-runs EXPLAIN to block seq scans & recommend concurrent indexes",
    title: "Stage 03: Pre-Flight Cost Guard",
    headline: "Simulates compute cost before production dispatch.",
    summary:
      "Dry-runs PostgreSQL 'EXPLAIN (FORMAT JSON, COSTS TRUE)'. If an unindexed sequential scan or Cartesian join is detected on high-row tables, execution is halted and targeted 'CREATE INDEX CONCURRENTLY' DDL is suggested.",
    checks: ["3-Tier risk engine (< 60 Low / > 300 High)", "Halts Cartesian cross-joins", "Non-blocking concurrent index DDL"],
    simulator: {
      type: "cost",
      baseline: "14,289.40",
      remediated: "2.42",
      saved: "99.98%",
      indexDdl: "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);",
    },
  },
  {
    id: "doctor",
    num: "04",
    shortName: "SQL Doctor Critic",
    tag: "Self-Healing",
    icon: Sparkles,
    oneLiner: "Intercepts SQLSTATE errors and auto-repairs queries in 14ms",
    title: "Stage 04: SQL Doctor Self-Healing",
    headline: "Catches PostgreSQL runtime errors and repairs them automatically.",
    summary:
      "When a query fails with a PostgreSQL error code (e.g. 42803 grouping_error, 42703 undefined_column), the SQL Doctor Critic diagnoses the issue, auto-repairs missing GROUP BY clauses or types, and completes execution.",
    checks: ["Parses SQLSTATE 42803, 42703, 42P01", "Up to 3 self-healing retries", "Verified execution in ~14ms"],
    simulator: {
      type: "doctor",
      sqlstate: "SQLSTATE 42803 (grouping_error)",
      healedSnippet: "GROUP BY c.id, c.name, c.country\nORDER BY total_revenue DESC\nLIMIT 50;",
      status: "Auto-Healed in Attempt 1/3 · 14ms Execution",
    },
  },
]

export default function DeveloperWorkflowSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [selectedChip, setSelectedChip] = useState("Past 30 Days")
  const [copiedIndex, setCopiedIndex] = useState(false)
  const [healedActive, setHealedActive] = useState(false)

  const current = STAGES[activeStep]
  const timerRef = useRef(null)

  // Fast auto-advance every 4.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STAGES.length)
    }, 4500)
    return () => clearInterval(timerRef.current)
  }, [isAutoPlaying])

  const handleSelect = (idx) => {
    setActiveStep(idx)
    setIsAutoPlaying(false)
  }

  const handleCopy = (text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedIndex(true)
      setTimeout(() => setCopiedIndex(false), 1800)
    }
  }

  return (
    <section 
      id="workflow"
      className="relative py-12 sm:py-16 border-t border-slate-200/90 bg-gradient-to-b from-white via-slate-50/60 to-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/25 bg-teal-50/80 text-[11px] font-mono font-bold text-teal-800 shadow-2xs mb-2">
              <ShieldCheck className="size-3.5 text-teal-600" />
              <span>4-Stage Production Safety Rail</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How QueryCraft Protects Your Production Database
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Every query is schema-grounded, ambiguity-checked, pre-flight cost analyzed, and self-healed before execution.
            </p>
          </div>

          {/* Auto-Play Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-medium text-slate-700 shadow-2xs transition cursor-pointer shrink-0"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="size-3 text-amber-500" />
                <span>Pause Auto-Flow</span>
              </>
            ) : (
              <>
                <Play className="size-3 text-teal-600 fill-current" />
                <span>Resume Flow</span>
              </>
            )}
          </button>
        </div>

        {/* ── 4 COMPACT INTERACTIVE PIPELINE CARDS (AT A GLANCE) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map((s, idx) => {
            const Icon = s.icon
            const isActive = activeStep === idx
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? "border-teal-500/80 bg-white shadow-md ring-2 ring-teal-500/15 scale-[1.01]"
                    : "border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Active Indicator Top Bar */}
                {isActive && (
                  <span className="absolute -top-px left-4 right-4 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`size-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? "bg-teal-500/15 text-teal-700" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/70"
                      }`}>
                        <Icon className="size-3.5" />
                      </div>
                      <span className={`font-mono text-xs font-bold ${isActive ? "text-teal-700" : "text-slate-500"}`}>
                        {s.num}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? "bg-teal-50 text-teal-800 border border-teal-200/80" : "bg-slate-100 text-slate-500"
                    }`}>
                      {s.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    {s.shortName}
                  </h3>

                  <p className="text-[11.5px] text-slate-500 mt-1 leading-snug line-clamp-2">
                    {s.oneLiner}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                  <span className={isActive ? "text-teal-700 font-bold" : "text-slate-400 group-hover:text-slate-600"}>
                    {isActive ? "Viewing Active Stage" : "Click to Inspect"}
                  </span>
                  <ChevronRight className={`size-3 transition-transform ${isActive ? "translate-x-0.5 text-teal-600" : "text-slate-400"}`} />
                </div>
              </button>
            )
          })}
        </div>

        {/* ── COMPACT INTERACTIVE INSPECTOR CARD (~260px HEIGHT) ── */}
        <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white shadow-lg overflow-hidden transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Detail Pane (45% Width) */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/40">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                    {current.num} / 04 Pipeline Guard
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {current.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {current.summary}
                </p>

                {/* Key Checks */}
                <div className="pt-2 space-y-1.5">
                  {current.checks.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="size-3 text-teal-600 shrink-0 font-bold" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Progression Link */}
              <div className="pt-4 mt-4 border-t border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {STAGES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStep === i ? "w-6 bg-teal-600" : "w-1.5 bg-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect((activeStep + 1) % STAGES.length)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next: {STAGES[(activeStep + 1) % STAGES.length].shortName}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Right Interactive Simulator Pane (55% Width, Sleek Dark Studio Window) */}
            <div className="lg:col-span-7 p-4 sm:p-5 bg-[#080d14] text-slate-100 flex flex-col justify-between font-mono text-xs">
              
              {/* Window Top Bar */}
              <div>
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500/80" />
                    <span className="size-2 rounded-full bg-amber-500/80" />
                    <span className="size-2 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-400 font-medium">pipeline_telemetry.sql</span>
                  </div>
                  <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    READ-ONLY SANDBOX
                  </span>
                </div>

                {/* ── STAGE 01: GROUNDING ── */}
                {activeStep === 0 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Input Natural Language:</span>
                      <p className="text-teal-300 font-sans text-xs">&quot;{current.simulator.prompt}&quot;</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Database className="size-3 text-teal-400" />
                        <span>Grounded Live Information Schema DDL:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {current.simulator.tables.map((tbl, i) => (
                          <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[10.5px] text-emerald-400">
                            {tbl}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>{current.simulator.status}</span>
                    </div>
                  </div>
                )}

                {/* ── STAGE 02: CLARIFIER ── */}
                {activeStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
                      <span>Ambiguity Intercepted: {current.simulator.question}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">1-Tap Clarification Chips (Click to test):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {current.simulator.chips.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setSelectedChip(chip)}
                            className={`px-2.5 py-1 rounded text-[11px] font-sans transition-all cursor-pointer ${
                              selectedChip === chip
                                ? "bg-teal-500 text-slate-950 font-bold shadow-xs"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {selectedChip === chip ? `✓ ${chip}` : chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-teal-300 text-[11px] font-mono">
                      Injected Rail: <code>{current.simulator.rails}</code>
                    </div>
                  </div>
                )}

                {/* ── STAGE 03: COST GUARD ── */}
                {activeStep === 2 && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                        <span className="text-[9.5px] text-rose-300 uppercase font-bold block">Baseline EXPLAIN</span>
                        <span className="text-base font-extrabold text-rose-400 block">{current.simulator.baseline}</span>
                        <span className="text-[9.5px] text-rose-300 block">🛑 Blocked [HIGH RISK]</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-[9.5px] text-emerald-300 uppercase font-bold block">Remediated Cost</span>
                        <span className="text-base font-extrabold text-emerald-400 block">{current.simulator.remediated}</span>
                        <span className="text-[9.5px] text-emerald-300 block">⚡ -{current.simulator.saved} Reduction</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-teal-500/30 flex items-center justify-between gap-2">
                      <code className="text-[10.5px] text-teal-300 truncate">{current.simulator.indexDdl}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(current.simulator.indexDdl)}
                        className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 shrink-0 cursor-pointer"
                      >
                        {copiedIndex ? "Copied ✓" : "Copy DDL"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STAGE 04: SQL DOCTOR ── */}
                {activeStep === 3 && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-center justify-between gap-2">
                      <span>Intercepted: {current.simulator.sqlstate}</span>
                      <button
                        type="button"
                        onClick={() => setHealedActive(true)}
                        className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 shrink-0 cursor-pointer"
                      >
                        {healedActive ? "Repaired ✓" : "Simulate Auto-Heal"}
                      </button>
                    </div>

                    <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
                      <code>{current.simulator.healedSnippet}</code>
                    </pre>

                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>{current.simulator.status}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Window Bottom Status */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>PostgreSQL Engine Safe</span>
                </span>
                <span className="text-teal-400 font-semibold">Zero Mutations Permitted</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
