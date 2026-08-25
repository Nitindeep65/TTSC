"use client"

import React from "react"
import { useTour } from "@/lib/tourContext"
import { Sparkles, Database, Plug, ArrowRight, ArrowLeft, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const TOUR_STEPS = [
  {
    step: 1,
    title: "Start Here: Starter Prompts",
    badge: "Action-Oriented",
    icon: Sparkles,
    content: "Click one of these starter prompts to see how QueryCraft connects to the Mock Database, evaluates time windows, and asks targeted clarifying questions before running SQL.",
    positionClass: "bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2",
  },
  {
    step: 2,
    title: "Zero Hallucinations: Live Schema",
    badge: "Trust & Safety",
    icon: Database,
    content: "QueryCraft reads your live database schema directly. Toggle this panel anytime to inspect real tables, columns, and data types (UUID, JSONB, BSON).",
    positionClass: "top-20 right-4 sm:right-8",
  },
  {
    step: 3,
    title: "Your Turn: Connect Any Database",
    badge: "The Transition",
    icon: Plug,
    content: "Once you are comfortable, click the Workspace switcher or Connect button to securely connect your own PostgreSQL (Supabase, Neon, AWS RDS) or MongoDB Atlas cluster.",
    positionClass: "top-20 left-4 sm:left-12",
  },
]

export default function SpotlightTooltip() {
  const { isTourActive, currentStep, totalSteps, nextStep, prevStep, endTour, skipTour } = useTour()

  if (!isTourActive) return null

  const currentStepData = TOUR_STEPS.find((s) => s.step === currentStep) || TOUR_STEPS[0]
  const IconComponent = currentStepData.icon

  return (
    <>
      {/* Global Dimmed Backdrop (High z-index, below highlighted element) */}
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-[2px]"
        onClick={nextStep}
        aria-hidden="true"
      />

      {/* Floating Spotlight Card */}
      <div
        role="dialog"
        aria-label={`Tour Step ${currentStep}: ${currentStepData.title}`}
        className={`fixed z-[70] w-[92vw] max-w-sm sm:max-w-md p-4 sm:p-5 rounded-2xl bg-[#0f1713] border border-emerald-500/50 shadow-2xl shadow-emerald-950/80 text-white animate-in zoom-in-95 duration-200 ${currentStepData.positionClass}`}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-teal-400 to-[#4ca873] rounded-t-2xl" />

        <div className="flex items-start justify-between gap-2 mb-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#182c20] border border-emerald-500/40 text-emerald-400">
              <IconComponent className="size-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                {currentStepData.badge}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {currentStepData.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={skipTour}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Skip Tour"
            aria-label="Skip Tour"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs sm:text-[13px] text-[#9cb4a6] leading-relaxed my-3">
          {currentStepData.content}
        </p>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1b2b22]">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`size-1.5 sm:size-2 rounded-full transition-all duration-300 ${
                  s === currentStep
                    ? "bg-emerald-400 scale-125 ring-2 ring-emerald-500/30"
                    : s < currentStep
                    ? "bg-emerald-700"
                    : "bg-zinc-700"
                }`}
              />
            ))}
            <span className="text-[11px] font-mono text-[#7d9b8a] ml-1.5">
              {currentStep} of {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="h-7 sm:h-8 px-2 text-xs text-[#8da797] hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-3 mr-1" />
                <span>Back</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={nextStep}
              className="h-7 sm:h-8 px-3 text-xs font-bold bg-[#1f7a47] hover:bg-[#186038] text-white shadow-md shadow-emerald-950/50"
            >
              {currentStep < 3 ? (
                <>
                  <span>Next</span>
                  <ArrowRight className="size-3 ml-1" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3 text-emerald-300 mr-1" />
                  <span>Finish Tour</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
