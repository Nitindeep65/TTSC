"use client"

import React, { useState } from "react"
import {
  Sparkles,
  Database,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Code2,
  BarChart3,
  Rocket,
  Layers,
  Terminal,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTour } from "@/lib/tourContext"

const ROLES = [
  {
    id: "data_engineer",
    title: "Data Engineer / DBA",
    emoji: "🛠️",
    icon: Code2,
    badge: "SQL Optimization & Index Advisor",
    description: "Optimize complex joins, generate CREATE INDEX suggestions, and dry-run PostgreSQL EXPLAIN plans.",
  },
  {
    id: "analyst",
    title: "Product / Analyst",
    emoji: "📊",
    icon: BarChart3,
    badge: "Natural Language & Visualizer",
    description: "Ask questions in plain English, generate safe SQL/NoSQL queries, and visualize results in dynamic charts.",
  },
  {
    id: "founder",
    title: "Founder / Exec",
    emoji: "🚀",
    icon: Rocket,
    badge: "Instant Business Metrics",
    description: "Inspect top-line KPIs, monitor MRR & user cohorts, and get plain-English data answers without technical bottlenecks.",
  },
]

export default function OnboardingModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState("analyst")

  let tour = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tour = useTour()
  } catch {}

  if (!isOpen) return null

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => prev + 1)
    } else {
      onComplete?.({ role: selectedRole })
      tour?.startTour?.()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    onComplete?.({ role: selectedRole })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl max-h-[92dvh] flex flex-col rounded-2xl bg-[#0f1713] border border-[#22382c] shadow-2xl shadow-emerald-950/50 text-white overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-600 via-[#4ca873] to-teal-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-[#1b2b22]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-linear-to-br from-[#1f3a2c] to-[#14261d] border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Sparkles className="size-4 sm:size-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400/90">
                Welcome to QueryCraft
              </span>
              <h2 id="onboarding-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                {step === 1 && "Personalize Your Workspace"}
                {step === 2 && "Explore Without Fear"}
                {step === 3 && "Query from Anywhere"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Skip onboarding"
            aria-label="Close onboarding"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#121c17] flex items-center justify-between border-b border-[#1b2b22]/70 text-xs">
          <div className="flex items-center gap-1.5 w-full max-w-[200px]">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-emerald-500" : "bg-[#21352a]"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#7d9b8a]">
            Step {step} of 3
          </span>
        </div>

        {/* Modal Body / Multi-Step Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          {/* STEP 1: Personalization & Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#9cb4a6]">
                How will you primarily use QueryCraft? We will calibrate your natural language queries, starter prompts, and visualization presets.
              </p>

              <div className="space-y-2.5">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.id
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-linear-to-r from-[#172c21] to-[#122119] border-emerald-500/80 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                          : "bg-[#142019]/60 border-[#23382c] hover:border-[#355242] hover:bg-[#16241c]"
                      }`}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1b2f24] border border-[#2b4938] text-xl shadow-xs">
                        {r.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {r.title}
                          </h3>
                          {isSelected && (
                            <div className="flex size-4.5 items-center justify-center rounded-full bg-emerald-500 text-black shrink-0">
                              <Check className="size-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[#8da797] mt-1 leading-relaxed">
                          {r.description}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#1d3527] text-emerald-300 border border-emerald-500/20">
                          {r.badge}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: The Sandbox (Explore Without Fear) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>Zero Database Connection Anxiety: Safe Sandbox Pre-Connected</span>
              </div>

              <p className="text-xs sm:text-sm text-[#9cb4a6] leading-relaxed">
                You never have to connect production credentials to test QueryCraft. We have pre-connected an isolated, rich <strong className="text-white">E-Commerce Sandbox Database</strong> ready for live queries.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#142019] border border-[#23382c] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Database className="size-3.5 text-emerald-400" />
                    <span>5 Mock Schemas</span>
                  </div>
                  <p className="text-[11px] text-[#8da797] leading-normal">
                    Pre-populated with <code className="text-emerald-300">users</code>, <code className="text-emerald-300">orders</code>, <code className="text-emerald-300">products</code>, <code className="text-emerald-300">payments</code>, and <code className="text-emerald-300">order_items</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#142019] border border-[#23382c] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <ShieldCheck className="size-3.5 text-emerald-400" />
                    <span>Strict Read-Only Guard</span>
                  </div>
                  <p className="text-[11px] text-[#8da797] leading-normal">
                    Enforces <code className="text-emerald-300">SET TRANSACTION READ ONLY</code> and safe automatic <code className="text-emerald-300">LIMIT 50</code> on every execution.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#142019] border border-[#23382c] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Layers className="size-3.5 text-emerald-400" />
                    <span>Interactive Clarifier</span>
                  </div>
                  <p className="text-[11px] text-[#8da797] leading-normal">
                    Pauses to ask 1-tap questions if metrics or timeframes are missing, eliminating blind guesses.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#142019] border border-[#23382c] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Terminal className="size-3.5 text-emerald-400" />
                    <span>Self-Healing Doctor</span>
                  </div>
                  <p className="text-[11px] text-[#8da797] leading-normal">
                    Intercepts runtime SQLSTATE errors and auto-repairs queries with a schema-grounded critic loop.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Copilot Setup (Query from Anywhere) */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#9cb4a6] leading-relaxed">
                Take QueryCraft with you everywhere. Use the Manifest V3 Chrome Extension Spotlight Copilot across Supabase, Neon, AWS Console, MongoDB Atlas, or any internal portal.
              </p>

              {/* Spotlight Hotkey Showcase */}
              <div className="p-4 rounded-xl bg-linear-to-b from-[#16271e] to-[#0f1b14] border border-emerald-500/40 text-center space-y-3 shadow-inner">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Global In-Situ Hotkey
                </span>

                <div className="flex items-center justify-center gap-2 py-1">
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-[#1b3326] border border-emerald-500/50 text-white font-mono text-xs sm:text-sm font-bold shadow-md">
                    Cmd ⌘
                  </kbd>
                  <span className="text-zinc-400 font-bold">+</span>
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-[#1b3326] border border-emerald-500/50 text-white font-mono text-xs sm:text-sm font-bold shadow-md">
                    Shift ⇧
                  </kbd>
                  <span className="text-zinc-400 font-bold">+</span>
                  <kbd className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black border border-emerald-400 font-mono text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-500/30">
                    K
                  </kbd>
                </div>

                <p className="text-[11px] text-[#8da797]">
                  (Or <kbd className="font-mono bg-[#14221a] px-1.5 py-0.5 rounded text-zinc-300">Ctrl</kbd> + <kbd className="font-mono bg-[#14221a] px-1.5 py-0.5 rounded text-zinc-300">Shift</kbd> + <kbd className="font-mono bg-[#14221a] px-1.5 py-0.5 rounded text-zinc-300">K</kbd> on Windows & Linux)
                </p>
              </div>

              {/* Mini Feature List */}
              <div className="space-y-2 text-xs text-[#9cb4a6]">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Opens a lightweight Shadow DOM spotlight directly over your screen.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Bidirectionally synchronizes custom metric rules and notebook snippets.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Works without ever sending your sensitive connection secrets to external servers.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#0c1410] border-t border-[#1b2b22]">
          <div>
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-xs text-[#8da797] hover:text-white hover:bg-white/10 gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-[#6e8a7a] hover:text-[#9cb4a6] transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleNext}
              className="h-9 px-4 text-xs font-bold bg-[#1f7a47] hover:bg-[#186038] text-white shadow-lg shadow-emerald-950/50 gap-1.5"
            >
              {step < 3 ? (
                <>
                  <span>Continue</span>
                  <ArrowRight className="size-3.5" />
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 text-emerald-300" />
                  <span>Finish & Enter Sandbox</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
