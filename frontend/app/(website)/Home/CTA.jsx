import Link from "next/link"
import { ArrowRight, MessageSquareText, Sparkles, Terminal } from "lucide-react"

function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#17231c] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(76,168,115,0.18),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(44,119,79,0.25),transparent_40%)]" />
      
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-[#8ed8a8] backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#71c897]" />
            Instant Query Evaluation
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Start talking to your PostgreSQL data today.
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#bad1c2]">
            Test questions in our interactive multi-turn chat or try single prompt query compilation in the workspace.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/Dashboard/chat"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4ca873] px-6 py-3.5 text-sm font-semibold text-[#0c1a12] shadow-lg shadow-[#4ca873]/20 transition hover:bg-[#5fc089]"
          >
            <MessageSquareText className="size-4" />
            Launch Interactive Chat
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/Dashboard"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <Terminal className="size-4 text-[#71c897]" />
            Query Tester
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTA