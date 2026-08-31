'use client'

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  Layers,
  LineChart,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  User,
  Zap,
} from "lucide-react"

const PERSONAS = [
  {
    id: "analyst",
    icon: BarChart3,
    label: "Data Analyst",
    tagline: "Answer business questions instantly without writing SQL",
    color: "bg-blue-600",
    lightColor: "bg-blue-50 border-blue-200 text-blue-800",
    examples: [
      {
        prompt: "What's our month-over-month revenue growth for the last 6 months?",
        dialect: "PostgreSQL",
        query: `SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS month,
  SUM(total_amount)              AS revenue,
  LAG(SUM(total_amount)) OVER (
    ORDER BY TO_CHAR(created_at, 'YYYY-MM')
  )                              AS prev_revenue
FROM orders
WHERE status = 'completed'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 6;`,
        result: [
          { col: "2024-08", val: "$94,200", trend: "↗ +18%" },
          { col: "2024-07", val: "$79,800", trend: "↗ +12%" },
          { col: "2024-06", val: "$71,200", trend: "↗ +9%" },
        ],
      },
      {
        prompt: "Top 5 product categories by total units sold this quarter",
        dialect: "MongoDB MQL",
        query: `db.orders.aggregate([
  { $match: {
    status: "completed",
    created_at: { $gte: ISODate("2024-07-01") }
  }},
  { $unwind: "$items" },
  { $group: {
    _id: "$items.category",
    units: { $sum: "$items.qty" }
  }},
  { $sort: { units: -1 } },
  { $limit: 5 }
]);`,
        result: [
          { col: "Enterprise SaaS", val: "4,820 units", trend: "#1" },
          { col: "Hardware Kits", val: "3,240 units", trend: "#2" },
          { col: "Cloud Licenses", val: "2,180 units", trend: "#3" },
        ],
      },
    ],
  },
  {
    id: "engineer",
    icon: Code2,
    label: "Backend Engineer",
    tagline: "Debug slow queries and optimize database performance",
    color: "bg-violet-600",
    lightColor: "bg-violet-50 border-violet-200 text-violet-800",
    examples: [
      {
        prompt: "Show me all queries that are doing full sequential table scans on audit_logs",
        dialect: "PostgreSQL · EXPLAIN",
        query: `EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE)
SELECT COUNT(*) FROM audit_logs
WHERE action = 'data_export';

-- QueryCraft Cost Guard Result:
-- ⚠ Sequential Scan on 500,000 rows
-- Estimated cost: 8,543.00
-- Recommendation:
CREATE INDEX CONCURRENTLY
  idx_audit_logs_action
  ON audit_logs(action);`,
        result: [
          { col: "Seq Scan detected", val: "Cost: 8,543", trend: "⚠ Blocked" },
          { col: "Rows scanned", val: "500,000", trend: "0 indexes used" },
          { col: "Recommendation", val: "CREATE INDEX", trend: "→ Fix ready" },
        ],
      },
      {
        prompt: "Find users who placed orders but never completed them in the last 30 days",
        dialect: "PostgreSQL",
        query: `SELECT u.id, u.email, COUNT(o.id) AS pending
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status != 'completed'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email
HAVING COUNT(o.id) > 0
ORDER BY pending DESC
LIMIT 50;`,
        result: [
          { col: "user@acme.com", val: "7 pending", trend: "High risk" },
          { col: "dev@startup.io", val: "4 pending", trend: "Medium" },
          { col: "admin@corp.com", val: "2 pending", trend: "Low" },
        ],
      },
    ],
  },
  {
    id: "pm",
    icon: TrendingUp,
    label: "Product Manager",
    tagline: "Get metrics answers instantly — no Slack to data team needed",
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    examples: [
      {
        prompt: "How many new users signed up and converted to paid in the last 30 days?",
        dialect: "PostgreSQL",
        query: `SELECT
  COUNT(*) FILTER (
    WHERE created_at >= NOW() - INTERVAL '30 days'
  ) AS new_signups,
  COUNT(*) FILTER (
    WHERE plan_tier != 'free'
    AND created_at >= NOW() - INTERVAL '30 days'
  ) AS paid_conversions
FROM users;`,
        result: [
          { col: "New Signups", val: "1,847", trend: "↗ +23%" },
          { col: "Paid Conversions", val: "312", trend: "16.9% CVR" },
          { col: "Avg. Days to Convert", val: "4.2 days", trend: "↘ -0.8" },
        ],
      },
      {
        prompt: "What's our DAU/MAU ratio as a stickiness indicator?",
        dialect: "PostgreSQL",
        query: `WITH dau AS (
  SELECT COUNT(DISTINCT user_id) AS daily_active
  FROM user_sessions
  WHERE date = CURRENT_DATE
),
mau AS (
  SELECT COUNT(DISTINCT user_id) AS monthly_active
  FROM user_sessions
  WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
)
SELECT
  dau.daily_active,
  mau.monthly_active,
  ROUND(dau.daily_active::NUMERIC
    / mau.monthly_active * 100, 1) AS stickiness_pct
FROM dau, mau;`,
        result: [
          { col: "DAU", val: "2,840", trend: "↗ +8%" },
          { col: "MAU", val: "18,200", trend: "↗ +15%" },
          { col: "Stickiness", val: "15.6%", trend: "Above avg" },
        ],
      },
    ],
  },
]

