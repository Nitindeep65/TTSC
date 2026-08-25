'use client'

import React, { useState } from "react"
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
  Database,
  Cpu,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const useCases = [
  {
    icon: DollarSign,
    category: "Financial Analytics (PostgreSQL)",
    title: "Revenue & Refund Audits",
    prompt: "Calculate total revenue and refunded amounts grouped by payment method in Q3 2024",
    sqlPreview: `SELECT payment_method,
  SUM(CASE WHEN status='succeeded' THEN amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN status='refunded' THEN amount ELSE 0 END) AS refunds
FROM payments
WHERE created_at BETWEEN '2024-07-01' AND '2024-09-30'
GROUP BY payment_method
LIMIT 50;`,
    engineAdvantage: "Auto-maps payment status ENUMs and NUMERIC decimals without type casting errors in PostgreSQL.",
    badge: "PostgreSQL",
    dialect: "SQL",
    tags: ["Relational SQL"],
  },
  {
    icon: ShoppingBag,
    category: "Document Store (MongoDB MQL)",
    title: "Nested Order Item Aggregations",
    prompt: "Calculate total units sold and revenue per category from nested order items in MongoDB",
    sqlPreview: `db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  { $group: {
      _id: "$items.category",
      total_units: { $sum: "$items.quantity" },
      revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } }
  }},
  { $sort: { revenue: -1 } },
  { $limit: 50 }
]);`,
    engineAdvantage: "Handles nested BSON document arrays, $unwind stages, and $multiply math flawlessly.",
    badge: "MongoDB",
    dialect: "MQL",
    tags: ["NoSQL & Document"],
  },
  {
    icon: Cpu,
    category: "In-Memory Cache (Redis)",
    title: "Active Session & Key-Value Inspection",
    prompt: "Find all user session keys created in the last hour with active TTLs",
    sqlPreview: `# Read-only Redis session key inspection:
SCAN 0 MATCH session:user:* COUNT 50
# Returns matching active session tokens and expiration TTLs`,
    engineAdvantage: "Generates non-blocking SCAN and GET commands without endangering production Redis clusters.",
    badge: "Redis",
    dialect: "Key-Value",
    tags: ["Cache & Key-Value"],
  },
  {
    icon: Users,
    category: "Growth & Retention (MySQL / Postgres)",
    title: "Customer Cohort Churn Insights",
    prompt: "List users registered in the last 60 days who haven't placed an order yet",
    sqlPreview: `SELECT u.id, u.email, u.name, u.created_at
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= NOW() - INTERVAL '60 days'
  AND o.id IS NULL
LIMIT 50;`,
    engineAdvantage: "Generates clean LEFT JOIN with user_id IS NULL pattern for non-buyers cohort.",
    badge: "MySQL / Postgres",
    dialect: "SQL",
    tags: ["Relational SQL"],
  },
  {
    icon: Activity,
    category: "NoSQL Cloud (DynamoDB / Mongo)",
    title: "Real-time Telemetry & Error Spikes",
    prompt: "Find all error logs with severity 'CRITICAL' in the last 24 hours grouped by service",
    sqlPreview: `db.application_logs.aggregate([
  { $match: {
      severity: "CRITICAL",
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }},
  { $group: { _id: "$service_name", error_count: { $sum: 1 } } },
  { $sort: { error_count: -1 } }
]);`,
    engineAdvantage: "Computes dynamic Date math and groups polymorphic log schemas safely.",
    badge: "DocumentDB",
    dialect: "MQL",
    tags: ["NoSQL & Document"],
  },
  {
    icon: Layers,
    category: "Operations & Inventory (Supabase)",
    title: "Low Stock & Reorder Alerts",
    prompt: "Show all available products in 'Electronics' with stock below 15 ordered by unit price ASC",
    sqlPreview: `SELECT id, name, price, stock_quantity
FROM products
WHERE category = 'Electronics'
  AND is_available = TRUE
  AND stock_quantity < 15
ORDER BY price ASC
LIMIT 50;`,
    engineAdvantage: "Ensures boolean flags and index constraints are fully respected.",
    badge: "Supabase",
    dialect: "SQL",
    tags: ["Relational SQL"],
  },
]

const filterTabs = ["All", "Relational SQL", "NoSQL & Document", "Cache & Key-Value"]

export default function DailyUseCases() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [expandedIdx, setExpandedIdx] = useState(null)

  const filtered = activeFilter === "All"
    ? useCases
    : useCases.filter((uc) => uc.tags.includes(activeFilter))

  return (
    <section className="border-b border-border bg-background px-4 py-20 sm:px-6 lg:px-8 lg:py-24" id="use-cases">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-10">
          <Badge variant="emerald" className="gap-2 px-3.5 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5 text-[#3aa363]" />
            <span>Everyday Production Workflows (SQL &amp; NoSQL)</span>
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-[#17241c] sm:text-4xl">
            Built for everyday queries across any database.
          </h2>

          <p className="text-base text-[#5c6e63] leading-relaxed">
            From relational SQL joins to complex MongoDB aggregation pipelines and Redis lookups — here is how teams query with confidence daily.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeFilter === tab
                  ? "border-[#3aa363] bg-[#1f2d24] text-white shadow-sm"
                  : "border-border bg-white text-[#485b50] hover:border-[#71c897] hover:bg-[#f2fbf5]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Use Cases Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {filtered.map((uc, idx) => (
            <div
              key={uc.title}
              className="group flex flex-col justify-between rounded-2xl border border-[#e0e8e2] bg-white p-6 hover-lift hover:border-[#71c897] hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs group-hover:scale-105 transition-transform duration-200">
                    <uc.icon className="size-5" />
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                    {uc.badge}
                  </Badge>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#7d9084] mb-0.5">{uc.category}</p>
                  <h3 className="text-sm font-semibold text-[#17241c]">{uc.title}</h3>
                </div>

                {/* Prompt display */}
                <div className="rounded-xl border border-border bg-[#f8fbf8] p-3 text-xs font-mono text-[#253f2f] leading-relaxed shadow-3xs">
                  &ldquo;{uc.prompt}&rdquo;
                </div>

                {/* Engine advantage */}
                <p className="text-xs text-[#63756a] leading-relaxed">
                  <strong className="text-[#206642] font-semibold">Engine advantage:</strong> {uc.engineAdvantage}
                </p>

                {/* SQL/MQL Preview toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#206642] hover:text-[#13492c] transition"
                >
                  <span>{expandedIdx === idx ? "Hide Code" : `Preview ${uc.dialect}`}</span>
                  <ArrowRight className={`size-3.5 transition-transform duration-200 ${expandedIdx === idx ? "rotate-90" : ""}`} />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedIdx === idx ? "max-h-60" : "max-h-0"
                  }`}
                >
                  <div className="rounded-xl border border-[#243529] bg-[#141f18] overflow-hidden">
                    <div className="border-b border-white/10 bg-[#0f1712] px-3 py-1.5 font-mono text-[10px] text-[#71c897]/60 flex items-center justify-between">
                      <span>Compiled {uc.dialect}</span>
                      <span className="rounded bg-[#1f3a28] px-1.5 py-0.5 text-[9px] text-[#71c897] font-bold">READ-ONLY</span>
                    </div>
                    <pre className="p-3 font-mono text-[10.5px] leading-relaxed text-[#c4e6d2] overflow-x-auto whitespace-pre-wrap">
                      <code>{uc.sqlPreview}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border">
                <Link
                  href="/Dashboard/chat"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#206642] hover:text-[#13492c] transition group/link"
                >
                  <span>Try in Studio</span>
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
