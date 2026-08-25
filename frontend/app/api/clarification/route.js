import { NextResponse } from "next/server"
import { executeLlmClarification } from "@/lib/serverLlm"

export async function POST(request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL

    // If a deployed cloud backend is configured and reachable, proxy to it
    if (backendUrl && !backendUrl.includes("127.0.0.1") && !backendUrl.includes("localhost")) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/clarification/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch (proxyErr) {
        console.warn("Backend proxy error, falling back to serverless LLM engine:", proxyErr.message)
      }
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
