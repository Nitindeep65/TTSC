'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowUp,
  Bookmark,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Cloud,
  Columns,
  Copy,
  Database,
  Eye,
  HelpCircle,
  Key,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  User,
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
import { RiskBadge, RiskBanner } from "@/components/guard/RiskBadge"
import TableDataProfilerModal from "@/components/database/TableDataProfilerModal"
import QueryNotebookModal from "@/components/workspace/QueryNotebookModal"
import { useTour } from "@/lib/tourContext"

const STARTER_PROMPTS = [
  {
    type: "Clarification Loop",
    text: "Show top customers",
    desc: "Engine pauses to clarify metric, date range, & status with 1-tap reply chips",
    color: "amber",
    icon: HelpCircle,
  },
  {
    type: "Complete SQL",
    text: "Find completed orders from the last 7 days with customer names and total amount",
    desc: "Instantly compiles a safe, optimized PostgreSQL query with LIMIT 50 guards",
    color: "emerald",
    icon: Terminal,
  },
  {
    type: "Cost & Index Analysis",
    text: "Find active users with high order count and total spend over $500",
    desc: "Analyzes cost, detects sequential scans, and suggests optimal indexes",
    color: "blue",
    icon: ShieldCheck,
  },
  {
    type: "SQL Doctor Repair",
    text: "Fix query: SELECT u.name, o.total FROM users u JOIN orders o GROUP BY u.name;",
    desc: "Auto-heals missing GROUP BY columns and runtime SQL errors with Critic loop",
    color: "purple",
    icon: Sparkles,
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
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 group-hover:border-amber-500/50",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 group-hover:border-emerald-500/50",
  blue: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25 group-hover:border-sky-500/50",
  purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25 group-hover:border-purple-500/50",
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
  const router = useRouter()
  const { connectionUri, dbInfo, setIsModalOpen } = useDatabase()
  const { user } = useAuth()

  let tour = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tour = useTour()
  } catch {}
  const isTourActive = tour?.isTourActive || false
  const currentStep = tour?.currentStep || 1

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
  const [expandedDetails, setExpandedDetails] = useState({})
  const [selectedChips, setSelectedChips] = useState({})
  const [agentStage, setAgentStage] = useState(1) // 1: Planner, 2: SQL Worker, 3: Critic Doctor

  // Multi-agent stage progression while query compiles
  useEffect(() => {
    if (!isLoading) {
      setAgentStage(1)
      return
    }
    const t1 = setTimeout(() => setAgentStage(2), 1100)
    const t2 = setTimeout(() => setAgentStage(3), 2600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isLoading])

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const inFlightRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

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
    if (!query.trim() || isLoading || inFlightRef.current) return

    inFlightRef.current = true
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
          role: "assistant",
          status: "needs_clarification",
          content: data.message,
          rawContent: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }])
      } else if (data.status === "complete") {
        const { sql_query, explanation, tables_identified, visual_intent, matched_metrics, risk_level } = data.extracted_data || {}
        setMessages(p => [...p, {
          role: "assistant",
          status: "complete",
          message: data.message,
          explanation,
          tables: tables_identified || [],
          sql_query,
          risk_level: risk_level || data.risk_level || "LOW",
          visual_intent: visual_intent || data.visual_intent,
          matched_metrics: matched_metrics || [],
          rawContent: `${data.message || ""} ${explanation || ""} SQL: ${sql_query || ""}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }])
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not reach AI compilation engine. Please try again."
      setMessages(p => [...p, {
        role: "assistant",
        status: "error",
        content: errorMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } finally {
      setIsLoading(false)
      inFlightRef.current = false
    }
  }, [inputText, isLoading, messages, dbInfo, connectionUri, user])

  const handleCopy = async (sql, idx) => {
    await navigator.clipboard.writeText(sql)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 1800)
  }

  const handleRun = async (sql, idx, msg, forceSandbox = false) => {
    setExecutingIndex(idx)
    try {
      const data = await databaseApi.execute({
        connection_uri: forceSandbox ? "" : (connectionUri || ""),
        sql_query: sql,
        limit: 50,
        auto_heal: true,
        user_prompt: msg?.rawContent,
        live_schema: forceSandbox ? null : dbInfo?.schema_sql,
      })

      if (data.was_healed && data.healing_info?.healed_sql) {
        setMessages(prev => prev.map((m, i) => i === idx ? {
          ...m,
          sql_query: data.healing_info.healed_sql,
          explanation: data.healing_info.diagnosis || m.explanation,
        } : m))
      }

      setQueryResults(p => ({
        ...p,
        [idx]: {
          success: true,
          columns: data.columns,
          rows: data.rows,
          rowCount: data.row_count,
          healingInfo: data.healing_info || (data.was_healed ? { was_healed: true, ...data.healing_info } : null),
        },
      }))
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Database query execution failed."
      setQueryResults(p => ({
        ...p,
        [idx]: {
          success: false,
          error: errorMsg,
          canFallbackToSandbox: !!connectionUri && !forceSandbox,
        },
      }))
    } finally {
      setExecutingIndex(null)
    }
  }

  const handleAutoHeal = async (msg, idx, errorMsg) => {
    setExecutingIndex(idx)
    try {
      const diagData = await databaseApi.diagnose({
        error_message: errorMsg,
        failing_sql: msg.sql_query,
        live_schema: dbInfo?.schema_sql || null,
        user_prompt: msg?.rawContent || "",
      })

      if (diagData.can_execute && diagData.healed_sql) {
        const healedSql = diagData.healed_sql

        setMessages(prev => prev.map((m, i) => i === idx ? {
          ...m,
          sql_query: healedSql,
          explanation: diagData.diagnosis || m.explanation,
        } : m))

        const execData = await databaseApi.execute({
          connection_uri: connectionUri || "",
          sql_query: healedSql,
          limit: 50,
          auto_heal: false,
          live_schema: dbInfo?.schema_sql,
        })

        setQueryResults(p => ({
          ...p,
          [idx]: {
            success: true,
            columns: execData.columns,
            rows: execData.rows,
            rowCount: execData.row_count,
            healingInfo: {
              was_healed: true,
              original_sql: msg.sql_query,
              healed_sql: healedSql,
              diagnosis: diagData.diagnosis,
              sqlstate_code: diagData.sqlstate_code,
              error_healed: errorMsg,
            },
          },
        }))
      } else {
        alert(`SQL Doctor diagnosis: ${diagData.diagnosis || "Could not automatically repair query."}`)
      }
    } catch (err) {
      alert(`Auto-healing failed: ${err.message}`)
    } finally {
      setExecutingIndex(null)
    }
  }

  const handleExplain = async (sql, idx) => {
    setExplainingIndex(idx)
    try {
      const data = await databaseApi.explain({
        connection_uri: connectionUri || "",
        sql_query: sql,
      })
      setExplainData(data)
    } catch (err) {
      alert(`EXPLAIN failed: ${err.response?.data?.detail || err.message}`)
    } finally {
      setExplainingIndex(null)
    }
  }

  const handleSaveVerified = async (msg, idx) => {
    try {
      await memoryApi.saveVerifiedQuery({
        nl_prompt: msg.rawContent || msg.message,
        canonical_query: msg.sql_query,
        dialect: "postgresql",
        tables_used: msg.tables || [],
        tags: ["chat-verified"],
      })
      setVerifiedSaved(p => ({ ...p, [idx]: true }))
    } catch {
      setVerifiedSaved(p => ({ ...p, [idx]: true }))
    }
  }

  const handleSaveToNotebook = async (msg, idx) => {
    try {
      await memoryApi.saveNotebookQuery({
        title: msg.message ? String(msg.message).slice(0, 50) : "SQL Snippet",
        sql_query: msg.sql_query,
        dialect: "postgresql",
        tags: msg.tables || ["general"],
        notes: msg.explanation || "Saved from QueryCraft Studio",
      })
      setNotebookSaved(p => ({ ...p, [idx]: true }))
    } catch {
      setNotebookSaved(p => ({ ...p, [idx]: true }))
    }
  }

  const filteredSchema = useMemo(() => {
    const q = schemaSearch.trim().toLowerCase()
    if (!q) return schemaTables
    return schemaTables.filter(t => {
      const name = (t.table_name || t.table || "").toLowerCase()
      if (name.includes(q)) return true
      return (t.columns || []).some(c => (typeof c === "string" ? c : c.name || "").toLowerCase().includes(q))
    })
  }, [schemaTables, schemaSearch])

  const perf = explainData?.cost_guard?.performance_category
  const perfClass = perf === "fast" ? "perf-fast" : perf === "moderate" ? "perf-mod" : "perf-heavy"
  const perfLabel = perf === "fast" ? "🟢 Fast / Optimal" : perf === "moderate" ? "🟡 Moderate" : "🔴 Heavy / Slow"

  return (
    <main className="relative flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full max-w-full overflow-hidden bg-background text-foreground">

      {/* ───────────────── CHAT COLUMN ───────────────── */}
      <section className="flex flex-1 flex-col h-full min-w-0 max-w-full overflow-hidden">

        {/* ── Top Bar Header ── */}
        <header className="flex h-13 sm:h-14 shrink-0 items-center justify-between border-b border-border bg-card/85 px-3 sm:px-6 backdrop-blur-md min-w-0 max-w-full z-10 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400 shrink-0 shadow-2xs">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] sm:text-[12px] font-bold tracking-tight">Llama 3.1 70B</span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium hidden xs:inline">· Studio Engine</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[11.5px] text-muted-foreground font-medium truncate max-w-[280px]">
              <Database className="size-3.5 text-emerald-500 shrink-0" />
              <span className="truncate font-mono">
                {dbInfo ? `${dbInfo.host} (${dbInfo.tables_count} tables)` : "Demo Sandbox (5 tables)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNotebookModalOpen(true)}
              className="gap-1.5 text-xs font-semibold h-8 hidden lg:flex border-border hover:bg-muted shadow-2xs cursor-pointer"
            >
              <Bookmark className="size-3.5 text-emerald-500" />
              <span>Notebook</span>
            </Button>

            {!dbInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-1.5 text-xs font-semibold h-8 px-2.5 sm:px-3 border-border hover:bg-muted shadow-2xs cursor-pointer"
              >
                <Cloud className="size-3.5 text-emerald-500" />
                <span className="hidden xs:inline">Connect DB</span>
              </Button>
            )}

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setMessages([]); setQueryResults({}) }}
                className="gap-1.5 text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}

            <Button
              id="tour-schema-toggle"
              variant={isHelperOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsHelperOpen(p => !p)}
              className={`gap-1.5 text-xs h-8 px-2.5 sm:px-3 font-semibold border-border transition-all duration-200 shadow-2xs cursor-pointer ${
                isTourActive && currentStep === 2
                  ? "relative z-[60] ring-4 ring-emerald-500 bg-card shadow-2xl scale-105"
                  : isHelperOpen
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                    : "text-foreground hover:bg-muted"
              }`}
              title="Toggle database schema explorer"
            >
              {isHelperOpen ? <PanelRightClose className="size-3.5 text-emerald-400" /> : <PanelRightOpen className="size-3.5 text-emerald-500" />}
              <span className="hidden xs:inline">Schema Explorer</span>
            </Button>
          </div>
        </header>

        {/* ── Messages Feed ── */}
        <div className="flex-1 overflow-y-auto w-full min-w-0">
          <div className="mx-auto max-w-3.5xl px-3 sm:px-6 md:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 w-full min-w-0">

            {/* Welcome / Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center pt-3 sm:pt-8 animate-fade-up">
                
                {/* Hero Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-card px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-2xs">
                  <Database className="size-3.5 text-emerald-500" />
                  <span>PostgreSQL Safety &amp; Clarification Engine</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight px-2 max-w-2xl leading-tight">
                  {user ? `Hello ${user.displayName || "Engineer"} — what data do you need?` : "What database insights do you need?"}
                </h1>

                <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-[13.5px] text-muted-foreground leading-relaxed px-2">
                  {dbInfo ? (
                    <>
                      Grounded live on <strong className="text-foreground font-semibold">{dbInfo.host}</strong> ({dbInfo.tables_count} tables).
                      Typo-tolerant parser with automated parameter clarification before compilation.
                    </>
                  ) : (
                    "Query any database table in natural language. Missing filters and metrics are clarified interactively before compiling safe, production-grade SQL."
                  )}
                </p>

                {/* Capability Pills */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 rounded-md bg-card border border-border px-2 py-0.5 shadow-2xs">
                    <ShieldCheck className="size-3 text-emerald-500" /> Zero-Hallucination
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-card border border-border px-2 py-0.5 shadow-2xs">
                    <Check className="size-3 text-emerald-500" /> Typo-Tolerant
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-card border border-border px-2 py-0.5 shadow-2xs">
                    <Activity className="size-3 text-sky-500" /> EXPLAIN Cost Guard
                  </span>
                </div>

                {/* Bottom Guidance */}
                <div className="mt-8 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Choose a starter workflow below or type your database question</span>
                </div>
              </div>
            )}

            {/* Message Thread */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 sm:gap-4 animate-fade-up max-w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {/* Assistant Bot Avatar */}
                {msg.role === "assistant" && (
                  <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border text-emerald-500 shadow-xs mt-0.5 ring-1 ring-emerald-500/20">
                    <Bot className="size-4 sm:size-4.5" />
                  </div>
                )}

                <div className={`flex flex-col gap-1.5 min-w-0 ${msg.role === "user" ? "max-w-[90%] sm:max-w-xl items-end" : "flex-1 max-w-full"}`}>

                  {/* ── User Message Bubble ── */}
                  {msg.role === "user" && (
                    <div className="flex flex-col items-end gap-1 max-w-full">
                      <div className="flex items-center gap-1.5 px-1 max-w-full">
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {msg.userName || user?.displayName || "You"}
                        </span>
                        {(msg.userEmail || user?.email) && (
                          <span className="text-[10px] text-muted-foreground font-mono truncate hidden xs:inline">
                            ({msg.userEmail || user?.email})
                          </span>
                        )}
                      </div>
                      <div className="rounded-2xl rounded-tr-md bg-primary text-primary-foreground px-4 py-3 sm:px-5 sm:py-3.5 text-[14px] font-medium shadow-xs leading-relaxed max-w-full break-words">
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {/* ── Clarification Card ── */}
                  {msg.status === "needs_clarification" && (
                    <div className="rounded-2xl rounded-tl-md border border-amber-500/30 bg-amber-500/10 border-l-4 border-l-amber-500 p-4 sm:p-5 shadow-2xs space-y-3.5 max-w-full">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                          <HelpCircle className="size-3.5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Clarification Needed Before Execution
                        </span>
                      </div>

                      <p className="text-[13.5px] sm:text-[14px] font-semibold text-foreground leading-relaxed break-words">
                        {msg.content}
                      </p>

                      {/* Multi-Select Clarification Reply Chips */}
                      <div className="pt-2 border-t border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <HelpCircle className="size-3 text-amber-500" />
                            <span>Select Parameters to Clarify:</span>
                          </p>
                          {(selectedChips[idx]?.length || 0) > 0 && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => {
                                const selected = selectedChips[idx] || []
                                if (selected.length > 0) {
                                  handleSend(`Proceed with: ${selected.join(" AND ")}`)
                                }
                              }}
                              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>Submit ({selectedChips[idx]?.length})</span>
                              <ArrowUp className="size-3" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {generateClarificationChips(msg.content).map((chip, chipIdx) => {
                            const isSelected = (selectedChips[idx] || []).includes(chip)
                            return (
                              <button
                                key={chipIdx}
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                  if (isLoading) return
                                  setSelectedChips((prev) => {
                                    const current = prev[idx] || []
                                    const next = current.includes(chip)
                                      ? current.filter((c) => c !== chip)
                                      : [...current, chip]
                                    return { ...prev, [idx]: next }
                                  })
                                }}
                                className={`text-[11.5px] sm:text-xs font-medium px-3 py-1.5 rounded-lg border transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer select-none ${
                                  isSelected
                                    ? "bg-emerald-600 text-white border-emerald-500 font-semibold shadow-xs"
                                    : "bg-card border-amber-500/30 text-foreground hover:bg-amber-500/10"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="size-3" />
                                ) : (
                                  <span className="size-1.5 rounded-full bg-amber-500" />
                                )}
                                <span className="truncate max-w-[220px] sm:max-w-none">{chip}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Complete SQL Card ── */}
                  {msg.status === "complete" && (
                    <div className="w-full max-w-full rounded-2xl rounded-tl-md border border-border bg-card shadow-2xs overflow-hidden">

                      {/* Card Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border bg-muted/40">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3" /> Ready
                          </span>
                          {msg.matched_metrics?.length > 0 && (
                            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                              {msg.matched_metrics.join(", ")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveToNotebook(msg, idx)}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] sm:text-[11.5px] font-semibold transition-all duration-150 cursor-pointer ${
                              notebookSaved[idx]
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <Bookmark className={`size-3.5 ${notebookSaved[idx] ? "fill-emerald-500 text-emerald-500" : ""}`} />
                            <span className="hidden xs:inline">{notebookSaved[idx] ? "Saved" : "Notebook"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveVerified(msg, idx)}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] sm:text-[11.5px] font-semibold transition-all duration-150 cursor-pointer ${
                              verifiedSaved[idx]
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <Star className={`size-3.5 ${verifiedSaved[idx] ? "fill-emerald-500 text-emerald-500" : ""}`} />
                            <span className="hidden xs:inline">{verifiedSaved[idx] ? "Verified" : "Verify"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="px-4 py-3.5 sm:px-5 sm:py-4 space-y-3">
                        <p className="text-[14px] sm:text-[14.5px] font-bold text-foreground leading-snug break-words">
                          {msg.message}
                        </p>
                        {msg.explanation && (
                          <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-relaxed break-words">
                            {msg.explanation}
                          </p>
                        )}
                        {/* Progressive Details Drawer */}
                        {(msg.tables?.length > 0 || msg.matched_metrics?.length > 0) && (
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() => setExpandedDetails(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                            >
                              {expandedDetails[idx] ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                              <span>
                                {msg.tables?.length ? `Grounded in ${msg.tables.length} table${msg.tables.length > 1 ? "s" : ""}` : "Execution Details"}
                              </span>
                            </button>

                            {expandedDetails[idx] && (
                              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2.5 space-y-2 animate-in fade-in duration-100 text-xs">
                                {msg.tables?.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Catalog Tables:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {msg.tables.map(t => (
                                        <span key={t} className="font-mono text-[10.5px] rounded bg-white border border-border px-1.5 py-0.5 text-foreground font-medium">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {msg.matched_metrics?.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Matched KPI Rules:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {msg.matched_metrics.map(m => (
                                        <span key={m} className="text-[10.5px] rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-blue-800 font-medium">
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* SQL Block */}
                      {msg.sql_query && (
                        <div className="mx-3 sm:mx-5 mb-4 rounded-xl overflow-hidden border border-border shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/50 px-3.5 sm:px-4 py-2 border-b border-border">
                            <div className="flex items-center gap-2">
                              <Terminal className="size-3.5 text-emerald-500" />
                              <span className="font-mono text-[10.5px] sm:text-[11px] font-bold text-foreground">
                                SQL · PostgreSQL
                              </span>
                              {msg.risk_level && (
                                <RiskBadge level={msg.risk_level} size="sm" />
                              )}
                            </div>

                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExplain(msg.sql_query, idx)}
                                disabled={explainingIndex === idx}
                                className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                {explainingIndex === idx ? <Loader2 className="size-3 animate-spin" /> : <Activity className="size-3 text-sky-500" />}
                                <span>EXPLAIN</span>
                              </Button>

                              <Button
                                onClick={() => handleRun(msg.sql_query, idx, msg)}
                                disabled={executingIndex === idx}
                                className="h-7 px-3 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer"
                                size="sm"
                              >
                                {executingIndex === idx ? (
                                  <>
                                    <Loader2 className="size-3 animate-spin" />
                                    <span className="hidden xs:inline">Running...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="size-3 fill-current text-emerald-400" />
                                    <span>{connectionUri ? "Run on DB" : "Run Query"}</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(msg.sql_query, idx)}
                                className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="size-3 text-emerald-500" />
                                    <span className="hidden xs:inline">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3" />
                                    <span className="hidden xs:inline">Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          <pre className="overflow-x-auto px-3.5 sm:px-5 py-3.5 sm:py-4 font-mono text-[12.5px] sm:text-[13px] leading-relaxed text-emerald-700 dark:text-emerald-400 bg-muted/30 dark:bg-[#070b09] max-w-full">
                            <code>{msg.sql_query}</code>
                          </pre>
                        </div>
                      )}

                      {/* Results / DataVisualizer */}
                      {queryResults[idx] && (
                        <div className="px-3 sm:px-5 pb-4 sm:pb-5 space-y-3 overflow-hidden">
                          {queryResults[idx].healingInfo?.was_healed && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-3.5">
                              <Zap className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[12px] font-bold text-foreground">Auto-Healed by Critic Agent (SQL Doctor)</p>
                                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{queryResults[idx].healingInfo.diagnosis}</p>
                              </div>
                            </div>
                          )}

                          {queryResults[idx].success ? (
                            <DataVisualizer
                              columns={queryResults[idx].columns}
                              rows={queryResults[idx].rows}
                              visualIntent={msg.visual_intent}
                              title={msg.message}
                            />
                          ) : (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 sm:p-4 text-xs sm:text-[13px] text-destructive space-y-2.5">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-destructive">Database Execution Notice</p>
                                  <p className="text-destructive text-xs mt-0.5 leading-relaxed">{queryResults[idx].error}</p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-destructive/20 flex flex-wrap items-center justify-between gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={executingIndex === idx}
                                  onClick={() => handleAutoHeal(msg, idx, queryResults[idx].error)}
                                  className="h-7 px-3 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  {executingIndex === idx ? (
                                    <>
                                      <Loader2 className="size-3 animate-spin text-emerald-400" />
                                      <span>Healing Query…</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="size-3 text-emerald-400" />
                                      <span>Auto-Fix with SQL Doctor</span>
                                    </>
                                  )}
                                </Button>

                                {queryResults[idx].canFallbackToSandbox && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleRun(msg.sql_query, idx, msg, true)}
                                    className="h-7 px-2.5 text-[11px] font-semibold bg-card border border-border hover:bg-muted text-foreground shadow-2xs cursor-pointer"
                                  >
                                    Run in Demo Sandbox
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Card */}
                  {msg.status === "error" && (
                    <div className="rounded-2xl rounded-tl-md border border-red-200 bg-red-50 p-3.5 sm:p-4 text-xs sm:text-[13px] text-red-800 shadow-2xs">
                      {msg.content}
                    </div>
                  )}

                  <div className={`text-[10px] sm:text-[11px] text-[#8ea396] font-medium px-1 ${msg.role === "user" ? "text-right" : ""}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div
                    className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#111c16] text-[#5de08a] shadow-xs mt-0.5 font-bold text-[10.5px] sm:text-xs ring-1 ring-emerald-500/20"
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

            {/* LangGraph Streaming Multi-Agent Status Indicator */}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 animate-fade-up">
                <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border text-emerald-600">
                  <Bot className="size-4 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-md border border-border bg-card p-3 sm:p-4 text-xs shadow-2xs space-y-2 max-w-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-1.5">
                    <span className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider">
                      LangGraph Multi-Agent Pipeline
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      agentStage === 1
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-semibold"
                        : agentStage > 1
                        ? "text-muted-foreground line-through opacity-70"
                        : "text-muted-foreground"
                    }`}>
                      {agentStage === 1 && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      01. Planner
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      agentStage === 2
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-semibold"
                        : agentStage > 2
                        ? "text-muted-foreground line-through opacity-70"
                        : "text-muted-foreground"
                    }`}>
                      {agentStage === 2 && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      02. SQL Worker
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      agentStage === 3
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-semibold"
                        : "text-muted-foreground"
                    }`}>
                      {agentStage === 3 && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      03. Critic Doctor
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {agentStage === 1 && "Supervisor decomposing prompt & introspecting catalog..."}
                    {agentStage === 2 && "Synthesizing schema-grounded SQL query with safe LIMIT..."}
                    {agentStage === 3 && "Running critic safety checks & EXPLAIN cost guard..."}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─────── Floating Input Dock ─────── */}
        <div className="shrink-0 px-3 sm:px-6 md:px-8 pb-3.5 sm:pb-5">
          <div className="mx-auto max-w-3.5xl space-y-2">
            
            {/* Compact Horizontal Starter Pills */}
            <div id="tour-starter-prompts" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
                <Sparkles className="size-3 text-amber-500" />
                <span>Starters:</span>
              </span>
              {STARTER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isLoading}
                  onClick={() => !isLoading && (p.isCanvas ? router.push(`/Dashboard/canvas`) : handleSend(p.text))}
                  className="shrink-0 rounded-full border border-border bg-card hover:bg-muted hover:border-border-hover px-2.5 py-1 text-[11.5px] font-medium text-foreground transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>{p.text}</span>
                </button>
              ))}
            </div>

            <div className="relative rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-lg focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                rows={1}
                placeholder="Ask a data question (e.g., 'give me top customers by spend' or 'show monthly revenue trend')…"
                className="w-full resize-none bg-transparent px-4 sm:px-5 pt-3.5 sm:pt-4 pb-2 text-[14px] sm:text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground/60 max-h-40 sm:max-h-52 leading-relaxed"
              />

              <div className="flex items-center justify-between px-3 sm:px-4 pb-2.5 pt-1 border-t border-border/60">
                <div className="flex items-center gap-2 text-[10.5px] sm:text-[11.5px] text-muted-foreground">
                  <span className="hidden sm:inline">Enter to send</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden md:inline">Shift+Enter for newline</span>
                  <span className="hidden md:inline">·</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="size-3.5" />
                    Schema-Grounded &amp; Typo-Tolerant
                  </span>
                </div>

                <Button
                  type="button"
                  disabled={!inputText.trim() || isLoading}
                  onClick={() => handleSend()}
                  className="size-8 sm:size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs disabled:opacity-30 transition-all shrink-0 cursor-pointer"
                  size="icon"
                >
                  <ArrowUp className="size-4 text-emerald-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SCHEMA PANEL (Responsive Drawer on Mobile, Sidebar on Desktop) ───────────────── */}
      {isHelperOpen && (
        <>
          {/* Backdrop on mobile/tablet */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
            onClick={() => setIsHelperOpen(false)}
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-84 max-w-[88vw] border-l border-border bg-card flex flex-col h-full shadow-2xl lg:shadow-none lg:static lg:w-80 lg:z-auto lg:shrink-0 animate-fade-in">
            <div className="px-4 py-3.5 border-b border-border bg-muted/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7.5 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Database className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-foreground leading-none">Schema Explorer</p>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate font-mono">
                      {dbInfo ? `${dbInfo.host}` : "Demo Schema"} · {filteredSchema.length} tables
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const allCollapsed = filteredSchema.every(t => collapsed[t.table_name])
                      const next = {}
                      filteredSchema.forEach(t => { next[t.table_name] = !allCollapsed })
                      setCollapsed(next)
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors px-1 cursor-pointer"
                  >
                    {filteredSchema.every(t => collapsed[t.table_name]) ? "Expand All" : "Collapse All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHelperOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
                    title="Close Schema Explorer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={schemaSearch}
                  onChange={e => setSchemaSearch(e.target.value)}
                  placeholder="Filter tables or columns…"
                  className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-ring transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredSchema.length === 0 && (
                <p className="text-center py-8 text-[12px] text-muted-foreground">No matching tables in schema</p>
              )}
              {filteredSchema.map(t => {
                const name = t.table_name || t.table
                const isCollapsed = !!collapsed[name]
                return (
                  <div key={name} className="group/row rounded-xl border border-border bg-card overflow-hidden shadow-2xs transition-all duration-150 hover:border-border-hover">
                    <div className="flex items-center justify-between px-3 py-2.5 bg-muted/40 border-b border-border">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(name)}
                        className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <Columns className="size-3.5 text-emerald-500 shrink-0" />
                        <span className="font-mono text-[12px] font-bold text-foreground truncate">{name}</span>
                        <span className="rounded bg-muted border border-border px-1.5 py-0.2 text-[9px] font-bold text-muted-foreground shrink-0">
                          {(t.columns || []).length}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setProfileTable(name); }}
                          title="View sample preview & distributions"
                          className="flex items-center gap-1 rounded-md bg-card border border-border px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Eye className="size-2.5" />
                          <span>Sample</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCollapse(name)}
                          className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {isCollapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="divide-y divide-border/60">
                        {t.description && (
                          <p className="px-3 py-1.5 text-[10.5px] text-muted-foreground italic bg-muted/20">{t.description}</p>
                        )}
                        {(t.columns || []).map((col, ci) => {
                          const colName = typeof col === "string" ? col : col.name
                          const colType = typeof col === "string" ? "TEXT" : col.type
                          return (
                            <div key={ci} className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/40 transition-colors">
                              <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-foreground truncate max-w-[150px]">
                                {col?.is_primary_key && <Key className="size-2.5 text-amber-500 shrink-0" title="Primary Key" />}
                                {col?.is_foreign_key && <span className="text-[9px] text-sky-500 font-bold shrink-0" title="Foreign Key">FK</span>}
                                <span className="truncate">{colName}</span>
                              </span>
                              <span className="text-[9.5px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0">
                                {colType}
                              </span>
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
        </>
      )}

      {/* ─── EXPLAIN Modal ─── */}
      {explainData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Activity className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-foreground">EXPLAIN Cost Guard</h3>
                  <p className="text-[11.5px] text-muted-foreground">PostgreSQL Execution Planner</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setExplainData(null)} className="size-8 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div className={`p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between ${perfClass}`}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Category</p>
                  <p className="text-[13px] font-bold mt-0.5 text-foreground">{perfLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Est. Cost</p>
                  <p className="text-[14px] font-mono font-extrabold mt-0.5 text-foreground">{explainData?.cost_guard?.total_estimated_cost ?? "N/A"}</p>
                </div>
              </div>

              {explainData?.cost_guard?.sequential_scans?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span>Sequential Scan Warning</span>
                  </div>
                  <p className="leading-relaxed">
                    Tables scanned sequentially: <span className="font-mono font-bold">{explainData.cost_guard.sequential_scans.join(", ")}</span>.
                  </p>
                </div>
              )}

              {explainData?.index_recommendations?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Index Advisor Recommendation</p>
                  {explainData.index_recommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-muted/40 border border-border font-mono text-[11px] text-foreground flex items-center justify-between gap-2">
                      <code className="truncate text-emerald-600 dark:text-emerald-400">{rec.ddl}</code>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(rec.ddl)
                          setCopiedIndexRec(true)
                          setTimeout(() => setCopiedIndexRec(false), 1500)
                        }}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0 hover:underline cursor-pointer"
                      >
                        {copiedIndexRec ? "Copied" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <Button size="sm" onClick={() => setExplainData(null)} className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Query Notebook Modal */}
      <QueryNotebookModal isOpen={isNotebookModalOpen} onClose={() => setIsNotebookModalOpen(false)} />

      {/* Table Data Profiler Modal */}
      {profileTable && (
        <TableDataProfilerModal
          isOpen={!!profileTable}
          onClose={() => setProfileTable(null)}
          tableName={profileTable}
          columns={schemaTables.find(t => (t.table_name || t.table) === profileTable)?.columns || []}
        />
      )}
    </main>
  )
}