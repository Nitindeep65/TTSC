"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bot, Sparkles, Send, X, Terminal, Database,
  Copy, Check, ExternalLink, RefreshCw, BookOpen,
  ArrowRight, ShieldCheck, ChevronDown
} from "lucide-react"
import Link from "next/link"

const STARTER_PROMPTS = [
  { label: "⚡ Connect Claude & Cursor", query: "How do I connect QueryCraft to Claude Desktop and Cursor?" },
  { label: "🧠 Natural Language SQL", query: "How do I run natural language queries using querycraft ask?" },
  { label: "🔌 Link Supabase / Postgres", query: "How do I connect my live database to a workspace?" },
  { label: "🔑 Browser Login & Auth", query: "How does querycraft auth login work?" },
]

export default function DocsAiCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm the **QueryCraft Docs Copilot**. Ask me anything about our CLI commands, MCP setup for Claude/Cursor, live database connections, or Cost Guard.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen, messages])

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

      if (!res.ok) throw new Error("Could not reach Docs Copilot.")
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't find an answer to that in the documentation." },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Could not connect to Docs Assistant. Please check [/docs/cli](/docs/cli) directly." },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Render markdown-like code blocks and bold text cleanly
  const renderMessageContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const codeContent = part.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim()
        return (
          <div key={i} style={{
            position: "relative",
            margin: "8px 0",
            background: "#080d1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <pre style={{
              margin: 0,
              padding: "10px 12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "#34d399",
              lineHeight: 1.5,
              overflowX: "auto",
            }}>
              {codeContent}
            </pre>
          </div>
        )
      }

      // Inline formatting
      const lines = part.split("\n")
      return (
        <div key={i} style={{ lineHeight: 1.6 }}>
          {lines.map((line, lineIdx) => {
            if (line.startsWith("### ")) {
              return <div key={lineIdx} style={{ fontWeight: 700, color: "#fff", fontSize: 13.5, margin: "6px 0 2px" }}>{line.replace("### ", "")}</div>
            }
            if (line.startsWith("- ")) {
              return (
                <div key={lineIdx} style={{ display: "flex", gap: 6, margin: "2px 0" }}>
                  <span style={{ color: "#10b981" }}>•</span>
                  <span>{line.replace("- ", "")}</span>
                </div>
              )
            }
            return <div key={lineIdx} style={{ marginBottom: 4 }}>{line}</div>
          })}
        </div>
      )
    })
  }

  return (
    <>
      {/* ── Floating Launcher Trigger ─────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              background: "rgba(11, 15, 25, 0.92)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              backdropFilter: "blur(12px)",
              borderRadius: 30,
              padding: "8px 14px 8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(16, 185, 129, 0.15)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.6)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #059669, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <Sparkles size={16} color="#fff" />
              <span style={{
                position: "absolute",
                top: 0, right: 0,
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 8px #34d399",
              }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                Ask Docs AI
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>
                Grounded Copilot
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Expanded Copilot Dialog ───────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 390,
            maxWidth: "calc(100vw - 32px)",
            height: 540,
            maxHeight: "calc(100vh - 48px)",
            background: "#070b14",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 16,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 30px rgba(16, 185, 129, 0.15)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(16px)",
            animation: "docsCopilotSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "rgba(255, 255, 255, 0.03)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg, #059669, #10b981)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>QueryCraft Docs Copilot</span>
                </div>
                <div style={{ fontSize: 10, color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                  <ShieldCheck size={11} />
                  <span>Grounded in Official Docs</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link
                href="/docs/cli"
                target="_blank"
                style={{
                  padding: "4px 8px", borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#94a3b8", fontSize: 11, fontWeight: 600,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <BookOpen size={11} />
                <span>Docs</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none", border: "none",
                  color: "#94a3b8", cursor: "pointer", padding: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontSize: 12.5,
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #059669, #047857)"
                      : "rgba(255, 255, 255, 0.04)",
                    border: m.role === "user"
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.07)",
                    color: "#fff",
                  }}
                >
                  {renderMessageContent(m.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#34d399", fontSize: 11.5, padding: "4px 8px" }}>
                <RefreshCw size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                <span>Searching QueryCraft docs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          {messages.length <= 2 && (
            <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", paddingLeft: 4 }}>
                Popular Questions:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {STARTER_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.query)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 14,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: "#94a3b8",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)"
                      e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
                      e.currentTarget.style.color = "#34d399"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
                      e.currentTarget.style.color = "#94a3b8"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div style={{
            padding: "12px",
            background: "rgba(255, 255, 255, 0.02)",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about CLI, MCP, or databases..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 12.5,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: input.trim() ? "#059669" : "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes docsCopilotSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
