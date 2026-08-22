import Link from "next/link"
import { ArrowRight, Check, Database, MessageSquareText, Sparkles, Terminal, Cpu } from "lucide-react"

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#e3e8e2] bg-[#f7f8f5]" id="about">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(113,178,133,0.18),transparent_35%),radial-gradient(circle_at_10%_85%,rgba(211,157,76,0.12),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[700px] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe0d2] bg-[#edf7ef] px-3.5 py-1.5 text-xs font-semibold text-[#226844] shadow-2xs">
            <Sparkles className="size-3.5 text-[#4ca873]" />
            Natural Language Database Intelligence
          </div>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[#1f2d24] sm:text-5xl lg:text-6xl">
            Ask questions. <br />
            <span className="bg-gradient-to-r from-[#2c774f] to-[#4ca873] bg-clip-text text-transparent">
              Generate PostgreSQL.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#5c6e63] sm:text-lg">
            Convert plain English requests into production-grade PostgreSQL queries. When instructions are ambiguous, the engine prompts for clarification instead of making risky assumptions.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
            <Link
              href="/Dashboard/chat"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f2d24] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1f2d24]/15 transition hover:bg-[#324f3b] hover:shadow-xl"
            >
              <MessageSquareText className="size-4 text-[#71c897]" />
              Start Interactive Chat
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/Dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfddd0] bg-white px-6 py-3.5 text-sm font-semibold text-[#273d2f] shadow-2xs transition hover:border-[#79b790] hover:bg-[#f1f8f2]"
            >
              <Terminal className="size-4 text-[#4ca873]" />
              Open Query Workspace
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#65766c]">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#4ca873]" />
              Multi-turn Clarification
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#4ca873]" />
              PostgreSQL Syntax
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#4ca873]" />
              Zero Hallucinations
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[#9ed2b1]/40 to-[#cde7d6]/40 blur-2xl" />
          
          <div className="relative overflow-hidden rounded-2xl border border-[#d7e1d8] bg-white shadow-[0_24px_60px_-28px_rgba(31,45,36,0.35)]">
            <div className="flex items-center justify-between border-b border-[#e8ebe6] bg-[#fbfdfb] px-5 py-3.5">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#1f2d24]">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#e9f4ed] text-[#28734d]">
                  <Database className="size-3.5" />
                </span>
                <span>Postgres Schema: E-Commerce</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#edf7ef] px-2.5 py-0.5 text-[11px] font-semibold text-[#2a774f]">
                <span className="size-1.5 rounded-full bg-[#4ca873] animate-pulse" />
                Model Connected
              </span>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-white text-xs font-bold">
                  U
                </div>
                <div className="rounded-xl rounded-tl-xs bg-[#f2f5f1] px-4 py-3 text-sm leading-relaxed text-[#2f4035]">
                  "Show top 5 customers by spend who made orders in the last 30 days"
                </div>
              </div>

              <div className="ml-11 rounded-xl border border-[#dfe8e0] bg-[#fbfdfb] p-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#28734d]">
                    <Sparkles className="size-3.5" />
                    <span>Intent Evaluated & Verified</span>
                  </div>
                  <span className="rounded-md bg-[#eef6f0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#266e47]">
                    99.4% Match
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-[#e8f1ea] px-2 py-0.5 font-mono text-[11px] font-medium text-[#2d563d]">
                    users
                  </span>
                  <span className="rounded-md bg-[#e8f1ea] px-2 py-0.5 font-mono text-[11px] font-medium text-[#2d563d]">
                    orders
                  </span>
                  <span className="rounded-md bg-[#f4ebd7] px-2 py-0.5 font-mono text-[11px] font-medium text-[#7a5316]">
                    SUM(total_amount)
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-[#17231c] p-4 font-mono text-xs leading-relaxed text-[#d7f1df] shadow-inner">
                <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-[#7da78c]">
                  <span>GENERATED SQL</span>
                  <span>POSTGRESQL</span>
                </div>
                <span className="text-[#8bc59e] font-semibold">SELECT</span> u.id, u.name, <span className="text-[#8bc59e] font-semibold">SUM</span>(o.total_amount) <span className="text-[#8bc59e] font-semibold">AS</span> total_spent<br />
                <span className="text-[#8bc59e] font-semibold">FROM</span> users u<br />
                <span className="text-[#8bc59e] font-semibold">JOIN</span> orders o <span className="text-[#8bc59e] font-semibold">ON</span> u.id = o.user_id<br />
                <span className="text-[#8bc59e] font-semibold">WHERE</span> o.created_at &gt;= <span className="text-[#e2b072]">NOW() - INTERVAL &apos;30 days&apos;</span><br />
                <span className="text-[#8bc59e] font-semibold">GROUP BY</span> u.id, u.name<br />
                <span className="text-[#8bc59e] font-semibold">ORDER BY</span> total_spent <span className="text-[#8bc59e] font-semibold">DESC</span> <span className="text-[#8bc59e] font-semibold">LIMIT</span> 5;
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero