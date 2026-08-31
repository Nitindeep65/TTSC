import { NextResponse } from "next/server"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const authHeader = req.headers.get("authorization") || ""
  const emailParam = searchParams.get("email") || ""

  let email = "nitindeep65@gmail.com"
  if (emailParam) {
    email = emailParam
  }

  const workspaces = [
    {
      name: "Production",
      engine: "postgres",
      environment: "Production",
      is_active: true,
      has_connection: true,
    },
    {
      name: "Staging",
      engine: "postgres",
      environment: "Staging",
      is_active: false,
      has_connection: true,
    },
    {
      name: "Analytics",
      engine: "mongodb",
      environment: "Analytics",
      is_active: false,
      has_connection: false,
    },
  ]

  return NextResponse.json({
    status: "authenticated",
    email: email,
    active_workspace: "Production",
    workspaces_count: workspaces.length,
    workspaces: workspaces,
    session_type: "OAuth 2.0 / User-Scoped",
    message: `You are authenticated as ${email} with active workspace 'Production'.`,
  })
}
