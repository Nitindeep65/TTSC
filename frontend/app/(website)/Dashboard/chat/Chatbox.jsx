'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Activity,
  ArrowUp,
  BarChart3,
  Bookmark,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Cloud,
  Code2,
  Columns,
  Copy,
  Database,
  Download,
  Eye,
  HelpCircle,
  Key,
  Lightbulb,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  Terminal,
  Trash2,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react"
import { clarificationApi, databaseApi, memoryApi } from "@/lib/api"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import DataVisualizer from "@/components/visualization/DataVisualizer"
import MetricGlossaryModal from "@/components/semantic/MetricGlossaryModal"
import TableDataProfilerModal from "@/components/database/TableDataProfilerModal"
import QueryNotebookModal from "@/components/workspace/QueryNotebookModal"

const STARTER_PROMPTS = [
  {
    type: "SQL Clarification",
    text: "Show top customers",
    desc: "AI pauses to clarify metric, date range, and status before generating SQL",
    color: "amber",
  },
  {
    type: "Complete SQL",
    text: "Find completed orders from the last 7 days with customer names and total amount",
    desc: "Immediately compiles a safe, optimised PostgreSQL SELECT query",
    color: "emerald",
  },
  {
    type: "NoSQL (MongoDB MQL)",
    text: "Calculate total revenue and unit sales per product category from nested order items in MongoDB",
    desc: "Compiles a clean MongoDB Aggregation pipeline with $match, $unwind & $group",
    color: "purple",
  },
  {
    type: "Chart + Trend",
    text: "Show daily completed order revenue for the last 30 days as a trend chart",
    desc: "NLP detects chart intent → renders interactive line chart automatically",
    color: "blue",
  },
]

const FALLBACK_SCHEMA = [
  { table_name: "users", description: "Registered accounts", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "email", type: "VARCHAR(255)" }, { name: "name", type: "VARCHAR(100)" }, { name: "role", type: "VARCHAR(50)" }, { name: "is_active", type: "BOOLEAN" }, { name: "created_at", type: "TIMESTAMPTZ" }] },
  { table_name: "products", description: "Product catalogue", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "name", type: "VARCHAR(255)" }, { name: "category", type: "VARCHAR(100)" }, { name: "price", type: "NUMERIC(10,2)" }, { name: "stock_quantity", type: "INTEGER" }, { name: "is_available", type: "BOOLEAN" }] },
  { table_name: "orders", description: "Purchase transactions", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "user_id", type: "UUID", is_foreign_key: true }, { name: "total_amount", type: "NUMERIC(12,2)" }, { name: "status", type: "VARCHAR(50)" }, { name: "created_at", type: "TIMESTAMPTZ" }] },
  { table_name: "order_items", description: "Line items per order", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "order_id", type: "UUID", is_foreign_key: true }, { name: "product_id", type: "UUID", is_foreign_key: true }, { name: "quantity", type: "INTEGER" }, { name: "unit_price", type: "NUMERIC(10,2)" }] },
  { table_name: "payments", description: "Payment records", columns: [{ name: "id", type: "UUID", is_primary_key: true }, { name: "order_id", type: "UUID", is_foreign_key: true }, { name: "amount", type: "NUMERIC(12,2)" }, { name: "payment_method", type: "VARCHAR(50)" }, { name: "status", type: "VARCHAR(50)" }] },
]

const BADGE_COLORS = {
  amber: "bg-amber-50  text-amber-700  border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50   text-blue-700   border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
}

function generateClarificationChips(text) {
  const t = (text || "").toLowerCase()
  const chips = []
  if (t.includes("time") || t.includes("date") || t.includes("window") || t.includes("year") || t.includes("month") || t.includes("range")) {
    chips.push("Last 30 Days", "Calendar Year 2024", "All Time")
  }
  if (t.includes("status") || t.includes("completed") || t.includes("active") || t.includes("pending")) {
    chips.push("Completed Orders Only", "Active Users Only", "Include All Statuses")
  }
  if (t.includes("ranking") || t.includes("spend") || t.includes("metric") || t.includes("count") || t.includes("top")) {
    chips.push("Top 5 by Total Spend", "Top 10 by Order Count", "Order by Recent Date")
  }
  if (chips.length === 0) {
    chips.push("Yes, proceed with defaults", "Filter by last 30 days", "Top 5 results")
  }
  return Array.from(new Set(chips)).slice(0, 4)
}

