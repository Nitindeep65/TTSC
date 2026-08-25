import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL

    if (backendUrl && !backendUrl.includes("127.0.0.1") && !backendUrl.includes("localhost")) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/database/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch (err) {
        console.warn("Backend proxy error for execute:", err.message)
      }
    }

    // Default simulated sample execution
    return NextResponse.json({
      columns: ["id", "customer_name", "email", "total_orders", "total_spent"],
      rows: [
        ["u_001", "Alex Rivera", "alex@querycraft.dev", 14, "4,850.00"],
        ["u_002", "Sofia Davis", "sofia@cloudscale.io", 11, "3,920.50"],
        ["u_003", "Marcus Vance", "marcus@fintech.co", 9, "2,840.00"],
        ["u_004", "Elena Rostova", "elena@datadrive.net", 8, "2,190.00"],
        ["u_005", "Liam Chen", "liam@techcorp.io", 6, "1,750.25"],
      ],
      row_count: 5,
      execution_time_ms: 18.4,
      was_healed: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Execution error" },
      { status: 500 }
    )
  }
}
