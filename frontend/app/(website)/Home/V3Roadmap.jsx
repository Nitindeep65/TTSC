'use client'

import React, { useState } from "react"
import {
  AlarmClock,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Clock3,
  Layers2,
  ScanSearch,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const roadmapItems = [
  {
    id: 1,
    label: "Proactive Intelligence",
    Icon: AlarmClock,
    accentColor: "#3aa363",
    accentBg: "rgba(58, 163, 99, 0.08)",
    borderAccent: "rgba(58, 163, 99, 0.25)",
    title: "Proactive Anomaly Hunter",
    tagline: "AI that works while you sleep",
    description:
      "A scheduled LangGraph cron-agent wakes at 8 AM, autonomously scans your most important KPIs from the Semantic Layer, compares them to a 30-day moving average, and surfaces statistically significant anomalies directly to your notification feed — before you even open your laptop.",
    plusPoints: [
      "Automated daily digest of revenue, churn & DAU anomalies",
      "Statistical variance detection over 30-day baselines",
      "Zero-configuration — powered by your existing Semantic Rules",
      "Instant Slack / Email alert on critical threshold breaches",
    ],
    uiFeature: "AI Morning Briefing & Notification Center",
    timelinePhase: "Phase 1",
  },
  {
    id: 2,
    label: "Multi-Agent Orchestration",
    Icon: LayoutDashboard,
    accentColor: "#5b8def",
    accentBg: "rgba(91, 141, 239, 0.08)",
    borderAccent: "rgba(91, 141, 239, 0.25)",
    title: "Dashboard Architect",
    tagline: "One sentence → Full executive dashboard",
    description:
      "A Supervisor Agent decomposes a single high-level prompt into 4–6 parallel sub-tasks. Independent Worker Agents compile, dry-run, and execute each query simultaneously using asyncio. A Canvas Agent then assembles the results into a live, multi-chart JSON layout.",
    plusPoints: [
      "Supervisor → Worker multi-agent sub-graph via LangGraph",
      "4–6 queries generated and executed in true parallel",
      "Automatic chart-type assignment (Line, Pie, Bar, Area)",
      "Single prompt → production-ready dashboard in seconds",
    ],
    uiFeature: "Canvas Mode — Live Multi-Chart Grid",
    timelinePhase: "Phase 1",
  },
  {
    id: 3,
    label: "Autonomous Data Ops",
    Icon: ShieldCheck,
    accentColor: "#e07b3f",
    accentBg: "rgba(224, 123, 63, 0.08)",
    borderAccent: "rgba(224, 123, 63, 0.25)",
    title: "Data Hygiene & Janitor Agent",
    tagline: "Autonomous database health auditor",
    description:
      "Triggered by a single click, this agent introspects schema constraints, foreign keys, and index coverage, then fires probing SQL against the live database to detect orphaned records, cardinality drift, and unexpected NULL spikes — producing a structured health report in minutes.",
    plusPoints: [
      "Orphaned row detection across all FK relationships",
      "Column-level cardinality & NULL spike analysis",
      "Missing index identification with remediation DDL",
      "1-Click execution of generated cleanup scripts",
    ],
    uiFeature: "Data Health Report with 1-Click Remediation SQL",
    timelinePhase: "Phase 2",
  },
  {
    id: 4,
    label: "Intelligent Learning",
    Icon: BookOpen,
    accentColor: "#9b6be8",
    accentBg: "rgba(155, 107, 232, 0.08)",
    borderAccent: "rgba(155, 107, 232, 0.25)",
    title: "Auto-Documenter & Dictionary Builder",
    tagline: "AI that learns your business language",
    description:
      "Instead of requiring manual metric definitions, this agent scans pg_stat_statements and historical query logs, extracts recurring filter patterns, and autonomously proposes new Semantic Rules to your KPI glossary for one-click approval.",
    plusPoints: [
      "Automatic metric extraction from pg_stat_statements",
      "Pattern recognition across recurring WHERE-clause filters",
      "AI-drafted Semantic Rules ready for 1-click approval",
      "\"AI Suggestions\" tab surfacing inferred business definitions",
    ],
    uiFeature: "AI Suggestions Tab in Metric Glossary",
    timelinePhase: "Phase 2",
  },
]

function PhaseTag({ phase }) {
  const isPhase1 = phase === "Phase 1"
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: isPhase1 ? "rgba(58,163,99,0.12)" : "rgba(155,107,232,0.12)",
        color: isPhase1 ? "#3aa363" : "#9b6be8",
        border: `1px solid ${isPhase1 ? "rgba(58,163,99,0.3)" : "rgba(155,107,232,0.3)"}`,
      }}
    >
      <Clock3 className="size-2.5" />
      {phase}
    </span>
  )
}

