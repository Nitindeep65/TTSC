'use client'

import React from "react"
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Filter,
  HelpCircle,
  Key,
  Layers,
  Lock,
  Play,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Zap,
} from "lucide-react"

const featureList = [
  {
    icon: Cloud,
    badge: "Cloud Introspection",
    title: "Live Database Schema Grounding",
    description:
      "Connect your Supabase, Neon, or AWS RDS instance. The engine inspects information_schema in real-time, respecting UUIDs, JSONB, NUMERIC types, and foreign key relationships.",
    highlight: "Zero Hallucination Guarantee",
  },
  {
    icon: HelpCircle,
    badge: "Multi-Turn Engine",
    title: "Proactive Clarification Layer",
    description:
      "When queries have ambiguous date windows, missing transaction status filters (completed vs pending), or vague rankings, the engine pauses and asks targeted questions first.",
    highlight: "No Risky Assumptions",
  },
  {
    icon: ShieldCheck,
    badge: "Production Safety",
    title: "Strict Read-Only & LIMIT 50 Guards",
    description:
      "Enforces pure SELECT queries. Any attempt to generate INSERT, UPDATE, DELETE, or DROP is intercepted, and resource protection limits prevent cloud egress spikes.",
    highlight: "Read-Only SELECT Enforced",
  },
  {
    icon: Play,
    badge: "Instant Verification",
    title: "Direct Query Execution in Browser",
    description:
      "Run generated SQL queries directly against your cloud database in an isolated read-only transaction and inspect tabular rows right inside the chat interface.",
    highlight: "1-Click Live Execution",
  },
]

export default function Features() {
  return (
    <section className="border-b border-[#e3e8e2] bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24" id="features">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d5] bg-[#edf7f0] px-3.5 py-1 text-xs font-semibold text-[#206642]">
            <Sparkles className="size-3.5 text-[#3aa363]" />
            <span>Engineered for Production PostgreSQL</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            The Text-to-SQL engine that doesn't guess.
          </h2>

          <p className="text-base text-[#5c6e63] leading-relaxed">
            Most Text-to-SQL tools hallucinate missing columns or assume silent date defaults. We verify conversational intent against your live schema before compiling queries.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureList.map((f, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#e2eae2] bg-[#fbfdfb] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#71c897]/70 hover:bg-white hover:shadow-lg hover:shadow-[#1f2d24]/5"
            >
              <div>
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs group-hover:scale-105 transition-transform">
                  <f.icon className="size-5.5" />
                </div>

                <span className="inline-block rounded-full bg-[#edf6f0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#246b45] mb-2">
                  {f.badge}
                </span>

                <h3 className="text-base font-semibold text-[#17241c] tracking-tight">
                  {f.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-[#5f7065] leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="mt-6 border-t border-[#eaf0eb] pt-3.5 flex items-center gap-1.5 text-xs font-semibold text-[#206642]">
                <CheckCircle2 className="size-3.5 text-[#3ba565]" />
                <span>{f.highlight}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
