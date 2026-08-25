"use client"

import React, { useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Terminal,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap,
} from "lucide-react"
import { useExtension } from "@/lib/extensionContext"
import { playExtensionPromptSound, playSuccessSound } from "@/lib/soundUtils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const SAMPLE_QUERIES = [
  {
    title: "High Value Customers",
    prompt: "Show top 5 customers by total order spend in 2024 with email and order count",
    sql: "SELECT c.id, c.name, c.email, COUNT(o.id) AS total_orders, SUM(o.amount) AS total_spent\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.created_at >= '2024-01-01'\nGROUP BY c.id, c.name, c.email\nORDER BY total_spent DESC\nLIMIT 5;",
  },
  {
    title: "MongoDB Churn Risk",
    prompt: "Find active users who haven't logged in for 30 days",
    sql: "db.users.aggregate([\n  { $match: { status: 'active', last_login: { $lt: new Date(Date.now() - 30*24*60*60*1000) } } },\n  { $project: { name: 1, email: 1, last_login: 1, plan: 1 } },\n  { $limit: 10 }\n])",
  },
  {
    title: "Self-Healing Critic Doctor",
    prompt: "Fix 'column orders.user_id does not exist' in JOIN",
    sql: "-- Auto-Healed Query (Corrected FK to orders.customer_id)\nSELECT c.name, o.amount\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nLIMIT 20;",
  }
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
    }, 450)
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
      }, 2000)
    } else {
      setVerifySuccess(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissModal(24)
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#2d4d38]/80 bg-[#0d1611] text-[#e3ece5] shadow-2xl ring-1 ring-emerald-500/20">
        
        {/* Background Ambient Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-[#1b432a]/20 blur-3xl" />

        {/* Modal Top Header */}
        <div className="relative border-b border-[#1f3727] bg-[#111e16]/90 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1b432a] to-[#0e2518] text-[#4ade80] shadow-md ring-1 ring-emerald-400/30">
                <Sparkles className="size-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    Unlock the QueryCraft Chrome Extension
                  </h3>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-950/60 text-[10px] font-mono text-[#4ade80]">
                    Spotlight Copilot
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-[#9db7a5]">
                  Generate SQL/NoSQL anywhere on the web, auto-heal database errors, and insert code with <kbd className="rounded bg-[#1a3022] px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">Cmd+Shift+K</kbd>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Sound replay button */}
              <button
                type="button"
                onClick={toggleSound}
                className="flex size-8 items-center justify-center rounded-lg border border-[#233d2c] bg-[#15241b] text-[#86a892] transition hover:border-emerald-500/50 hover:bg-[#1a3023] hover:text-emerald-300"
                title={soundActive ? "Sound enabled (click to mute / replay chime)" : "Sound muted"}
              >
                {soundActive ? <Volume2 className="size-4 text-emerald-400" /> : <VolumeX className="size-4 text-[#607b6b]" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismissModal(24)}
                className="flex size-8 items-center justify-center rounded-lg border border-[#233d2c] bg-[#15241b] text-[#86a892] transition hover:border-rose-500/50 hover:bg-rose-950/30 hover:text-rose-300"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "preview"
                  ? "bg-[#1f422b] text-white shadow-xs"
                  : "text-[#87a391] hover:bg-[#16271c] hover:text-white"
              }`}
            >
              <Zap className="size-3.5 text-emerald-400" />
              <span>Interactive Spotlight Demo</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("setup")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "setup"
                  ? "bg-[#1f422b] text-white shadow-xs"
                  : "text-[#87a391] hover:bg-[#16271c] hover:text-white"
              }`}
            >
              <Download className="size-3.5 text-emerald-400" />
              <span>3-Step Quick Install</span>
            </button>
          </div>

        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">

          {/* 4 Feature Highlights Pill Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="flex items-start gap-2.5 rounded-xl border border-[#213b2a] bg-[#101b14] p-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400">
                <Terminal className="size-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Spotlight Anywhere</h4>
                <p className="text-[11px] text-[#86a28f] leading-snug">Press <kbd className="font-mono text-[9.5px] bg-[#192b1f] px-1 py-0.5 rounded text-emerald-300">Cmd+Shift+K</kbd> inside Supabase, Neon, or Mongo Atlas.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[#213b2a] bg-[#101b14] p-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400">
                <Code2 className="size-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1-Click Editor Insertion</h4>
                <p className="text-[11px] text-[#86a28f] leading-snug">Inject generated SQL or MQL pipelines straight into active inputs.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[#213b2a] bg-[#101b14] p-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400">
                <Stethoscope className="size-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">In-Situ SQL Doctor</h4>
                <p className="text-[11px] text-[#86a28f] leading-snug">Highlight any runtime error trace and heal it with LangGraph Critic.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[#213b2a] bg-[#101b14] p-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400">
                <Layers className="size-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Cloud Sync</h4>
                <p className="text-[11px] text-[#86a28f] leading-snug">Shared database credentials, verified few-shots, and metric glossary.</p>
              </div>
            </div>
          </div>

          {/* TAB 1: INTERACTIVE SPOTLIGHT SIMULATOR */}
          {activeTab === "preview" && (
            <div className="space-y-3 rounded-xl border border-[#233f2c] bg-[#0c140f] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  ⚡ Try the Spotlight Copilot Simulator
                </span>
                <span className="text-[10px] text-[#718f7d]">Simulates In-Page Command Bar</span>
              </div>

              {/* Sample prompt chips */}
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_QUERIES.map((q, idx) => (
                  <button
                    key={q.title}
                    type="button"
                    onClick={() => handleSimulate(idx)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      selectedDemo === idx
                        ? "border border-emerald-500/50 bg-[#1e422c] text-white"
                        : "border border-[#213829] bg-[#132218] text-[#87a592] hover:border-emerald-500/30 hover:text-white"
                    }`}
                  >
                    {q.title}
                  </button>
                ))}
              </div>

              {/* Mini Spotlight Box */}
              <div className="overflow-hidden rounded-lg border border-[#264430] bg-[#080d09] shadow-inner">
                <div className="flex items-center justify-between border-b border-[#1b3022] bg-[#0e1912] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-semibold text-[#86a591]">QueryCraft Floating Spotlight (`Cmd+Shift+K`)</span>
                  </div>
                  <span className="rounded bg-[#172b1e] px-1.5 py-0.5 font-mono text-[9px] text-emerald-300">
                    Live Engine
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 rounded-md border border-[#243d2c] bg-[#101b13] px-2.5 py-1.5 text-xs text-white">
                    <Terminal className="size-3.5 text-emerald-400 shrink-0" />
                    <span className="flex-1 truncate font-mono text-[11px] text-[#a7c5b2]">
                      {SAMPLE_QUERIES[selectedDemo].prompt}
                    </span>
                    <kbd className="rounded bg-[#1c3222] px-1 py-0.5 text-[9px] text-emerald-300">↵ Run</kbd>
                  </div>

                  {simulating ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-emerald-400">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Generating schema-grounded query...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="max-h-36 overflow-x-auto rounded-md bg-[#050806] p-2.5 font-mono text-[11px] text-emerald-300 leading-relaxed">
                        <code>{simulatedSql}</code>
                      </pre>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#718f7d]">
                        <span>✓ Ready for 1-tap editor insertion</span>
                        <span className="font-semibold text-emerald-400">Read-Only Safety Guard: ON</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP SETUP */}
          {activeTab === "setup" && (
            <div className="space-y-3 rounded-xl border border-[#233f2c] bg-[#0c140f] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  📥 How to Load QueryCraft in Chrome / Edge / Brave / Arc
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                
                {/* Step 1 */}
                <div className="flex items-start gap-2.5 rounded-lg border border-[#1f3727] bg-[#101b14] p-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1b432a] text-[11px] font-bold text-emerald-300">
                    1
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-white">Open Browser Extensions Page</p>
                    <p className="text-[11px] text-[#86a28f]">
                      Navigate to <code className="rounded bg-[#1a3022] px-1 py-0.5 font-mono text-emerald-300">chrome://extensions</code> in your Chromium browser URL bar.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-2.5 rounded-lg border border-[#1f3727] bg-[#101b14] p-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1b432a] text-[11px] font-bold text-emerald-300">
                    2
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-white">Enable Developer Mode</p>
                    <p className="text-[11px] text-[#86a28f]">
                      Turn on the <strong className="text-white">Developer mode</strong> toggle located in the top-right corner of the Extensions dashboard.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-2.5 rounded-lg border border-[#1f3727] bg-[#101b14] p-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1b432a] text-[11px] font-bold text-emerald-300">
                    3
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="font-semibold text-white">Click "Load unpacked" &amp; Select Extension Directory</p>
                    <p className="text-[11px] text-[#86a28f]">
                      Click <strong className="text-white">Load unpacked</strong> and choose the <code className="text-emerald-300">extension</code> folder from this workspace:
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md border border-[#243d2c] bg-[#090e0b] px-2.5 py-1 font-mono text-[11px] text-emerald-400">
                        TTS/extension
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyPath}
                        className="flex items-center gap-1 rounded-md border border-[#2b4c34] bg-[#16271c] px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-[#1f3827]"
                      >
                        {copiedPath ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                        <span>{copiedPath ? "Copied" : "Copy Path"}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {verifySuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/60 p-3 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span><strong>Extension Connected!</strong> Spotlight Copilot is now active across all browser tabs. Closing modal...</span>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="relative border-t border-[#1f3727] bg-[#111e16]/95 px-5 py-3.5 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => dismissModal(24)}
                className="text-[#718f7d] hover:text-white transition"
              >
                Remind me tomorrow
              </button>
              <span className="text-[#324f3c]">•</span>
              <button
                type="button"
                onClick={dismissForever}
                className="text-[#718f7d] hover:text-rose-300 transition text-[11px]"
              >
                Don't show again
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVerify}
                disabled={isChecking}
                className="border-[#274631] bg-[#142319] text-xs text-[#a3c3af] hover:border-emerald-500/50 hover:bg-[#1a2f22] hover:text-white flex-1 sm:flex-initial"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-emerald-400 mr-1.5" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-3.5 text-emerald-400 mr-1.5" />
                    <span>I've Loaded It — Verify</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setActiveTab("setup")}
                className="bg-emerald-600 font-semibold text-xs text-white shadow-md hover:bg-emerald-500 flex-1 sm:flex-initial"
              >
                <Download className="size-3.5 mr-1.5" />
                <span>Get Extension</span>
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
