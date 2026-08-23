'use client'

import React from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Layers,
  LineChart,
  MessageSquareText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const useCases = [
  {
    icon: DollarSign,
    category: "Financial Analytics",
    title: "Revenue & Refund Audits",
    prompt: "Calculate total revenue and refunded amounts grouped by payment method in Q3 2024",
    whyMcp: "MCP auto-maps payment status ENUMs and NUMERIC decimals without type casting errors.",
    badge: "Daily Finance",
  },
  {
    icon: ShoppingBag,
    category: "Operations & Inventory",
    title: "Low Stock Alerting",
    prompt: "Show all available products in 'Electronics' with stock below 15 ordered by unit price ASC",
    whyMcp: "Ensures is_available = TRUE boolean filter is never omitted.",
    badge: "Inventory Ops",
  },
  {
    icon: Users,
    category: "Growth & Retention",
    title: "Customer Cohort Insights",
    prompt: "List users registered in the last 60 days who haven't placed an order yet",
    whyMcp: "Generates clean LEFT JOIN with user_id IS NULL logic instantly.",
    badge: "Product Analytics",
  },
  {
    icon: Activity,
    category: "Data Integrity & Monitoring",
    title: "Stuck Transaction Alerts",
    prompt: "Find all orders in 'pending' status created over 48 hours ago with customer contact info",
    whyMcp: "Calculates precise TIMESTAMPTZ interval comparisons (NOW() - INTERVAL '48 hours').",
    badge: "Engineering Ops",
  },
]

export default function DailyUseCases() {
  return (
    <section className="border-b border-border bg-background px-4 py-20 sm:px-6 lg:px-8 lg:py-24" id="use-cases">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5 text-[#3aa363]" />
            <span>Everyday Production Workflows</span>
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            Built for everyday team queries.
          </h2>

          <p className="text-base text-[#5c6e63] leading-relaxed">
            From quick sanity checks to complex multi-table aggregations, here is how engineers, analysts, and PMs use the engine daily.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((uc, idx) => (
            <Card
              key={idx}
              className="flex flex-col justify-between p-6 hover-lift hover:border-[#71c897] hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
                    <uc.icon className="size-5" />
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                    {uc.badge}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-[#17241c]">
                  {uc.title}
                </h3>

                <div className="rounded-xl border border-border bg-[#f8fbf8] p-3 text-xs font-mono text-[#253f2f] leading-relaxed shadow-3xs">
                  "{uc.prompt}"
                </div>

                <p className="text-xs text-[#63756a] leading-relaxed">
                  <strong className="text-[#206642] font-semibold">Engine advantage:</strong> {uc.whyMcp}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-border">
                <Link
                  href="/Dashboard/chat"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#206642] hover:text-[#13492c] transition group"
                >
                  <span>Try in Chat</span>
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
