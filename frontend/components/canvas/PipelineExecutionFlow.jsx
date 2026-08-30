"use client"

import React from "react"
import {
  BrainCircuit,
  Boxes,
  Stethoscope,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  GitFork,
  Activity,
  ChevronRight,
  Database,
  Cpu,
} from "lucide-react"

/**
 * 4-Node LangGraph Multi-Agent Pipeline Execution Stages
 */
export const PIPELINE_STAGES = [
  {
    step: 1,
    id: "supervisor_planner",
    name: "Supervisor Planner",
    role: "LangGraph Coordinator",
    icon: BrainCircuit,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    activeGlow: "ring-emerald-500/40",
    description: "Evaluates prompt & schema catalog; decomposes into 4 analytical widget plans.",
    output: "4 Task DAG Specifications",
  },
  {
    step: 2,
    id: "parallel_workers",
    name: "Parallel SQL Workers",
    role: "4 Concurrent Worker Nodes",
    icon: GitFork,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    activeGlow: "ring-blue-500/40",
    description: "Compiles PostgreSQL & MQL queries concurrently via asyncio with LIMIT 50 guards.",
    output: "4 Executed Query Datasets",
  },
  {
    step: 3,
    id: "critic_doctor",
    name: "Critic & Safety Guard",
    role: "SQL Doctor & Cost Planner",
    icon: Stethoscope,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    activeGlow: "ring-amber-500/40",
    description: "Enforces READ ONLY transactions; parses SQLSTATE errors and auto-heals failures.",
    output: "Verified Safe Execution",
  },
  {
    step: 4,
    id: "canvas_assembler",
    name: "Canvas Assembler",
    role: "Executive Synthesizer",
    icon: LayoutGrid,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    activeGlow: "ring-purple-500/40",
    description: "Extracts KPI hero indicators, generates SVG sparklines, and drafts executive brief.",
    output: "Interactive Dashboard Canvas",
  },
]

export default function PipelineExecutionFlow({
  activeStep = 0,
  isGenerating = false,
  totalTimeMs = null,
  compact = false,
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-sm p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
            <Cpu className="size-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                Multi-Agent Pipeline Execution Flow
              </h3>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                LangGraph DAG
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Autonomous supervisor decomposition &rarr; concurrent SQL compilation &rarr; self-healing critic &rarr; canvas assembly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGenerating ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <Loader2 className="size-3 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Step {activeStep || 1} of 4 Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-muted border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Pipeline Ready {totalTimeMs ? `(${totalTimeMs}ms)` : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4-Node Pipeline Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {PIPELINE_STAGES.map((stage, idx) => {
          const StageIcon = stage.icon
          const isCurrent = isGenerating && activeStep === stage.step
          const isPassed = !isGenerating || activeStep > stage.step

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                isCurrent
                  ? "bg-card border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]"
                  : isPassed
                    ? "bg-card/70 border-border/80 hover:border-border hover:shadow-2xs"
                    : "bg-muted/30 border-border/40 opacity-65"
              }`}
            >
              <div>
                {/* Node Header: Step & Agent Icon */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`flex size-7 items-center justify-center rounded-lg ${stage.bgColor} border ${stage.borderColor} ${stage.iconColor}`}>
                      <StageIcon className="size-4" />
                    </span>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">
                      0{stage.step}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Loader2 className="size-3 animate-spin" />
                        <span>Running</span>
                      </span>
                    ) : isPassed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium">Pending</span>
                    )}
                  </div>
                </div>

                {/* Node Titles */}
                <div>
                  <h4 className="text-xs font-bold text-foreground leading-tight">
                    {stage.name}
                  </h4>
                  <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {stage.role}
                  </p>
                </div>

                {/* Description */}
                {!compact && (
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    {stage.description}
                  </p>
                )}
              </div>

              {/* Node Footer Output Pill */}
              <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-muted-foreground truncate">Output:</span>
                <span className="font-mono font-medium text-foreground truncate ml-1">
                  {stage.output}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
