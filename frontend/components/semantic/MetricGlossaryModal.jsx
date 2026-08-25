"use client"

import React, { useState, useEffect, useCallback } from "react"
import { semanticApi } from "@/lib/api"
import {
  BookOpen,
  Check,
  Code2,
  FolderKanban,
  Layers,
  Lightbulb,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MetricGlossaryModal({ isOpen, onClose }) {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("list") // "list", "teach", "manual"
  
  // Teach AI Form State
  const [teachPrompt, setTeachPrompt] = useState("")
  const [isTeaching, setIsTeaching] = useState(false)

  // Manual Form State
  const [manualName, setManualName] = useState("")
  const [manualDef, setManualDef] = useState("")
  const [manualSql, setManualSql] = useState("")
  const [manualCategory, setManualCategory] = useState("Finance")
  const [isSavingManual, setIsSavingManual] = useState(false)

  // Policy Document Upload State
  const [policyTitle, setPolicyTitle] = useState("")
  const [policyText, setPolicyText] = useState("")
  const [isUploadingPolicy, setIsUploadingPolicy] = useState(false)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    try {
      const data = await semanticApi.getMetrics()
      setMetrics(data.metrics || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      if (isOpen) {
        setLoading(true)
        try {
          const data = await semanticApi.getMetrics()
          if (!ignore) {
            setMetrics(data.metrics || [])
          }
        } catch {
          // ignore
        } finally {
          if (!ignore) {
            setLoading(false)
          }
        }
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [isOpen])

  const handleTeachAI = async (e) => {
    e.preventDefault()
    if (!teachPrompt.trim()) return
    setIsTeaching(true)
    try {
      await semanticApi.teachAI({ instruction: teachPrompt.trim() })
      setTeachPrompt("")
      setActiveTab("list")
      fetchMetrics()
    } catch (e) {
      alert("Failed to extract business metric: " + (e.response?.data?.detail || e.message))
    } finally {
      setIsTeaching(false)
    }
  }

  const handleCreateManual = async (e) => {
    e.preventDefault()
    if (!manualName.trim() || !manualDef.trim()) return
    setIsSavingManual(true)
    try {
      await semanticApi.createMetric({
        name: manualName.trim(),
        definition: manualDef.trim(),
        sql_formula: manualSql.trim() || null,
        category: manualCategory,
        tags: [manualCategory.toLowerCase()],
      })
      setManualName("")
      setManualDef("")
      setManualSql("")
      setActiveTab("list")
      fetchMetrics()
    } catch (e) {
      alert("Failed to save metric: " + (e.response?.data?.detail || e.message))
    } finally {
      setIsSavingManual(false)
    }
  }

  const handleUploadPolicy = async (e) => {
    e.preventDefault()
    if (!policyText.trim()) return
    setIsUploadingPolicy(true)
    try {
      await semanticApi.uploadPolicy({
        title: policyTitle.trim() || "Policy Document",
        content: policyText.trim(),
      })
      setPolicyTitle("")
      setPolicyText("")
      setActiveTab("list")
      fetchMetrics()
    } catch (e) {
      alert("Failed to extract policy rules: " + (e.response?.data?.detail || e.message))
    } finally {
      setIsUploadingPolicy(false)
    }
  }

  const handleDeleteMetric = async (id) => {
    if (!confirm("Remove this business metric rule?")) return
    try {
      await semanticApi.deleteMetric(id)
      fetchMetrics()
    } catch {
      alert("Failed to delete metric.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#17241c]">Semantic Layer &amp; Custom Metrics</h2>
                <Badge variant="emerald" className="text-[9px] uppercase font-bold">RAG Layer</Badge>
              </div>
              <p className="text-xs text-[#607266]">
                Define company-specific formulas (e.g. Net MRR, VIP Customers) for zero-hallucination grounding.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            className="text-[#738478]"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-border pt-4 pb-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "list"
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#edf4ef]"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Active Glossary ({metrics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("teach")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "teach"
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#edf4ef]"
            }`}
          >
            <Sparkles className="size-3.5 text-[#3ba565]" />
            <span>Teach AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "upload"
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#edf4ef]"
            }`}
          >
            <FolderKanban className="size-3.5 text-blue-500" />
            <span>Upload Policy (RAG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "manual"
                ? "bg-[#1f2d24] text-white shadow-2xs"
                : "text-[#55675c] hover:bg-[#edf4ef]"
            }`}
          >
            <Code2 className="size-3.5" />
            <span>Explicit SQL</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="mt-4 max-h-96 overflow-y-auto pr-1">
          
          {/* TAB 1: List of Active Metrics */}
          {activeTab === "list" && (
            <div className="space-y-2.5">
              {metrics.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6e8074]">
                  No custom metrics defined yet. Click &quot;Teach AI&quot; or &quot;Upload Policy&quot; above to add one.
                </div>
              ) : (
                metrics.map((m) => (
                  <div
                    key={m.id}
                    className="group rounded-xl border border-border bg-[#fcfdfc] p-3.5 shadow-3xs space-y-2 transition-all hover:border-[#b8d8c2] hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#17241c]">{m.name}</span>
                        <Badge variant="secondary" className="text-[9px] font-semibold">
                          {m.category}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMetric(m.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8b9b90] hover:text-red-600 transition"
                        title="Delete Metric"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[#526458] leading-relaxed">
                      {m.definition}
                    </p>

                    {m.sql_formula && (
                      <div className="rounded-lg bg-[#f0f5f1] border border-[#d6ebd9] p-2 font-mono text-[10.5px] text-[#226841]">
                        <span className="text-[9px] uppercase font-bold text-[#5e836b] block">SQL Formula:</span>
                        <code>{m.sql_formula}</code>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Teach AI Mode */}
          {activeTab === "teach" && (
            <form onSubmit={handleTeachAI} className="space-y-4">
              <div className="rounded-xl border border-[#cbe1d2] bg-[#f2faf4] p-3 text-xs text-[#206642] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lightbulb className="size-3.5" />
                  <span>Conversational Teaching</span>
                </div>
                <p className="text-[11px] text-[#3b664d] leading-relaxed">
                  Type any business rule in natural language. The AI will extract the entity name, definition, and PostgreSQL SQL filter automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1.5">
                  Business Rule Instruction
                </label>
                <textarea
                  required
                  rows={3}
                  value={teachPrompt}
                  onChange={(e) => setTeachPrompt(e.target.value)}
                  placeholder="e.g. From now on, consider a 'VIP Customer' as anyone who has completed at least 3 orders and spent over $1,000 this year."
                  className="w-full rounded-xl border border-input bg-white p-3 text-xs text-[#17241c] outline-none placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="submit"
                  variant="default"
                  disabled={!teachPrompt.trim() || isTeaching}
                  className="gap-1.5"
                >
                  {isTeaching ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Extracting &amp; Learning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5 text-[#71c897]" />
                      <span>Teach &amp; Save Rule</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: Document Policy Upload (Document RAG) */}
          {activeTab === "upload" && (
            <form onSubmit={handleUploadPolicy} className="space-y-3.5">
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <FolderKanban className="size-3.5" />
                  <span>Document RAG (Batch Policy Ingestion)</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Paste internal policy documents (e.g. &quot;Q3 Financial Definitions&quot;, CSV columns, or PDF text). The engine chunks the document and extracts all KPI rules at once.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1">
                  Policy Document Title
                </label>
                <input
                  type="text"
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  placeholder="e.g. Q3 2024 Revenue &amp; Customer Health Definitions"
                  className="w-full rounded-xl border border-input bg-white px-3 py-2 text-xs text-[#17241c] outline-none focus:border-[#4ca873]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1">
                  Document Content / Policy Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  placeholder="Paste policy document text, markdown definitions, or CSV formulas here..."
                  className="w-full rounded-xl border border-input bg-white p-3 text-xs text-[#17241c] outline-none placeholder:text-[#9aa79e] focus:border-[#4ca873]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="submit"
                  variant="default"
                  disabled={!policyText.trim() || isUploadingPolicy}
                  className="gap-1.5"
                >
                  {isUploadingPolicy ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Extracting &amp; Indexing Rules…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5 text-[#71c897]" />
                      <span>Extract &amp; Save All Rules</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 4: Manual SQL Formula Override */}
          {activeTab === "manual" && (
            <form onSubmit={handleCreateManual} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1">
                    Metric Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Net MRR, High Risk Churn"
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-xs text-[#17241c] outline-none focus:border-[#4ca873]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full rounded-xl border border-input bg-white px-3 py-2 text-xs text-[#17241c] outline-none focus:border-[#4ca873]"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Customer">Customer</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1">
                  Plain-English Definition <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualDef}
                  onChange={(e) => setManualDef(e.target.value)}
                  placeholder="e.g. Total revenue excluding refunds and canceled invoices"
                  className="w-full rounded-xl border border-input bg-white px-3 py-2 text-xs text-[#17241c] outline-none focus:border-[#4ca873]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1">
                  Explicit SQL Expression (Optional)
                </label>
                <input
                  type="text"
                  value={manualSql}
                  onChange={(e) => setManualSql(e.target.value)}
                  placeholder="e.g. SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END)"
                  className="w-full rounded-xl border border-input bg-white px-3 py-2 font-mono text-xs text-[#17241c] outline-none focus:border-[#4ca873]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="submit"
                  variant="default"
                  disabled={!manualName.trim() || !manualDef.trim() || isSavingManual}
                  className="gap-1.5"
                >
                  {isSavingManual ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Add Metric</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  )
}

