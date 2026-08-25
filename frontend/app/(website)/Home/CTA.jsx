'use client'

import Link from "next/link"
import {
  ArrowRight,
  Cloud,
  Database,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Terminal,
  Plug,
  Search,
  Zap,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const steps = [
  {
    num: "01",
    icon: Plug,
    title: "Connect any SQL or NoSQL database",
    desc: "Paste your connection URI — Supabase, Neon, AWS RDS, MongoDB Atlas, Redis, or DynamoDB. Live schema discovery happens in seconds.",
  },
  {
    num: "02",
    icon: Search,
    title: "Ask in plain natural language",
    desc: "Type your query. QueryCraft clarifies any ambiguous date ranges, nested arrays, or metrics before compiling code.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Execute verified queries safely",
    desc: "Review verified SQL, MongoDB MQL, or Redis commands, inspect performance plans, and execute with read-only sandboxing.",
  },
]

export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#121d16] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      {/* Glow Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(76,168,115,0.22),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(36,105,68,0.30),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto max-w-7xl">

        {/* 3-Step strip */}
        <div className="mb-14 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="relative flex items-start gap-4">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[52px] top-5 hidden h-0.5 w-[calc(100%-68px)] bg-gradient-to-r from-[#3aa363]/50 to-transparent sm:block" />
              )}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1f3a28] border border-[#3aa363]/30 text-[#71c897]">
                <s.icon className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-[#71c897]/60">{s.num}</span>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                </div>
                <p className="text-xs text-[#8aad98] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Content */}
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center border-t border-white/10 pt-14">

          <div className="max-w-2xl space-y-4">
            <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold text-[#8ed8a8] border-white/15 bg-white/5 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-[#71c897]" />
              <span>Universal Database Studio</span>
            </Badge>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Connect your SQL or NoSQL database.{" "}
              <br />
              <span className="bg-gradient-to-r from-[#71c897] via-[#a3e5bd] to-white bg-clip-text text-transparent">
                Start querying in seconds.
              </span>
            </h2>

            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#bad1c2]">
              No manual prompt crafting. No hallucinated collections or table joins. Connect Supabase, Neon, MongoDB Atlas, Redis, or AWS RDS — QueryCraft handles the rest.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#a0beaa]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[#71c897]" />
                Safe Read-Only Sandboxing
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="size-4 text-[#71c897]" />
                Multi-Model (SQL, MQL, Key-Value)
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-[#71c897]" />
                Dual-Engine Self-Healing Critic
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 sm:flex-row shrink-0">
            <Link href="/Dashboard/chat">
              <Button
                variant="primary"
                size="lg"
                className="gap-2.5 px-7 py-4 text-sm font-bold shadow-xl shadow-[#4ca873]/25 hover:scale-[1.03] transition-all duration-200"
              >
                <MessageSquareText className="size-4.5" />
                <span>Launch Live Studio</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/Dashboard">
              <Button
                variant="outline"
                size="lg"
                className="gap-2.5 border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:scale-[1.03] transition-all duration-200"
              >
                <Terminal className="size-4.5 text-[#71c897]" />
                <span>Query Workspace</span>
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}