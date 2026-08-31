'use client'

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Network,
  Radio,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react"

const MCP_HIGHLIGHTS = [
  {
    icon: Network,
    badge: "Protocol Standard",
    title: "Dynamic Schema Streaming",
    desc: "Uses Model Context Protocol to stream live database catalogs — PostgreSQL tables, MongoDB collections, Redis key schemas — directly into LLM context on every query.",
  },
  {
    icon: ShieldCheck,
    badge: "Universal Sandboxing",
    title: "Cross-Engine Read-Only Safety",
    desc: "MCP tool definitions strictly enforce read-only execution (SELECT, find(), aggregate(), GET), preventing data mutations across all SQL and NoSQL databases.",
  },
  {
    icon: Workflow,
    badge: "Open Ecosystem",
    title: "Universal Agent Compatibility",
    desc: "Connect your cloud database in this web studio, or plug the same MCP server into Claude Desktop, Cursor IDE, and any enterprise AI agent pipeline.",
  },
]

const CODE_TABS = [
  {
    id: "cursor",
    label: ".cursor/mcp.json",
    code: `{
  "mcpServers": {
    "querycraft-cost-guard": {
      "command": "/path/to/.venv/bin/python",
      "args": ["-m", "app.mcp_server"],
      "cwd": "/path/to/TTS/backend",
      "env": {
        "PYTHONPATH": "/path/to/TTS/backend",
        "POSTGRES_URL": "postgresql://***",
        "READ_ONLY_ENFORCED": "true",
        "AUTO_LIMIT": "50"
      }
    }
  }
}`,
  },
  {
    id: "claude",
    label: "claude_desktop_config.json",
    code: `{
  "mcpServers": {
    "universal-database-clarifier": {
      "command": "python",
      "args": ["-m", "app.mcp_server"],
      "env": {
        "POSTGRES_URL": "postgresql://user:***@db.neon.tech:5432/app",
        "MONGODB_URI": "mongodb+srv://user:***@cluster.mongodb.net",
        "REDIS_URL": "redis://default:***@redis.upstash.io:6379",
        "READ_ONLY_ENFORCED": "true",
        "AUTO_LIMIT": "50"
      }
    }
  }
}`,
  },
  {
    id: "tool",
    label: "MCP Tool Request",
    code: `{
  "tool": "evaluate_and_heal_sql",
  "parameters": {
    "sql_query": "SELECT * FROM users u, audit_logs a",
    "cost_threshold": 150.0
  }
}

// Response (auto-healed):
{
  "is_error": false,
  "action_type": "rewritten",
  "optimized_sql": "SELECT u.email, a.action\\nFROM users u\\nJOIN audit_logs a ON u.id = a.user_id\\nLIMIT 50;",
  "original_cost": 385000.0,
  "optimized_cost": 14.8,
  "reduction_pct": 99.9,
  "explanation": "Detected Cartesian product — added FK join"
}`,
  },
]

const TERMINAL_LINES = [
  { text: "$ querycraft mcp start", color: "text-slate-400" },
  { text: "[MCP] Server initializing — QueryCraft-CostGuard v1.0", color: "text-slate-300" },
  { text: "[MCP] Transport: stdio | Protocol: JSON-RPC 2.0", color: "text-slate-400" },
  { text: "[MCP] Tool registered: evaluate_and_heal_sql ✓", color: "text-emerald-400" },
  { text: "[MCP] Connected to PostgreSQL: 12 tables introspected ✓", color: "text-emerald-400" },
  { text: "[MCP] Ready — awaiting tool invocations from IDE agent", color: "text-emerald-300 font-semibold" },
]

export default function MCPSection() {
  const [activeTab, setActiveTab] = useState("cursor")
  const [isCopied, setIsCopied] = useState(false)

  const current = CODE_TABS.find((t) => t.id === activeTab)

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1800)
  }

  return (
    <section
      className="relative bg-[#f8fafc] px-4 py-20 sm:px-6 lg:px-8 lg:py-24 border-b border-slate-100"
      id="mcp"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-3 mb-14"
        >
          <p className="section-kicker justify-center">
            <Radio className="size-3.5 animate-pulse" />
            Open Model Context Protocol (MCP)
          </p>
          <h2 className="text-[#0f172a]">
            Plug into any AI agent.{" "}
            <span className="gradient-text">Instantly.</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            QueryCraft's MCP server exposes the Cost Guard workflow as a native tool for Cursor, Claude Desktop, and any agent framework — over standard stdio.
          </p>
        </motion.div>

        {/* 2-column showcase */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

          {/* Left: 3 core pillars */}
          <div className="space-y-4">
            {MCP_HIGHLIGHTS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.09 }}
                whileHover={{ y: -2 }}
                className="hover-lift group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-200/80 hover:shadow-md transition-all duration-200"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-emerald-400 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <item.icon className="size-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-[#0f172a]">{item.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Compatibility badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                Compatible with Cursor · Claude Desktop · Custom MCP Clients
              </div>
              <span className="shrink-0 font-mono text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                JSON-RPC 2.0
              </span>
            </motion.div>
          </div>

          {/* Right: Code inspector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-3"
          >
            {/* Code tabs card */}
            <div className="overflow-hidden rounded-2xl border border-[#21262d] bg-[#0d1117] shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#21262d] bg-[#0d1117] px-4 py-2.5">
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {CODE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-[10.5px] font-medium transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#1c2128] text-emerald-400 border border-[#30363d] shadow-xs"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-2 shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] text-slate-400 hover:text-slate-200 hover:bg-[#1c2128] border border-transparent hover:border-[#30363d] transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Code body */}
              <div className="min-h-[260px]">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="p-5 font-mono text-[11.5px] leading-relaxed text-slate-300 overflow-x-auto"
                  >
                    <code>{current.code}</code>
                  </motion.pre>
                </AnimatePresence>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between border-t border-[#21262d] bg-[#0d1117] px-4 py-2 font-mono text-[9.5px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MCP Transport: stdio · JSON-RPC 2.0
                </span>
                <span>Multi-Engine</span>
              </div>
            </div>

            {/* Terminal output */}
            <div className="rounded-xl border border-[#21262d] bg-[#0d1117] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#21262d] px-3 py-2">
                <Terminal className="size-3 text-slate-500" />
                <span className="font-mono text-[10px] text-slate-500">Terminal Output</span>
              </div>
              <div className="p-3 space-y-1">
                {TERMINAL_LINES.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`font-mono text-[10.5px] leading-relaxed ${line.color}`}
                  >
                    {line.text}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
