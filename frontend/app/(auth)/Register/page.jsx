"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react"

import { useRouter } from "next/navigation"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
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

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      router.push("/Dashboard")
    } catch {
      setError("Could not complete registration. Please try again.")
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
            Create an Account
          </h2>
          <p className="mt-1 text-sm text-[#6c7c72]">
            Start querying your database with natural language
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-[#324538]">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-xl border border-[#dce5dd] bg-[#fbfdfb] px-3.5 py-2.5 pl-10 text-sm text-[#1f2d24] outline-none transition placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
                placeholder="Alex Morgan"
              />
              <User className="pointer-events-none absolute left-3.5 top-3 size-4 text-[#8a9b90]" />
            </div>
          </div>

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
            <label htmlFor="password" className="block text-xs font-semibold text-[#324538]">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-xl border border-[#dce5dd] bg-[#fbfdfb] px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#1f2d24] outline-none transition placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
                placeholder="Minimum 8 characters"
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

          <div className="flex items-center gap-2 pt-1 text-xs text-[#58695e]">
            <input
              type="checkbox"
              required
              id="terms"
              className="size-4 rounded border-[#ccd8ce] text-[#246944] focus:ring-[#4ca873]"
            />
            <label htmlFor="terms">
              I agree to the Terms of Service and Privacy Policy
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
                Create Account
                <ArrowRight className="size-4 text-[#71c897]" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#6e7f74]">
          Already have an account?{" "}
          <Link href="/Login" className="font-semibold text-[#246944] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
