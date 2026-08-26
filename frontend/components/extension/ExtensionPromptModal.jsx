"use client"

import React, { useState } from "react"
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Layers,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Terminal,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react"
import { useExtension } from "@/lib/extensionContext"
import { playExtensionPromptSound, playSuccessSound } from "@/lib/soundUtils"
import { Button } from "@/components/ui/button"

const SAMPLE_QUERIES = [
  {
    title: "High Value Customers",
    prompt: "Top 5 customers by order spend in 2024 with total count",
    sql: "SELECT c.id, c.name, COUNT(o.id) AS orders, SUM(o.amount) AS total_spent\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.created_at >= '2024-01-01'\nGROUP BY c.id, c.name\nORDER BY total_spent DESC\nLIMIT 5;",
  },
  {
    title: "MongoDB Pipeline",
    prompt: "Active users inactive for 30+ days",
    sql: "db.users.aggregate([\n  { $match: { status: 'active', last_login: { $lt: new Date(Date.now() - 30*86400000) } } },\n  { $project: { name: 1, email: 1, last_login: 1 } },\n  { $limit: 10 }\n])",
  },
  {
    title: "Error Doctor",
    prompt: "Auto-heal undefined column error in JOIN",
    sql: "-- Healed Query (Corrected FK reference)\nSELECT c.name, o.total_amount\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nLIMIT 25;",
  },
]

