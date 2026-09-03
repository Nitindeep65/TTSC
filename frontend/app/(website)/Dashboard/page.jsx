"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code2,
  Copy,
  Database,
  Download,
  Eye,
  HelpCircle,
  Loader2,
  MessageSquareText,
  Play,
  Plus,
  Table2,
  Terminal,
  X,
  Zap,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"
import { clarificationApi, databaseApi } from "@/lib/api"
import { generateClarificationChips } from "@/lib/serverLlm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskBadge, RiskBanner } from "@/components/guard/RiskBadge"

const COMPILER_STARTERS = [
  "Show monthly revenue for the last 6 months",
  "Top 5 customers by total spend",
  "List active users who signed up this month",
  "Calculate average order value by product category",
]

export default function CompilerPage() {
  const { dbInfo, connectionUri, setIsModalOpen, executeLiveQuery } = useDatabase()
  const { user } = useAuth()

  // Persistent Multi-Tab Workspace
  const [tabs, setTabs] = useState([
    {
      id: "tab-1",
      name: "Query 1",
      prompt: "",
      sqlQuery: "",
      editedSql: "",
      liveResult: null,
      hasResult: false,
      apiResponse: null,
      errorMessage: "",
      explainPlan: null,
    },
  ])
  const [activeTabId, setActiveTabId] = useState("tab-1")

  const [prompt, setPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  // SQL & Results
  const [sqlQuery, setSqlQuery] = useState("")
  const [isEditingSql, setIsEditingSql] = useState(false)
  const [editedSql, setEditedSql] = useState("")
  const [resultMode, setResultMode] = useState("table") // "table" | "safety" | "json"
  const [liveResult, setLiveResult] = useState(null)
  const [isExecutingLive, setIsExecutingLive] = useState(false)

  // Progressive Telemetry
  const [showTelemetry, setShowTelemetry] = useState(false)
  const [explainPlan, setExplainPlan] = useState(null)
  const [isExplaining, setIsExplaining] = useState(false)

  // Draggable Column Widths
  const [columnWidths, setColumnWidths] = useState({})
  const [copiedCell, setCopiedCell] = useState(null)

  const handleCopyCell = (e, val, key) => {
    e.stopPropagation()
    if (val === null || val === undefined) return
    navigator.clipboard.writeText(String(val))
    setCopiedCell(key)
    setTimeout(() => setCopiedCell(null), 1500)
  }

  const handleResizeStart = (e, col) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const thElement = e.target.parentElement
    const initialWidth = columnWidths[col] || thElement.offsetWidth
    const onMouseMove = (moveEvent) => {
      const diff = moveEvent.clientX - startX
      setColumnWidths((prev) => ({
        ...prev,
        [col]: Math.max(70, initialWidth + diff),
      }))
    }
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  // Tab management helpers
  const switchTab = (targetId) => {
    if (targetId === activeTabId) return
    // Save current active state into tabs array
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              prompt,
              sqlQuery,
              editedSql,
              liveResult,
              hasResult,
              apiResponse,
              errorMessage,
              explainPlan,
            }
          : t
      )
    )
    // Load target tab state
    const target = tabs.find((t) => t.id === targetId)
    if (target) {
      setPrompt(target.prompt || "")
      setSqlQuery(target.sqlQuery || "")
      setEditedSql(target.editedSql || target.sqlQuery || "")
      setLiveResult(target.liveResult || null)
      setHasResult(target.hasResult || false)
      setApiResponse(target.apiResponse || null)
      setErrorMessage(target.errorMessage || "")
      setExplainPlan(target.explainPlan || null)
      setIsEditingSql(false)
    }
    setActiveTabId(targetId)
  }

  const addNewTab = () => {
    // Save current state first
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              prompt,
              sqlQuery,
              editedSql,
              liveResult,
              hasResult,
              apiResponse,
              errorMessage,
              explainPlan,
            }
          : t
      )
    )
    const newId = `tab-${Date.now()}`
    const newName = `Query ${tabs.length + 1}`
    const newTab = {
      id: newId,
      name: newName,
      prompt: "",
      sqlQuery: "",
      editedSql: "",
      liveResult: null,
      hasResult: false,
      apiResponse: null,
      errorMessage: "",
      explainPlan: null,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newId)
    setPrompt("")
    setSqlQuery("")
    setEditedSql("")
    setLiveResult(null)
    setHasResult(false)
    setApiResponse(null)
    setErrorMessage("")
    setExplainPlan(null)
    setIsEditingSql(false)
  }

  const closeTab = (tabId) => {
    if (tabs.length <= 1) return
    const remaining = tabs.filter((t) => t.id !== tabId)
    setTabs(remaining)
    if (activeTabId === tabId) {
      const nextTab = remaining[remaining.length - 1]
      setActiveTabId(nextTab.id)
      setPrompt(nextTab.prompt || "")
      setSqlQuery(nextTab.sqlQuery || "")
      setEditedSql(nextTab.editedSql || "")
      setLiveResult(nextTab.liveResult || null)
      setHasResult(nextTab.hasResult || false)
      setApiResponse(nextTab.apiResponse || null)
      setErrorMessage(nextTab.errorMessage || "")
      setExplainPlan(nextTab.explainPlan || null)
    }
  }

  const handleCompileAndExecute = async (customPrompt, executeAfterCompile = true) => {
    const text = typeof customPrompt === "string" ? customPrompt : prompt
    if (!text.trim() || isProcessing) return

    if (typeof customPrompt === "string") {
      setPrompt(customPrompt)
    }

    setIsProcessing(true)
    setHasResult(false)
    setErrorMessage("")
    setLiveResult(null)
    setExplainPlan(null)
    setIsEditingSql(false)

    try {
      const payload = {
        user_prompt: text.trim(),
        session_history: [],
        user_id: user?.uid || "guest",
        user_email: user?.email || "demo@querycraft.dev",
      }

      if (dbInfo?.schema_sql) {
        payload.live_schema = dbInfo.schema_sql
      }
      if (connectionUri) {
        payload.connection_uri = connectionUri
      }

      const compileData = await clarificationApi.compileQuery(payload)
      setApiResponse(compileData)
      setHasResult(true)

      const generatedSql = compileData?.extracted_data?.sql_query || ""
      setSqlQuery(generatedSql)
      setEditedSql(generatedSql)

      // If compilation succeeded and execute is requested, run immediately!
      if (executeAfterCompile && generatedSql && compileData.status === "complete") {
        await executeQuery(generatedSql)
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || error.message || "Failed to compile query. Ensure backend or serverless engine is online."
      )
      setHasResult(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const executeQuery = async (queryToRun) => {
    setIsExecutingLive(true)
    try {
      if (connectionUri) {
        const result = await executeLiveQuery(queryToRun)
        setLiveResult({
          success: true,
          columns: result.columns || [],
          rows: result.rows || [],
          rowCount: result.row_count || (result.rows ? result.rows.length : 0),
          executionTimeMs: result.execution_time_ms || 24,
        })
      } else {
        // Safe internal demo sandbox mock rows when no live DB is connected
        setLiveResult({
          success: true,
          columns: ["id", "entity_name", "metric_value", "status"],
          rows: [
            { id: "101", entity_name: "Enterprise Account Alpha", metric_value: 48900, status: "completed" },
            { id: "102", entity_name: "Mid-Market Beta", metric_value: 24200, status: "completed" },
            { id: "103", entity_name: "Growth Tier Gamma", metric_value: 18500, status: "completed" },
            { id: "104", entity_name: "Starter Tier Delta", metric_value: 9400, status: "processing" },
          ],
          rowCount: 4,
          isSandbox: true,
          executionTimeMs: 16,
        })
      }
    } catch (err) {
      setLiveResult({
        success: false,
        error: err.response?.data?.detail || err.message,
      })
    } finally {
      setIsExecutingLive(false)
    }
  }

  const handleCopy = async (text) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1800)
  }

  const [isCopiedRows, setIsCopiedRows] = useState(false)
  const handleCopyRows = async () => {
    if (!liveResult?.rows || liveResult.rows.length === 0) return
    const text = JSON.stringify(liveResult.rows, null, 2)
    await navigator.clipboard.writeText(text)
    setIsCopiedRows(true)
    setTimeout(() => setIsCopiedRows(false), 1800)
  }

  const handleExportCsv = () => {
    if (!liveResult?.rows || liveResult.rows.length === 0) return
    const cols = liveResult.columns || Object.keys(liveResult.rows[0] || {})
    const header = cols.join(",")
    const body = liveResult.rows
      .map((r) =>
        cols
          .map((c) => {
            const val = r[c] === null ? "" : String(r[c])
            return val.includes(",") || val.includes('"') || val.includes("\n")
              ? `"${val.replace(/"/g, '""')}"`
              : val
          })
          .join(",")
      )
      .join("\n")
    const csvContent = `${header}\n${body}`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `querycraft_results_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatSql = () => {
    const target = isEditingSql ? editedSql : sqlQuery
    if (!target) return
    const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON", "GROUP BY", "ORDER BY", "LIMIT", "HAVING", "AND", "OR", "AS"]
    let formatted = target
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi")
      formatted = formatted.replace(regex, kw)
    })
    if (isEditingSql) {
      setEditedSql(formatted)
    } else {
      setSqlQuery(formatted)
    }
  }

  const handleExplain = async () => {
    if (!sqlQuery || isExplaining) return
    setIsExplaining(true)
    try {
      const plan = await databaseApi.explain({ sql_query: sqlQuery, connection_uri: connectionUri || "" })
      setExplainPlan(plan)
      setResultMode("safety")
      setShowTelemetry(true)
    } catch (err) {
      setExplainPlan({ error: err.message || "Explain plan requires active PostgreSQL connection." })
      setShowTelemetry(true)
    } finally {
      setIsExplaining(false)
    }
  }

  const extractedData = apiResponse?.extracted_data

  return (
    <main className="flex-1 bg-background text-foreground w-full max-w-full overflow-x-hidden min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* ── Header: Title & Context ── */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
                <Terminal className="size-4 text-emerald-400" />
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Compiler
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {dbInfo
                ? `Grounded in live database schema on ${dbInfo.host} (${dbInfo.tables_count} tables).`
                : "Type in plain English to compile read-only SQL and inspect live results."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!dbInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-1.5 text-xs border-border hover:bg-muted"
              >
                <Cloud className="size-3.5 text-emerald-600" />
                <span>Connect Database</span>
              </Button>
            )}

            <Link href="/Dashboard/chat">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                <MessageSquareText className="size-3.5" />
                <span>Open Chat Studio</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* ── MULTI-TAB WORKSPACE TABS BAR ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer select-none ${
                    isActive
                      ? "bg-card text-foreground shadow-2xs border border-border font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
                  }`}
                >
                  <Terminal className={`size-3 ${isActive ? "text-emerald-600" : "text-muted-foreground"}`} />
                  <span>{tab.name}</span>
                  {tabs.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tab.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition p-0.5 rounded ml-0.5"
                      title="Close tab"
                    >
                      <X className="size-2.5" />
                    </span>
                  )}
                </button>
              )
            })}

            {/* + New Tab button */}
            <button
              type="button"
              onClick={addNewTab}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition cursor-pointer font-medium"
              title="Open New Query Tab"
            >
              <Plus className="size-3 text-emerald-600" />
              <span className="text-[11px]">New Tab</span>
            </button>
          </div>
        </div>

        {/* ── ZONE 1: INPUT & ACTIONS (HERO QUERY COMPOSER) ── */}
        <section className="composer-hero p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-xs">Query Composer</span>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {dbInfo ? `${dbInfo.db_type ? dbInfo.db_type.toUpperCase() : "POSTGRESQL"} · ${dbInfo.tables_count} tables` : "Sandbox Mode"}
              </span>
            </div>
            {dbInfo ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Schema Grounded
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] text-emerald-600 hover:underline font-semibold"
              >
                + Connect Live Database
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              id="compiler-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 600))}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault()
                  handleCompileAndExecute()
                }
              }}
              placeholder="Ask your database in plain English... (e.g. 'Show monthly completed order revenue for the last 6 months')"
              rows={3}
              className="w-full resize-none rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs sm:text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring leading-relaxed font-normal"
            />
          </div>

          {/* Action Row & Shortcut Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
            {/* Starter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Try:
              </span>
              {COMPILER_STARTERS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCompileAndExecute(starter, true)}
                  disabled={isProcessing}
                  className="rounded-lg border border-border bg-muted/40 hover:bg-muted hover:border-border-hover px-2.5 py-1 text-[11.5px] text-muted-foreground hover:text-foreground transition font-medium cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!prompt.trim() || isProcessing}
                onClick={() => handleCompileAndExecute(null, false)}
                className="h-8 px-3 text-xs font-semibold border-border hover:bg-muted rounded-xl"
                title="Compile SQL without executing on database"
              >
                <span>Compile Only</span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={!prompt.trim() || isProcessing}
                onClick={() => handleCompileAndExecute(null, true)}
                className="h-8 px-4 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer rounded-xl"
                title="Compile SQL and execute immediately (⌘Enter)"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3 text-emerald-400" />
                    <span>Compile &amp; Execute</span>
                    <kbd className="hidden sm:inline-block font-mono text-[9px] text-primary-foreground/70 bg-white/10 px-1 py-0.2 rounded ml-1">
                      ⌘↵
                    </kbd>
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* ── ZONE 2: GENERATED QUERY & ZONE 3: RESULTS ── */}
        <section aria-live="polite" className="space-y-5">
          {/* Processing State: Multi-Agent Telemetry Pipeline */}
          {isProcessing && (
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center gap-4 text-center shadow-xs">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-foreground font-mono">QueryCraft Agent Orchestration</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[11.5px] font-mono text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  1. Schema Introspection
                </span>
                <span className="text-border hidden sm:inline">→</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  2. AST Generation
                </span>
                <span className="text-border hidden sm:inline">→</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                  3. Cost Guard Check
                </span>
                <span className="text-border hidden sm:inline">→</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                  4. Safe Execution
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-md">
                Grounding against {dbInfo?.tables_count || 12} live tables · Enforcing read-only sandbox &amp; LIMIT 50
              </p>
            </div>
          )}

          {/* Error State */}
          {!isProcessing && errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300 shadow-2xs space-y-1">
              <p className="text-xs font-bold font-mono">Query Compilation Notice</p>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Empty State */}
          {!isProcessing && !hasResult && !errorMessage && (
            <div className="rounded-xl border border-border/80 bg-card p-10 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mb-3">
                <Database className="size-5 text-emerald-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Workspace Ready</h2>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                Enter a question in plain English or select a preset starter above to compile, inspect safety metrics, and execute live against your database.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="size-3" /> Read-Only Safe
                </span>
                <span>·</span>
                <span>LIMIT 50 Guard</span>
                <span>·</span>
                <span>EXPLAIN Telemetry</span>
              </div>
            </div>
          )}

          {/* Completed State */}
          {!isProcessing && hasResult && apiResponse && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Needs Clarification Prompt — Diagnostic Interactive Experience */}
              {apiResponse.status === "needs_clarification" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <HelpCircle className="size-4 text-amber-600 dark:text-amber-400" />
                      <span>Clarification Required Before Safe Compilation</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded font-semibold text-amber-700 dark:text-amber-300">
                      Pausing Execution
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">{apiResponse.message}</p>
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10.5px] font-mono text-muted-foreground uppercase tracking-wider">
                      Tap a resolution to proceed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generateClarificationChips(apiResponse.message).map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCompileAndExecute(`${prompt} — ${chip}`, true)}
                          className="rounded-lg border border-amber-500/30 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-emerald-500 hover:text-emerald-600 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{chip}</span>
                          <ArrowRight className="size-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Generated SQL Code Surface */}
              {sqlQuery && (
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                  {/* SQL Toolbar */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <Code2 className="size-3.5 text-emerald-600" />
                      <span className="text-xs font-mono font-bold text-foreground">
                        {dbInfo?.db_type ? dbInfo.db_type.toUpperCase() : "POSTGRESQL"} (Read-Only)
                      </span>
                      <span className="text-[9.5px] font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold">
                        LIMIT 50 ENFORCED
                      </span>
                      {(apiResponse?.risk_level || explainPlan?.risk_level) && (
                        <RiskBadge level={explainPlan?.risk_level || apiResponse?.risk_level} size="sm" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingSql(!isEditingSql)}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        {isEditingSql ? "Cancel Edit" : "Edit SQL"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isExplaining}
                        onClick={handleExplain}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                        title="Run EXPLAIN cost inspection on query"
                      >
                        {isExplaining ? <Loader2 className="size-3 animate-spin" /> : <Eye className="size-3" />}
                        <span>Explain</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatSql}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                        title="Format and standardize SQL keywords"
                      >
                        Format
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(isEditingSql ? editedSql : sqlQuery)}
                        className="h-7 px-2 text-[11px] gap-1 border-border hover:bg-muted"
                      >
                        {isCopied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                        <span>{isCopied ? "Copied" : "Copy SQL"}</span>
                      </Button>

                      {isEditingSql && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setSqlQuery(editedSql)
                            setIsEditingSql(false)
                            executeQuery(editedSql)
                          }}
                          className="h-7 px-2.5 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Run Edited
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Code Block / Editable Textarea */}
                  {isEditingSql ? (
                    <textarea
                      value={editedSql}
                      onChange={(e) => setEditedSql(e.target.value)}
                      rows={6}
                      className="w-full bg-muted/30 dark:bg-[#070b09] p-4 font-mono text-xs text-foreground outline-none leading-relaxed"
                    />
                  ) : (
                    <pre className="overflow-x-auto bg-muted/30 dark:bg-[#070b09] p-4 font-mono text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      <code>{sqlQuery}</code>
                    </pre>
                  )}
                </div>
              )}

              {/* Execution Results View */}
              {liveResult && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs">
                  {/* Results Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Table2 className="size-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-foreground">
                        {liveResult.isSandbox ? "Demo Sandbox Results" : "Live Database Execution"}
                      </span>
                      {liveResult.rowCount !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                            ({liveResult.rowCount} rows · {liveResult.executionTimeMs}ms)
                          </span>
                          <RiskBadge level={explainPlan?.risk_level || apiResponse?.risk_level || "LOW"} size="sm" />
                        </div>
                      )}
                    </div>

                    {/* Result Actions & View Switcher */}
                    <div className="flex items-center gap-2">
                      {liveResult.success && liveResult.rows?.length > 0 && resultMode === "table" && (
                        <div className="flex items-center gap-1 mr-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyRows}
                            className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Copy table data as JSON"
                          >
                            {isCopiedRows ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                            <span>{isCopiedRows ? "Copied" : "Copy"}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportCsv}
                            className="h-7 px-2 text-[11px] gap-1 border-border hover:bg-muted cursor-pointer"
                            title="Download results as CSV spreadsheet"
                          >
                            <Download className="size-3 text-emerald-600" />
                            <span>Export CSV</span>
                          </Button>
                        </div>
                      )}

                      {/* Result Presentation Switcher */}
                      <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setResultMode("table")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                            resultMode === "table"
                              ? "bg-card text-foreground shadow-2xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Table
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResultMode("safety")
                            if (!explainPlan) handleExplain()
                          }}
                          className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                            resultMode === "safety"
                              ? "bg-card text-foreground shadow-2xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Safety &amp; Plan
                        </button>

                        <button
                          type="button"
                          onClick={() => setResultMode("json")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                            resultMode === "json"
                              ? "bg-card text-foreground shadow-2xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          JSON
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Result Body */}
                  {liveResult.success ? (
                    <>
                      {/* Table View */}
                      {resultMode === "table" && (
                        liveResult.rows?.length > 0 ? (
                          <div className="max-h-80 overflow-auto rounded-lg border border-border">
                            <table className="w-full text-left font-mono text-xs border-collapse">
                              <thead className="sticky top-0 bg-muted/80 text-foreground z-10 backdrop-blur-xs">
                                <tr>
                                  {liveResult.columns.map((col) => (
                                    <th
                                      key={col}
                                      style={{ width: columnWidths[col] ? `${columnWidths[col]}px` : undefined }}
                                      className="relative p-2.5 font-semibold border-b border-border select-none"
                                    >
                                      <div className="flex items-center justify-between pr-2 truncate">
                                        <span className="truncate">{col}</span>
                                      </div>
                                      {/* Draggable resize handle */}
                                      <div
                                        onMouseDown={(e) => handleResizeStart(e, col)}
                                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500 transition-colors"
                                        title="Drag to resize column width"
                                      />
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/60">
                                {liveResult.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                                    {liveResult.columns.map((col) => {
                                      const cellVal = row[col]
                                      const cellKey = `${rIdx}-${col}`
                                      const isNum = typeof cellVal === "number" || (!isNaN(cellVal) && !isNaN(parseFloat(cellVal)) && isFinite(cellVal) && cellVal !== "")
                                      return (
                                        <td
                                          key={col}
                                          onClick={(e) => handleCopyCell(e, cellVal, cellKey)}
                                          title="Click to copy cell value"
                                          className={`p-2.5 text-foreground whitespace-nowrap cursor-pointer transition-colors ${
                                            isNum ? "text-right font-mono" : ""
                                          }`}
                                        >
                                          {cellVal === null || cellVal === undefined ? (
                                            <span className="italic text-muted-foreground/60 text-[10px] uppercase font-bold bg-muted/60 px-1 py-0.5 rounded">
                                              null
                                            </span>
                                          ) : (
                                            <span className="relative">
                                              {String(cellVal)}
                                              {copiedCell === cellKey && (
                                                <span className="ml-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                                  ✓
                                                </span>
                                              )}
                                            </span>
                                          )}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic py-3">
                            Query executed successfully. 0 rows returned.
                          </p>
                        )
                      )}

                      {/* Safety & EXPLAIN Analysis View */}
                      {resultMode === "safety" && (
                        <div className="pt-2 space-y-3">
                          {explainPlan ? (
                            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="size-4 text-emerald-600" />
                                  <span className="font-semibold text-xs text-foreground">PostgreSQL EXPLAIN Pre-Flight Analysis</span>
                                </div>
                                <RiskBadge level={explainPlan.risk_level || "LOW"} showDetails={false} />
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                                <div className="rounded-md border border-border bg-card p-2">
                                  <span className="text-[10px] text-muted-foreground uppercase">Estimated Cost</span>
                                  <p className="font-bold text-foreground text-sm">{explainPlan.total_cost ?? "N/A"}</p>
                                </div>
                                <div className="rounded-md border border-border bg-card p-2">
                                  <span className="text-[10px] text-muted-foreground uppercase">Scan Method</span>
                                  <p className={`font-bold text-sm ${explainPlan.has_seq_scan ? "text-amber-500" : "text-emerald-500"}`}>
                                    {explainPlan.has_seq_scan ? "Seq Scan" : "Index Scan"}
                                  </p>
                                </div>
                                <div className="rounded-md border border-border bg-card p-2">
                                  <span className="text-[10px] text-muted-foreground uppercase">Plan Rows</span>
                                  <p className="font-bold text-foreground text-sm">{explainPlan.plan_rows ?? "N/A"}</p>
                                </div>
                                <div className="rounded-md border border-border bg-card p-2">
                                  <span className="text-[10px] text-muted-foreground uppercase">Rating</span>
                                  <p className="font-bold text-foreground text-sm capitalize">{explainPlan.performance_rating || "Fast"}</p>
                                </div>
                              </div>

                              {explainPlan.index_recommendations?.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[11px] font-semibold text-foreground">Recommended Index DDL:</span>
                                  {explainPlan.index_recommendations.map((idx, i) => (
                                    <pre key={i} className="overflow-x-auto rounded-lg border border-border bg-muted/30 dark:bg-[#070b09] p-2.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                                      <code>{idx}</code>
                                    </pre>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground text-xs">
                              <p>No EXPLAIN plan loaded yet. Click <strong>Explain</strong> above to analyze cost and indexes.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Raw JSON View */}
                      {resultMode === "json" && (
                        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 dark:bg-[#070b09] p-4 font-mono text-xs text-foreground leading-relaxed max-h-72">
                          <code>{JSON.stringify(liveResult.rows, null, 2)}</code>
                        </pre>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                      <strong>Execution Error:</strong> {liveResult.error}
                    </div>
                  )}
                </div>
              )}

              {/* ── Progressive Telemetry Drawer ── */}
              <div className="rounded-xl border border-border bg-card p-3 space-y-2 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setShowTelemetry(!showTelemetry)}
                  className="flex items-center justify-between w-full font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="size-3.5 text-emerald-600" />
                    <span>Query Execution Details &amp; Grounding</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>{showTelemetry ? "Hide" : "Expand"}</span>
                    {showTelemetry ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  </div>
                </button>

                {showTelemetry && (
                  <div className="pt-2 border-t border-border space-y-3 animate-in fade-in duration-100">
                    {/* Referenced Tables */}
                    {extractedData?.tables_identified?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Grounded Catalog Tables:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {extractedData.tables_identified.map((tbl) => (
                            <span
                              key={tbl}
                              className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground"
                            >
                              {tbl}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Query Explanation */}
                    {extractedData?.explanation && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          AI Compiler Synthesis:
                        </span>
                        <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                          {extractedData.explanation}
                        </p>
                      </div>
                    )}

                    {/* EXPLAIN Cost Output */}
                    {explainPlan && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          EXPLAIN Cost Planner:
                        </span>
                        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 dark:bg-[#070b09] p-3 font-mono text-[11px] text-foreground mt-1">
                          <code>{JSON.stringify(explainPlan, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

      </div>
    </main>
  )
}