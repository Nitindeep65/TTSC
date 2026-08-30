import { NextResponse } from "next/server"
import { executeServerlessDashboard } from "@/lib/serverLlm"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.user_prompt || !body.user_prompt.trim()) {
      return NextResponse.json(
        { status: "error", message: "Dashboard prompt is required." },
        { status: 400 }
      )
    }

    // 1. If backend microservice is configured and reachable, proxy with 6s timeout
    const proxyData = await proxyToBackendIfAvailable("/api/dashboard/generate", "POST", body)
    if (proxyData) {
      return NextResponse.json(proxyData)
    }

    // 2. Serverless multi-agent synthesis with Llama 3.1 70B & sandbox execution
    const canvas = await executeServerlessDashboard({
      user_prompt: body.user_prompt.trim(),
      live_schema: body.live_schema || null,
      connection_uri: body.connection_uri || null,
    })

    return NextResponse.json(canvas)
  } catch (error) {
    console.error("Dashboard generate route error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to generate dashboard canvas.",
        widgets: [],
      },
      { status: 500 }
    )
  }
}
