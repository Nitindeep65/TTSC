'use client'

import { MessageSquareQuote, Star, ShieldCheck, Sparkles, CheckCircle2, Database, Cloud, Server, Cpu } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const metrics = [
  { value: "Zero", label: "Schema Hallucinations", sub: "Live schema & collection grounded", icon: ShieldCheck, color: "text-[#3aa363]" },
  { value: "100%", label: "Read-Only Enforced", sub: "SQL, MQL & Key-Value Sandboxed", icon: CheckCircle2, color: "text-[#3aa363]" },
  { value: "Multi-Model", label: "SQL + NoSQL Engines", sub: "Postgres, Mongo, Redis, MySQL", icon: MessageSquareQuote, color: "text-[#3aa363]" },
]

const testimonials = [
  {
    quote:
      "The proactive clarification engine completely solved the risk of silent bad queries. When our PMs asked for 'top customers', it asked whether to rank by total spend or order volume first before compiling the query.",
    author: "Elena Rostova",
    role: "Head of Data Engineering, Synthetix",
    company: "Supabase & RDS",
    initials: "ER",
    dbColor: "bg-[#3ecf8e]",
    dbLabel: "Supabase PostgreSQL",
    icon: Database,
  },
  {
    quote:
      "Generating complex MongoDB aggregation pipelines with nested $unwind and $lookup stages used to take our analysts hours. QueryCraft parses our document schemas and outputs clean, tested MQL in seconds.",
    author: "Siddharth Mehta",
    role: "Principal Data Architect, OmniStore",
    company: "MongoDB Atlas",
    initials: "SM",
    dbColor: "bg-[#00ed64]",
    dbLabel: "MongoDB Atlas (NoSQL)",
    icon: Cloud,
  },
  {
    quote:
      "The read-only enforcement and automatic LIMIT 50 injection gave our security team total confidence to let non-technical team members generate and run queries across Postgres, Neon, and Redis clusters.",
    author: "Devon Chen",
    role: "Lead Analytics Architect, NovaDB",
    company: "Neon & Redis Stack",
    initials: "DC",
    dbColor: "bg-[#00e599]",
    dbLabel: "Neon & Redis",
    icon: Server,
  },
]

export default function Testimonial() {
  return (
    <section id="testimonials" className="border-b border-border bg-[#fbfdfb] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-14">
          <Badge variant="emerald" className="px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em]">
            Multi-Database Precision
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            Trusted by modern data &amp; engineering teams.
          </h2>
          <p className="text-base leading-relaxed text-[#5e7065]">
            See how engineering leaders and product teams use QueryCraft to eliminate data hallucinations across SQL and NoSQL environments.
          </p>
        </div>

        {/* Metrics bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#d5e7d9] bg-[#edf8f1] px-6 py-6 text-center"
            >
              <m.icon className={`size-6 ${m.color}`} />
              <p className="text-2xl sm:text-3xl font-bold text-[#1a2920] tracking-tight">{m.value}</p>
              <p className="text-sm font-semibold text-[#1e6138]">{m.label}</p>
              <p className="text-xs text-[#5a7463]">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <Card
              key={idx}
              className="flex flex-col justify-between p-7 hover-lift hover:border-[#71c897]/80 hover:shadow-md"
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
                <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 shadow-3xs">
                  <span className={`size-2 rounded-full ${item.dbColor}`} />
                  <span className="text-[10px] font-semibold text-[#485b50]">{item.dbLabel}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}