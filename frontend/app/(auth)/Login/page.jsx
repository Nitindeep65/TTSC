"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Database, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Terminal 
} from "lucide-react"
import { useAuth } from "@/lib/authContext"

export default function LoginPage() {
  const router = useRouter()
  const { loginWithEmail, loginWithGoogle } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // "google"

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
      await loginWithEmail(formData.email, formData.password)
      router.push("/Dashboard")
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setSocialLoading("google")
    try {
      await loginWithGoogle()
      router.push("/Dashboard")
    } catch (err) {
      setError(err.message || "Google sign-in failed.")
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-[#05080c] text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      
      {/* ── TOP FLOATING NAVIGATION BAR ── */}
      <nav className="absolute top-4 inset-x-0 z-30 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
        {/* Left: Home Button */}
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0b121c]/90 hover:bg-[#121c2c] border border-slate-800 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="size-3.5 text-teal-400" />
          <span>Home</span>
        </Link>

        {/* Right: Docs & Sign Up Switcher */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <Link
            href="/docs/cli"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0b121c]/90 hover:bg-[#121c2c] border border-slate-800 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <Terminal className="size-3.5 text-teal-400" />
            <span>Docs</span>
          </Link>

          <Link
            href="/Register"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Sign Up</span>
          </Link>
        </div>
      </nav>

      {/* ── LEFT COLUMN: VISUAL BRAND SHOWCASE ── */}
      <div className="relative hidden h-full min-h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-[#060b11] via-[#081018] to-[#04070a] p-8 lg:p-12 border-r border-slate-800/80 lg:flex">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-96 rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* Top Branding Pill */}
        <div className="relative z-10 w-full flex items-center justify-between pt-10">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-teal-500/25 to-emerald-500/25 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-xs">
              <Database className="size-4.5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">QueryCraft</span>
              <span className="block text-[10.5px] font-mono text-teal-400">PostgreSQL Safety Engine</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10.5px] font-mono font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>PG 14–17 Ready</span>
          </div>
        </div>

        {/* Card Graphic */}
        <div className="relative z-10 flex w-full max-w-[500px] items-center justify-center my-auto py-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-[#090f19]/80 p-1.5 backdrop-blur-xl group">
            <img
              src="/pics/Card.png"
              alt="QueryCraft Studio Preview"
              className="w-full h-auto max-h-[60vh] object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 w-full max-w-[500px] grid grid-cols-3 gap-2.5 pb-2">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-0.5">
            <ShieldCheck className="size-4 text-teal-400 mx-auto" />
            <span className="block font-mono text-[10px] font-bold text-slate-200">Cost Guard</span>
            <span className="block text-[9.5px] text-slate-400">EXPLAIN Dry-Run</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-0.5">
            <Sparkles className="size-4 text-emerald-400 mx-auto" />
            <span className="block font-mono text-[10px] font-bold text-slate-200">SQL Doctor</span>
            <span className="block text-[9.5px] text-slate-400">Auto-Heal 14ms</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-0.5">
            <Database className="size-4 text-teal-400 mx-auto" />
            <span className="block font-mono text-[10px] font-bold text-slate-200">Zero Hallucination</span>
            <span className="block text-[9.5px] text-slate-400">Live Catalog DDL</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: AUTHENTICATION FORM ── */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-20 lg:p-12 bg-[#05080c]">
        
        {/* Subtle radial ambient glow on mobile */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-teal-500/5 blur-[90px] lg:hidden" />

        <div className="relative z-10 w-full max-w-[380px] space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30 shadow-xs mb-2">
              <Database className="size-5.5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sign in to QueryCraft
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Access your database workspaces, Pre-Flight Cost Guard, and safe SQL compiler
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 text-xs font-medium text-rose-200 bg-rose-950/60 border border-rose-800/80 rounded-xl animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="size-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  placeholder="alex@company.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-800 bg-[#090e16] text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="size-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-slate-800 bg-[#090e16] text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] text-white shadow-lg shadow-teal-900/30 cursor-pointer disabled:opacity-50 pt-0.5"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>Sign In with Email</span>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10.5px] uppercase font-mono font-bold tracking-wider">
              <span className="bg-[#05080c] px-3 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Social Button */}
          <button
            type="button"
            disabled={isLoading || Boolean(socialLoading)}
            onClick={handleGoogleSignIn}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl text-xs font-semibold transition-all border border-slate-800 bg-[#090e16] text-slate-200 hover:bg-slate-800/80 hover:border-slate-700 h-10 px-4 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {socialLoading === "google" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Switch to Register */}
          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/Register" className="text-teal-400 hover:text-teal-300 font-bold underline underline-offset-4">
              Sign up free
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-[10.5px] text-slate-500 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/" className="text-slate-400 hover:text-slate-200 underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/" className="text-slate-400 hover:text-slate-200 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>

        </div>
      </div>
    </div>
  )
}
