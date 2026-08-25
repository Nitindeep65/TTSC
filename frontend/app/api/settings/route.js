import { NextResponse } from "next/server"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

const DEFAULT_SETTINGS = {
  account: { displayName: "QueryCraft User", email: "demo@querycraft.dev", plan: "free" },
  preferences: { theme: "dark", fontSize: "12", compactOnStart: false, autoFocus: true },
  shortcuts: {},
  apiBase: "https://ttsc-jet.vercel.app",
  usage: { queries: 0, heals: 0, verified: 0 },
}

export async function GET(request) {
  try {
    const proxyData = await proxyToBackendIfAvailable("/api/settings", "GET")
    if (proxyData) {
      return NextResponse.json(proxyData)
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
