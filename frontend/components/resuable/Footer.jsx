import Link from "next/link"
import { Database, Sparkles, Terminal, ShieldCheck } from "lucide-react"

function Footer() {
  return (
    <footer className="border-t border-[#e3e8e2] bg-[#fbfdfb]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897]">
                <Sparkles className="size-4.5" />
              </span>
              <span className="text-base font-semibold tracking-tight text-[#1f2d24]">Text to SQL Engine</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#627269]">
              Translate natural language business questions into precise, multi-table PostgreSQL queries with an intelligent clarification layer.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d2e4d6] bg-[#edf6ef] px-3 py-1 text-xs font-medium text-[#246b45]">
              <span className="size-2 rounded-full bg-[#4ca873] animate-pulse" />
              Powered by NVIDIA Llama-3.1-8B
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#86958b]">Supported Tables</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#55655b]">
              <li className="flex items-center gap-2">
                <Database className="size-3.5 text-[#4ca873]" />
                <code className="text-xs font-semibold text-[#1f2d24]">users</code> (id, name, email, role)
              </li>
              <li className="flex items-center gap-2">
                <Database className="size-3.5 text-[#4ca873]" />
                <code className="text-xs font-semibold text-[#1f2d24]">orders</code> (id, user_id, amount)
              </li>
              <li className="flex items-center gap-2">
                <Database className="size-3.5 text-[#4ca873]" />
                <code className="text-xs font-semibold text-[#1f2d24]">order_items</code> (product_id, qty)
              </li>
              <li className="flex items-center gap-2">
                <Database className="size-3.5 text-[#4ca873]" />
                <code className="text-xs font-semibold text-[#1f2d24]">products</code> (category, price)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#86958b]">Navigation</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#55655b]">
              <li>
                <Link href="/" className="transition hover:text-[#1f2d24]">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/Dashboard" className="transition hover:text-[#1f2d24]">
                  Query Workspace
                </Link>
              </li>
              <li>
                <Link href="/Dashboard/chat" className="transition hover:text-[#1f2d24]">
                  Interactive Chat
                </Link>
              </li>
              <li>
                <Link href="/Login" className="transition hover:text-[#1f2d24]">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e8ece7] pt-6 sm:flex-row text-xs text-[#728078]">
          <p>© {new Date().getFullYear()} Text to SQL Engine. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[#246b45]">
              <ShieldCheck className="size-4 text-[#4ca873]" />
              Safe read-only query generation
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer