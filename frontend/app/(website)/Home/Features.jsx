'use client'

import React from "react"
import { motion } from "framer-motion"
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
  TableProperties,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const featureList = [
  {
    icon: Database,
    badge: "Multi-Model Engines",
    title: "Universal SQL & NoSQL Compiler",
    description:
      "Native support for relational SQL (PostgreSQL, MySQL, Supabase, Neon) as well as document and key-value stores (MongoDB Atlas, DynamoDB, Redis). Generates optimized queries tailored to your target engine.",
    highlight: "Postgres · MySQL · Mongo · Redis",
    snippet: "-- Relational SQL or MongoDB MQL:\ndb.orders.aggregate([{ $match: { status: 'completed' } }])",
  },
  {
    icon: HelpCircle,
    badge: "Conversational AI",
    title: "Proactive Clarification Layer",
    description:
      "When requests lack date ranges, transaction status filters, or explicit ranking parameters, the engine pauses and asks targeted clarifying questions before generating code.",
    highlight: "Zero Risky Assumptions",
    snippet: "Clarify: \"Top customers\" by total spend or order count? Timeframe: 30 days or YTD?",
  },
  {
    icon: Cloud,
    badge: "Live Introspection",
    title: "Schema & Collection Grounding",
    description:
      "Directly inspects live database catalogs — relational tables, UUIDs, JSONB columns, foreign keys, and MongoDB document schemas. Never hallucinates non-existent fields or invalid types.",
    highlight: "Zero Hallucination Guarantee",
    snippet: "Schema: users(id, email), orders(total_amount, status)\nCollections: products, sessions",
  },
  {
    icon: Zap,
    badge: "Self-Healing AI",
    title: "Dual Critic Loop (SQL & MQL)",
    description:
      "If a query encounters a PostgreSQL syntax error or MongoDB aggregation stage failure, our LLM critic diagnoses the root cause in real-time and compiles a verified replacement automatically.",
    highlight: "Automated Error Recovery",
    snippet: "PostgreSQL 42703 / Mongo pipeline error\n→ Diagnosis → Auto-healed ✓",
  },
  {
    icon: ShieldCheck,
    badge: "Universal Safety",
    title: "Read-Only Sandboxing & Limits",
    description:
      "Strictly enforces read-only access (SELECT in SQL, find/aggregate in NoSQL, GET in Redis). Intercepts INSERT, DELETE, DROP, and auto-appends LIMIT 50 safeguards.",
    highlight: "Read-Only Enforced Everywhere",
    snippet: "BLOCKED: INSERT / UPDATE / DROP\nALLOWED: SELECT / find() / aggregate()\nLIMIT: Auto 50",
  },
  {
    icon: Layers,
    badge: "Business Intelligence",
    title: "Cross-Engine Semantic Layer",
    description:
      "Define business KPI formulas, glossary terms, and active customer rules once. QueryCraft applies them across both relational joins and nested NoSQL document pipelines effortlessly.",
    highlight: "Unified Business Definitions",
    snippet: "KPI Rule: net_revenue = total_amount - refund_amount\nApplied across all queries.",
  },
]

export default function Features() {
  return (
    <section className="border-b border-border bg-[#f7f9f7] px-4 py-20 sm:px-6 lg:px-8 lg:py-24" id="features">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-3 mb-16"
        >
          <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold">
            <Layers className="size-3.5 text-[#3aa363]" />
            <span>Universal Multi-Engine Intelligence</span>
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl text-balance">
            One engine for all your{" "}
            <span className="bg-gradient-to-r from-[#1f663c] to-[#4ca873] bg-clip-text text-transparent">
              SQL &amp; NoSQL databases.
            </span>
          </h2>

          <p className="text-base text-[#5c6e63] leading-relaxed">
            From relational tables to nested document collections, QueryCraft clarifies intent, grounds queries in live schemas, and executes safe analytics anywhere.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {featureList.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -5 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#e0e8e2] bg-white p-6 hover:border-[#71c897]/80 hover:shadow-lg hover:shadow-[#1f2d24]/5 transition-all duration-200 overflow-hidden cursor-default"
            >
              {/* Hover accent */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#3aa363] to-[#71c897] opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-b-2xl" />

              <div>
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs group-hover:scale-110 transition-transform duration-200">
                  <f.icon className="size-5.5" />
                </div>

                <Badge variant="secondary" className="mb-2.5 text-[10px] uppercase font-bold tracking-wider">
                  {f.badge}
                </Badge>

                <h3 className="text-base font-semibold text-[#17241c] tracking-tight">
                  {f.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-[#5f7065] leading-relaxed">
                  {f.description}
                </p>
              </div>

              {/* Code snippet on hover */}
              <div className="mt-4 overflow-hidden rounded-lg border border-[#e4ede5] bg-[#f5fbf6] opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-32 transition-all duration-300">
                <pre className="p-3 font-mono text-[10px] leading-relaxed text-[#2a5238] overflow-x-auto whitespace-pre-wrap">
                  <code>{f.snippet}</code>
                </pre>
              </div>

              <div className="mt-5 border-t border-[#eaf0eb] pt-3.5 flex items-center gap-1.5 text-xs font-semibold text-[#206642]">
                <CheckCircle2 className="size-3.5 text-[#3ba565]" />
                <span>{f.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
