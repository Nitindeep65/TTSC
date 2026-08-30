'use client'

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Ban,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Database,
  HelpCircle,
  Layers,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  ShieldOff,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const problems = [
  {
    icon: HelpCircle,
    label: "Blind Assumptions",
    pain: "AI guesses 'last month' or assumes active records without asking — returning misleading business metrics with zero warning across SQL and MongoDB.",
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
  {
    icon: Brain,
    label: "Schema & Collection Hallucinations",
    pain: "LLMs invent column names like users.total_spend or hallucinate nested document paths that don't exist in your Mongo collections.",
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
  },
  {
    icon: ShieldOff,
    label: "Broken Pipelines & No Recovery",
    pain: "A failing SQL join or invalid MongoDB $lookup/$unwind stage leaves you with cryptic error codes and no automated correction path.",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    icon: Ban,
    label: "Runaway Queries & Unindexed Scans",
    pain: "Unconstrained SELECT * or unprojected MongoDB queries scan millions of documents, triggering cloud egress spikes and latency.",
    color: "text-rose-500",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    icon: ScrollText,
    label: "No Custom Business Context",
    pain: "Generic models don't know your KPI formulas across relational joins or nested JSON arrays. 'Churn' and 'MRR' mean something unique to your business.",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
]

const solutions = [
  {
    icon: MessageSquareText,
    label: "Conversational Clarification",
    fix: "Pauses before writing queries to clarify ambiguous date windows, status filters, aggregation methods, and target engines.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    icon: Database,
    label: "Live SQL & NoSQL Introspection",
    fix: "Introspects live PostgreSQL/MySQL schemas, UUID keys, JSONB fields, as well as MongoDB collection schemas and Redis key patterns.",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  {
    icon: Zap,
    label: "Dual-Engine Critic Loop",
    fix: "Intercepts runtime errors in both SQL statements and MongoDB pipelines, diagnoses root causes with an LLM critic, and regenerates verified fixes.",
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
  },
  {
    icon: ShieldCheck,
    label: "Read-Only + Auto-Limit Guards",
    fix: "Enforces pure read-only queries (SELECT in SQL, find/aggregate in MQL, GET in Redis). Blocks write commands and auto-injects limit guards.",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    icon: Layers,
    label: "Universal Semantic KPI Layer",
    fix: "Define business metrics once — revenue formulas, active user thresholds — and every generated SQL or MongoDB aggregation pipeline respects them.",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
]

const brokenSql = `-- What generic AI generates (Broken SQL & NoSQL):
-- 1. SQL (Missing joins, hallucinated columns):
SELECT * FROM customers WHERE status = 'active' ORDER BY total_spend DESC;
-- 2. MongoDB MQL (Invalid pipeline syntax, missing $unwind):
db.orders.aggregate([{ $group: { _id: "$user", spend: { $sum: "$items.price" } } }]);`

const healedSql = `-- What QueryCraft generates after schema verification:
-- 1. PostgreSQL (Grounds in real schema & foreign keys):
SELECT u.id, u.name, SUM(oi.quantity * oi.unit_price) AS spend
FROM users u JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed' GROUP BY u.id, u.name LIMIT 50;

-- 2. MongoDB MQL (Validated aggregation pipeline):
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  { $group: { _id: "$user_id", spend: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
  { $limit: 50 }
]);`

export default function ProblemSection() {
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-[#fafbf9] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      id="problem"
    >
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(220,38,38,0.04),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(34,197,94,0.06),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-4 mb-16 lg:mb-20"
        >
          <Badge
            variant="secondary"
            className="gap-2 px-3.5 py-1 text-xs font-semibold border-red-200 bg-red-50 text-red-700"
          >
            <AlertTriangle className="size-3.5 text-red-500" />
            <span>Universal AI Database Pitfalls</span>
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl lg:text-5xl text-balance">
            Generic AI{" "}
            <span className="relative">
              <span className="relative text-red-500">guesses schemas.</span>
            </span>{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#1f663c] via-[#2d8e57] to-[#4ca873] bg-clip-text text-transparent">
              QueryCraft verifies SQL &amp; NoSQL.
            </span>
          </h2>

          <p className="text-base leading-relaxed text-[#56675d] max-w-2xl mx-auto">
            Whether your data lives in relational PostgreSQL tables, MySQL, or MongoDB document collections, standard LLMs hallucinate fields and assume silent defaults. QueryCraft brings live schema grounding to all your data engines.
          </p>
        </motion.div>

        {/* Before / After grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-6 xl:gap-10 mb-16">

          {/* BEFORE — Problems column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-8 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                <XCircle className="size-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">Without QueryCraft</p>
                <p className="text-sm font-semibold text-[#17241c]">What goes wrong in SQL &amp; NoSQL</p>
              </div>
            </div>

            <div className="space-y-3">
              {problems.map((p, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                  className={`w-full text-left group flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-200 hover:shadow-sm cursor-pointer ${
                    activeIndex === idx
                      ? "border-red-300 bg-red-50 shadow-sm"
                      : "border-[#e8edea] bg-white hover:border-red-200"
                  }`}
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${p.bg} transition-transform duration-200 group-hover:scale-105`}>
                    <p.icon className={`size-4.5 ${p.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#17241c]">{p.label}</p>
                      <ChevronRight
                        className={`size-4 shrink-0 text-[#9cb0a4] transition-transform duration-200 ${
                          activeIndex === idx ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs text-[#6b7f74] leading-relaxed overflow-hidden transition-all duration-300 ${
                        activeIndex === idx ? "mt-1.5 max-h-20" : "max-h-0"
                      }`}
                    >
                      {p.pain}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Broken SQL & MQL example */}
            <div className="rounded-xl border border-red-200 bg-[#1a0808] overflow-hidden mt-2">
              <div className="flex items-center gap-2 border-b border-red-900/40 bg-[#140404] px-4 py-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-[10px] text-red-400/80 ml-2">Unverified AI Output — Broken in Production</span>
              </div>
              <pre className="p-4 font-mono text-[10.5px] leading-relaxed text-red-300/80 overflow-x-auto whitespace-pre-wrap">
                <code>{brokenSql}</code>
              </pre>
            </div>
          </motion.div>

          {/* AFTER — Solutions column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200">
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">With QueryCraft</p>
                <p className="text-sm font-semibold text-[#17241c]">Universal Multi-Engine Verification</p>
              </div>
            </div>

            <div className="space-y-3">
              {solutions.map((s, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-3.5 rounded-xl border border-[#e8edea] bg-white p-4 hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${s.bg} transition-transform duration-200 hover:scale-105`}>
                    <s.icon className={`size-4.5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#17241c]">{s.label}</p>
                    <p className="mt-0.5 text-xs text-[#6b7f74] leading-relaxed">{s.fix}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Healed SQL & MQL example */}
            <div className="rounded-xl border border-[#27382d] bg-[#141f18] overflow-hidden mt-2">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#0f1712] px-4 py-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-[10px] text-[#71c897]/70 ml-2">QueryCraft — Grounded SQL &amp; MongoDB MQL</span>
                <span className="ml-auto flex items-center gap-1 rounded bg-[#1f3a28] px-1.5 py-0.5 font-mono text-[9px] text-[#71c897] font-bold">
                  <CheckCircle2 className="size-2.5" />
                  VERIFIED
                </span>
              </div>
              <pre className="p-4 font-mono text-[10.5px] leading-relaxed text-[#c4e6d2] overflow-x-auto whitespace-pre-wrap">
                <code>{healedSql}</code>
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-[#d5e7d9] bg-[#edf8f1] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="size-5 text-[#3aa363] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm font-medium text-[#1e4d35]">
              QueryCraft bridges <strong>Relational SQL and NoSQL Document databases</strong> with a single conversational clarification interface that guarantees zero hallucination.
            </p>
          </div>
          <Badge variant="emerald" className="shrink-0 self-start sm:self-auto text-xs font-semibold px-3 py-1">
            Universal SQL &amp; NoSQL Support
          </Badge>
        </motion.div>

      </div>
    </section>
  )
}
