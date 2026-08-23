'use client'

import Link from "next/link"
import { ArrowRight, Cloud, Database, MessageSquareText, ShieldCheck, Sparkles, Terminal } from "lucide-react"

export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#121d16] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      {/* Subtle Glow Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(76,168,115,0.22),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(36,105,68,0.30),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">
        
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-semibold text-[#8ed8a8] backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#71c897]" />
            <span>Ready for Production Data</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            Connect your cloud database. <br />
            <span className="bg-gradient-to-r from-[#71c897] via-[#a3e5bd] to-white bg-clip-text text-transparent">
              Start querying in seconds.
            </span>
          </h2>

          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#bad1c2]">
            Connect Supabase, Neon, or AWS RDS in 1 click. Test multi-turn conversational SQL compilation or run queries directly in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#a0beaa]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#71c897]" />
              Safe Read-Only SELECT
            </span>
            <span className="flex items-center gap-1.5">
              <Cloud className="size-4 text-[#71c897]" />
              Zero Configuration Schema Introspection
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 sm:flex-row shrink-0">
          <Link
            href="/Dashboard/chat"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4ca873] px-6 py-4 text-sm font-bold text-[#0c1a12] shadow-xl shadow-[#4ca873]/25 transition hover:bg-[#5fc089] hover:scale-[1.02]"
          >
            <MessageSquareText className="size-4.5" />
            <span>Launch Live Chat</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/Dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <Terminal className="size-4.5 text-[#71c897]" />
            <span>Query Workspace</span>
          </Link>
        </div>

      </div>
    </section>
  )
}