export default function DailyUseCases() {
  const [activePersona, setActivePersona] = useState("analyst")
  const [activeExample, setActiveExample] = useState(0)

  const persona = PERSONAS.find((p) => p.id === activePersona)
  const example = persona.examples[activeExample]

  const handlePersonaSwitch = (id) => {
    setActivePersona(id)
    setActiveExample(0)
  }

  return (
    <section
      className="relative bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24 border-b border-slate-100"
      id="use-cases"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-3 mb-14"
        >
          <p className="section-kicker justify-center">
            <User className="size-3.5" />
            Daily Use Cases
          </p>
          <h2 className="text-[#0f172a]">
            Built for every team{" "}
            <span className="gradient-text">that touches data.</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Whether you're analyzing metrics, debugging slow queries, or just need a quick answer — QueryCraft speaks your language.
          </p>
        </motion.div>

        {/* Persona tab switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePersonaSwitch(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                activePersona === p.id
                  ? `${p.lightColor} shadow-sm`
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <p.icon className="size-4" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Main showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePersona}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="grid gap-8 lg:grid-cols-5"
          >

            {/* Left — Example selector */}
            <div className="lg:col-span-2 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                {persona.tagline}
              </p>
              {persona.examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveExample(i)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    activeExample === i
                      ? "border-slate-300 bg-slate-50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg ${persona.color} text-white text-[10px] font-bold`}>
                      {i + 1}
                    </div>
                    <p className="text-[13px] font-medium text-slate-700 leading-snug">{ex.prompt}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right — Generated query + result */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExample}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="lg:col-span-3 space-y-3"
              >
                {/* User prompt */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0f172a] px-4 py-2.5 text-white font-medium text-sm shadow-sm">
                    {example.prompt}
                  </div>
                </div>

                {/* Generated SQL */}
                <div className="flex items-start gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0f172a] text-emerald-400 shadow-xs mt-1">
                    <Bot className="size-4" />
                  </div>
                  <div className="w-full space-y-2.5">
                    <div className="code-window">
                      <div className="code-window-header">
                        <span className="code-window-dot bg-[#ff5f57]" />
                        <span className="code-window-dot bg-[#febc2e]" />
                        <span className="code-window-dot bg-[#28c840]" />
                        <span className="ml-2 font-mono text-[10px] text-slate-500">{example.dialect}</span>
                        <span className="ml-auto flex items-center gap-1 font-mono text-[9px] font-semibold text-emerald-600 bg-emerald-950/60 border border-emerald-900/40 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="size-2.5" />
                          VERIFIED
                        </span>
                      </div>
                      <pre className="code-window-body text-[11px]">
                        <code>{example.query}</code>
                      </pre>
                    </div>

                    {/* Results */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-3 py-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Live Results
                        </span>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600">
                            Executed safely
                          </span>
                        </div>
                      </div>
                      {example.result.map((row, ri) => (
                        <div
                          key={ri}
                          className={`flex items-center justify-between px-3 py-2 text-[11px] ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                        >
                          <span className="font-mono font-medium text-slate-700">{row.col}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-700 tabular-nums">{row.val}</span>
                            <span className="text-slate-400">{row.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
