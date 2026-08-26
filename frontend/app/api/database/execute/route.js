import { NextResponse } from "next/server"
import { executePostgreSqlQuery, isLocalhostUri } from "@/lib/dbDriver"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"
import { executeLlmDiagnosis } from "@/lib/serverLlm"

function generateSimulatedQueryResults(sqlQuery) {
  const sql = (sqlQuery || "").toLowerCase()

  if (sql.includes("users") && !sql.includes("orders")) {
    return {
      columns: ["id", "name", "email", "role", "is_active", "created_at"],
      rows: [
        { id: "e1a9b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c", name: "Alex Rivera", email: "alex.rivera@enterprise.com", role: "customer", is_active: true, created_at: "2024-01-15T08:30:00Z" },
        { id: "f2b0c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", name: "Sofia Davis", email: "sofia.davis@cloudscale.io", role: "customer", is_active: true, created_at: "2024-02-01T11:45:00Z" },
        { id: "a3c1d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e", name: "Marcus Vance", email: "marcus.vance@fintech.co", role: "admin", is_active: true, created_at: "2024-02-18T14:20:00Z" },
        { id: "b4d2e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f", name: "Elena Rostova", email: "elena.rostova@datadrive.net", role: "customer", is_active: true, created_at: "2024-03-05T09:15:00Z" },
        { id: "c5e3f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a", name: "Liam Chen", email: "liam.chen@techcorp.io", role: "merchant", is_active: true, created_at: "2024-03-22T16:50:00Z" },
      ],
      row_count: 5,
      execution_time_ms: 12.4,
      was_healed: false,
    }
  }

  if (sql.includes("products")) {
    return {
      columns: ["id", "name", "category", "price", "stock_quantity", "is_available"],
      rows: [
        { id: "p1-001", name: "Enterprise AI Gateway", category: "Software", price: 499.00, stock_quantity: 100, is_available: true },
        { id: "p1-002", name: "Cloud Query Accelerator", category: "Infrastructure", price: 299.00, stock_quantity: 45, is_available: true },
        { id: "p1-003", name: "Real-time Stream Engine", category: "Analytics", price: 799.00, stock_quantity: 30, is_available: true },
        { id: "p1-004", name: "Database Firewall Shield", category: "Security", price: 349.00, stock_quantity: 80, is_available: true },
      ],
      row_count: 4,
      execution_time_ms: 14.8,
      was_healed: false,
    }
  }

  if (sql.includes("orders") || sql.includes("total_spent") || sql.includes("total_amount") || sql.includes("sum(")) {
    return {
      columns: ["id", "customer_name", "email", "total_orders", "total_spent"],
      rows: [
        { id: "u_001", customer_name: "Alex Rivera", email: "alex@querycraft.dev", total_orders: 14, total_spent: "$4,850.00" },
        { id: "u_002", customer_name: "Sofia Davis", email: "sofia@cloudscale.io", total_orders: 11, total_spent: "$3,920.50" },
        { id: "u_003", customer_name: "Marcus Vance", email: "marcus@fintech.co", total_orders: 9, total_spent: "$2,840.00" },
        { id: "u_004", customer_name: "Elena Rostova", email: "elena@datadrive.net", total_orders: 8, total_spent: "$2,190.00" },
        { id: "u_005", customer_name: "Liam Chen", email: "liam@techcorp.io", total_orders: 6, total_spent: "$1,750.25" },
      ],
      row_count: 5,
      execution_time_ms: 18.4,
      was_healed: false,
    }
  }

  return {
    columns: ["id", "entity_name", "category", "status", "created_at"],
    rows: [
      { id: "rec_101", entity_name: "Primary Database Cluster", category: "Production", status: "active", created_at: "2024-01-01" },
      { id: "rec_102", entity_name: "Replica Read Node 1", category: "Production", status: "active", created_at: "2024-01-02" },
      { id: "rec_103", entity_name: "Analytics Data Lake", category: "Analytics", status: "active", created_at: "2024-01-03" },
    ],
    row_count: 3,
    execution_time_ms: 15.0,
    was_healed: false,
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const uri = body.connection_uri || ""
    const sql = body.sql_query || ""
    const limit = body.limit || 50

    // 1. Try forwarding to backend if available
    const proxyData = await proxyToBackendIfAvailable("/api/database/execute", "POST", body)
    if (proxyData) {
      return NextResponse.json(proxyData)
    }

    // 2. Check for local database attempted from cloud
    if (isLocalhostUri(uri) && process.env.VERCEL) {
      const msg = "Cannot connect to 'localhost' / '127.0.0.1' from Vercel Cloud deployment. Please connect to a cloud database (Neon, Supabase, AWS RDS, MongoDB Atlas) or run QueryCraft locally with 'npm run dev'."
      return NextResponse.json(
        {
          error: msg,
          detail: msg,
        },
        { status: 400 }
      )
    }

    // 3. Attempt live PostgreSQL execution if a real URI is present
    if (uri && (uri.startsWith("postgres://") || uri.startsWith("postgresql://"))) {
      try {
        const liveResult = await executePostgreSqlQuery(uri, sql, limit)
        return NextResponse.json(liveResult)
      } catch (execErr) {
        console.warn("Live execution error:", execErr.message)

        // In-flight automatic Critic self-healing if auto_heal is enabled (default true)
        const autoHealEnabled = body.auto_heal !== false
        if (autoHealEnabled && !uri.includes("sample") && !uri.includes("demo") && !uri.includes("user:password")) {
          try {
            console.log("Invoking SQL Doctor Critic Healer for failed query...")
            const diagnosis = await executeLlmDiagnosis({
              error_message: execErr.message,
              failing_sql: sql,
              live_schema: body.live_schema || null,
              user_prompt: body.user_prompt || "",
            })

            if (diagnosis.can_execute && diagnosis.healed_sql && diagnosis.healed_sql.trim() !== sql.trim()) {
              console.log("Re-executing healed SQL query:", diagnosis.healed_sql)
              const healedResult = await executePostgreSqlQuery(uri, diagnosis.healed_sql, limit)
              return NextResponse.json({
                ...healedResult,
                was_healed: true,
                healing_info: {
                  original_sql: sql,
                  healed_sql: diagnosis.healed_sql,
                  diagnosis: diagnosis.diagnosis,
                  sqlstate_code: diagnosis.sqlstate_code,
                  error_healed: execErr.message,
                },
              })
            }
          } catch (healErr) {
            console.warn("In-flight self-healing retry failed:", healErr.message)
          }
        }

        // If it's a real connected DB and healing was not possible, return error
        if (!uri.includes("sample") && !uri.includes("demo") && !uri.includes("user:password")) {
          const dbMsg = `Database Execution Error: ${execErr.message}`
          return NextResponse.json(
            {
              error: dbMsg,
              detail: dbMsg,
              failing_sql: sql,
            },
            { status: 400 }
          )
        }
      }
    }

    // 4. Return intelligent simulated results based on the query structure
    const simResult = generateSimulatedQueryResults(sql)
    return NextResponse.json(simResult)
  } catch (error) {
    console.error("Execute route error:", error)
    const errText = error.message || "Execution error"
    return NextResponse.json(
      { error: errText, detail: errText },
      { status: 500 }
    )
  }
}
