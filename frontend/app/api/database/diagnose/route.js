import { NextResponse } from "next/server"
import { executeLlmDiagnosis } from "@/lib/serverLlm"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

export async function POST(request) {
  try {
    const body = await request.json()

    const proxyData = await proxyToBackendIfAvailable("/api/database/diagnose", "POST", body)
    if (proxyData) {
      return NextResponse.json(proxyData)
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
