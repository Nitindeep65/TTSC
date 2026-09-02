"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Send, X, Terminal, Database,
  Copy, Check, ExternalLink, RotateCcw, BookOpen,
  ArrowRight, ShieldCheck, Zap, Key, HelpCircle,
  ChevronRight, CornerDownLeft, MessageSquare,
  Bot, RefreshCw, Layers, CheckCircle2, Search
} from "lucide-react"
import Link from "next/link"

const QUICK_TOPICS = [
  {
    icon: Zap,
    title: "1-Click AI Assistant Hook",
    badge: "setup",
    color: "#10b981",
    query: "How do I connect QueryCraft to Claude Desktop, Cursor, and Antigravity?",
  },
  {
    icon: Sparkles,
    title: "Natural Language SQL in Terminal",
    badge: "ask",
    color: "#3b82f6",
    query: "How does querycraft ask compile English to SQL with cost checks?",
  },
  {
    icon: ShieldCheck,
    title: "Pre-Flight Cost Guard & Risk Analysis",
    badge: "check",
    color: "#10b981",
    query: "How does querycraft check evaluate queries via EXPLAIN and assign risk levels?",
  },
  {
    icon: Bot,
    title: "SQL Doctor Error Diagnosis & Auto-Heal",
    badge: "doctor",
    color: "#8b5cf6",
    query: "How does querycraft doctor diagnose and fix broken SQL queries and runtime errors?",
  },
  {
    icon: Database,
    title: "Connect Live PostgreSQL / Supabase",
    badge: "connect",
    color: "#f59e0b",
    query: "How do I connect my live PostgreSQL / Supabase database?",
  },
]

export default function DocsAiCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto focus & scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen, messages])

  // Global keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const handleSend = async (queryText) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || loading) return

    const newHistory = [...messages, { role: "user", content: textToSend }]
    setMessages(newHistory)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/docs-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: newHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error("Failed to reach Craft AI.")
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't find an answer to that in the documentation." },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Could not connect to Craft AI. Please visit our full documentation at [/docs/cli](/docs/cli)." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code, key) => {
    navigator.clipboard.writeText(code)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
  }

  const handleResetChat = () => {
    setMessages([])
    setInput("")
  }

  // Render markdown code blocks, bold headers, and list items
  const renderMessageContent = (content, msgIdx) => {
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, partIdx) => {
      if (part.startsWith("```")) {
        const codeContent = part.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim()
        const key = `${msgIdx}-${partIdx}`
        const isCopied = copiedKey === key

        return (
          <div
            key={partIdx}
            className="my-2 rounded-xl overflow-hidden border border-white/10 bg-[#060913] shadow-md"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-slate-400 font-medium">terminal</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(codeContent, key)}
                className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-400 hover:text-emerald-400 transition-colors px-1.5 py-0.5 rounded hover:bg-white/[0.06]"
              >
                {isCopied ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 font-mono text-[12px] text-emerald-400 leading-relaxed overflow-x-auto selection:bg-emerald-500/20">
              {codeContent}
            </pre>
          </div>
        )
      }

      const lines = part.split("\n")
      return (
        <div key={partIdx} className="space-y-1 text-[13px] leading-relaxed text-slate-200">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1.5" />
            if (line.startsWith("### ")) {
              return (
                <div key={lIdx} className="font-bold text-white text-[14px] mt-2 mb-1">
                  {line.replace("### ", "")}
                </div>
              )
            }
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                  <span className="text-emerald-400 mt-1 font-bold text-xs">•</span>
                  <span>{line.replace(/^[-*]\s+/, "")}</span>
                </div>
              )
            }
            return <div key={lIdx}>{line}</div>
          })}
        </div>
      )
    })
  }

  return (
    <>
      {/* ── Floating Launcher Widget (Bottom-Right) ────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              onClick={() => setIsOpen(true)}
              initial={{ scale: 0.85, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 10 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#080d1a]/95 hover:bg-[#0c1324] border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.18)] backdrop-blur-xl transition-all duration-200 cursor-pointer"
            >
              {/* Glowing Icon Beacon */}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_14px_rgba(16,185,129,0.45)]">
                <Sparkles size={16} className="text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080d1a] shadow-[0_0_6px_#34d399]" />
              </div>

              {/* Text label */}
              <div className="text-left pr-1">
                <div className="text-[13px] font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Craft AI</span>
                  <span className="text-[9.5px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Docs
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-400 font-medium flex items-center gap-1">
                  <span>Ask anything</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform text-emerald-400" />
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Studio Copilot Dialog Window ──────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 right-6 w-[430px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-48px)] bg-[#070b16]/98 border border-white/10 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_35px_rgba(16,185,129,0.12)] z-50 flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.02] border-b border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold text-white tracking-tight">Craft AI</span>
                    <span className="text-[9.5px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded">
                      Official Docs Copilot
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Grounded in QueryCraft v1.5.0</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Reset conversation"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}

                <Link
                  href="/docs/cli"
                  target="_blank"
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2.5 py-1 rounded-lg transition-all"
                >
                  <BookOpen size={11} className="text-emerald-400" />
                  <span>Docs</span>
                  <ExternalLink size={10} className="text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all ml-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Thread Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Screen / Quick Topics */}
              {messages.length === 0 && (
                <div className="space-y-4 py-2">
                  <div className="text-center px-2 py-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <Sparkles size={22} className="text-emerald-400" />
                    </div>
                    <h3 className="text-[15px] font-bold text-white tracking-tight">
                      How can I help with QueryCraft?
                    </h3>
                    <p className="text-[12px] text-slate-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
                      Ask about CLI commands, 1-click AI setups for Claude & Cursor, or live database configurations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                      Quick Topics
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {QUICK_TOPICS.map((topic, i) => {
                        const Icon = topic.icon
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSend(topic.query)}
                            className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all duration-150 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] shrink-0"
                                style={{ color: topic.color }}
                              >
                                <Icon size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-semibold text-slate-200 group-hover:text-white truncate">
                                  {topic.title}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 group-hover:text-emerald-400 bg-white/[0.04] px-1.5 py-0.5 rounded shrink-0 ml-2">
                              {topic.badge}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mb-1 pl-1">
                      <Sparkles size={11} />
                      <span>Craft AI</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[12.5px] ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-sm shadow-md"
                        : "bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {renderMessageContent(m.content, idx)}
                  </div>
                </div>
              ))}

              {/* Loading Animation */}
              {loading && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs px-2 py-1">
                  <RefreshCw size={13} className="animate-spin" />
                  <span className="font-medium text-slate-300">Craft AI is searching documentation...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Field */}
            <div className="p-3 bg-white/[0.02] border-t border-white/[0.07]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask Craft AI about CLI, MCP, databases..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-emerald-500/50 rounded-xl px-3.5 py-2 text-[12.5px] text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                    input.trim()
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer hover:opacity-95"
                      : "bg-white/[0.05] text-slate-500 cursor-default"
                  }`}
                >
                  <Send size={14} />
                </button>
              </form>

              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span>Privacy & Grounding Protected</span>
                </span>
                <span>Press <kbd className="font-mono bg-white/[0.06] px-1 py-0.5 rounded text-[9px] text-slate-400">↵</kbd></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
