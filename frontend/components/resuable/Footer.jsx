'use client'

import Link from "next/link"
import { Database, Sparkles, Terminal, ShieldCheck, Cloud, Server } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-[#e3e8e2] bg-[#fbfdfb]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8">
        
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
                <Sparkles className="size-4.5" />
              </span>
              <div>
                <span className="block text-base font-semibold tracking-tight text-[#17241c]">
                  Text to SQL Studio
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#3aa363]">
                  Cloud PostgreSQL Intelligence
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-[#5e7065]">
              Translate natural language business questions into precise, multi-table PostgreSQL queries with an intelligent clarification layer.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d2e4d6] bg-[#edf6ef] px-3 py-1 text-xs font-semibold text-[#206642]">
                <span className="size-2 rounded-full bg-[#4ca873] animate-pulse" />
                Llama-3.1 70B Engine
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe7df] bg-white px-3 py-1 text-xs font-semibold text-[#485b50]">
                <ShieldCheck className="size-3.5 text-[#3aa363]" />
                Zero Hallucination Grounding
              </span>
            </div>
          </div>

          {/* Supported Cloud Databases Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#788a80]">
              Cloud Integrations
            </h4>
            <ul className="mt-3.5 space-y-2 text-xs font-medium text-[#4c5e53]">
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#3ecf8e]" />
                <span>Supabase PostgreSQL</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00e599]" />
                <span>Neon Serverless</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#ff9900]" />
                <span>AWS RDS PostgreSQL</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#336791]" />
                <span>Timescale &amp; Render</span>
              </li>
            </ul>
          </div>

          {/* Quick Navigation Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#788a80]">
              Product Workspaces
            </h4>
            <ul className="mt-3.5 space-y-2 text-xs font-medium text-[#4c5e53]">
              <li>
                <Link href="/Dashboard/chat" className="transition hover:text-[#17241c] hover:underline">
                  Interactive Multi-Turn Chat
                </Link>
              </li>
              <li>
                <Link href="/Dashboard" className="transition hover:text-[#17241c] hover:underline">
                  Single-Turn Query Compiler
                </Link>
              </li>
              <li>
                <Link href="/Login" className="transition hover:text-[#17241c] hover:underline">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e8efe9] pt-6 sm:flex-row text-xs text-[#788a80]">
          <p>© {new Date().getFullYear()} Text to SQL Engine. Production-Grade PostgreSQL Clarifier.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[#206642] font-medium">
              <ShieldCheck className="size-4 text-[#3ba565]" />
              Safe read-only execution with LIMIT 50 guards
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}