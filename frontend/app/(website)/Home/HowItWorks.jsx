'use client'

import React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  MessageSquareText,
  Play,
  Plug,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react"

const STEPS = [
  {
    num: "01",
    icon: Plug,
    title: "Connect Your Database",
    desc: "Paste a connection URI — Supabase, Neon, AWS RDS, PostgreSQL, MongoDB Atlas, or Redis. Live schema discovery runs in under 3 seconds.",
    accent: "bg-blue-50 border-blue-200 text-blue-700",
    iconBg: "bg-blue-600",
    preview: (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <Database className="size-3.5 text-slate-400" />
          <span className="font-mono text-[10px] text-slate-500">Connect Database</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-600">postgresql://user:***@db.neon.tech/app</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5">
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span className="font-mono text-[10px] font-semibold text-emerald-700">12 tables introspected · Schema grounded</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    icon: MessageSquareText,
    title: "Ask in Plain Language",
    desc: "Type your question naturally. No SQL knowledge needed. QueryCraft detects ambiguity and asks targeted clarifying questions before compiling anything.",
    accent: "bg-violet-50 border-violet-200 text-violet-700",
    iconBg: "bg-violet-600",
    preview: (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <Bot className="size-3.5 text-slate-400" />
          <span className="font-mono text-[10px] text-slate-500">Chat Studio</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-tr-sm bg-[#0f172a] px-3 py-1.5 text-white font-medium text-[10.5px]">
              Top customers by revenue last quarter
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#0f172a] text-emerald-400">
              <Bot className="size-3" />
            </div>
            <div className="rounded-xl rounded-tl-sm border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] font-medium text-amber-800">
              Completed orders only, or include all statuses?
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Review Verified Query",
    desc: "Get a schema-grounded, hallucination-free SQL or MQL query. Inspect the EXPLAIN plan, check the cost estimate, and edit before execution.",
    accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
    iconBg: "bg-emerald-600",
    preview: (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-emerald-600" />
            <span className="font-mono text-[10px] font-semibold text-emerald-700">Verified · Read-Only</span>
          </div>
          <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">LIMIT 50</span>
        </div>
        <div className="p-3">
          <div className="rounded-md bg-[#0d1117] border border-[#21262d] p-2.5">
            <pre className="font-mono text-[9.5px] leading-relaxed text-emerald-300/90 overflow-x-auto">{`SELECT u.name,
  SUM(oi.qty * oi.price) AS rev
FROM users u
JOIN orders o ON u.id=o.user_id
JOIN order_items oi ON o.id=oi.id
WHERE o.status='completed'
GROUP BY u.name LIMIT 50;`}</pre>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "04",
    icon: Play,
    title: "Execute & Visualize",
    desc: "Run the query safely against your live database. Results render as interactive tables, bar charts, line charts, or pie charts — with one-click CSV export.",
    accent: "bg-orange-50 border-orange-200 text-orange-700",
    iconBg: "bg-orange-500",
    preview: (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="size-3 text-slate-400" />
            <span className="font-mono text-[10px] text-slate-500">Live Results — 5 rows</span>
          </div>
          <Zap className="size-3 text-emerald-500" />
        </div>
        <div className="p-3">
          {[
            { name: "Acme Corp", val: "$24,500" },
            { name: "Global Logistics", val: "$18,200" },
            { name: "Stripe Inc", val: "$14,890" },
          ].map((row, i) => (
            <div key={i} className={`flex justify-between items-center py-1 text-[10px] ${i < 2 ? "border-b border-slate-50" : ""}`}>
              <span className="font-medium text-slate-700">{row.name}</span>
              <span className="font-bold text-emerald-700 tabular-nums">{row.val}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section
      className="relative bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24 border-b border-slate-100"
      id="how-it-works"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center space-y-3 mb-16"
        >
          <p className="section-kicker justify-center">
            <Zap className="size-3.5" />
            How It Works
          </p>
          <h2 className="text-[#0f172a]">
            From question to verified query{" "}
            <span className="gradient-text">in four steps.</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            No SQL knowledge required. No prompt engineering. Connect your database and start asking business questions in plain English.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: idx * 0.09 }}
              className="relative group"
            >
              {/* Connector line (except last) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block pointer-events-none absolute top-[22px] left-full w-8 h-px bg-gradient-to-r from-slate-300 to-slate-200 z-10" />
              )}

              <div className="flex flex-col h-full">
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${step.iconBg} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                    <step.icon className="size-4.5" />
                  </div>
                  <span className="font-mono text-4xl font-black text-slate-100 leading-none select-none">
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-[#0f172a] mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{step.desc}</p>

                {/* Mini UI preview */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="mt-auto"
                >
                  {step.preview}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5"
        >
          <p className="text-sm font-medium text-slate-700 text-center sm:text-left">
            Ready to stop guessing? Connect your database in seconds.
          </p>
          <a
            href="/Dashboard/chat"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all duration-200 hover:scale-[1.03]"
          >
            <Sparkles className="size-4 text-emerald-400" />
            Try It Free
            <ArrowRight className="size-3.5 text-emerald-400" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
