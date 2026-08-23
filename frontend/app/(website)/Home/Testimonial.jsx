'use client'

import { MessageSquareQuote, Star, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react"

const testimonials = [
  {
    quote:
      "The proactive clarification engine completely solved the risk of silent bad SQL. When our PMs asked for 'top customers', it asked whether to rank by total spend or order volume first instead of guessing.",
    author: "Elena Rostova",
    role: "Head of Data Engineering, Synthetix",
    company: "Supabase & RDS User",
    initials: "ER",
  },
  {
    quote:
      "Live introspection of our Neon database was instantaneous. It detected our UUID keys, JSONB metadata, and TIMESTAMPTZ columns without us having to write manual prompt engineering rules.",
    author: "Marcus Vance",
    role: "VP of Product, FinScale",
    company: "Neon Serverless Stack",
    initials: "MV",
  },
  {
    quote:
      "The read-only enforcement and automatic LIMIT 50 injection gave our security team total confidence to let non-technical team members generate and run queries directly in the workspace.",
    author: "Devon Chen",
    role: "Lead Analytics Architect, NovaDB",
    company: "AWS RDS PostgreSQL",
    initials: "DC",
  },
]

export default function Testimonial() {
  return (
    <section id="testimonials" className="border-b border-[#e3e8e2] bg-[#fbfdfb] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#246b45]">
            Engineered For Precision
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            Trusted by modern data &amp; engineering teams.
          </h2>
          <p className="text-base leading-relaxed text-[#5e7065]">
            See how engineering leaders and product teams use our Text-to-SQL clarification system to eliminate data hallucinations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <article
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-[#dfe7df] bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#71c897]/70 hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-1 text-[#d98b2c]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[#304437]">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#e8efe9] pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] font-mono text-xs font-bold text-[#71c897] shadow-xs">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#17241c]">{item.author}</p>
                    <p className="text-[11px] text-[#6d7e74]">{item.role}</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block rounded bg-[#edf6f0] px-2 py-0.5 text-[9px] font-bold text-[#206642]">
                  {item.company}
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}