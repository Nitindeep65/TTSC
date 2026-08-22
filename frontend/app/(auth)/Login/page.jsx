"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Database, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      window.location.href = "/Dashboard"
    } catch (err) {
      setError("Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-[#f7f8f5] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#dfe7df] bg-white p-8 shadow-sm sm:p-10">
        
        <div className="text-center">
          <Link href="/" className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#1f2d24] text-[#71c897] shadow-xs">
            <Sparkles className="size-6" />
          </Link>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f2d24]">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-[#6c7c72]">
            Sign in to access your PostgreSQL query workspace
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#324538]">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-xl border border-[#dce5dd] bg-[#fbfdfb] px-3.5 py-2.5 pl-10 text-sm text-[#1f2d24] outline-none transition placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
                placeholder="name@company.com"
              />
              <Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-[#8a9b90]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-[#324538]">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-[#2b724c] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-xl border border-[#dce5dd] bg-[#fbfdfb] px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#1f2d24] outline-none transition placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
                placeholder="••••••••"
              />
              <Lock className="pointer-events-none absolute left-3.5 top-3 size-4 text-[#8a9b90]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8a9b90] hover:text-[#1f2d24]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#58695e]">
              <input
                type="checkbox"
                className="size-4 rounded border-[#ccd8ce] text-[#246944] focus:ring-[#4ca873]"
              />
              Remember my session
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f2d24] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314f3b] disabled:opacity-60"
          >
            {isLoading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Sign In to Workspace
                <ArrowRight className="size-4 text-[#71c897]" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#6e7f74]">
          Don&apos;t have an account?{" "}
          <Link href="/Register" className="font-semibold text-[#246944] hover:underline">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  )
}
