/**
 * Dashboard Canvas page — MVP DISABLED
 *
 * The Autonomous Dashboard Architect (Canvas mode) is out of MVP scope.
 * This page redirects to the SQL Compiler (/Dashboard) to avoid 404 errors
 * from any cached or bookmarked links.
 *
 * To restore: re-enable dashboard.router in backend/app/main.py,
 * restore dashboardApi in frontend/lib/api.js, and restore nav link in layout.jsx.
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CanvasRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/Dashboard")
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center p-8">
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-2xl">
        🔄
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Redirecting to SQL Compiler…</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The Dashboard Canvas is not available in the current MVP version.
        </p>
      </div>
    </div>
  )
}