export default function ExtensionPromptModal() {
  const {
    isModalOpen,
    closeModal,
    dismissModal,
    dismissForever,
    checkInstallation,
    isChecking,
    soundActive,
    toggleSound,
  } = useExtension()

  const [activeTab, setActiveTab] = useState("preview") // "preview" | "setup"
  const [selectedDemo, setSelectedDemo] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [simulatedSql, setSimulatedSql] = useState(SAMPLE_QUERIES[0].sql)
  const [copiedPath, setCopiedPath] = useState(false)
  const [verifySuccess, setVerifySuccess] = useState(false)

  if (!isModalOpen) return null

  const handleSimulate = (index) => {
    setSelectedDemo(index)
    setSimulating(true)
    setSimulatedSql("")
    setTimeout(() => {
      setSimulatedSql(SAMPLE_QUERIES[index].sql)
      setSimulating(false)
    }, 350)
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText("TTS/extension")
    setCopiedPath(true)
    setTimeout(() => setCopiedPath(false), 2000)
  }

  const handleVerify = async () => {
    const installed = await checkInstallation()
    if (installed) {
      setVerifySuccess(true)
      playSuccessSound()
      setTimeout(() => {
        closeModal()
      }, 1800)
    } else {
      setVerifySuccess(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissModal(24)
      }}
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[#233529] bg-[#0e1511] text-[#e2ede6] shadow-2xl ring-1 ring-white/5">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1b2b20] px-4 py-3 sm:px-6 sm:py-4.5 bg-[#111a14]/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#162e1e] text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Zap className="size-4 sm:size-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight leading-none truncate">
                Unlock the QueryCraft Chrome Extension
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-[#87a090] leading-none truncate">
                AI Spotlight Copilot &amp; In-Situ Query Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg border border-[#203326] bg-[#142018] text-[#809b8b] hover:border-emerald-500/30 hover:text-white transition"
              title={soundActive ? "Sound enabled (click to mute)" : "Sound muted"}
            >
              {soundActive ? <Volume2 className="size-3.5 text-emerald-400" /> : <VolumeX className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => dismissModal(24)}
              className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg border border-[#203326] bg-[#142018] text-[#809b8b] hover:border-rose-500/30 hover:text-white transition"
              title="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1b2b20] bg-[#0c120e] px-4 sm:px-6 pt-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`relative flex items-center gap-2 pb-2.5 pt-1 text-xs font-medium transition shrink-0 ${
              activeTab === "preview"
                ? "text-white font-semibold"
                : "text-[#738d7d] hover:text-[#c4d6cb]"
            }`}
          >
            <Zap className="size-3.5 text-emerald-400" />
            <span>Interactive Spotlight Demo</span>
            {activeTab === "preview" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("setup")}
            className={`relative ml-4 sm:ml-6 flex items-center gap-2 pb-2.5 pt-1 text-xs font-medium transition shrink-0 ${
              activeTab === "setup"
                ? "text-white font-semibold"
                : "text-[#738d7d] hover:text-[#c4d6cb]"
            }`}
          >
            <Download className="size-3.5 text-emerald-400" />
            <span>3-Step Quick Install</span>
            {activeTab === "setup" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-3 sm:space-y-4 text-xs">

          {/* 3 Streamlined Core Benefits */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="rounded-xl border border-[#1e3024] bg-[#121c15] p-3 text-left">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-1">
                <Terminal className="size-3.5 shrink-0" />
                <span className="truncate">Spotlight Anywhere</span>
              </div>
              <p className="text-[11px] text-[#869f8f] leading-relaxed">
                Press <kbd className="rounded bg-[#1a2820] px-1 py-0.2 font-mono text-[9px] text-emerald-300">Cmd+Shift+K</kbd> anywhere on the web.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e3024] bg-[#121c15] p-3 text-left">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-1">
                <Code2 className="size-3.5 shrink-0" />
                <span className="truncate">1-Click Editor Insertion</span>
              </div>
              <p className="text-[11px] text-[#869f8f] leading-relaxed">
                Paste SQL straight into Supabase, Neon, or Mongo Atlas.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e3024] bg-[#121c15] p-3 text-left">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-1">
                <Stethoscope className="size-3.5 shrink-0" />
                <span className="truncate">In-Situ SQL Doctor</span>
              </div>
              <p className="text-[11px] text-[#869f8f] leading-relaxed">
                Highlight runtime errors on pages to auto-heal with AI.
              </p>
            </div>
          </div>

          {/* TAB 1: INTERACTIVE SPOTLIGHT DEMO */}
          {activeTab === "preview" && (
            <div className="space-y-2.5 rounded-xl border border-[#1e3024] bg-[#111913] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8ba394]">
                  Simulated In-Page Command Bar
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Cmd + Shift + K
                </span>
              </div>

              {/* Demo Query Selector */}
              <div className="flex gap-1.5">
                {SAMPLE_QUERIES.map((q, idx) => (
                  <button
                    key={q.title}
                    type="button"
                    onClick={() => handleSimulate(idx)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-medium transition ${
                      selectedDemo === idx
                        ? "border border-emerald-500/40 bg-[#192f20] text-white shadow-2xs"
                        : "border border-[#1d2c21] bg-[#131d16] text-[#7d9787] hover:border-emerald-500/20 hover:text-white"
                    }`}
                  >
                    {q.title}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="rounded-lg border border-[#1e2e23] bg-[#090e0b] overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#18261c] bg-[#0e1611] px-3 py-1.5">
                  <span className="font-mono text-[10px] text-[#718a7a]">
                    Input: &quot;{SAMPLE_QUERIES[selectedDemo].prompt}&quot;
                  </span>
                  <span className="text-[9.5px] text-emerald-400 font-mono">Verified</span>
                </div>
                
                <div className="p-3">
                  {simulating ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-emerald-400">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span className="text-[11px]">Compiling safe query...</span>
                    </div>
                  ) : (
                    <pre className="max-h-28 overflow-x-auto font-mono text-[11px] text-emerald-300 leading-relaxed">
                      <code>{simulatedSql}</code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-STEP SETUP */}
          {activeTab === "setup" && (
            <div className="space-y-2.5 rounded-xl border border-[#1e3024] bg-[#111913] p-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#1b2b20]">
                <span className="text-[11px] font-semibold text-white">
                  Load Unpacked Extension into Chromium
                </span>
                <span className="text-[10px] text-[#738d7d]">Chrome • Brave • Edge • Arc</span>
              </div>

              <div className="space-y-2 text-xs">
                
                <div className="flex items-start gap-2.5 rounded-lg border border-[#1b2a1f] bg-[#131d16] p-2.5">
                  <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-[#183120] text-[10px] font-bold text-emerald-400">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Open Browser Extensions Page</p>
                    <p className="text-[11px] text-[#7e9988] mt-0.5">
                      Navigate to <code className="rounded bg-[#1a2820] px-1 py-0.2 font-mono text-emerald-300">chrome://extensions</code> in your URL bar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-[#1b2a1f] bg-[#131d16] p-2.5">
                  <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-[#183120] text-[10px] font-bold text-emerald-400">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Enable Developer Mode</p>
                    <p className="text-[11px] text-[#7e9988] mt-0.5">
                      Switch on the <strong className="text-white font-medium">Developer mode</strong> toggle at the top-right.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-[#1b2a1f] bg-[#131d16] p-2.5">
                  <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-[#183120] text-[10px] font-bold text-emerald-400">
                    3
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="font-medium text-white">Click &quot;Load unpacked&quot; &amp; Select Directory</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded border border-[#203326] bg-[#090e0b] px-2 py-1 font-mono text-[10.5px] text-emerald-300">
                        TTS/extension
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyPath}
                        className="flex items-center gap-1 rounded border border-[#223829] bg-[#16241b] px-2 py-1 text-[10.5px] font-semibold text-emerald-300 hover:bg-[#1c3024] transition"
                      >
                        {copiedPath ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        <span>{copiedPath ? "Copied" : "Copy Path"}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {verifySuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span><strong>Extension Connected!</strong> Spotlight Copilot is now active across all browser tabs.</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1b2b20] bg-[#111a14]/90 px-6 py-3.5">
          <div className="flex items-center gap-2.5 text-xs text-[#718d7d]">
            <button
              type="button"
              onClick={() => dismissModal(24)}
              className="hover:text-white transition cursor-pointer"
            >
              Remind me tomorrow
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={dismissForever}
              className="hover:text-rose-300 transition text-[11px] cursor-pointer"
            >
              Don&apos;t show again
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={isChecking}
              className="h-8 border-[#23382a] bg-[#142018] text-xs text-[#9eb6a7] hover:border-emerald-500/40 hover:bg-[#1a2c20] hover:text-white"
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-3 animate-spin text-emerald-400 mr-1.5" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-3 text-emerald-400 mr-1.5" />
                  <span>Verify Installation</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setActiveTab("setup")}
              className="h-8 bg-[#183d26] hover:bg-[#205233] text-xs font-semibold text-white shadow-xs border border-emerald-500/30"
            >
              <Download className="size-3 mr-1.5 text-emerald-300" />
              <span>Setup Guide</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
