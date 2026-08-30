'use client'

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Copy,
  Database,
  HelpCircle,
  Layers,
  Menu,
  MessageSquareText,
  Play,
  Radio,
  Server,
  ShieldCheck,
  Table2,
  Terminal,
  TrendingUp,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/authContext"

const trustMetrics = [
  { value: "PostgreSQL & Mongo", label: "SQL & NoSQL Engines", icon: Layers },
  { value: "< 12ms", label: "Read-Only Execution", icon: Zap },
  { value: "0", label: "Schema Hallucinations", icon: ShieldCheck },
]

const DEMO_SCENARIOS = {
  clarification: {
    tabLabel: "Clarification Loop",
    dialect: "PostgreSQL SQL",
    userPrompt: "Show top customers by total spend",
    clarifyQuestion: "Should I filter for completed orders only and calculate spend from order_items?",
    chips: ["Completed Orders Only", "Top 5 by Total Spend", "All Time"],
    selectedChip: "Top 5 by Total Spend",
    query: `SELECT u.id, u.full_name,
  SUM(oi.quantity * oi.unit_price) AS total_spend
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY u.id, u.full_name
ORDER BY total_spend DESC
LIMIT 5;`,
    previewRows: [
      { name: "Acme Corp", spend: "$24,500", rank: "#1" },
      { name: "Global Logistics", spend: "$18,200", rank: "#2" },
      { name: "Stripe Inc", spend: "$14,890", rank: "#3" },
    ],
  },
  chart: {
    tabLabel: "Chart & Visualizer",
    dialect: "Time-Series SQL",
    userPrompt: "Show monthly completed order revenue for the last 6 months as a trend",
    clarifyQuestion: "Visual intent detected. Grouping by month timestamp with completed orders filter.",
    chips: ["Last 6 Months", "YTD 2024", "Include Taxes"],
    selectedChip: "Last 6 Months",
    query: `SELECT 
  TO_CHAR(created_at, 'YYYY-MM') AS month,
  SUM(total_amount) AS monthly_revenue
FROM orders
WHERE status = 'completed'
GROUP BY 1
ORDER BY 1 ASC
LIMIT 6;`,
    previewRows: [
      { name: "2024-01", spend: "$42,000", rank: "↗ +12%" },
      { name: "2024-02", spend: "$58,400", rank: "↗ +39%" },
      { name: "2024-03", spend: "$71,200", rank: "↗ +22%" },
    ],
  },
  nosql: {
    tabLabel: "MongoDB NoSQL",
    dialect: "MongoDB MQL",
    userPrompt: "Calculate total revenue and unit sales per product category in MongoDB",
    clarifyQuestion: "Unwinding nested '$items' array in orders collection before grouping by category.",
    chips: ["Unwind Items Array", "Group by Category", "Top 5 Categories"],
    selectedChip: "Unwind Items Array",
    query: `db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  { $group: {
      _id: "$items.category",
      total_revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      total_units: { $sum: "$items.qty" }
  }},
  { $sort: { total_revenue: -1 } },
  { $limit: 5 }
]);`,
    previewRows: [
      { name: "Enterprise Software", spend: "$124,000", rank: "1,420 units" },
      { name: "Hardware Kits", spend: "$82,500", rank: "890 units" },
      { name: "Cloud Licenses", spend: "$64,200", rank: "610 units" },
    ],
  },
}

