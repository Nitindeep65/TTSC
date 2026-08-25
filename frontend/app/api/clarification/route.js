import { NextResponse } from "next/server"
import { executeLlmClarification } from "@/lib/serverLlm"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

export async function POST(request) {
  try {
    const body = await request.json()

    // 1. If an external backend microservice is configured and reachable, proxy with 6s timeout
    const proxyData = await proxyToBackendIfAvailable("/api/clarification", "POST", body)
    if (proxyData) {
      return NextResponse.json(proxyData)
    }

    // Serverless Llama 3.1 70B AI Compilation & Clarification
    const result = await executeLlmClarification({
      user_prompt: body.user_prompt || "",
      session_history: body.session_history || [],
      live_schema: body.live_schema || null,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Clarification route error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to process query.",
        extracted_data: null,
      },
      { status: 500 }
    )
  }
}
