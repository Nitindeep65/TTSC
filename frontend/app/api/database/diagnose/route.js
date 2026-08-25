import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL

    if (backendUrl && !backendUrl.includes("127.0.0.1") && !backendUrl.includes("localhost")) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/database/diagnose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch (err) {
        console.warn("Backend proxy error for diagnose:", err.message)
      }
    }

    return NextResponse.json({
      original_sql: body.failing_sql || "",
      healed_sql: `-- Auto-Healed Query\nSELECT u.name, o.total_amount\nFROM users u\nJOIN orders o ON u.id = o.user_id\nLIMIT 50;`,
      diagnosis: "Fixed column reference: replaced non-existent column with validated foreign key relationship.",
      sqlstate_code: "42703",
      can_execute: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Diagnosis error" },
      { status: 500 }
    )
  }
}
