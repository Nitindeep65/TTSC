'use client'

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
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
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
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
  { value: "Multi-Model", label: "SQL & NoSQL Engines", icon: Layers },
  { value: "< 500ms", label: "Query Compilation", icon: Zap },
  { value: "0", label: "Schema Hallucinations", icon: Check },
]

export default function Hero() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [demoDialect, setDemoDialect] = useState("sql") // "sql" | "nosql"

  return (
    <section className="relative overflow-hidden border-b border-border bg-background" id="about">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_60%_-10%,rgba(76,168,115,0.14),transparent_65%),radial-gradient(ellipse_40%_40%_at_10%_90%,rgba(31,102,60,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5ebe4_1px,transparent_1px),linear-gradient(to_bottom,#e5ebe4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)] opacity-25" />

      {/* Animated glowing orb */}
      <div className="pointer-events-none absolute -top-24 left-[55%] size-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,168,115,0.18)_0%,transparent_70%)] blur-3xl" />

      {/* Problem awareness banner */}
      <div className="relative z-10 border-b border-amber-200/60 bg-amber-50/80 px-4 py-2 backdrop-blur-sm">
        <p className="mx-auto max-w-7xl text-center text-[11px] font-medium text-amber-800 sm:text-xs">
          <span className="font-bold">⚠ The universal data problem:</span>{" "}
          Traditional AI guesses date ranges, hallucinates missing columns, and breaks nested MongoDB pipelines or SQL joins in production.
          <span className="ml-2 inline-flex items-center gap-1 font-bold text-[#1f663c]">
            QueryCraft verifies first.
            <ArrowRight className="size-3" />
          </span>
        </p>
      </div>

      {/* --- HERO NAVBAR --- */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 shadow-xs backdrop-blur-md transition-all duration-200 sm:px-6">

          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <span className="block text-sm font-bold text-[#17241c] font-sans">QueryCraft</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#3aa363]">
                Universal SQL &amp; NoSQL Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#485b50]">
            <a href="#problem" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Problem
            </a>
            <a href="#features" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Features
            </a>
            <a href="#use-cases" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Use Cases
            </a>
            <a href="#mcp" className="flex items-center gap-1 text-[#1f663c] font-semibold transition hover:text-[#17241c] hover:underline underline-offset-4">
              <Radio className="size-2.5 text-[#3aa363] animate-pulse" />
              <span>MCP Protocol</span>
            </a>
            <a href="#testimonials" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Testimonials
            </a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link href="/Dashboard">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs text-[#2d4334] hover:bg-[#edf5ef] gap-1.5">
                    <Terminal className="size-3.5 text-[#3aa363]" />
                    <span>Workspace</span>
                  </Button>
                </Link>

                <Link href="/Dashboard/chat">
                  <Button variant="default" size="sm" className="gap-1.5 font-semibold text-xs shadow-sm hover:shadow-md">
                    <MessageSquareText className="size-3.5 text-[#71c897]" />
                    <span>Launch Studio</span>
                    <ArrowRight className="size-3 text-[#71c897]" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/Login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs text-[#2d4334] hover:bg-[#edf5ef]">
                    <span>Sign In</span>
                  </Button>
                </Link>

                <Link href="/Register">
                  <Button variant="default" size="sm" className="gap-1.5 font-semibold text-xs shadow-sm hover:shadow-md">
                    <span>Get Started</span>
                    <ArrowRight className="size-3 text-[#71c897]" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link href={user ? "/Dashboard/chat" : "/Login"}>
              <Button variant="default" size="sm" className="h-8 px-2.5 text-xs">
                <span>{user ? "Chat" : "Sign In"}</span>
                <ArrowRight className="size-3" />
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

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-border bg-white p-4 shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex flex-col space-y-2 text-xs font-medium text-[#3b4e43]">
              <a href="#problem" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">The Problem</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">Features</a>
              <a href="#use-cases" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">Use Cases</a>
              <a href="#mcp" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition font-semibold text-[#1f663c]">MCP Protocol</a>
              <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">Testimonials</a>
              <Link href={user ? "/Dashboard" : "/Login"} onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 hover:bg-[#f2f7f3] transition">
                {user ? "Query Workspace" : "Sign In"}
              </Link>
            </div>
            <div className="border-t border-border pt-2">
              <Link href={user ? "/Dashboard/chat" : "/Register"} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" className="w-full gap-2 text-xs">
                  <MessageSquareText className="size-4 text-[#71c897]" />
                  <span>{user ? "Open Interactive Chat" : "Create Free Account"}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* --- HERO MAIN CONTENT --- */}
      <div className="relative mx-auto grid min-h-[600px] w-full max-w-7xl items-center gap-8 lg:gap-8 xl:gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16 min-w-0">

        {/* Left Column */}
        <div className="w-full max-w-2xl min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold shadow-2xs backdrop-blur-xs">
            <span className="flex size-2 rounded-full bg-[#4ca873] animate-pulse" />
            <Sparkles className="size-3.5 text-[#3aa363]" />
            <span>Universal Multi-Model • SQL &amp; NoSQL Engine</span>
          </Badge>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#17241c] sm:text-4xl lg:text-5xl xl:text-6xl">
              Ask in plain English.{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1f663c] via-[#2d8e57] to-[#4ca873] bg-clip-text text-transparent">
                Query SQL &amp; NoSQL safely.
              </span>
            </h1>
            <p className="text-sm font-medium text-[#7d9084] sm:text-base">
              The universal clarification engine for{" "}
              <span className="font-bold text-[#1e4d35]">PostgreSQL, MySQL, MongoDB, DynamoDB &amp; Redis</span>.
            </p>
          </div>

          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#56675d]">
            Connect relational databases (<strong>Supabase</strong>, <strong>Neon</strong>, <strong>AWS RDS</strong>) or document/key-value stores (<strong>MongoDB Atlas</strong>, <strong>DynamoDB</strong>, <strong>Redis</strong>). QueryCraft introspects your live schema, asks targeted questions when parameters are ambiguous, and compiles verified queries with zero hallucination.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-1">
            <Link href={user ? "/Dashboard/chat" : "/Login"}>
              <Button variant="default" size="lg" className="w-full sm:w-auto gap-2.5 font-semibold text-xs sm:text-sm shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                <MessageSquareText className="size-4 text-[#71c897]" />
                <span>{user ? "Launch Interactive Chat" : "Get Started Free"}</span>
                <ArrowRight className="size-3.5 text-[#71c897]" />
              </Button>
            </Link>

            <Link href={user ? "/Dashboard" : "/Login"}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold text-xs sm:text-sm hover:scale-[1.02] transition-all duration-200">
                <Terminal className="size-4 text-[#3aa363]" />
                <span>{user ? "Query Compiler Workspace" : "Sign In to Studio"}</span>
              </Button>
            </Link>
          </div>

          {/* Trust metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {trustMetrics.map((m, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white/70 px-3 py-3 text-center shadow-xs backdrop-blur-sm"
              >
                <m.icon className="size-4 text-[#3aa363]" />
                <span className="text-base sm:text-lg font-bold text-[#17241c] leading-none">{m.value}</span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#7d9084] leading-tight">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Supported Databases Badges (SQL & NoSQL) */}
          <div className="pt-3 border-t border-border">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d9084] mb-2.5">
              Native Multi-Engine Database Support
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2 text-xs font-semibold text-[#304838]">
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-3xs transition-transform hover:scale-105">
                <span className="size-2 rounded-full bg-[#3ecf8e]" />
                Supabase
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-3xs transition-transform hover:scale-105">
                <span className="size-2 rounded-full bg-[#00e599]" />
                Neon
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-3xs transition-transform hover:scale-105">
                <span className="size-2 rounded-full bg-[#00ed64]" />
                MongoDB Atlas
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-3xs transition-transform hover:scale-105">
                <span className="size-2 rounded-full bg-[#dc382d]" />
                Redis
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-3xs transition-transform hover:scale-105">
                <span className="size-2 rounded-full bg-[#ff9900]" />
                AWS RDS / DynamoDB
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-3xs transition-transform hover:scale-105">
                <Database className="size-3.5 text-[#336791]" />
                PostgreSQL &amp; MySQL
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Conversational Demo with SQL & NoSQL Switcher */}
        <div className="relative mx-auto w-full max-w-[500px] lg:max-w-[470px] xl:max-w-[550px] min-w-0 lg:ml-auto animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#89cca0]/25 to-[#d4ecd9]/25 blur-xl pointer-events-none" />

          <Card className="relative overflow-hidden rounded-2xl border-border bg-white shadow-[0_24px_60px_-28px_rgba(25,40,30,0.25)] hover-lift">

            {/* Demo Header with SQL vs NoSQL toggle */}
            <div className="flex items-center justify-between border-b border-border bg-[#fbfdfb] px-3.5 sm:px-4 py-2.5">
              <div className="flex items-center gap-1 bg-[#edf5ef] p-0.5 rounded-lg border border-[#d5e7d9]">
                <button
                  type="button"
                  onClick={() => setDemoDialect("sql")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    demoDialect === "sql"
                      ? "bg-white text-[#17241c] shadow-xs"
                      : "text-[#586c5f] hover:text-[#17241c]"
                  }`}
                >
                  PostgreSQL (SQL)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoDialect("nosql")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    demoDialect === "nosql"
                      ? "bg-white text-[#17241c] shadow-xs"
                      : "text-[#586c5f] hover:text-[#17241c]"
                  }`}
                >
                  MongoDB (NoSQL MQL)
                </button>
              </div>

              <Badge variant="success" className="gap-1.5 font-mono text-[10px]">
                <span className="size-1.5 rounded-full bg-[#4ca873] animate-pulse" />
                Live Schema
              </Badge>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3.5 p-4 sm:p-5 text-xs">

              {demoDialect === "sql" ? (
                <>
                  {/* Turn 1: User */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-xl rounded-tr-xs bg-[#1f2d24] px-3.5 py-2.5 text-white shadow-2xs max-w-[85%] font-medium">
                      Show top customers by spend with completed orders in 2024
                    </div>
                  </div>

                  {/* Turn 2: Clarification */}
                  <div className="flex gap-2.5 justify-start">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-3xs">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="rounded-xl rounded-tl-xs border border-[#ecd9be] bg-[#fefaf3] p-3 text-[#4d361c] shadow-3xs space-y-1 max-w-[88%]">
                      <div className="flex items-center gap-1 font-semibold text-[#a5651c] text-[11px]">
                        <HelpCircle className="size-3 text-[#d98b2c]" />
                        Clarification needed
                      </div>
                      <p className="leading-relaxed">
                        Should I rank top <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">5</code> or <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">10</code> customers, and calculate spend from <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">order_items</code>?
                      </p>
                    </div>
                  </div>

                  {/* Turn 3: User Follow-up */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-xl rounded-tr-xs bg-[#1f2d24] px-3.5 py-2.5 text-white shadow-2xs font-medium">
                      Top 5 customers from order_items total
                    </div>
                  </div>

                  {/* Turn 4: Final SQL */}
                  <div className="flex gap-2.5 justify-start w-full min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-3xs">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="w-full min-w-0 space-y-2 rounded-xl rounded-tl-xs border border-border bg-[#fbfdfb] p-3.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#1e6138] text-[11px]">
                        <ShieldCheck className="size-3.5 text-[#3aa363]" />
                        <span>Verified Relational SQL</span>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-[#243529] bg-[#17231c] w-full min-w-0">
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#121c16] px-3 py-1.5 text-[10px] text-[#86a894] font-mono">
                          <span>PostgreSQL (Read-Only)</span>
                          <span className="rounded bg-[#216b44] px-1.5 py-0.5 text-[9px] text-white font-sans font-bold">
                            LIMIT 5
                          </span>
                        </div>
                        <pre className="p-2.5 font-mono text-[10px] sm:text-[10.5px] leading-relaxed text-[#d7f1df] overflow-x-auto w-full min-w-0 max-w-full">
                          <code>{`SELECT u.id, u.name,
  SUM(oi.quantity * oi.unit_price) AS spend
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
  AND o.created_at >= '2024-01-01'
GROUP BY u.id, u.name
ORDER BY spend DESC
LIMIT 5;`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Turn 1: User NoSQL */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-xl rounded-tr-xs bg-[#1f2d24] px-3.5 py-2.5 text-white shadow-2xs max-w-[85%] font-medium">
                      Find highest value customers with completed orders in MongoDB
                    </div>
                  </div>

                  {/* Turn 2: Clarification NoSQL */}
                  <div className="flex gap-2.5 justify-start">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-3xs">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="rounded-xl rounded-tl-xs border border-[#ecd9be] bg-[#fefaf3] p-3 text-[#4d361c] shadow-3xs space-y-1 max-w-[88%]">
                      <div className="flex items-center gap-1 font-semibold text-[#a5651c] text-[11px]">
                        <HelpCircle className="size-3 text-[#d98b2c]" />
                        MQL Clarification
                      </div>
                      <p className="leading-relaxed">
                        In your <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">orders</code> collection, should we unwind <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">items</code> array and calculate sum of <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">items.qty * items.price</code>?
                      </p>
                    </div>
                  </div>

                  {/* Turn 3: User Follow-up NoSQL */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-xl rounded-tr-xs bg-[#1f2d24] px-3.5 py-2.5 text-white shadow-2xs font-medium">
                      Yes, unwind items and return top 5 with user details
                    </div>
                  </div>

                  {/* Turn 4: Final NoSQL MQL */}
                  <div className="flex gap-2.5 justify-start w-full min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-3xs">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="w-full min-w-0 space-y-2 rounded-xl rounded-tl-xs border border-border bg-[#fbfdfb] p-3.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#1e6138] text-[11px]">
                        <ShieldCheck className="size-3.5 text-[#3aa363]" />
                        <span>Verified MongoDB Aggregation Pipeline</span>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-[#243529] bg-[#17231c] w-full min-w-0">
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#121c16] px-3 py-1.5 text-[10px] text-[#86a894] font-mono">
                          <span>MongoDB MQL (Read-Only)</span>
                          <span className="rounded bg-[#00ed64] px-1.5 py-0.5 text-[9px] text-[#121c16] font-sans font-bold">
                            $limit: 5
                          </span>
                        </div>
                        <pre className="p-2.5 font-mono text-[10px] sm:text-[10.5px] leading-relaxed text-[#d7f1df] overflow-x-auto w-full min-w-0 max-w-full">
                          <code>{`db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  { $group: {
      _id: "$user_id",
      total_spend: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
  }},
  { $sort: { total_spend: -1 } },
  { $limit: 5 }
]);`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

          </Card>
        </div>

      </div>
    </section>
  )
}