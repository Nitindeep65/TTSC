'use client'

import { useState, useRef, useEffect } from "react"
import {
  ArrowUp,
  Bot,
  Check,
  Code2,
  Copy,
  Database,
  HelpCircle,
  Lightbulb,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Sparkles,
  Table2,
  Terminal,
  User,
} from "lucide-react"
import axios from "axios"

const starterPrompts = [
  "Find the top 5 users by total spend in 2024",
  "Show products with stock quantity below 20",
  "Calculate average order value by order status",
  "List users who registered in the last 30 days",
]

const dbSchemaList = [
  {
    table: "users",
    columns: ["id", "name", "email", "role", "created_at"],
  },
  {
    table: "orders",
    columns: ["id", "user_id", "total_amount", "status", "created_at"],
  },
  {
    table: "order_items",
    columns: ["id", "order_id", "product_id", "quantity", "unit_price"],
  },
  {
    table: "products",
    columns: ["id", "name", "category", "stock_quantity", "price"],
  },
]

export default function Chatbox() {
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : inputText
    if (!query.trim() || isLoading) return

    const userText = query.trim()
    const newUserMsg = {
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.rawContent || m.content,
    }))

    setMessages((prev) => [...prev, newUserMsg])
    setInputText("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/clarification/", {
        user_prompt: userText,
        session_history: historyPayload,
      })

      const aiData = response.data

      if (aiData.status === "needs_clarification") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            status: "needs_clarification",
            content: aiData.message,
            rawContent: aiData.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      } else if (aiData.status === "complete") {
        const { sql_query, explanation, tables_identified } = aiData.extracted_data || {}
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            status: "complete",
            message: aiData.message,
            explanation,
            tables: tables_identified || [],
            sql_query,
            rawContent: `${aiData.message || ""} ${explanation || ""} SQL: ${sql_query || ""}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          status: "error",
          content: "Failed to connect to the backend server. Please make sure FastAPI is running at http://127.0.0.1:8000.",
          rawContent: "Error connecting to backend.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopySQL = async (sql, idx) => {
    if (!sql) return
    await navigator.clipboard.writeText(sql)
    setCopiedIndex(idx)
    window.setTimeout(() => setCopiedIndex(null), 1800)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex-1 bg-[#f7f8f5]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8 lg:py-6">
        
        <section className="flex min-h-[720px] flex-col overflow-hidden rounded-2xl border border-[#dfe4dc] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#e8ebe6] bg-[#fbfdfb] px-5 py-3.5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897]">
                <Bot className="size-5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[#1f2d24]">SQL Clarification Assistant</h1>
                <div className="flex items-center gap-1.5 text-xs text-[#6e7e74]">
                  <span className="size-1.5 rounded-full bg-[#4ca873] animate-pulse" />
                  Multi-turn Context Active
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe7df] bg-white px-2.5 py-1 text-xs font-medium text-[#5a6b60] shadow-2xs transition hover:bg-[#f1f6f2]"
                  title="Clear conversation"
                >
                  <RefreshCw className="size-3" />
                  Reset Chat
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-auto px-4 py-6 sm:px-8">
            {messages.length === 0 ? (
              <div className="my-auto space-y-6 py-8">
                <div className="mx-auto max-w-xl text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#1f2d24] text-[#71c897]">
                    <Sparkles className="size-6" />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-[#1f2d24]">
                    Interactive Text-to-SQL Clarifier
                  </h2>
                  <p className="mt-1.5 text-sm text-[#67776d]">
                    Ask any data question. If key details like date ranges or metrics are missing, the assistant will ask follow-up questions before generating the SQL query.
                  </p>
                </div>

                <div className="mx-auto max-w-xl rounded-xl border border-[#e1e8e1] bg-[#f8fbf8] p-4">
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#718278]">
                    <Lightbulb className="size-4 text-[#d98b2c]" />
                    Suggested Prompts
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="rounded-lg border border-[#dfe8df] bg-white p-2.5 text-left text-xs font-medium text-[#304838] transition hover:border-[#79b790] hover:bg-[#f1f8f2]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mx-auto flex max-w-3xl gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897] shadow-xs">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div className="max-w-2xl space-y-2">
                    {msg.role === "user" ? (
                      <div className="rounded-2xl rounded-tr-xs bg-[#1f2d24] px-4.5 py-3 text-sm leading-relaxed text-white shadow-xs">
                        {msg.content}
                      </div>
                    ) : msg.status === "needs_clarification" ? (
                      <div className="rounded-2xl rounded-tl-xs border border-[#ecd9be] bg-[#fefaf3] p-4 text-sm text-[#4e3519] shadow-xs">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#a5651c]">
                          <HelpCircle className="size-3.5 text-[#d98b2c]" />
                          Clarification Needed
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    ) : msg.status === "complete" ? (
                      <div className="space-y-3 rounded-2xl rounded-tl-xs border border-[#dce8de] bg-[#fbfdfb] p-4.5 text-sm shadow-xs">
                        {msg.message && (
                          <p className="font-semibold text-[#1f2d24]">{msg.message}</p>
                        )}

                        {msg.explanation && (
                          <p className="text-xs leading-relaxed text-[#56685d]">
                            {msg.explanation}
                          </p>
                        )}

                        {msg.tables?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#798a80]">
                              Tables:
                            </span>
                            {msg.tables.map((t) => (
                              <span
                                key={t}
                                className="rounded-md border border-[#cbe0d0] bg-[#eef7f1] px-2 py-0.5 font-mono text-[11px] font-medium text-[#205d3c]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {msg.sql_query && (
                          <div className="overflow-hidden rounded-xl border border-[#27382d] bg-[#17231c]">
                            <div className="flex items-center justify-between border-b border-white/10 bg-[#121c16] px-3.5 py-2 text-[11px] text-[#86a894]">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Code2 className="size-3.5 text-[#4ca873]" />
                                PostgreSQL
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopySQL(msg.sql_query, idx)}
                                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#d7f1df] transition hover:bg-white/10"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="size-3 text-[#4ca873]" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3" />
                                    <span>Copy SQL</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-[#d7f1df]">
                              <code>{msg.sql_query}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-tl-xs border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                        {msg.content}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-[#86978d] ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e2ece4] text-[#445b4c] shadow-xs">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="mx-auto flex max-w-3xl gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1f2d24] text-[#71c897]">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-[#dfe7df] bg-[#f8fbf8] px-4 py-3 text-xs text-[#63746a]">
                  <span className="size-3 animate-spin rounded-full border-2 border-[#4ca873] border-t-transparent" />
                  Reasoning over schema and session context...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <footer className="border-t border-[#e8ebe6] bg-[#fcfdfb] p-4 sm:px-7">
            <div className="mx-auto max-w-3xl rounded-xl border border-[#cfd9d0] bg-white p-2 shadow-2xs focus-within:border-[#4ca873] focus-within:ring-3 focus-within:ring-[#4ca873]/10">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask your database question (e.g. 'Show orders from this week with status pending')..."
                className="w-full resize-none bg-transparent px-2.5 py-1 text-sm text-[#1f2d24] outline-none placeholder:text-[#9aa59d]"
              />
              <div className="flex items-center justify-between border-t border-[#f0f4f0] pt-2 px-1">
                <span className="text-[11px] text-[#86968d]">
                  Shift + Enter for new line, Enter to send
                </span>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  className="flex size-8 items-center justify-center rounded-lg bg-[#1f2d24] text-white shadow-xs transition hover:bg-[#34533f] disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          </footer>
        </section>

        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#216b44]">
              <Database className="size-4" />
              Active Schema Tables
            </div>
            <p className="mt-1 text-xs text-[#718277]">
              Postgres tables available for query synthesis.
            </p>

            <div className="mt-4 space-y-3">
              {dbSchemaList.map((item) => (
                <div
                  key={item.table}
                  className="rounded-xl border border-[#e4ebe5] bg-[#f9fbf9] p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-mono font-bold text-[#1f2d24]">
                    <span>{item.table}</span>
                    <span className="rounded bg-[#e8f2eb] px-1.5 py-0.5 text-[10px] text-[#246944]">
                      table
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.columns.map((col) => (
                      <span
                        key={col}
                        className="rounded border border-[#e1e9e2] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#55695e]"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </main>
  )
}