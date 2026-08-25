'use client'

import React, { useState } from "react"
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Network,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const mcpHighlights = [
  {
    icon: Network,
    badge: "Protocol Standard",
    title: "Dynamic Schema Streaming",
    desc: "Uses Model Context Protocol to stream live database catalogs (PostgreSQL tables, MongoDB collections, Redis key schemas) directly into LLM context on every query.",
  },
  {
    icon: ShieldCheck,
    badge: "Universal Sandboxing",
    title: "Cross-Engine Read-Only Safety",
    desc: "MCP tool definitions strictly enforce read-only execution (SELECT, find(), aggregate(), GET), preventing data mutations across SQL and NoSQL databases.",
  },
  {
    icon: Workflow,
    badge: "Open Protocol Ecosystem",
    title: "Universal Agent Compatibility",
    desc: "Connect your cloud database in this web studio, or plug the same MCP server into Claude Desktop, Cursor, and enterprise AI agent pipelines.",
  },
]

const sampleMcpConfig = `{
  "mcpServers": {
    "universal-database-clarifier": {
      "command": "python",
      "args": ["-m", "app.mcp_server"],
      "env": {
        "POSTGRES_URL": "postgresql://postgres:***@db.supabase.co:5432/postgres",
        "MONGODB_URI": "mongodb+srv://user:***@cluster0.mongodb.net/analytics",
        "REDIS_URL": "redis://default:***@redis.upstash.io:6379",
        "READ_ONLY_ENFORCED": "true",
        "AUTO_LIMIT": "50"
      }
    }
  }
}`

const sampleToolCall = `{
  "tool": "mcp__database_clarify_and_compile",
  "parameters": {
    "prompt": "Find top customers by total order spend in 2024",
    "engine": "mongodb",
    "context": {
      "collections_introspected": ["users", "orders"],
      "clarification_status": "complete",
      "output_format": "mql_aggregation_pipeline"
    }
  }
}`

export default function MCPSection() {
  const [activeTab, setActiveTab] = useState("config")
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1800)
  }

  const currentCode = activeTab === "config" ? sampleMcpConfig : sampleToolCall

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#fbfdfb] px-4 py-20 sm:px-6 lg:px-8 lg:py-24" id="mcp">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(76,168,115,0.12),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(31,45,36,0.06),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold">
            <Radio className="size-3.5 text-[#3aa363] animate-pulse" />
            <span>Open Model Context Protocol (MCP) Standard</span>
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            Built on the open Model Context Protocol.
          </h2>

          <p className="text-base text-[#5c6e63] leading-relaxed">
            MCP standardizes how AI models discover SQL tables and NoSQL collections, invoke safe data inspection tools, and stream real-time queries for daily analytics.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center min-w-0">

          {/* Left: 3 Core Pillars */}
          <div className="space-y-5 min-w-0">
            {mcpHighlights.map((item, idx) => (
              <Card
                key={idx}
                className="flex items-start gap-4 p-5 hover-lift hover:border-[#71c897]/80 hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
                  <item.icon className="size-5.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#17241c] truncate">
                      {item.title}
                    </h3>
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider shrink-0">
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5f7065] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Card>
            ))}

            <div className="rounded-2xl border border-[#d5e7d9] bg-[#edf8f1] p-4 text-xs text-[#1e6138] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 font-medium min-w-0">
                <CheckCircle2 className="size-4 text-[#3aa363] shrink-0" />
                <span className="truncate">Compatible with Claude Desktop, Cursor &amp; Custom MCP Clients</span>
              </div>
              <Badge variant="emerald" className="font-mono text-[10px] bg-white text-[#206642] shrink-0">
                Multi-Engine MCP
              </Badge>
            </div>
          </div>

          {/* Right: Interactive MCP Code & Protocol Inspector */}
          <div className="overflow-hidden rounded-2xl border border-[#27382d] bg-[#141f18] shadow-2xl transition-all duration-300 min-w-0">

            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1712] px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("config")}
                  className={`rounded-lg px-3 py-1 font-mono text-[11px] font-medium transition-all duration-150 ${activeTab === "config"
                      ? "bg-[#1f2d24] text-[#71c897] border border-[#35523f] shadow-xs"
                      : "text-[#86a894] hover:text-white"
                    }`}
                >
                  mcp_config.json
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tool")}
                  className={`rounded-lg px-3 py-1 font-mono text-[11px] font-medium transition-all duration-150 ${activeTab === "tool"
                      ? "bg-[#1f2d24] text-[#71c897] border border-[#35523f] shadow-xs"
                      : "text-[#86a894] hover:text-white"
                    }`}
                >
                  MCP Tool Request
                </button>
              </div>

              <Button
                type="button"
                variant="darkGhost"
                size="sm"
                onClick={() => handleCopyCode(currentCode)}
                className="h-7 gap-1 text-[11px] text-[#d7f1df]"
              >
                {isCopied ? <Check className="size-3 text-[#4ca873]" /> : <Copy className="size-3" />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {/* Code Body */}
            <pre className="p-5 font-mono text-xs leading-relaxed text-[#cde7d6] overflow-x-auto">
              <code>{currentCode}</code>
            </pre>

            {/* Protocol Status Bar */}
            <div className="flex items-center justify-between border-t border-white/10 bg-[#0c140f] px-4 py-2 text-[10px] text-[#799986] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#4ca873] animate-pulse" />
                MCP Transport: STDIO / HTTP SSE (Multi-Database)
              </span>
              <span>JSON-RPC 2.0</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
