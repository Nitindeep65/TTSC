"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles, Send, X, Terminal, Database,
  Copy, Check, ExternalLink, RotateCcw, BookOpen,
  ArrowRight, ShieldCheck, Zap, Key, HelpCircle,
  ChevronRight, CornerDownLeft
} from "lucide-react"
import Link from "next/link"

const STARTER_CARDS = [
  {
    title: "1-Click AI Assistant Hook",
    desc: "Connect to Claude Desktop, Cursor & Antigravity",
    icon: Zap,
    color: "#34d399",
    query: "How do I connect QueryCraft to Claude Desktop, Cursor, and Antigravity?",
  },
  {
    title: "Natural Language SQL",
    desc: "Compile English prompts to safe queries via CLI",
    icon: Sparkles,
    color: "#60a5fa",
    query: "How do I run natural language queries using querycraft ask?",
  },
  {
    title: "Connect Live Database",
    desc: "Link PostgreSQL, Supabase, Neon & MongoDB",
    icon: Database,
    color: "#fbbf24",
    query: "How do I connect my live PostgreSQL database to a workspace?",
  },
  {
    title: "Browser OAuth & Security",
    desc: "gh-style authentication & session isolation",
    icon: Key,
    color: "#a78bfa",
    query: "How does querycraft auth login and whoami work?",
  },
]

export default function DocsAiCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen, messages])

  // ESC key to close
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

      if (!res.ok) throw new Error("Could not reach Craft AI.")
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

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1800)
  }

  const handleResetChat = () => {
    setMessages([])
    setInput("")
  }

  // Precision Markdown Formatter
  const renderMessageContent = (content, msgIndex) => {
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, partIdx) => {
      if (part.startsWith("```")) {
        const codeContent = part.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim()
        const codeId = `${msgIndex}-${partIdx}`
        const isCopied = copiedIndex === codeId

        return (
          <div
            key={partIdx}
            style={{
              position: "relative",
              margin: "10px 0",
              background: "#040711",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.02)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            }}>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                terminal
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeContent, codeId)}
                style={{
                  background: "none",
                  border: "none",
                  color: isCopied ? "#34d399" : "#94a3b8",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {isCopied ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre style={{
              margin: 0,
              padding: "12px 14px",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 12,
              color: "#34d399",
              lineHeight: 1.6,
              overflowX: "auto",
            }}>
              {codeContent}
            </pre>
          </div>
        )
      }

      const lines = part.split("\n")
      return (
        <div key={partIdx} style={{ lineHeight: 1.65 }}>
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} style={{ height: 6 }} />
            if (line.startsWith("### ")) {
              return (
                <div key={lIdx} style={{ fontWeight: 700, color: "#fff", fontSize: 13.5, margin: "8px 0 3px" }}>
                  {line.replace("### ", "")}
                </div>
              )
            }
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <div key={lIdx} style={{ display: "flex", gap: 6, margin: "2px 0", paddingLeft: 4 }}>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>•</span>
                  <span>{line.replace(/^[-*]\s+/, "")}</span>
                </div>
              )
            }
            return <div key={lIdx} style={{ marginBottom: 3 }}>{line}</div>
          })}
        </div>
      )
    })
  }

  return (
    <>
      {/* ── Sleek Floating Launcher Trigger ────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="craft-ai-launcher"
            style={{
              background: "#080d1a",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: 40,
              padding: "8px 16px 8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.6)"
              e.currentTarget.style.boxShadow = "0 14px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(16, 185, 129, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.35)"
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15)"
            }}
          >
            {/* Glowing Avatar */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #059669, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)",
            }}>
              <Sparkles size={16} color="#ffffff" />
              <span style={{
                position: "absolute",
                top: -1, right: -1,
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#34d399",
                border: "2px solid #080d1a",
                boxShadow: "0 0 6px #34d399",
              }} />
            </div>

            <div style={{ textAlign: "left" }}>
              <div style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.2px",
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <span>Craft AI</span>
              </div>
              <div style={{
                fontSize: 10.5,
                color: "#34d399",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#34d399" }} />
                <span>Docs Copilot</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* ── Studio Copilot Dialog Window ──────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 410,
            maxWidth: "calc(100vw - 32px)",
            height: 580,
            maxHeight: "calc(100vh - 48px)",
            background: "#080c16",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 20,
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.15)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(20px)",
            animation: "craftAiSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header Bar */}
          <div style={{
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.02)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "linear-gradient(135deg, #059669, #10b981)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)",
              }}>
                <Sparkles size={15} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Craft AI</span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700,
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    padding: "1px 6px", borderRadius: 4,
                  }}>
                    Docs Copilot
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  <ShieldCheck size={11} color="#34d399" />
                  <span>Grounded in QueryCraft Docs</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear Chat"
                  style={{
                    background: "none", border: "none",
                    color: "#64748b", cursor: "pointer", padding: "5px 7px",
                    borderRadius: 6, display: "flex", alignItems: "center",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "none" }}
                >
                  <RotateCcw size={13} />
                </button>
              )}

              <Link
                href="/docs/cli"
                target="_blank"
                style={{
                  padding: "4px 8px", borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#94a3b8", fontSize: 11, fontWeight: 600,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <BookOpen size={11} />
                <span>Docs</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none", border: "none",
                  color: "#94a3b8", cursor: "pointer", padding: "5px",
                  borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Content / Chat Thread */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontSize: 12.5,
          }}>
            {/* Empty State: Curated Cards */}
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "8px 0" }}>
                <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 10,
                  }}>
                    <Sparkles size={20} color="#34d399" />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                    How can I help you with QueryCraft?
                  </h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>
                    Ask about CLI commands, 1-click AI configuration for Claude & Cursor, or live database setups.
                  </p>
                </div>

                {/* 4 Interactive Starter Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {STARTER_CARDS.map((card, i) => {
                    const Icon = card.icon
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(card.query)}
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: 10,
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                          e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"
                          e.currentTarget.style.transform = "translateX(2px)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)"
                          e.currentTarget.style.transform = "translateX(0)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: "rgba(255,255,255,0.04)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <Icon size={14} color={card.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f1f5f9" }}>
                              {card.title}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              {card.desc}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={14} color="#64748b" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {m.role === "assistant" && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 10.5, fontWeight: 700, color: "#34d399",
                    marginBottom: 4, paddingLeft: 2,
                  }}>
                    <Sparkles size={11} />
                    <span>Craft AI</span>
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "92%",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "12px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #059669, #047857)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: m.role === "user"
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.07)",
                    color: "#f8fafc",
                    fontSize: 12.5,
                  }}
                >
                  {renderMessageContent(m.content, idx)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#34d399", fontSize: 12, padding: "6px 8px" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "craftAiPulse 1s infinite" }} />
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "craftAiPulse 1s infinite 0.2s" }} />
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "craftAiPulse 1s infinite 0.4s" }} />
                </div>
                <span>Craft AI is reading docs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Form */}
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
                placeholder="Ask Craft AI about CLI commands, AI setup..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 10,
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: 12.5,
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: input.trim() ? "linear-gradient(135deg, #059669, #10b981)" : "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                  boxShadow: input.trim() ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                }}
              >
                <Send size={14} />
              </button>
            </form>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
              padding: "0 4px",
              fontSize: 10.5,
              color: "#64748b",
            }}>
              <span>Grounded in QueryCraft Engine</span>
              <span>Press <kbd style={{ fontFamily: "inherit", background: "rgba(255,255,255,0.06)", padding: "1px 4px", borderRadius: 3 }}>↵ Enter</kbd></span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes craftAiSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes craftAiPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </>
  )
}