export default function Hero() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeScenario, setActiveScenario] = useState("clarification")

  const current = DEMO_SCENARIOS[activeScenario]

  return (
    <section className="relative overflow-hidden border-b border-border bg-background" id="about">
      {/* Ambient background mesh & gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_60%_-10%,rgba(76,168,115,0.14),transparent_65%),radial-gradient(ellipse_40%_40%_at_10%_90%,rgba(31,102,60,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5ebe4_1px,transparent_1px),linear-gradient(to_bottom,#e5ebe4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)] opacity-25" />
      <div className="pointer-events-none absolute -top-24 left-[55%] size-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,168,115,0.18)_0%,transparent_70%)] blur-3xl" />


      {/* ── HERO NAVBAR ── */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 shadow-xs backdrop-blur-md transition-all duration-200 sm:px-6">

          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#111c16] text-[#5de08a] shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Database className="size-4.5" />
            </span>
            <div>
              <span className="block text-sm font-extrabold text-[#111c16] font-sans leading-none">QueryCraft</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#2b9b54] mt-0.5">
                AI SQL &amp; NoSQL Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#485b50]">
            <a href="#how-it-works" className="transition hover:text-[#111c16] hover:underline underline-offset-4">
              How It Works
            </a>
            <a href="#problem" className="transition hover:text-[#111c16] hover:underline underline-offset-4">
              Why Generic AI Fails
            </a>
            <a href="#features" className="transition hover:text-[#111c16] hover:underline underline-offset-4">
              Features
            </a>
            <a href="#use-cases" className="transition hover:text-[#111c16] hover:underline underline-offset-4">
              Use Cases
            </a>
            <a href="#mcp" className="flex items-center gap-1 text-[#1b6b3a] font-semibold transition hover:text-[#111c16] hover:underline underline-offset-4">
              <Radio className="size-2.5 text-[#34c06a] animate-pulse" />
              <span>MCP Protocol</span>
            </a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link href="/Dashboard">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs text-[#22362b] hover:bg-[#edf5ef] gap-1.5 cursor-pointer">
                    <Terminal className="size-3.5 text-[#34c06a]" />
                    <span>Workspace</span>
                  </Button>
                </Link>

                <Link href="/Dashboard/chat">
                  <Button variant="default" size="sm" className="gap-1.5 font-bold text-xs bg-[#111c16] hover:bg-[#1e3328] text-white shadow-xs cursor-pointer">
                    <MessageSquareText className="size-3.5 text-[#5de08a]" />
                    <span>Launch Chat Studio</span>
                    <ArrowRight className="size-3 text-[#5de08a]" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/Login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs text-[#22362b] hover:bg-[#edf5ef] cursor-pointer">
                    <span>Sign In</span>
                  </Button>
                </Link>

                <Link href="/Dashboard/chat">
                  <Button variant="default" size="sm" className="gap-1.5 font-bold text-xs bg-[#111c16] hover:bg-[#1e3328] text-white shadow-xs cursor-pointer">
                    <span>Try Live Free</span>
                    <ArrowRight className="size-3 text-[#5de08a]" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/Dashboard/chat">
              <Button variant="default" size="sm" className="h-8 px-2.5 text-xs bg-[#111c16] text-white font-bold">
                <span>Try Studio</span>
                <ArrowRight className="size-3 text-[#5de08a]" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="iconSm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-border bg-white p-4 shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex flex-col space-y-2 text-xs font-medium text-[#3b4e43]">
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">How It Works</a>
              <a href="#problem" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">Why Generic AI Fails</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">Features</a>
              <a href="#use-cases" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">Use Cases</a>
              <a href="#mcp" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition font-semibold text-[#1b6b3a]">MCP Protocol</a>
            </div>
            <div className="border-t border-border pt-2">
              <Link href="/Dashboard/chat" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" className="w-full gap-2 text-xs bg-[#111c16] text-white font-bold">
                  <MessageSquareText className="size-4 text-[#5de08a]" />
                  <span>Launch Interactive Chat Studio</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── HERO MAIN BODY ── */}
      <div className="relative mx-auto grid min-h-[600px] w-full max-w-7xl items-center gap-8 lg:gap-10 xl:gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16 min-w-0">

        {/* Left Column: Clear Value Prop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl min-w-0 space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold shadow-2xs backdrop-blur-xs">
              <span className="flex size-2 rounded-full bg-[#34c06a] animate-pulse" />
              <Zap className="size-3.5 text-[#2b9b54]" />
              <span>AI Data Analyst for PostgreSQL, MySQL &amp; MongoDB</span>
            </Badge>
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight text-[#111c16] sm:text-4xl lg:text-5xl xl:text-5.5xl text-balance">
              Chat with your database.{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1b6b3a] via-[#2b9b54] to-[#34c06a] bg-clip-text text-transparent">
                Get verified SQL &amp; charts.
              </span>
            </h1>
            <p className="text-sm font-semibold text-[#55695e] sm:text-base">
              Zero hallucination. 1-tap clarification loop. Automated self-healing execution.
            </p>
          </div>

          <p className="max-w-xl text-sm sm:text-[15px] leading-relaxed text-[#55695e]">
            Connect your live database (<strong>Supabase</strong>, <strong>Neon</strong>, <strong>AWS RDS</strong>, <strong>PostgreSQL</strong>, <strong>MongoDB Atlas</strong>). QueryCraft introspects your real tables, catches typos, asks 1-tap clarifying questions when requests are vague, and compiles production-safe read-only queries with instant SVG charts.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-1">
            <Link href="/Dashboard/chat">
              <Button size="lg" className="w-full sm:w-auto gap-2.5 font-bold text-xs sm:text-sm bg-[#111c16] hover:bg-[#1e3328] text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <MessageSquareText className="size-4 text-[#5de08a]" />
                <span>Launch Interactive Studio</span>
                <ArrowRight className="size-3.5 text-[#5de08a]" />
              </Button>
            </Link>

            <Link href="/Dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold text-xs sm:text-sm border-[#d4e2d8] hover:bg-[#edf5ef] hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <Terminal className="size-4 text-[#34c06a]" />
                <span>Query Compiler Sandbox</span>
              </Button>
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {trustMetrics.map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center gap-1 rounded-xl border border-[#dce7e0] bg-white/80 px-3 py-3 text-center shadow-xs backdrop-blur-sm"
              >
                <m.icon className="size-4 text-[#34c06a]" />
                <span className="text-base sm:text-lg font-extrabold text-[#111c16] leading-none tabular-nums">{m.value}</span>
                <span className="text-[10.5px] font-medium text-[#718578] leading-tight">{m.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Supported Engines */}
          <div className="pt-3 border-t border-border">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#718578] mb-2.5">
              Connect Any Database in 10 Seconds
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#22362b]">
              <span className="flex items-center gap-1.5 rounded-lg border border-[#dce7e0] bg-white px-2.5 py-1 shadow-3xs">
                <span className="size-2 rounded-full bg-[#3ecf8e]" />
                Supabase
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#dce7e0] bg-white px-2.5 py-1 shadow-3xs">
                <span className="size-2 rounded-full bg-[#00e599]" />
                Neon
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#dce7e0] bg-white px-2.5 py-1 shadow-3xs">
                <span className="size-2 rounded-full bg-[#00ed64]" />
                MongoDB Atlas
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#dce7e0] bg-white px-2.5 py-1 shadow-3xs">
                <span className="size-2 rounded-full bg-[#336791]" />
                PostgreSQL &amp; MySQL
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#dce7e0] bg-white px-2.5 py-1 shadow-3xs">
                <span className="size-2 rounded-full bg-[#ff9900]" />
                AWS RDS
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Live Interactive Scenario Studio Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[520px] lg:max-w-[490px] xl:max-w-[560px] min-w-0 lg:ml-auto"
        >
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#89cca0]/25 to-[#d4ecd9]/25 blur-xl pointer-events-none" />

          <Card className="relative overflow-hidden rounded-2xl border-[#dce7e0] bg-white shadow-[0_24px_60px_-28px_rgba(25,40,30,0.25)]">

            {/* Interactive Scenario Selector Tabs */}
            <div className="flex items-center justify-between border-b border-[#e4ece6] bg-[#f9faf9] px-3.5 sm:px-4 py-2.5">
              <div className="flex items-center gap-1 bg-[#edf5ef] p-0.5 rounded-lg border border-[#d5e7d9]">
                {Object.entries(DEMO_SCENARIOS).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveScenario(key)}
                    className={`relative px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      activeScenario === key
                        ? "bg-white text-[#111c16] shadow-xs"
                        : "text-[#586c5f] hover:text-[#111c16]"
                    }`}
                  >
                    {activeScenario === key && (
                      <motion.span
                        layoutId="active-scenario-indicator"
                        className="absolute inset-0 rounded-md bg-white shadow-xs -z-0"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{s.tabLabel}</span>
                  </button>
                ))}
              </div>

              <Badge variant="success" className="gap-1.5 font-mono text-[10px] hidden xs:inline-flex">
                <span className="size-1.5 rounded-full bg-[#34c06a] animate-pulse" />
                Live Grounded
              </Badge>
            </div>

            {/* Simulated Chat Thread with AnimatePresence */}
            <div className="p-4 sm:p-5 text-xs min-h-[360px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScenario}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3.5"
                >
                  {/* User Prompt */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-xl rounded-tr-xs bg-[#111c16] px-3.5 py-2.5 text-white shadow-2xs max-w-[88%] font-medium">
                      {current.userPrompt}
                    </div>
                  </div>

                  {/* AI Clarification Card */}
                  <div className="flex gap-2.5 justify-start">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#111c16] text-[#5de08a] shadow-3xs">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="rounded-xl rounded-tl-xs border border-amber-200 bg-[#fffdfa] border-l-4 border-l-amber-500 p-3 text-amber-950 shadow-3xs space-y-2 max-w-[90%]">
                      <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
                        <HelpCircle className="size-3.5 text-amber-600" />
                        <span>Clarification Loop Paused Execution</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed font-medium">
                        {current.clarifyQuestion}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {current.chips.map((chip, ci) => (
                          <span
                            key={ci}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              chip === current.selectedChip
                                ? "bg-amber-100 border-amber-300 text-amber-950 shadow-2xs"
                                : "bg-white border-amber-200/80 text-amber-800"
                            }`}
                          >
                            {chip} {chip === current.selectedChip && "✓"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generated SQL/MQL Output */}
                  <div className="flex gap-2.5 justify-start w-full min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#111c16] text-[#5de08a] shadow-3xs">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="w-full min-w-0 space-y-2.5 rounded-xl rounded-tl-xs border border-[#dce7e0] bg-[#fbfdfb] p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#1b6b3a]">
                          <ShieldCheck className="size-3.5 text-[#34c06a]" />
                          <span>{current.dialect} · Verified Read-Only</span>
                        </span>
                        <span className="font-mono text-[9.5px] text-[#718578] bg-[#edf5ef] px-1.5 py-0.2 rounded">
                          LIMIT 5
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-[#1b2b22] bg-[#0c1410] w-full min-w-0">
                        <pre className="p-3 font-mono text-[10.5px] leading-relaxed text-[#c6ebd4] overflow-x-auto w-full min-w-0 max-w-full">
                          <code>{current.query}</code>
                        </pre>
                      </div>

                      {/* Live Results Preview Box */}
                      <div className="rounded-lg border border-[#dce7e0] bg-white p-2 text-[10.5px] font-mono">
                        <div className="flex items-center justify-between text-[#718578] border-b border-[#f0f4f1] pb-1 mb-1 font-bold">
                          <span>Result Preview</span>
                          <span className="text-[#34c06a]">3 of 5 rows</span>
                        </div>
                        {current.previewRows.map((r, ri) => (
                          <div key={ri} className="flex items-center justify-between py-0.5 text-[#111c16]">
                            <span className="truncate">{r.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1b6b3a] tabular-nums">{r.spend}</span>
                              <span className="text-[9.5px] text-[#718578]">{r.rank}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Try It Live Button */}
            <div className="border-t border-[#e4ece6] bg-[#f9faf9] p-3 text-center">
              <Link href="/Dashboard/chat">
                <Button size="sm" className="w-full gap-2 text-xs font-bold bg-[#111c16] hover:bg-[#1e3328] text-white shadow-2xs cursor-pointer">
                  <span>Open Scenario in Chat Studio</span>
                  <ArrowRight className="size-3.5 text-[#5de08a]" />
                </Button>
              </Link>
            </div>

          </Card>
        </motion.div>

      </div>
    </section>
  )
}