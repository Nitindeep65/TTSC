"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Database, Menu, MessageSquareText, Sparkles, Terminal, X, Layers } from "lucide-react"

const navLinks = [
  { name: "Overview", href: "/" },
  { name: "Problem", href: "/#problem" },
  { name: "Features", href: "/#features" },
  { name: "Use Cases", href: "/#use-cases" },
  { name: "MCP Protocol", href: "/#mcp" },
  { name: "Testimonials", href: "/#testimonials" },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e3e8e2] bg-[#fbfdfb]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={closeMenu} className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-sm ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="size-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight text-[#1f2d24]">QueryCraft</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4ca873]">
              Universal SQL &amp; NoSQL Studio
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#eaf5ed] font-semibold text-[#226343]"
                    : "text-[#5b6a60] hover:bg-[#edf4ee] hover:text-[#1f2d24]"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          
          <span className="mx-2 h-5 w-px bg-[#dfe6df]" />

          <Link
            href="/Dashboard/chat"
            className="flex items-center gap-2 rounded-lg border border-[#cfddd0] bg-white px-3.5 py-2 text-xs font-semibold text-[#2d4334] shadow-xs transition hover:border-[#4ca873] hover:bg-[#f3f9f4]"
          >
            <MessageSquareText className="size-3.5 text-[#4ca873]" />
            Live Chat
          </Link>

          <Link
            href="/Dashboard"
            className="ml-1 flex items-center gap-2 rounded-lg bg-[#1f2d24] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2e4736] hover:shadow-md"
          >
            Workspace
            <ArrowRight className="size-3.5 text-[#71c897]" />
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-xl border border-[#dfe6df] bg-white text-[#1f2d24] shadow-xs transition hover:bg-[#f1f6f2] md:hidden"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={`border-t border-[#e3e8e2] bg-[#fbfdfb] px-4 py-4 transition-all duration-200 md:hidden ${
          isOpen ? "block max-h-96 opacity-100" : "hidden max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMenu}
              className={`rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                pathname === item.href
                  ? "bg-[#eaf5ed] font-semibold text-[#226343]"
                  : "text-[#5b6a60] hover:bg-[#edf4ee] hover:text-[#1f2d24]"
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="my-2 h-px bg-[#e3e8e2]" />
          <Link
            href="/Dashboard/chat"
            onClick={closeMenu}
            className="flex items-center justify-between rounded-lg border border-[#cfddd0] bg-white px-3.5 py-2.5 text-sm font-medium text-[#2d4334]"
          >
            <span className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-[#4ca873]" />
              Live Chat Assistant
            </span>
            <ArrowRight className="size-4 text-[#728078]" />
          </Link>
          <Link
            href="/Dashboard"
            onClick={closeMenu}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1f2d24] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open Workspace
            <ArrowRight className="size-4 text-[#71c897]" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
