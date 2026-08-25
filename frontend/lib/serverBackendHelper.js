/**
 * Helper for safe proxying to external microservices (FastAPI / LangGraph)
 * without self-referential loops or infinite timeouts.
 */

export function getValidExternalBackendUrl() {
  const url = process.env.BACKEND_URL
  if (!url) return null
  const u = url.trim().toLowerCase()
  // Block localhost, 127.0.0.1, and self-referential vercel URLs from serverless functions
  if (
    u.includes("vercel.app") ||
    u.includes("localhost") ||
    u.includes("127.0.0.1") ||
    u === ""
  ) {
    return null
  }
  return url.replace(/\/$/, "")
}

export async function proxyToBackendIfAvailable(endpoint, method = "POST", body = null) {
  const backendUrl = getValidExternalBackendUrl()
  if (!backendUrl) return null

  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(6000),
    }
    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body)
    }
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    const res = await fetch(`${backendUrl}${cleanEndpoint}`, options)
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn(`External backend proxy failed for ${endpoint}:`, err.message)
  }
  return null
}
