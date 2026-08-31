"use client"

import React, { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Activity,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Database,
  Flame,
  CheckCircle2,
} from "lucide-react"

const PRESET_QUERIES = [
  {
    name: "Cartesian Trap (users × audit_logs)",
    sql: "SELECT u.email, a.action FROM users u, audit_logs a WHERE u.email = 'user_5@example.com';",
  },
  {
    name: "Unindexed Scan (500k audit_logs)",
    sql: "SELECT COUNT(*) FROM audit_logs WHERE action = 'data_export';",
  },
  {
    name: "Unindexed Full Seq Scan",
    sql: "SELECT * FROM orders WHERE status = 'shipped' AND total_amount > 500.00 ORDER BY created_at DESC;",
  },
  {
    name: "Unbounded Cartesian Join",
    sql: "SELECT u.name, o.id, i.quantity FROM users u, orders o, order_items i WHERE u.id = o.user_id;",
  },
]

export default function CostGuardDashboard() {
  const [rawSql, setRawSql] = useState(PRESET_QUERIES[0].sql)
  const [copied, setCopied] = useState(false)
  const [showPlanJson, setShowPlanJson] = useState(false)
  const [costThreshold, setCostThreshold] = useState(150.0)

  // TanStack Query Mutation
  const guardMutation = useMutation({
    mutationFn: async (sql) => {
      const response = await axios.post("/api/v1/guard", {
        sql_query: sql,
        cost_threshold: Number(costThreshold) || 150.0,
      })
      return response.data
    },
  })

  const result = guardMutation.data
  const isLoading = guardMutation.isPending
  const isError = guardMutation.isError

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Keyboard shortcut: Cmd+Enter / Ctrl+Enter to trigger guard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (rawSql.trim() && !isLoading) {
          guardMutation.mutate(rawSql)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [rawSql, isLoading, guardMutation])

  return (
    <div className="w-full flex flex-col gap-6 text-[#e3ebe6]">
      {/* ── TOP BANNER & TELEMETRY BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-950/30">
            <Zap className="size-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Pre-Flight Cost Guard <span className="text-emerald-500 font-mono text-sm">(AI Firewall)</span>
              </h2>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald-500 tracking-wider">
                AST Plan Guard
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deterministic EXPLAIN AST Evaluation &amp; Autonomous LLM Query Remediation Loop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-emerald-400">
            <Terminal className="size-3.5 text-emerald-400" />
            <span>MCP stdio (Cursor / Claude / Gemini)</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-3 py-1.5 text-muted-foreground">
            <Database className="size-3.5 text-emerald-500" />
            <span>PostgreSQL EXPLAIN</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-3 py-1.5 text-muted-foreground">
            <Flame className="size-3.5 text-amber-500" />
            <span>Budget: &lt; {costThreshold} Cost</span>
          </div>
        </div>
      </div>

      {/* ── SPLIT SCREEN WORKBENCH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── LEFT PANEL: QUERY INPUT ── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Terminal className="size-3.5 text-emerald-500" />
              Developer Raw SQL Query
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">Dry-Run Sandbox</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUERIES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawSql(p.sql)}
                className="rounded-md bg-muted/70 hover:bg-muted border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Code Textarea */}
          <div className="relative rounded-xl border border-border bg-[#070b09] overflow-hidden focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all shadow-inner">
            <textarea
              rows={12}
              value={rawSql}
              onChange={(e) => setRawSql(e.target.value)}
              placeholder="Paste raw SQL (e.g. SELECT * FROM orders WHERE ...)"
              className="w-full bg-transparent p-4 font-mono text-xs sm:text-[13px] leading-relaxed text-[#d4e4db] placeholder-[#384a40] outline-none resize-none"
              spellCheck={false}
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>Budget:</span>
              <input
                type="number"
                value={costThreshold}
                onChange={(e) => setCostThreshold(e.target.value)}
                className="w-16 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground font-mono outline-none"
              />
            </div>

            <button
              type="button"
              disabled={isLoading || !rawSql.trim()}
              onClick={() => guardMutation.mutate(rawSql)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-2.5 px-4 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Evaluating AST Plan...</span>
                </>
              ) : (
                <>
                  <Zap className="size-4 fill-current" />
                  <span>Pre-Flight Guard (⌘↵)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL: BEFORE & AFTER DIFF & TELEMETRY ── */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {/* Header & Status Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inspection &amp; Remediation Plan
            </span>

            {result && (
              <div className="flex items-center gap-2">
                {result.action_type === "blocked_needs_index" || result.status === "blocked_needs_index" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/40 px-3 py-1 text-xs font-bold font-mono text-red-500 animate-pulse">
                    <ShieldAlert className="size-3.5" />
                    Query Blocked — Missing Index
                  </span>
                ) : result.is_safe ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold font-mono text-emerald-500">
                    <ShieldCheck className="size-3.5" />
                    {result.status === "healed" || result.action_type === "rewritten"
                      ? `Safe - Cost Reduced (-${result.cost_comparison.cost_reduction_pct}%)`
                      : "Safe - Plan Verified"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-bold font-mono text-red-500">
                    <ShieldAlert className="size-3.5" />
                    Unsafe - High Compute Cost
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Empty State */}
          {!result && !isLoading && !isError && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-border rounded-xl bg-muted/20">
              <Activity className="size-8 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground max-w-xs">
                Enter your SQL query on the left and run Pre-Flight Guard. The engine evaluates PostgreSQL EXPLAIN compute cost and heals bottlenecks.
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex flex-col gap-3 py-16 items-center justify-center text-center">
              <RefreshCw className="size-7 text-emerald-500 animate-spin" />
              <p className="text-xs font-mono text-muted-foreground mt-2">
                Executing EXPLAIN (FORMAT JSON) &amp; Analyzing AST...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
              <p className="font-bold">Execution Inspection Failed:</p>
              <p className="mt-1 font-mono text-[11px]">
                {guardMutation.error?.response?.data?.detail || guardMutation.error.message}
              </p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="flex flex-col gap-4">
              {/* Metrics HUD Card */}
              <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-border bg-[#070b09] p-3.5 text-center shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Baseline Cost</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                    {result.cost_comparison.initial_cost.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-col border-x border-border/80">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Optimized Cost</span>
                  <span
                    className={`font-mono text-sm sm:text-base font-bold ${
                      result.action_type === "blocked_needs_index" ? "text-red-400" : "text-emerald-500"
                    }`}
                  >
                    {result.action_type === "blocked_needs_index"
                      ? `${result.cost_comparison.initial_cost.toFixed(1)} (Blocked)`
                      : result.cost_comparison.final_cost.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Scan Method</span>
                  <span
                    className={`font-mono text-xs sm:text-sm font-bold ${
                      result.cost_comparison.initial_has_seq_scan ? "text-amber-500" : "text-emerald-500"
                    }`}
                  >
                    {result.cost_comparison.initial_has_seq_scan ? "Seq Scan (500k Rows)" : "Index Scan"}
                  </span>
                </div>
              </div>

              {/* Blocked Needs Index Warning Banner */}
              {(result.action_type === "blocked_needs_index" || result.status === "blocked_needs_index") && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-500 font-bold">
                    <ShieldAlert className="size-4 shrink-0" />
                    <span>Production Execution Blocked: Missing Index</span>
                  </div>
                  <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                    Query execution was halted to prevent a dangerous full sequential scan. Please send this missing index report to your Data Engineering team:
                  </p>
                  {result.suggested_index && (
                    <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-[#090505] p-2.5 font-mono text-[11px] text-red-300">
                      <code>{result.suggested_index}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.suggested_index)}
                        className="ml-2 shrink-0 text-red-400 hover:text-red-200 underline cursor-pointer"
                      >
                        {copied ? "Copied" : "Copy DDL"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Plain-English Explanation */}
              <div
                className={`rounded-xl border p-3.5 text-xs flex items-start gap-2.5 ${
                  result.action_type === "blocked_needs_index"
                    ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                    : "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                }`}
              >
                <Sparkles
                  className={`size-4 shrink-0 mt-0.5 ${
                    result.action_type === "blocked_needs_index" ? "text-amber-500" : "text-emerald-500"
                  }`}
                />
                <div>
                  <p
                    className={`font-bold text-[11.5px] ${
                      result.action_type === "blocked_needs_index"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    Guard Reliability Report:
                  </p>
                  <p className="mt-0.5 leading-relaxed text-muted-foreground">{result.explanation}</p>
                </div>
              </div>

              {/* Before & After Diff Box (Preserves User SELECT Query) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {result.action_type === "blocked_needs_index" ? "Target Query (Unchanged)" : "Remediated Query"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(result.optimized_query)}
                    className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    <span>{copied ? "Copied" : "Copy SQL"}</span>
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-[#050806] p-4 overflow-x-auto shadow-inner">
                  <pre
                    className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${
                      result.action_type === "blocked_needs_index" ? "text-[#a0b0a8]" : "text-emerald-400"
                    }`}
                  >
                    <code>{result.optimized_query}</code>
                  </pre>
                </div>
              </div>

              {/* Collapsible Raw EXPLAIN Plan */}
              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowPlanJson(!showPlanJson)}
                  className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
                >
                  <span className="font-mono">▸ Raw PostgreSQL EXPLAIN AST</span>
                  {showPlanJson ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {showPlanJson && (
                  <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-[#040605] p-3 font-mono text-[10px] text-muted-foreground">
                    {JSON.stringify(result.explain_plan, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
