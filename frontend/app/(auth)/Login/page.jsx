"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Database, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/authContext"

export default function LoginPage() {
  const router = useRouter()
  const { loginWithEmail, loginWithGoogle, loginWithGithub } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // "google" | "github"

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

  const handleGithubSignIn = async () => {
    setError("")
    setSocialLoading("github")
    try {
      await loginWithGithub()
      router.push("/Dashboard")
    } catch (err) {
      setError(err.message || "GitHub sign-in failed.")
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-[#070e0a] text-white">
      {/* Top Right Navigation */}
      <Link
        href="/Register"
        className="inline-flex items-center justify-center rounded-lg text-xs font-semibold transition-colors hover:bg-[#132219] h-8 px-3.5 absolute top-4 right-4 md:top-8 md:right-8 z-20 text-[#d4e5db] border border-[#223829] bg-[#0c1611]/80 backdrop-blur-xs"
      >
        Sign Up
      </Link>

      {/* ── Left Column: Card Visual Showcase ── */}
      <div className="relative hidden h-full min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070e0a] p-6 lg:p-10 border-r border-[#1a2b20] lg:flex">
        {/* Ambient subtle glow matching Card.png palette */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-[#1b432a]/20 blur-3xl" />

        {/* Card.png Graphic filling the container */}
        <div className="relative z-10 flex w-full max-w-[540px] items-center justify-center">
          <img
            src="/pics/Card.png"
            alt="QueryCraft — Craft Better Queries, Get Smarter Results"
            className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl ring-1 ring-emerald-500/20"
          />
        </div>
      </div>

      {/* ── Right Column: Unified Auth Form ── */}
      <div className="lg:p-8 flex items-center justify-center min-h-screen lg:min-h-0 bg-[#0a130e]">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[360px] p-6 sm:p-0">
          
          <div className="flex flex-col space-y-2 text-center items-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#112419] text-emerald-400 border border-emerald-500/30 shadow-xs mb-1">
              <Database className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sign in to QueryCraft
            </h1>
            <p className="text-xs text-[#759080]">
              Enter your email below to access your cloud databases
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs font-medium text-red-300 bg-red-950/50 border border-red-800/80 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-2.5">
                <div className="grid gap-1">
                  <label className="sr-only" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={formData.email}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-lg border border-[#23382a] bg-[#0e1c15] px-3 py-1 text-xs text-white placeholder:text-[#6a8274] outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    placeholder="Password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-lg border border-[#23382a] bg-[#0e1c15] px-3 py-1 text-xs text-white placeholder:text-[#6a8274] outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs h-9 px-4 py-2 cursor-pointer mt-1"
                >
                  {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                  Sign In with Email
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1d3124]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-[#0a130e] px-2 text-[#6d8476]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Google Button */}
              <button
                type="button"
                disabled={isLoading || Boolean(socialLoading)}
                onClick={handleGoogleSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors border border-[#23382a] bg-[#0e1c15] text-[#d4e5db] hover:bg-[#15281e] h-9 px-3 cursor-pointer"
              >
                {socialLoading === "google" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <svg className="size-3.5" viewBox="0 0 24 24">
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
                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                disabled={isLoading || Boolean(socialLoading)}
                onClick={handleGithubSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors border border-[#23382a] bg-[#0e1c15] text-[#d4e5db] hover:bg-[#15281e] h-9 px-3 cursor-pointer"
              >
                {socialLoading === "github" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 438.549 438.549" className="size-3.5 fill-current text-white">
                    <path d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z" />
                  </svg>
                )}
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <p className="px-8 text-center text-[11px] text-[#6d8476]">
            By continuing, you agree to our{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>

        </div>
      </div>
    </div>
  )
}