export default function Chatbox() {
  const { connectionUri, dbInfo, setIsModalOpen } = useDatabase()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [executingIndex, setExecutingIndex] = useState(null)
  const [queryResults, setQueryResults] = useState({})
  const [explainingIndex, setExplainingIndex] = useState(null)
  const [explainData, setExplainData] = useState(null)
  const [verifiedSaved, setVerifiedSaved] = useState({})
  const [notebookSaved, setNotebookSaved] = useState({})
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false)
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false)
  const [profileTable, setProfileTable] = useState(null)
  const [copiedIndexRec, setCopiedIndexRec] = useState(false)
  const [isHelperOpen, setIsHelperOpen] = useState(false)
  const [schemaTables, setSchemaTables] = useState(FALLBACK_SCHEMA)
  const [schemaSearch, setSchemaSearch] = useState("")
  const [collapsed, setCollapsed] = useState({})

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, isLoading])

  useEffect(() => {
    if (dbInfo?.tables?.length > 0) {
      setSchemaTables(dbInfo.tables)
    } else {
      clarificationApi.getSchema().then(data => data?.tables && setSchemaTables(data.tables)).catch(() => {})
    }
  }, [dbInfo])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [inputText])

  const toggleCollapse = (name) => setCollapsed(p => ({ ...p, [name]: !p[name] }))

  const handleSend = useCallback(async (override) => {
    const query = typeof override === "string" ? override : inputText
    if (!query.trim() || isLoading) return

    const userText = query.trim()
    const historyPayload = messages.map(m => ({ role: m.role, content: m.rawContent || m.content }))

    const userName = user?.displayName || user?.email?.split("@")[0] || "You"
    const userEmail = user?.email || ""
    const userInitials = (user?.displayName || user?.email || "U").charAt(0).toUpperCase()
    const userPhoto = user?.photoURL || null

    setMessages(p => [...p, {
      role: "user",
      content: userText,
      userName,
      userEmail,
      userInitials,
      userPhoto,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }])
    setInputText("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setIsLoading(true)

    try {
      const payload = {
        user_prompt: userText,
        session_history: historyPayload,
        user_id: user?.uid || "guest",
        user_email: user?.email || "demo@querycraft.dev",
      }
      if (dbInfo?.schema_sql) payload.live_schema = dbInfo.schema_sql
      if (connectionUri) payload.connection_uri = connectionUri

      const data = await clarificationApi.compileQuery(payload)

      if (data.status === "needs_clarification") {
        setMessages(p => [...p, {
          role: "assistant", status: "needs_clarification",
          content: data.message, rawContent: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }])
      } else if (data.status === "complete") {
        const { sql_query, explanation, tables_identified, visual_intent, matched_metrics } = data.extracted_data || {}
        setMessages(p => [...p, {
          role: "assistant", status: "complete",
          message: data.message, explanation, tables: tables_identified || [],
          sql_query, visual_intent: visual_intent || data.visual_intent,
          matched_metrics: matched_metrics || [],
          rawContent: `${data.message || ""} ${explanation || ""} SQL: ${sql_query || ""}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }])
      }
    } catch {
      setMessages(p => [...p, {
        role: "assistant", status: "error",
        content: "Could not reach backend API. Ensure the backend server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [inputText, isLoading, messages, dbInfo, connectionUri])

  const handleCopy = async (sql, idx) => {
    await navigator.clipboard.writeText(sql)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 1800)
  }

  const handleRun = async (sql, idx, msg) => {
    if (!connectionUri) { setIsModalOpen(true); return }
    setExecutingIndex(idx)
    try {
      const data = await databaseApi.execute({
        connection_uri: connectionUri, sql_query: sql, limit: 50,
        auto_heal: true, user_prompt: msg?.rawContent, live_schema: dbInfo?.schema_sql,
      })
      setQueryResults(p => ({ ...p, [idx]: { success: true, columns: data.columns, rows: data.rows, rowCount: data.row_count, healingInfo: data.healing_info } }))
    } catch (err) {
      setQueryResults(p => ({ ...p, [idx]: { success: false, error: err.response?.data?.detail || err.message } }))
    } finally {
      setExecutingIndex(null)
    }
  }

  const handleExplain = async (sql, idx) => {
    if (!connectionUri) { setIsModalOpen(true); return }
    setExplainingIndex(idx)
    try {
      const data = await databaseApi.explain({ connection_uri: connectionUri, sql_query: sql })
      setExplainData(data)
    } catch (err) {
      alert("EXPLAIN error: " + (err.response?.data?.detail || err.message))
    } finally {
      setExplainingIndex(null)
    }
  }

  const handleSaveVerified = async (msg, idx) => {
    try {
      await memoryApi.verifyQuery({
        user_prompt: msg.rawContent || msg.message || "Verified Query",
        verified_sql: msg.sql_query,
        tables: msg.tables || [], explanation: msg.explanation, tags: msg.tables || [],
      })
      setVerifiedSaved(p => ({ ...p, [idx]: true }))
    } catch { alert("Failed to save to verified memory.") }
  }

  const handleSaveToNotebook = async (msg, idx) => {
    try {
      await memoryApi.saveNotebook({
        title: msg.message || "Saved Snippet",
        user_prompt: msg.rawContent || msg.message || "Saved SQL Query",
        sql_query: msg.sql_query,
        tags: msg.tables?.length ? msg.tables.map(t => `#${t}`) : ["#saved"],
        database_host: dbInfo?.host || "postgres",
      })
      setNotebookSaved(p => ({ ...p, [idx]: true }))
    } catch { alert("Failed to save to notebook.") }
  }

  const filteredSchema = schemaTables.filter(t => {
    const q = schemaSearch.toLowerCase()
    return !q || (t.table_name || "").toLowerCase().includes(q) || (t.columns || []).some(c => (c.name || "").toLowerCase().includes(q))
  })

  const perf = explainData?.performance_rating
  const perfClass = perf === "fast" ? "perf-fast" : perf === "moderate" ? "perf-mod" : "perf-heavy"
  const perfLabel = perf === "fast" ? "🟢 Fast / Optimal" : perf === "moderate" ? "🟡 Moderate" : "🔴 Heavy / Slow"

  return (
    <main className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#f5f6f2]">

      {/* ───────────────── CHAT COLUMN ───────────────── */}
      <section className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">

        {/* Sub-header */}
        <div className="flex h-13 shrink-0 items-center justify-between border-b border-[--border] bg-white/90 px-5 sm:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11.5px] font-semibold text-emerald-700">Llama 3.1 · 70B</span>
            </div>
            <span className="hidden sm:block text-[12px] text-[#8a9e93] font-medium">
              {dbInfo ? `↳ ${dbInfo.host} · ${dbInfo.tables_count} tables` : "↳ Demo schema · 5 tables"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNotebookModalOpen(true)}
              className="gap-1.5 text-xs font-semibold text-[#1b6b3a] h-8 hidden sm:flex border-[--border] hover:bg-[#edf5ef]">
              <Bookmark className="size-3.5 text-[#34c06a]" />
              Notebook
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsMetricModalOpen(true)}
              className="gap-1.5 text-xs font-semibold text-[#1b6b3a] h-8 hidden sm:flex border-[--border] hover:bg-[#edf5ef]">
              <Wand2 className="size-3.5 text-[#34c06a]" />
              Metrics Glossary
            </Button>
            {!dbInfo && (
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}
                className="gap-1.5 text-xs h-8 border-[--border]">
                <Cloud className="size-3.5 text-[#34c06a]" />
                <span className="hidden sm:inline">Connect DB</span>
              </Button>
            )}
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setQueryResults({}) }}
                className="gap-1.5 text-xs h-8 text-[#667872] hover:text-[#1a2920] hover:bg-[#edf5ef]">
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
            <Button
              variant={isHelperOpen ? "secondary" : "outline"} size="sm"
              onClick={() => setIsHelperOpen(p => !p)}
              className="gap-1.5 text-xs h-8 font-semibold border-[--border]"
            >
              {isHelperOpen ? <PanelRightClose className="size-3.5 text-[#34c06a]" /> : <PanelRightOpen className="size-3.5" />}
              <span className="hidden md:inline">Schema</span>
            </Button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8 space-y-8">

            {/* Welcome / Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center pt-6 animate-fade-up">
                <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#1a2920] text-[#5de08a] shadow-lg hover:scale-105 transition-transform duration-200">
                  <Sparkles className="size-7" />
                </div>
                <h1 className="text-3xl font-bold text-[#141a17] tracking-tight">
                  {user ? `Welcome, ${user.displayName || "Architect"} — What would you like to query?` : "What would you like to query?"}
                </h1>
                <p className="mt-3 max-w-xl text-[14px] text-[#667872] leading-relaxed">
                  {dbInfo
                    ? <>Grounded in <strong className="text-[#1b6b3a]">{dbInfo.host}</strong> ({dbInfo.tables_count} tables). Ambiguous metrics and filters are clarified automatically before any SQL is compiled.</>
                    : "Ask in plain English. The engine asks for missing parameters—like date ranges or status filters—before generating production-safe SQL."
                  }
                </p>

                <div className="mt-10 w-full max-w-2xl">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8a9e93]">
                      <Lightbulb className="size-3.5 text-amber-500" />
                      Suggested Prompts
                    </span>
                    <span className="text-[11.5px] text-[#34c06a] font-semibold">Click to use →</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {STARTER_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(p.text)}
                        className="group flex flex-col gap-2 rounded-xl border border-[--border] bg-white p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-[#b8d4bc]"
                      >
                        <span className={`self-start rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_COLORS[p.color]}`}>
                          {p.type}
                        </span>
                        <p className="text-[13px] font-semibold text-[#1a2920] leading-snug group-hover:text-[#1b6b3a] transition-colors">
                          &ldquo;{p.text}&rdquo;
                        </p>
                        <p className="text-[11.5px] text-[#8a9e93] leading-snug">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Thread */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a] shadow-sm mt-0.5">
                    <Bot className="size-4.5" />
                  </div>
                )}

                <div className={`flex flex-col gap-1.5 ${msg.role === "user" ? "max-w-xl items-end" : "flex-1 max-w-full"}`}>

                  {/* User bubble with author tag */}
                  {msg.role === "user" && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[11px] font-bold text-[#141a17]">
                          {msg.userName || user?.displayName || "You"}
                        </span>
                        {(msg.userEmail || user?.email) && (
                          <span className="text-[10px] text-[#718578] font-mono">
                            ({msg.userEmail || user?.email})
                          </span>
                        )}
                      </div>
                      <div className="rounded-2xl rounded-tr-md bg-[#1a2920] px-5 py-3.5 text-[14px] font-medium text-white shadow-sm leading-relaxed max-w-xl">
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {/* Clarification */}
                  {msg.status === "needs_clarification" && (
                    <div className="rounded-2xl rounded-tl-md border border-amber-200 bg-[#fefaf3] p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <HelpCircle className="size-3.5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                          Clarification Needed Before Execution
                        </span>
                      </div>
                      <p className="text-[14px] font-medium text-amber-950 leading-relaxed">{msg.content}</p>

                      {/* 1-Tap Reply Chips */}
                      <div className="pt-1.5 border-t border-amber-200/60">
                        <p className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                          <Sparkles className="size-3 text-amber-600" />
                          <span>1-Tap Quick Responses:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {generateClarificationChips(msg.content).map((chip, chipIdx) => (
                            <button
                              key={chipIdx}
                              type="button"
                              onClick={() => handleSend(chip)}
                              className="clarify-chip hover-lift"
                            >
                              <span>{chip}</span>
                              <span className="text-[#34c06a] text-xs font-bold">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Complete SQL Card */}
                  {msg.status === "complete" && (
                    <div className="w-full rounded-2xl rounded-tl-md border border-[--border] bg-white shadow-sm overflow-hidden">

                      {/* Card Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[--border] bg-[#f8faf8]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <Check className="size-3" /> Ready for Production
                          </span>
                          {msg.matched_metrics?.length > 0 && (
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                              ✦ {msg.matched_metrics.join(", ")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveToNotebook(msg, idx)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition-all duration-150 ${notebookSaved[idx]
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "text-[#667872] hover:bg-[#edf5ef] hover:text-[#1a2920]"
                              }`}
                          >
                            <Bookmark className={`size-3.5 ${notebookSaved[idx] ? "fill-emerald-500 text-emerald-500" : ""}`} />
                            {notebookSaved[idx] ? "In Notebook" : "Save to Notebook"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveVerified(msg, idx)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition-all duration-150 ${verifiedSaved[idx]
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "text-[#667872] hover:bg-[#edf5ef] hover:text-[#1a2920]"
                              }`}
                          >
                            <Star className={`size-3.5 ${verifiedSaved[idx] ? "fill-emerald-500 text-emerald-500" : ""}`} />
                            {verifiedSaved[idx] ? "Saved to Memory" : "Save as Verified"}
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="px-5 py-4 space-y-4">
                        <p className="text-[14.5px] font-semibold text-[#141a17] leading-snug">{msg.message}</p>
                        {msg.explanation && (
                          <p className="text-[13px] text-[#5e7065] leading-relaxed">{msg.explanation}</p>
                        )}
                        {msg.tables?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#8a9e93] uppercase tracking-wide">Tables:</span>
                            {msg.tables.map(t => (
                              <span key={t} className="font-mono text-[11px] rounded-md bg-[#f0f4f1] border border-[--border] px-2 py-0.5 text-[#2a4035]">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SQL Block */}
                      {msg.sql_query && (
                        <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-[#1e2f26] shadow-sm">
                          <div className="flex items-center justify-between bg-[#0d1613] px-4 py-2.5 border-b border-[#1e2f26]">
                            <span className="font-mono text-[11px] font-semibold text-[#6d9e84]">PostgreSQL · Read-Only</span>
                            <div className="flex items-center gap-1.5">
                              <Button variant="ghost" size="sm"
                                onClick={() => handleExplain(msg.sql_query, idx)}
                                disabled={explainingIndex === idx}
                                className="h-7 gap-1 text-[11px] text-[#8dc4a5] hover:text-white hover:bg-white/10"
                              >
                                {explainingIndex === idx ? <Loader2 className="size-3 animate-spin" /> : <Activity className="size-3 text-blue-400" />}
                                EXPLAIN
                              </Button>
                              <Button
                                onClick={() => handleRun(msg.sql_query, idx, msg)}
                                disabled={executingIndex === idx}
                                className="h-7 gap-1.5 text-[11.5px] font-bold bg-[#1f7a47] hover:bg-[#186038] text-white"
                                size="sm"
                              >
                                {executingIndex === idx
                                  ? <><Loader2 className="size-3 animate-spin" /> Running...</>
                                  : <><Play className="size-3" /> {connectionUri ? "Run on DB" : "Connect & Run"}</>
                                }
                              </Button>
                              <Button variant="ghost" size="sm"
                                onClick={() => handleCopy(msg.sql_query, idx)}
                                className="h-7 gap-1 text-[11px] text-[#8dc4a5] hover:text-white hover:bg-white/10"
                              >
                                {copiedIndex === idx ? <><Check className="size-3 text-emerald-400" /> Copied</> : <><Copy className="size-3" /> Copy</>}
                              </Button>
                            </div>
                          </div>
                          <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-[#c4e6d2] bg-[#0d1613]">
                            <code>{msg.sql_query}</code>
                          </pre>
                        </div>
                      )}

                      {/* Results / DataVisualizer */}
                      {queryResults[idx] && (
                        <div className="px-5 pb-5 space-y-3">
                          {queryResults[idx].healingInfo?.was_healed && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                              <Zap className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[12px] font-bold text-emerald-800">Auto-Healed by Critic Agent</p>
                                <p className="text-[11.5px] text-emerald-700 mt-0.5 leading-snug">{queryResults[idx].healingInfo.diagnosis}</p>
                              </div>
                            </div>
                          )}
                          {queryResults[idx].success
                            ? <DataVisualizer columns={queryResults[idx].columns} rows={queryResults[idx].rows} visualIntent={msg.visual_intent} title={msg.message} />
                            : <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-800"><strong>Error:</strong> {queryResults[idx].error}</div>
                          }
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {msg.status === "error" && (
                    <div className="rounded-2xl rounded-tl-md border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">{msg.content}</div>
                  )}

                  <div className={`text-[11px] text-[#a3b5a9] ${msg.role === "user" ? "text-right" : ""}`}>{msg.timestamp}</div>
                </div>

                {msg.role === "user" && (
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a] shadow-sm mt-0.5 font-bold text-xs ring-1 ring-emerald-500/20"
                    title={msg.userEmail || user?.email || msg.userName || "You"}
                  >
                    {msg.userPhoto ? (
                      <img src={msg.userPhoto} alt="User" className="size-full rounded-xl object-cover" />
                    ) : (
                      <span>{msg.userInitials || (user?.displayName || user?.email || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4 animate-fade-up">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a]">
                  <Bot className="size-4.5" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-[--border] bg-white px-5 py-3.5 text-[13px] text-[#667872] shadow-sm">
                  <span className="size-4 animate-spin rounded-full border-2 border-[#4abe7a] border-t-transparent" />
                  Reasoning over schema, metrics &amp; few-shot memory…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─────── Input Dock ─────── */}
        <div className="shrink-0 chat-input-dock px-5 sm:px-8 pb-6">
          <div className="mx-auto max-w-3xl">
            <div className="chat-input-surface">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                rows={1}
                placeholder="Ask a data question or follow up on a clarification…"
                className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[14.5px] text-[#141a17] outline-none placeholder:text-[#a3b5a9] max-h-52 leading-relaxed"
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <div className="flex items-center gap-2.5 text-[11.5px] text-[#a3b5a9]">
                  <span className="hidden sm:inline">Shift+Enter for newline</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    Zero-hallucination grounding
                  </span>
                </div>
                <Button
                  type="button"
                  disabled={!inputText.trim() || isLoading}
                  onClick={() => handleSend()}
                  className="size-9 rounded-xl bg-[#1a2920] hover:bg-[#243c2e] shadow-sm disabled:opacity-30 transition-all"
                  size="icon"
                >
                  <ArrowUp className="size-4 text-[#5de08a]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SCHEMA PANEL ───────────────── */}
      {isHelperOpen && (
        <aside className="w-76 shrink-0 border-l border-[--border] bg-white flex flex-col h-full overflow-hidden animate-fade-in">
          <div className="px-4 py-3.5 border-b border-[--border] bg-[#f8faf8] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#1a2920] text-[#5de08a]">
                  <Database className="size-3.5" />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-[#141a17] leading-none">Schema Explorer</p>
                  <p className="text-[10.5px] text-[#8a9e93] mt-0.5">{dbInfo ? `${dbInfo.host}` : "Demo schema"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allCollapsed = filteredSchema.every(t => collapsed[t.table_name])
                  const next = {}
                  filteredSchema.forEach(t => { next[t.table_name] = !allCollapsed })
                  setCollapsed(next)
                }}
                className="text-[10.5px] font-semibold text-[#34c06a] hover:text-[#1b6b3a] transition-colors"
              >
                {filteredSchema.every(t => collapsed[t.table_name]) ? "Expand all" : "Collapse all"}
              </button>
            </div>
            <input
              type="text"
              value={schemaSearch}
              onChange={e => setSchemaSearch(e.target.value)}
              placeholder="Filter tables or columns…"
              className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-[12.5px] text-[#141a17] outline-none placeholder:text-[#a3b5a9] focus:border-[#4abe7a] transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredSchema.length === 0 && (
              <p className="text-center py-8 text-[12px] text-[#a3b5a9]">No matching tables</p>
            )}
            {filteredSchema.map(t => {
              const name = t.table_name || t.table
              const isCollapsed = !!collapsed[name]
              return (
                <div key={name} className="group/row rounded-xl border border-[--border] bg-white overflow-hidden shadow-2xs transition-all duration-150 hover:border-[#a8d4b3]">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#f8faf8] border-b border-[--border]">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(name)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <Columns className="size-3.5 text-[#34c06a] shrink-0" />
                      <span className="font-mono text-[12.5px] font-bold text-[#141a17] truncate">{name}</span>
                      <span className="rounded bg-[#edf5ef] px-1.5 py-0.2 text-[9px] font-bold text-[#1b6b3a]">
                        {(t.columns || []).length}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setProfileTable(name); }}
                        title="View 5-row live sample preview & column distributions"
                        className="flex items-center gap-1 rounded bg-white border border-[#c6e5d1] px-1.5 py-0.5 text-[9.5px] font-bold text-[#1b6b3a] hover:bg-[#eef7f1] transition-colors"
                      >
                        <Eye className="size-2.5" />
                        <span>Sample</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCollapse(name)}
                        className="p-0.5 text-[#a3b5a9] hover:text-[#141a17]"
                      >
                        {isCollapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="border-t border-[--border] divide-y divide-[#f0f3f1]">
                      {t.description && (
                        <p className="px-3.5 py-2 text-[11px] text-[#8a9e93] bg-[#fcfcfc] italic">{t.description}</p>
                      )}
                      {(t.columns || []).map((col, ci) => {
                        const colName = typeof col === "string" ? col : col.name
                        const colType = typeof col === "string" ? "TEXT" : col.type
                        return (
                          <div key={ci} className="flex items-center justify-between px-3.5 py-2 hover:bg-[#f8faf8] transition-colors">
                            <span className="flex items-center gap-1.5 font-mono text-[11.5px] font-medium text-[#2a4035]">
                              {col?.is_primary_key && <Key className="size-3 text-amber-500" />}
                              {col?.is_foreign_key && <span className="text-[10px]">↗</span>}
                              {colName}
                            </span>
                            <span className="text-[10.5px] font-mono text-[#8a9e93]">{colType}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>
      )}

      {/* ─── EXPLAIN Modal ─── */}
      {explainData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[--border] bg-white shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-[--border]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#1a2920] text-[#5de08a]">
                  <Activity className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#141a17]">EXPLAIN Plan</h3>
                  <p className="text-[11.5px] text-[#8a9e93]">PostgreSQL cost estimation</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setExplainData(null)} className="size-8 text-[#8a9e93]">
                <X className="size-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${perfClass}`}>
                <span className="text-[13px] font-bold">{perfLabel}</span>
                <span className="text-[11px] font-semibold capitalize">{explainData.performance_rating}</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  ["Total Cost", explainData.total_cost, ""],
                  ["Est. Rows", explainData.plan_rows, ""],
                  ["Seq Scan", explainData.has_seq_scan ? "Detected" : "None", explainData.has_seq_scan ? "text-amber-600" : "text-emerald-600"],
                ].map(([label, val, cls]) => (
                  <div key={label} className="rounded-xl border border-[--border] bg-[#f8faf8] p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase text-[#8a9e93] mb-1">{label}</p>
                    <p className={`font-mono text-[13px] font-bold text-[#141a17] ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>

              {explainData.scan_details?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase text-[#8a9e93] tracking-wide">Scan Operations</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {explainData.scan_details.map((s, i) => (
                      <div key={i} className="rounded-lg bg-[#f0f5f1] border border-[--border] px-3 py-1.5 font-mono text-[11.5px] text-[#2a4035]">{s}</div>
                    ))}
                  </div>
                </div>
              )}

              {explainData.index_recommendations?.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-[--border]">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase text-emerald-700 tracking-wide flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Recommended Indexes
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(explainData.index_recommendations.join("\n"))
                        setCopiedIndexRec(true)
                        setTimeout(() => setCopiedIndexRec(false), 1500)
                      }}
                      className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5"
                    >
                      {copiedIndexRec ? "✓ Copied" : "Copy DDL"}
                    </button>
                  </div>
                  {explainData.index_recommendations.map((r, i) => (
                    <pre key={i} className="overflow-x-auto rounded-lg bg-[#0d1613] p-3 font-mono text-[11px] text-[#a7f3d0]"><code>{r}</code></pre>
                  ))}
                </div>
              )}

              <Button variant="default" size="sm" onClick={() => setExplainData(null)} className="w-full h-9 font-semibold">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      <MetricGlossaryModal isOpen={isMetricModalOpen} onClose={() => setIsMetricModalOpen(false)} />

      <TableDataProfilerModal
        isOpen={!!profileTable}
        onClose={() => setProfileTable(null)}
        tableName={profileTable}
        connectionUri={connectionUri}
      />

      <QueryNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        onSelectQuery={(sql, prompt) => setInputText(prompt || sql)}
        activeDbName={dbInfo?.host || "postgres"}
      />
    </main>
  )
}