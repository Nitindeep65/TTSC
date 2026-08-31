import { NextResponse } from "next/server"

// In-memory / serverless authorization code map
const oauthCodes = new Map()

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, redirect_uri, client_id, state } = body

    if (!email) {
      return NextResponse.json({ detail: "Email is required" }, { status: 400 })
    }

    const code = "qc_code_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
    oauthCodes.set(code, {
      email,
      redirect_uri,
      client_id,
      state,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })

    return NextResponse.json({
      status: "success",
      code,
      state,
      redirect_uri,
    })
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 })
  }
}
