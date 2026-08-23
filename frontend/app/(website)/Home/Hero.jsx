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
  Cpu,
  Database,
  HelpCircle,
  Layers,
  Menu,
  MessageSquareText,
  Network,
  Play,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Table2,
  Terminal,
  Workflow,
  X,
  Zap,
} from "lucide-react"

export default function Hero() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <section className="relative overflow-hidden border-b border-[#e3e8e2] bg-[#f7f8f5]" id="about">
      {/* Background Subtle Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(113,178,133,0.18),transparent_40%),radial-gradient(circle_at_10%_85%,rgba(211,157,76,0.10),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5ebe4_1px,transparent_1px),linear-gradient(to_bottom,#e5ebe4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30" />

      {/* --- HERO NAVBAR --- */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-2xl border border-[#dfe7df]/80 bg-white/75 px-4 py-3 shadow-xs backdrop-blur-md sm:px-6">
          
          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <span className="block text-sm font-bold text-[#17241c]">Text to SQL</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#3aa363]">
                MCP Postgres Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#485b50]">
            <a href="#about" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Overview
            </a>
            <a href="#features" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Features
            </a>
            <a href="#mcp" className="flex items-center gap-1 text-[#1f663c] font-semibold transition hover:text-[#17241c] hover:underline underline-offset-4">
              <Radio className="size-2.5 text-[#3aa363] animate-pulse" />
              <span>MCP Protocol</span>
            </a>
            <a href="#use-cases" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Daily Use Cases
            </a>
            <a href="#testimonials" className="transition hover:text-[#17241c] hover:underline underline-offset-4">
              Testimonials
            </a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/Login"
              className="px-3 py-1.5 text-xs font-semibold text-[#304738] transition hover:text-[#17241c]"
            >
              Sign In
            </Link>

            <Link
              href="/Dashboard/chat"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1f2d24] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#314f3b] hover:shadow-md"
            >
              <MessageSquareText className="size-3.5 text-[#71c897]" />
              <span>Launch Studio</span>
              <ArrowRight className="size-3 text-[#71c897]" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/Dashboard/chat"
              className="inline-flex items-center gap-1 rounded-lg bg-[#1f2d24] px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              <span>Chat</span>
              <ArrowRight className="size-3" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex size-8.5 items-center justify-center rounded-lg border border-[#dce5dd] bg-white text-[#304738] hover:bg-[#f2f7f3]"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>

        </nav>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-[#dfe7df] bg-white p-4 shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="flex flex-col space-y-2 text-xs font-medium text-[#3b4e43]">
              <a
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition"
              >
                Overview
              </a>
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition"
              >
                Features &amp; Cloud Integrations
              </a>
              <a
                href="#mcp"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition font-semibold text-[#1f663c]"
              >
                Model Context Protocol (MCP)
              </a>
              <a
                href="#use-cases"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition"
              >
                Daily Use Cases
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition"
              >
                Testimonials
              </a>
              <Link
                href="/Dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition"
              >
                Query Compiler
              </Link>
              <Link
                href="/Login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-[#f2f7f3] transition"
              >
                Sign In / Register
              </Link>
            </div>

            <div className="border-t border-[#edf2ee] pt-2">
              <Link
                href="/Dashboard/chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#1f2d24] py-2.5 text-xs font-semibold text-white"
              >
                <MessageSquareText className="size-4 text-[#71c897]" />
                <span>Open Interactive Chat</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* --- HERO MAIN CONTENT --- */}
      <div className="relative mx-auto grid min-h-[680px] w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
        
        {/* Left Column: Headline & Value Prop */}
        <div className="max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0d2] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#206642] shadow-2xs backdrop-blur-xs">
            <span className="flex size-2 rounded-full bg-[#4ca873] animate-pulse" />
            <Sparkles className="size-3.5 text-[#4ca873]" />
            <span>MCP Native • Cloud PostgreSQL Engine</span>
          </div>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[#17241c] sm:text-5xl lg:text-6xl">
            Ask in plain English. <br />
            <span className="bg-gradient-to-r from-[#1f663c] via-[#2d8e57] to-[#4ca873] bg-clip-text text-transparent">
              Get Production-Ready SQL.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[#56675d] sm:text-lg">
            Powered by the <strong>Model Context Protocol (MCP)</strong>. Connect your <strong>Supabase</strong>, <strong>Neon</strong>, or <strong>AWS RDS</strong> PostgreSQL database. The engine parses live schema constraints, pauses to clarify ambiguous dates and filters, and outputs safe, read-only SQL queries.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3.5 sm:flex-row pt-2">
            <Link
              href="/Dashboard/chat"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1f2d24] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1f2d24]/15 transition hover:bg-[#314e3b] hover:shadow-xl"
            >
              <MessageSquareText className="size-4.5 text-[#71c897]" />
              <span>Launch Interactive Chat</span>
              <ArrowRight className="size-4 text-[#71c897]" />
            </Link>

            <Link
              href="/Dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfddd0] bg-white px-6 py-3.5 text-sm font-semibold text-[#243a2c] shadow-2xs transition hover:border-[#79b790] hover:bg-[#f2f8f3]"
            >
              <Terminal className="size-4.5 text-[#3aa363]" />
              <span>Query Compiler Workspace</span>
            </Link>
          </div>

          {/* Cloud Database Supported Badges */}
          <div className="pt-4 border-t border-[#e2e8e2]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d9084] mb-3">
              Native Cloud Database Support via MCP
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-[#304838]">
              <span className="flex items-center gap-1.5 rounded-lg border border-[#d6e4d9] bg-white px-3 py-1.5 shadow-3xs">
                <span className="size-2 rounded-full bg-[#3ecf8e]" />
                Supabase
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#d6e4d9] bg-white px-3 py-1.5 shadow-3xs">
                <span className="size-2 rounded-full bg-[#00e599]" />
                Neon Serverless
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#d6e4d9] bg-white px-3 py-1.5 shadow-3xs">
                <span className="size-2 rounded-full bg-[#ff9900]" />
                AWS RDS
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#d6e4d9] bg-white px-3 py-1.5 shadow-3xs">
                <Database className="size-3.5 text-[#336791]" />
                Custom PostgreSQL
              </span>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#627368] pt-1">
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-[#3aa363]" />
              MCP Schema Streaming
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-[#3aa363]" />
              Zero Hallucinations
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-[#3aa363]" />
              Read-Only &amp; LIMIT 50 Safe
            </span>
          </div>

        </div>

        {/* Right Column: Interactive Conversational Demo Simulation */}
        <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[#89cca0]/30 to-[#d4ecd9]/30 blur-2xl" />
          
          <div className="relative overflow-hidden rounded-2xl border border-[#d7e1d8] bg-white shadow-[0_24px_60px_-28px_rgba(25,40,30,0.30)]">
            
            {/* Demo Header */}
            <div className="flex items-center justify-between border-b border-[#e8ebe6] bg-[#fbfdfb] px-4 sm:px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1f2d24]">
                <span className="flex size-6 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897]">
                  <Database className="size-3.5" />
                </span>
                <span>MCP Schema Context: E-Commerce RDS</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#edf7ef] px-2.5 py-0.5 text-[11px] font-semibold text-[#246b45]">
                <span className="size-1.5 rounded-full bg-[#4ca873] animate-pulse" />
                MCP Streamed
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3.5 p-4 sm:p-5 text-xs">
              
              {/* Turn 1: User Request */}
              <div className="flex gap-2.5 justify-end">
                <div className="rounded-xl rounded-tr-xs bg-[#1f2d24] px-3.5 py-2.5 text-white shadow-2xs max-w-[85%]">
                  Show top customers by spend with completed orders in 2024
                </div>
              </div>

              {/* Turn 2: Assistant Clarification */}
              <div className="flex gap-2.5 justify-start">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-3xs">
                  <Bot className="size-3.5" />
                </div>
                <div className="rounded-xl rounded-tl-xs border border-[#ecd9be] bg-[#fefaf3] p-3 text-[#4d361c] shadow-3xs space-y-1 max-w-[88%]">
                  <div className="flex items-center gap-1 font-semibold text-[#a5651c] text-[11px]">
                    <HelpCircle className="size-3 text-[#d98b2c]" />
                    MCP Clarification Tool
                  </div>
                  <p className="leading-relaxed">
                    Should we rank the top 5 or top 10 customers, and calculate spend from <code className="rounded bg-[#f6eddf] px-1 font-mono text-[10px]">order_items (qty * unit_price)</code>?
                  </p>
                </div>
              </div>

              {/* Turn 3: User Follow-up */}
              <div className="flex gap-2.5 justify-end">
                <div className="rounded-xl rounded-tr-xs bg-[#1f2d24] px-3.5 py-2.5 text-white shadow-2xs">
                  Top 5 customers from order_items total
                </div>
              </div>

              {/* Turn 4: Final Complete SQL */}
              <div className="flex gap-2.5 justify-start">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-3xs">
                  <Bot className="size-3.5" />
                </div>
                <div className="w-full space-y-2 rounded-xl rounded-tl-xs border border-[#d6e4d9] bg-[#fbfdfb] p-3.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1e6138] text-[11px]">
                    <ShieldCheck className="size-3.5 text-[#3aa363]" />
                    <span>MCP Safe SQL Compiled</span>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-[#243529] bg-[#17231c]">
                    <div className="flex items-center justify-between border-b border-white/10 bg-[#121c16] px-3 py-1.5 text-[10px] text-[#86a894] font-mono">
                      <span>PostgreSQL (Read-Only)</span>
                      <span className="rounded bg-[#216b44] px-1.5 py-0.2 text-[9px] text-white font-sans font-bold">
                        LIMIT 5
                      </span>
                    </div>
                    <pre className="p-2.5 font-mono text-[11px] leading-relaxed text-[#d7f1df] overflow-x-auto">
                      <code>{`SELECT u.id, u.name,
       SUM(oi.quantity * oi.unit_price) AS total_spend
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
  AND EXTRACT(YEAR FROM o.created_at) = 2024
GROUP BY u.id, u.name
ORDER BY total_spend DESC
LIMIT 5;`}</code>
                    </pre>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  )
}