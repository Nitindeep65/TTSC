import { NextResponse } from "next/server"

const DEFAULT_SETTINGS = {
  account: { displayName: "QueryCraft User", email: "demo@querycraft.dev", plan: "free" },
  preferences: { theme: "dark", fontSize: "12", compactOnStart: false, autoFocus: true },
  shortcuts: {},
  apiBase: "https://ttsc-jet.vercel.app",
  usage: { queries: 0, heals: 0, verified: 0 },
}

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
    if (backendUrl && !backendUrl.includes("127.0.0.1") && !backendUrl.includes("localhost")) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/settings/`)
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch (e) {
        // fallback below
      }
    }
    return NextResponse.json(DEFAULT_SETTINGS)
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...body })
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}
