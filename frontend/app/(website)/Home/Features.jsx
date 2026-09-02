'use client'

import React from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Cloud,
  Database,
  HelpCircle,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react"

const PRIMARY_FEATURES = [
  {
    icon: ShieldCheck,
    badge: "Pre-Flight Cost Guard",
    title: "EXPLAIN Cost Firewall & 3-Tier Risk",
    description:
      "Simulates compute plans before execution using PostgreSQL EXPLAIN (FORMAT JSON, COSTS TRUE). Classifies queries into LOW (<60 cost), MEDIUM (60-300), and HIGH (>300), detects unindexed sequential scans, and auto-suggests index DDL.",
    highlight: "LOW · MEDIUM · HIGH Risk Engine",
    snippet: `EXPLAIN (FORMAT JSON) SELECT * FROM orders;
→ Total Cost: 48.8 | Scan: Seq Scan
→ Risk: [MEDIUM RISK - REVIEW RECOMMENDED]
→ Suggested Index:
  CREATE INDEX CONCURRENTLY IF NOT EXISTS
  idx_orders_status ON orders(status);`,
    spanClass: "sm:col-span-1",
    accentColor: "text-emerald-600",
    accentBg: "bg-emerald-600",
    accentLight: "bg-emerald-50 border-emerald-200",
  },
  {
    icon: HelpCircle,
    badge: "Conversational AI",
    title: "Proactive Clarification Layer",
    description:
      "When requests lack date ranges, status filters, or aggregation parameters, the engine pauses and asks targeted clarifying questions before compiling — with 1-tap interactive response chips.",
    highlight: "Zero Risky Assumptions",
    snippet: `Clarify: "Top customers" by:
→ total spend (SUM of order_items)
→ order count (COUNT DISTINCT orders)

Date range:
→ [Last 30 days] [YTD 2024] [All time]`,
    spanClass: "sm:col-span-1",
    accentColor: "text-violet-600",
    accentBg: "bg-violet-600",
    accentLight: "bg-violet-50 border-violet-200",
  },
]

const SECONDARY_FEATURES = [
  {
    icon: Cloud,
    badge: "Live Introspection",
    title: "Zero-Hallucination Schema Grounding",
    description:
      "Introspects live PostgreSQL catalogs — tables, UUIDs, JSONB columns, foreign keys, and constraints. Never hallucinates non-existent columns or invalid types.",
    highlight: "Live DDL Grounding",
    snippet: `Schema: users(id UUID [PK], email TEXT)\norders(user_id UUID [FK], total NUMERIC)\nIndexed: orders(status, created_at)`,
    accentColor: "text-teal-600",
    accentBg: "bg-teal-600",
  },
  {
    icon: Zap,
    badge: "Self-Healing AI",
    title: "Critic Loop — SQL Doctor",
    description:
      "Intercepts runtime errors, maps SQLSTATE error codes (42703, 42P01, 22P02, 42803), uses an LLM critic to diagnose root causes, and auto-repairs queries with up to 3 self-healing retries.",
    highlight: "SQLSTATE 42703 / 42803 Recovery",
    snippet: `PostgreSQL ERROR 42703 (undefined_column)\n→ Diagnosis: 'full_name' not in users\n→ Auto-heal: replaced with users.name\n→ Status: Verified & Executed ✓`,
    accentColor: "text-amber-600",
    accentBg: "bg-amber-500",
  },
  {
    icon: Database,
    badge: "Universal Safety",
    title: "Read-Only AST Sandboxing",
    description:
      "Strictly enforces read-only access (SELECT, WITH only). Intercepts and blocks destructive mutations (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE) before they touch your database.",
    highlight: "Zero Mutations Allowed",
    snippet: `BLOCKED: DROP, DELETE, INSERT, ALTER\nALLOWED: SELECT, WITH\nAuto-guard: LIMIT 50 injected`,
    accentColor: "text-blue-600",
    accentBg: "bg-blue-600",
  },
]

const WIDE_FEATURE = {
  icon: Layers,
  badge: "Universal Agent Architecture",
  title: "Model Context Protocol (MCP) & Standalone CLI",
  description:
    "Give AI coding agents (Claude Desktop, Cursor IDE, Antigravity, Windsurf) direct, safe access to your PostgreSQL database through 6 standardized tools. Run queries from terminal with querycraft ask, check costs with querycraft check, and heal errors with querycraft doctor.",
  highlight: "6 MCP Tools · 1-Click Auto-Setup",
  items: [
    { label: "inspect_schema", formula: "Live PostgreSQL schema & types in Markdown" },
    { label: "generate_safe_sql", formula: "NL → SQL with 3-tier risk classification" },
    { label: "evaluate_and_heal_sql", formula: "Pre-Flight Cost Guard + auto-heal execution" },
    { label: "querycraft check", formula: "Terminal EXPLAIN cost analyzer & index advisor" },
  ],
}

function FeatureCard({ feature, large = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className={`bento-card group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden ${large ? "min-h-[280px]" : ""}`}
    >
      {/* Hover accent strip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div>
        {/* Icon + badge */}
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-xl ${feature.accentBg || "bg-slate-900"} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}>
            <feature.icon className="size-5" />
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${feature.accentLight || "bg-slate-100 border-slate-200 text-slate-600"}`}>
            {feature.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#0f172a] tracking-tight leading-snug mb-2">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-slate-500 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Code snippet — reveals on hover */}
      <div className="bento-snippet mt-4 rounded-lg overflow-hidden">
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3">
          <pre className="font-mono text-[9.5px] leading-relaxed text-emerald-300/90 whitespace-pre-wrap">
            <code>{feature.snippet}</code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1.5">
        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
        <span className="text-xs font-semibold text-emerald-700">{feature.highlight}</span>
      </div>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section
      className="bg-[#f8fafc] px-4 py-20 sm:px-6 lg:px-8 lg:py-24 border-b border-slate-100"
      id="features"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-3 mb-14"
        >
          <p className="section-kicker justify-center">
            <Layers className="size-3.5" />
            Universal Multi-Engine Intelligence
          </p>
          <h2 className="text-[#0f172a]">
            One engine for all your{" "}
            <span className="gradient-text">SQL & NoSQL databases.</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            From relational tables to nested document collections, QueryCraft clarifies intent, grounds queries in live schemas, and executes safe analytics anywhere.
          </p>
        </motion.div>

        {/* Primary 2-column row */}
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          {PRIMARY_FEATURES.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} large />
          ))}
        </div>

        {/* Secondary 3-column row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {SECONDARY_FEATURES.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} />
          ))}
        </div>

        {/* Wide full-width Semantic Layer card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bento-card group rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden"
        >
          {/* Hover accent strip */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="grid gap-8 lg:grid-cols-2 items-center">
            {/* Left: Text */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                  <WIDE_FEATURE.icon className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {WIDE_FEATURE.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] tracking-tight leading-snug">
                {WIDE_FEATURE.title}
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                {WIDE_FEATURE.description}
              </p>
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-emerald-700">{WIDE_FEATURE.highlight}</span>
              </div>
            </div>

            {/* Right: KPI Glossary preview */}
            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
                <span className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  KPI Semantic Glossary
                </span>
                <span className="ml-auto text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                  {WIDE_FEATURE.items.length} definitions
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {WIDE_FEATURE.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                    <span className="font-mono text-[9px] font-bold text-slate-400 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800">{item.label}</p>
                      <p className="font-mono text-[9.5px] text-emerald-700 truncate mt-0.5">{item.formula}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