function RoadmapCard({ item, isOpen, onToggle }) {
  const { Icon, accentColor, accentBg, borderAccent, title, tagline, description, plusPoints, uiFeature, timelinePhase, label } = item

  return (
    <div
      className="group relative rounded-2xl border bg-white transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isOpen ? borderAccent : "#e5ebe6",
        boxShadow: isOpen
          ? `0 8px 32px ${accentColor}18, 0 2px 8px rgba(0,0,0,0.06)`
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          opacity: isOpen ? 1 : 0,
        }}
      />

      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-5 sm:p-6 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <div
          className="flex-shrink-0 flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ background: accentBg, color: accentColor }}
        >
          <Icon className="size-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8fa898]">{label}</span>
            <PhaseTag phase={timelinePhase} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#17241c] tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs text-[#5f7065] mt-0.5 font-medium">{tagline}</p>
        </div>

        <div
          className="flex-shrink-0 flex size-8 items-center justify-center rounded-lg transition-colors duration-200"
          style={{ background: isOpen ? accentBg : "#f5f8f5" }}
        >
          {isOpen
            ? <ChevronUp className="size-4" style={{ color: accentColor }} />
            : <ChevronDown className="size-4 text-[#9aab9e]" />
          }
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "600px" : "0px" }}
      >
        <div className="px-5 sm:px-6 pb-6 pt-0">
          <div className="border-t border-[#edf2ee] mb-5" />

          <p className="text-sm text-[#4d6357] leading-relaxed mb-5">{description}</p>

          <ul className="space-y-2.5 mb-5">
            {plusPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#2e4538]">
                <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div
            className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold"
            style={{ background: accentBg, color: accentColor, border: `1px solid ${borderAccent}` }}
          >
            <Layers2 className="size-3.5" />
            Dashboard Feature: {uiFeature}
          </div>
        </div>
      </div>
    </div>
  )
}

function ArchitectureCallout() {
  return (
    <div className="relative rounded-2xl border border-[#e0e8e2] bg-gradient-to-br from-[#f7fbf8] to-[#f0f8f3] p-6 sm:p-8 overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-[#3aa363]/6 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-48 rounded-full bg-[#5b8def]/6 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897]">
          <BrainCircuit className="size-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3aa363]">Architecture Shift</span>
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-[#17241c] tracking-tight mb-1.5">
            From Reactive to Multi-Agent Supervisor Architecture
          </h4>
          <p className="text-sm text-[#5c6e63] leading-relaxed">
            V3 upgrades the existing 6-node LangGraph state machine to a{" "}
            <strong className="text-[#1f2d24]">Supervisor → Worker</strong> pattern.
            A top-level router agent classifies each incoming request and dynamically delegates
            to the right sub-graph — single-query SQL compiler, parallel dashboard planner, or
            autonomous cron-agent — with full asyncio parallelism.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 items-center gap-2 text-center">
        {[
          { label: "Supervisor Agent", sub: "Routes intent" },
          { label: "→", sub: null },
          { label: "Worker Agents", sub: "Parallel SQL" },
          { label: "→", sub: null },
          { label: "Canvas Agent", sub: "Assembles output" },
        ].map((node, i) =>
          node.sub === null ? (
            <div key={i} className="hidden sm:flex justify-center">
              <ArrowRight className="size-4 text-[#9aab9e]" />
            </div>
          ) : (
            <div
              key={i}
              className="rounded-xl border border-[#d8e8db] bg-white px-3 py-2.5 shadow-xs"
            >
              <p className="text-xs font-semibold text-[#17241c]">{node.label}</p>
              <p className="text-[10px] text-[#8fa898] mt-0.5">{node.sub}</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function V3Roadmap() {
  const [openId, setOpenId] = useState(1)

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section className="border-b border-border bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="v3-roadmap">
      <div className="mx-auto max-w-5xl">

        <div className="mx-auto max-w-3xl text-center space-y-3 mb-14">
          <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5 text-[#3aa363]" />
            <span>Coming in QueryCraft V3</span>
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            The next frontier of{" "}
            <span className="bg-gradient-to-r from-[#1f663c] to-[#4ca873] bg-clip-text text-transparent">
              agentic AI for data.
            </span>
          </h2>

          <p className="text-base text-[#5c6e63] leading-relaxed">
            V3 evolves QueryCraft from a reactive query tool into a fully autonomous,
            multi-agent data platform — shifting the AI from answering questions to
            finding answers <em>before you ask them</em>.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-[#5f7065]">
              <span className="size-2 rounded-full bg-[#3aa363] inline-block" />
              Phase 1 — Ships first
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#5f7065]">
              <span className="size-2 rounded-full bg-[#9b6be8] inline-block" />
              Phase 2 — Advanced automation
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          {roadmapItems.map((item) => (
            <RoadmapCard
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>

        <ArchitectureCallout />

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/Dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f2d24] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4235] transition-colors duration-200"
          >
            <Zap className="size-4 text-[#71c897]" />
            Try V2 Now
          </a>
          <a
            href="https://github.com/Nitindeep65/TTSC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e8db] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f2d24] hover:border-[#3aa363] hover:bg-[#f5fbf6] transition-colors duration-200"
          >
            <ScanSearch className="size-4 text-[#3aa363]" />
            Follow Development
          </a>
        </div>

      </div>
    </section>
  )
}
