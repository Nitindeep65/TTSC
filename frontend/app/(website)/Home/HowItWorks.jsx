'use client'

import React from "react"
import Link from "next/link"
import {
  Database,
  MessageSquareText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Zap,
  Terminal,
  Layers,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    step: "01",
    title: "Connect Your Database",
    subtitle: "Instant Introspection",
    desc: "Paste your connection string (Supabase, Neon, AWS RDS, PostgreSQL, MySQL, MongoDB Atlas) or use our 1-click Demo Sandbox. QueryCraft introspects your real schema, columns, foreign keys, and indexes in milliseconds.",
    badge: "10-Second Setup",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: Database,
    codeSnippet: `// Live Schema Introspection
Introspected 5 tables:
• users (id, email, full_name, created_at)
• contracts (id, title, value, status)
• counterparties (id, name, tier)
• orders, payments...`,
  },
  {
    step: "02",
    title: "Ask in Plain English",
    subtitle: "1-Tap Clarification Loop",
    desc: "Ask any data question. If your query is ambiguous (e.g. 'Show top customers' without a date range), QueryCraft asks 1-tap clarifying questions instead of guessing. It also automatically catches spelling typos against your real schema.",
    badge: "Zero Guessing & Typo-Tolerant",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: HelpCircle,
    codeSnippet: `User: "give the list of ocunter parties"
AI: Auto-corrected 'ocunter parties' → 'counterparties'
Clarification: "Filter by tier (Tier 1/2) or show all?"
[✦ All Tiers] [✦ Tier 1 Only] [✦ Active Only]`,
  },
  {
    step: "03",
    title: "Get Live Data & Charts",
    subtitle: "Read-Only Safety & Auto-Heal",
    desc: "QueryCraft compiles optimized SQL or MongoDB MQL with safe read-only LIMIT 50 protections. Query runtime errors are automatically diagnosed and fixed in-flight by the SQL Doctor critic agent.",
    badge: "Interactive Charts & CSV Export",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    icon: TrendingUp,
    codeSnippet: `SELECT name, tier, contract_count
FROM counterparties
ORDER BY contract_count DESC LIMIT 50;
→ 12ms execution · Read-Only Protected
→ Rendered: Table, Bar Chart, Donut & CSV`,
  },
]

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="how-it-works">
      {/* Background ambient radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(52,192,106,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-[#1b6b3a] shadow-xs">
            <Sparkles className="size-3.5 text-emerald-600 animate-pulse" />
            <span>How QueryCraft Works</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-[#111c16] sm:text-4xl lg:text-5xl leading-tight">
            From natural question to verified insights in{" "}
            <span className="bg-gradient-to-r from-[#1f7a47] via-[#2b9b54] to-[#34c06a] bg-clip-text text-transparent">
              3 simple steps.
            </span>
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-[#55695e] max-w-2xl mx-auto">
            Traditional AI guesses blindly and breaks in production. QueryCraft connects to your actual database schema, clarifies ambiguity, and compiles guaranteed read-only queries.
          </p>
        </div>

        {/* 3-Step Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 xl:gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#dce7e0] bg-[#fbfdfb] p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#a8d4b3]"
              >
                {/* Step Pill Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-[#1b5c38]/40 group-hover:text-[#1b5c38] transition-colors">
                      {s.step}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#111c16] text-[#5de08a] shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111c16] leading-tight">{s.title}</h3>
                      <p className="text-xs font-semibold text-[#1b6b3a]">{s.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#55695e] mb-6">
                    {s.desc}
                  </p>
                </div>

                {/* Code Window Preview */}
                <div className="rounded-xl border border-[#1b2b22] bg-[#0c1410] overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#1b2b22] bg-[#080e0b] px-3 py-1.5 text-[10px] text-[#75ab8f] font-mono">
                    <span>Live Verification</span>
                    <span className="text-[#34c06a]">● Active</span>
                  </div>
                  <pre className="p-3 font-mono text-[10.5px] sm:text-[11px] leading-relaxed text-[#c6ebd4] overflow-x-auto whitespace-pre-wrap">
                    <code>{s.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Fast Action Strip */}
        <div className="mt-12 sm:mt-16 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-extrabold text-[#111c16]">
              Ready to test QueryCraft on your database?
            </h4>
            <p className="text-xs sm:text-sm text-[#55695e]">
              Try the interactive Chat Studio right now with 0 setup or connect your live Supabase / Neon / MongoDB database.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/Dashboard/chat">
              <Button size="lg" className="h-10 px-5 text-xs sm:text-sm font-bold bg-[#111c16] hover:bg-[#1e3328] text-white shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
                <span>Launch Chat Studio</span>
                <ArrowRight className="size-4 text-[#5de08a]" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
