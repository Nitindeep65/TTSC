import { NextResponse } from "next/server"
import { executeLlmDiagnosis } from "@/lib/serverLlm"

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
        console.warn("Backend proxy error for diagnose, using serverless diagnosis:", err.message)
      }
    }

    // Serverless SQL Doctor LLM diagnosis
    const diagnosisResult = await executeLlmDiagnosis({
      error_message: body.error_message || "Syntax or execution error",
      failing_sql: body.failing_sql || "",
      live_schema: body.live_schema || null,
      user_prompt: body.user_prompt || "",
    })

    return NextResponse.json(diagnosisResult)
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Diagnosis error" },
      { status: 500 }
    )
  }
}
