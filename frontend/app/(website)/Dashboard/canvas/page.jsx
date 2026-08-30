"use client"

import React, { useState, useEffect } from "react"
import {
  Sparkles,
  Layers,
  TrendingUp,
  ShoppingBag,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Database,
  RefreshCw,
  ShieldCheck,
  Zap,
  Calendar,
  BrainCircuit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDatabase } from "@/lib/databaseContext"
import { dashboardApi, getClientFallbackDashboard } from "@/lib/api"
import DashboardCanvas from "@/components/canvas/DashboardCanvas"
import PipelineExecutionFlow from "@/components/canvas/PipelineExecutionFlow"

const TEMPLATE_PILLS = [
  {
    id: "saas",
    label: "SaaS Executive Overview",
    prompt: "Build me an Executive SaaS Performance Dashboard tracking Net MRR, Churn Rate, Top Accounts, and Subscription Tier distribution.",
    icon: TrendingUp,
  },
  {
    id: "ecommerce",
    label: "E-Commerce & Orders",
    prompt: "Create an E-Commerce Operations Dashboard with total revenue trends, order status breakdown, top customers by spend, and payment method distribution.",
    icon: ShoppingBag,
  },
  {
    id: "retention",
    label: "Customer Retention & Cohorts",
    prompt: "Generate a Customer Retention Dashboard showing new user signups over time, customer status distribution, top 10 most loyal buyers, and average spend.",
    icon: Users,
  },
  {
    id: "inventory",
    label: "Product Catalog Health",
    prompt: "Build a Product Catalog & Inventory Health Dashboard showing low stock warnings, stock quantity by category, and price distribution.",
    icon: Layers,
  },
]

export default function CanvasPage() {
  const { connectionUri, dbInfo } = useDatabase()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStep, setActiveStep] = useState(0) // 1: Planning, 2: Compiling Workers, 3: Execution Guard, 4: Canvas Assembler
  const [canvasData, setCanvasData] = useState(() => getClientFallbackDashboard("Build me an Executive SaaS Performance Dashboard tracking Net MRR, Churn Rate, Top Accounts, and Subscription Tier distribution."))
  const [showPipelineFlow, setShowPipelineFlow] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [dateWindow, setDateWindow] = useState("30D")
  const [targetEngine, setTargetEngine] = useState("postgresql")

  const handleGenerateDashboard = async (targetPrompt) => {
    const p = (targetPrompt || prompt || "").trim()
    if (!p || isGenerating) return

    setPrompt(p)
    setIsGenerating(true)
    setErrorMessage("")
    setActiveStep(1)

    // Animated step progression simulating LangGraph multi-agent pipeline
    const timer1 = setTimeout(() => setActiveStep(2), 350)
    const timer2 = setTimeout(() => setActiveStep(3), 850)

    try {
      const data = await dashboardApi.generateDashboard({
        user_prompt: p,
        theme: p.toLowerCase().includes("saas") ? "executive" : "operations",
        live_schema: dbInfo?.schema_sql || null,
        connection_uri: connectionUri || null,
      })

      setActiveStep(4)
      setCanvasData(data)
    } catch (err) {
      console.error("Canvas generation error:", err)
      setErrorMessage(
        err.response?.data?.detail || err.message || "Failed to generate dashboard canvas."
      )
    } finally {
      clearTimeout(timer1)
      clearTimeout(timer2)
      setIsGenerating(false)
      setActiveStep(0)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 max-w-7xl mx-auto w-full space-y-5">
      {/* ── 1. Page Header & Hero ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
              <Sparkles className="size-4 text-emerald-400" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Dashboard Architect
            </h1>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-600 border border-emerald-500/20">
              Multi-Agent Sub-Graph
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Type one high-level prompt and watch the LangGraph Supervisor Agent decompose, compile 4 parallel queries, and assemble an interactive canvas.
          </p>
        </div>

        {/* Action Controls & Live status badge */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPipelineFlow((prev) => !prev)}
            className="gap-1.5 text-xs font-medium border-border hover:bg-muted h-8"
          >
            <BrainCircuit className="size-3.5 text-emerald-600" />
            <span>{showPipelineFlow ? "Hide Flow" : "Inspect Agent Flow"}</span>
          </Button>

          <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-muted/60 border border-border rounded-xl px-3 py-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supervisor Active</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-[11px] font-mono text-emerald-600">Llama 3.1 70B</span>
          </div>
        </div>
      </div>

      {/* ── Global Canvas Controls Bar (Date Window & Engine Selector) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-card shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Date Window:</span>
          <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs font-medium">
            {["7D", "30D", "90D", "YTD"].map((dw) => (
              <button
                key={dw}
                type="button"
                onClick={() => {
                  setDateWindow(dw)
                  handleGenerateDashboard(`${prompt || "Build Executive SaaS Performance Dashboard"} for the timeframe: ${dw}`)
                }}
                className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                  dateWindow === dw
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dw}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Database className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Engine:</span>
          <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs font-medium">
            {[
              { id: "postgresql", label: "PostgreSQL" },
              { id: "mongodb", label: "MongoDB" },
              { id: "mysql", label: "MySQL" },
            ].map((eng) => (
              <button
                key={eng.id}
                type="button"
                onClick={() => {
                  setTargetEngine(eng.id)
                  handleGenerateDashboard(`${prompt || "Build Executive SaaS Performance Dashboard"} optimized for ${eng.label}`)
                }}
                className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                  targetEngine === eng.id
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {eng.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Prompt Bar & Template Starters ── */}
      <div className="rounded-3xl border border-[#d8e5dc] bg-white p-4 shadow-xs space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleGenerateDashboard()
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build me a SaaS Executive Dashboard for Q3 with MRR, churn, and top cohorts..."
              className="w-full rounded-2xl border border-[#cfe0d5] bg-[#f9fbf9] px-4 py-2.5 text-xs text-[#141a17] placeholder:text-[#849c8e] focus:border-emerald-600 focus:bg-white focus:outline-none transition shadow-2xs font-medium"
              disabled={isGenerating}
            />
          </div>

          <Button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="gap-2 rounded-2xl bg-[#16271c] hover:bg-[#203a29] text-white font-bold text-xs px-5 h-10 shadow-xs cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin text-[#4ade80]" />
                <span>Assembling Canvas...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-[#4ade80]" />
                <span>Build Dashboard</span>
              </>
            )}
          </Button>
        </form>

        {/* Template Starter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-[#6d8475] uppercase tracking-wider mr-1">
            Starters:
          </span>
          {TEMPLATE_PILLS.map((pill) => {
            const Icon = pill.icon
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleGenerateDashboard(pill.prompt)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-xl border border-[#dce8df] bg-[#f7faf8] hover:bg-[#edf5ef] hover:border-emerald-300 px-2.5 py-1 text-[11px] font-semibold text-[#293d31] transition cursor-pointer disabled:opacity-50"
              >
                <Icon className="size-3 text-emerald-700" />
                <span>{pill.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 3. Multi-Agent Pipeline Execution Flow ── */}
      {(isGenerating || showPipelineFlow) && (
        <div className="animate-in fade-in duration-200">
          <PipelineExecutionFlow
            activeStep={activeStep}
            isGenerating={isGenerating}
            totalTimeMs={canvasData?.execution_time_total_ms}
          />
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <p className="font-bold">Execution Notice:</p>
          <p className="mt-0.5">{errorMessage}</p>
        </div>
      )}

      {/* ── 4. Render Canvas ── */}
      <DashboardCanvas
        canvasData={canvasData}
        onRefresh={() => handleGenerateDashboard(prompt)}
      />
    </div>
  )
}
