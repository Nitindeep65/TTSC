import { NextResponse } from "next/server"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

const DEFAULT_METRICS = [
  {
    id: "active_churn",
    name: "Active Churn",
    definition: "Accounts cancelled within the last 30 days divided by active accounts",
    sql_formula: "COUNT(CASE WHEN status = 'cancelled' AND updated_at >= NOW() - INTERVAL '30 days' THEN 1 END)::FLOAT / NULLIF(COUNT(CASE WHEN status = 'active' THEN 1 END), 0)",
    category: "customer_success",
    tags: ["churn", "retention", "kpi"],
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
    const proxyData = await proxyToBackendIfAvailable("/api/semantic/metrics", "GET")
    if (proxyData) {
      return NextResponse.json(proxyData)
    }
    return NextResponse.json(DEFAULT_METRICS)
  } catch {
    return NextResponse.json(DEFAULT_METRICS)
  }
}
