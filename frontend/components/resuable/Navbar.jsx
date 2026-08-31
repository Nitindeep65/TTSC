'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Database,
  MessageSquareText,
  Menu,
  Radio,
  Terminal,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/authContext"

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#problem",       label: "Why Generic AI Fails" },
  { href: "#features",      label: "Features" },
  { href: "#use-cases",     label: "Use Cases" },
  {
    href: "#mcp",
    label: "MCP Protocol",
    accent: true,
    icon: Radio,
  },
  {
    href: "/docs/cli",
    label: "CLI Docs",
    accent: true,
    icon: Terminal,
    external: false,
  },
]

export default function Navbar() {
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "navbar-scrolled" : "navbar-top"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className={`flex items-center justify-between py-3.5 transition-all duration-300 ${
          !isScrolled ? "py-5" : "py-3.5"
        }`}>

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#0f172a] text-emerald-400 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Database className="size-4" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-[#0f172a] tracking-tight">QueryCraft</span>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-emerald-600 mt-0.5">
                AI Database Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const cls = `flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-150 ${
                link.accent
                  ? "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
              const content = (<>{link.icon && <link.icon className="size-3 text-emerald-500 animate-pulse" />}{link.label}</>)
              return link.href.startsWith("/") ? (
                <Link key={link.href} href={link.href} className={cls}>{content}</Link>
              ) : (
                <a key={link.href} href={link.href} className={cls}>{content}</a>
              )
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/Dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Terminal className="size-3.5 text-emerald-500" />
                    <span>Workspace</span>
                  </Button>
                </Link>
                <Link href="/Dashboard/chat">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-[13px] font-semibold bg-[#0f172a] hover:bg-slate-800 text-white shadow-sm"
                  >
                    <MessageSquareText className="size-3.5 text-emerald-400" />
                    <span>Open Studio</span>
                    <ArrowRight className="size-3 text-emerald-400" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/Login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/Dashboard/chat">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-[13px] font-semibold bg-[#0f172a] hover:bg-slate-800 text-white shadow-sm"
                  >
                    <span>Try for Free</span>
                    <ArrowRight className="size-3 text-emerald-400" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Row */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/Dashboard/chat">
              <Button
                size="sm"
                className="h-8 px-3 text-xs font-semibold bg-[#0f172a] text-white"
              >
                Try Free
                <ArrowRight className="size-3 text-emerald-400 ml-1" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const cls = `flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                  link.accent ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-700 hover:bg-slate-50"
                }`
                const content = (<>{link.icon && <link.icon className="size-3.5 text-emerald-500" />}{link.label}</>)
                return link.href.startsWith("/") ? (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={cls}>{content}</Link>
                ) : (
                  <a key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={cls}>{content}</a>
                )
              })}
              <div className="pt-3 border-t border-slate-100 mt-2">
                <Link href="/Dashboard/chat" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full gap-2 bg-[#0f172a] text-white font-semibold">
                    <MessageSquareText className="size-4 text-emerald-400" />
                    Launch Chat Studio
                    <ArrowRight className="size-3.5 text-emerald-400" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
