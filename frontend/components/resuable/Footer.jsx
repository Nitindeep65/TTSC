'use client'

import Link from "next/link"
import { Code2, Database, ExternalLink, Link2, ShieldCheck, Users } from "lucide-react"

const DB_ENGINES = [
  { label: "Supabase", color: "#3ECF8E" },
  { label: "Neon Serverless", color: "#00E699" },
  { label: "AWS RDS PostgreSQL", color: "#FF9900" },
  { label: "CockroachDB", color: "#6933FF" },
  { label: "Cloud PostgreSQL", color: "#336791" },
  { label: "Heroku Postgres", color: "#79589F" },
]

const PRODUCT_LINKS = [
  { href: "/Dashboard/chat", label: "SQL Doctor & Chat" },
  { href: "/Dashboard", label: "SQL Compiler Sandbox" },
  { href: "/Dashboard/guard", label: "Pre-Flight Cost Guard" },
  { href: "/docs/cli", label: "CLI & MCP Server" },
]

const RESOURCES_LINKS = [
  { href: "/docs/cli",       label: "CLI Documentation" },
  { href: "/#problem",      label: "Architecture & Safety" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#mcp",          label: "MCP Protocol Guide" },
  { href: "/#features",     label: "Feature Overview" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Top 4-column grid */}
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#0f172a] text-emerald-400 shadow-xs">
                <Database className="size-4.5" />
              </span>
              <div className="leading-none">
                <span className="block text-sm font-bold text-[#0f172a]">QueryCraft</span>
                <span className="block text-[9.5px] font-bold uppercase tracking-[0.12em] text-emerald-600 mt-0.5">
                  PostgreSQL Safety Layer
                </span>
              </div>
            </Link>

            <p className="text-[13px] leading-relaxed text-slate-500">
              Transform natural language into safe, production-ready PostgreSQL queries with pre-flight cost analysis, 3-tier risk classification, and automated SQL Doctor healing.
            </p>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                <ShieldCheck className="size-3 text-emerald-500" />
                Read-Only Safe
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <Code2 className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <Link2 className="size-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <Users className="size-4" />
              </a>
            </div>
          </div>

          {/* Supported Databases */}
          <div>
            <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">
              Database Engines
            </h4>
            <ul className="space-y-2.5">
              {DB_ENGINES.map((e, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  {e.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Product workspaces */}
          <div>
            <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {RESOURCES_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row text-[12px] text-slate-400">
          <p>
            © {year} QueryCraft. Universal SQL & NoSQL Database Engine.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Safe read-only execution · Zero schema hallucinations
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}