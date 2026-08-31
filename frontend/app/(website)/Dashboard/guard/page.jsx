"use client"

import React from "react"
import CostGuardDashboard from "@/components/guard/CostGuardDashboard"

export default function GuardPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <CostGuardDashboard />
    </div>
  )
}
