"use client"

import React from "react"
import { AuthProvider } from "@/lib/authContext"

export default function AuthProviderWrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
