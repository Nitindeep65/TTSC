'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Database,
  Layers,
  MessageSquareText,
  Plug,
  Search,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/authContext"

const STEPS = [
  {
    num: "01",
    icon: Plug,
    title: "Connect your database",
    desc: "Paste a connection URI. Live schema discovery in under 3 seconds.",
  },
  {
    num: "02",
    icon: Search,
    title: "Ask in plain English",
    desc: "No SQL knowledge needed. QueryCraft clarifies before compiling.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Execute with confidence",
    desc: "Verified, read-only queries with EXPLAIN cost analysis.",
  },
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Safe read-only sandboxing" },
  { icon: Layers, label: "SQL, MQL & Key-Value engines" },
  { icon: Zap, label: "Self-healing critic loop" },
  { icon: Database, label: "Live schema grounding" },
]

export default function CTA() {
  const { user } = useAuth()

  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-[#0f172a] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-80"
        aria-hidden="true"
      />

      {/* Ambient emerald glow */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/4 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">

        {/* 3-step strip */}
        <div className="mb-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="pointer-events-none absolute left-[52px] top-5 hidden h-px w-[calc(100%-56px)] bg-gradient-to-r from-emerald-500/40 to-transparent sm:block" />
              )}

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <step.icon className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-emerald-500/70">{step.num}</span>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA body */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="border-t border-white/10 pt-14 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center"
        >
          <div className="max-w-2xl space-y-5">

            {/* Terminal decoration */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-sm text-emerald-400 backdrop-blur-sm">
              <span className="text-emerald-500/70">$</span>
              <span>querycraft connect postgres://your-database-url</span>
              <span className="animate-pulse text-white/50">█</span>
            </div>

            <p className="section-kicker text-emerald-500">
              <Database className="size-3.5" />
              Universal Database Studio
            </p>

            <h2 className="text-white">
              Your database deserves{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text-light">a smarter analyst.</span>
            </h2>

            <p className="max-w-xl text-[15px] leading-relaxed text-slate-400">
              No manual prompt crafting. No hallucinated table joins. Connect Supabase, Neon, MongoDB Atlas, or AWS RDS — QueryCraft handles schema discovery, clarification, and safe execution.
            </p>

            {/* Trust grid */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              {TRUST_ITEMS.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[13px] text-slate-400">
                  <item.icon className="size-3.5 text-emerald-500" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3.5 sm:flex-row shrink-0">
            <Link href={user ? "/Dashboard/chat" : "/Login"}>
              <button className="group flex items-center gap-2.5 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_32px_rgba(16,185,129,0.4)] hover:scale-[1.03] transition-all duration-200">
                <MessageSquareText className="size-4.5" />
                <span>{user ? "Launch Live Studio" : "Start for Free"}</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </Link>

            <Link href={user ? "/Dashboard" : "/Login"}>
              <button className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:scale-[1.03] hover:border-white/25 transition-all duration-200">
                <Terminal className="size-4.5 text-emerald-400" />
                <span>{user ? "Query Workspace" : "Sign In to Studio"}</span>
              </button>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}