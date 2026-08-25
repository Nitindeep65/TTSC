import { NextResponse } from "next/server"

const DEFAULT_METRICS = [
  {
    id: "active_churn",
    name: "Active Churn Rate",
    definition: "Percentage of users who canceled without renewal in the last 30 days",
    sql_formula: "COUNT(CASE WHEN status = 'churned' THEN 1 END) * 100.0 / COUNT(*)",
    category: "revenue",
    tags: ["churn", "retention"],
  },
  {
    id: "net_mrr",
    name: "Net MRR",
    definition: "Monthly Recurring Revenue minus churned and downgraded accounts",
    sql_formula: "SUM(CASE WHEN status = 'active' THEN mrr_amount ELSE 0 END)",
    category: "finance",
    tags: ["revenue", "mrr", "finance"],
  },
]

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
    if (backendUrl && !backendUrl.includes("127.0.0.1") && !backendUrl.includes("localhost")) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/semantic/metrics`)
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch (e) {
        // fallback
      }
    }
    return NextResponse.json(DEFAULT_METRICS)
  } catch {
    return NextResponse.json(DEFAULT_METRICS)
  }
}
