import { NextResponse } from "next/server"
import { getDashboardStarterTemplates } from "@/lib/serverLlm"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

export async function GET() {
  try {
    const proxyData = await proxyToBackendIfAvailable("/api/dashboard/templates", "GET")
    if (proxyData) {
      return NextResponse.json(proxyData)
    }

    const templates = getDashboardStarterTemplates()
    return NextResponse.json({
      status: "success",
      templates,
    })
  } catch (error) {
    return NextResponse.json({
      status: "success",
      templates: getDashboardStarterTemplates(),
    })
  }
}
