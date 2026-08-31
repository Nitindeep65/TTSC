"use client"

import React, { useState } from "react"
import { AuthProvider } from "@/lib/authContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export default function AuthProviderWrapper({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
