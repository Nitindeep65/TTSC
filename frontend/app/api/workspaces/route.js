import { NextResponse } from "next/server"
import axios from "axios"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email") || searchParams.get("user_id") || "default_user"

  // 1. Try forwarding to Python FastAPI backend if online
  try {
    const res = await axios.get(`${BACKEND_URL}/api/workspaces/?email=${encodeURIComponent(email)}`, {
      timeout: 3000,
    })
    if (res.data && res.data.workspaces) {
      return NextResponse.json(res.data)
    }
  } catch (err) {
    // Fall back to serverless default workspaces
  }

  // 2. Serverless fallback workspaces
  const defaultWorkspaces = [
    {
      id: "prod-pg-1",
      name: "Production",
      engine: "postgres",
      environment: "Production",
      is_active: true,
      has_connection: true,
      createdAt: "2026-08-30T00:00:00.000Z",
    },
    {
      id: "staging-pg-1",
      name: "Staging",
      engine: "postgres",
      environment: "Staging",
      is_active: false,
      has_connection: true,
      createdAt: "2026-08-30T00:00:00.000Z",
    },
    {
      id: "analytics-mongo-1",
      name: "Analytics",
      engine: "mongodb",
      environment: "Analytics",
      is_active: false,
      has_connection: false,
      createdAt: "2026-08-30T00:00:00.000Z",
    },
  ]

  return NextResponse.json({
    status: "success",
    count: defaultWorkspaces.length,
    workspaces: defaultWorkspaces,
    user: email,
  })
}
