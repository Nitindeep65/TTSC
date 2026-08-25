"use client"

import React, { useState, useEffect, useCallback } from "react"
import { memoryApi } from "@/lib/api"
import {
  Bookmark,
  Check,
  Code2,
  Copy,
  FolderKanban,
  Hash,
  Loader2,
  Play,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function QueryNotebookModal({ isOpen, onClose, onSelectQuery, activeDbName }) {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // New Snippet Form
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newPrompt, setNewPrompt] = useState("")
  const [newSql, setNewSql] = useState("")
  const [newTags, setNewTags] = useState("#finance")
  const [isSaving, setIsSaving] = useState(false)

  const fetchNotebook = useCallback(async () => {
    setLoading(true)
    try {
      const data = await memoryApi.getNotebook()
      setQueries(data.queries || [])
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
          const data = await memoryApi.getNotebook()
          if (!ignore) {
            setQueries(data.queries || [])
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

  const handleCopy = (sql, id) => {
    navigator.clipboard.writeText(sql)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleDelete = async (id) => {
    if (!confirm("Remove this query snippet from notebook?")) return
    try {
      await memoryApi.deleteNotebook(id)
      fetchNotebook()
    } catch {
      alert("Failed to delete notebook snippet.")
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSql.trim() || !newPrompt.trim()) return
    setIsSaving(true)
    try {
      const tagList = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith("#") ? t : `#${t}`))

      await memoryApi.saveNotebook({
        title: newTitle.trim() || newPrompt.trim().slice(0, 40),
        user_prompt: newPrompt.trim(),
        sql_query: newSql.trim(),
        tags: tagList.length > 0 ? tagList : ["#saved"],
        database_host: activeDbName || "postgres",
      })
      setNewTitle("")
      setNewPrompt("")
      setNewSql("")
      setIsAdding(false)
      fetchNotebook()
    } catch {
      alert("Failed to save query to notebook.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  // Extract all unique tags
  const allTags = Array.from(new Set(queries.flatMap((q) => q.tags || [])))

  // Filter queries
  const filtered = queries.filter((q) => {
    const s = searchTerm.toLowerCase()
    const matchesSearch =
      !s ||
      (q.title || "").toLowerCase().includes(s) ||
      (q.user_prompt || "").toLowerCase().includes(s) ||
      (q.sql_query || "").toLowerCase().includes(s)
    const matchesTag = !selectedTag || (q.tags || []).includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[--border] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--border] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
              <Bookmark className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#17241c]">Saved Query Notebook &amp; Snippets</h2>
                <Badge variant="emerald" className="text-[9.5px] uppercase font-bold">
                  Shared Cloud
                </Badge>
              </div>
              <p className="text-xs text-[#607266]">
                Syncs seamlessly with Chrome Extension &amp; team members for instant reuse.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isAdding ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsAdding((p) => !p)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>{isAdding ? "Cancel" : "Add Snippet"}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#738478]"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Search & Tags Row */}
        <div className="py-3 border-b border-[--border] space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="size-4 text-[#8a9e93] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved notebooks by keyword or SQL snippet…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[--border] text-xs text-[#17241c] outline-none placeholder:text-[#a0b2a7] focus:border-[#34c06a]"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#8a9e93] mr-1">Tags:</span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition ${
                  selectedTag === null
                    ? "bg-[#1f2d24] text-white"
                    : "bg-[#edf4ef] text-[#415549] hover:bg-[#dfeade]"
                }`}
              >
                All ({queries.length})
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition ${
                    selectedTag === t
                      ? "bg-[#1f2d24] text-white"
                      : "bg-[#edf4ef] text-[#415549] hover:bg-[#dfeade]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-3">

          {/* Add Snippet Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="rounded-xl border border-[#cde5d4] bg-[#f4faf6] p-4 space-y-3 mb-4">
              <span className="text-xs font-bold text-[#1b6b3a] uppercase tracking-wide block">
                Add New Query Snippet
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#354c3e] block mb-1">Snippet Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Daily Revenue by Payment Method"
                    className="w-full rounded-lg border border-[--border] bg-white px-3 py-1.5 text-xs text-[#17241c] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#354c3e] block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="#finance, #daily-ops"
                    className="w-full rounded-lg border border-[--border] bg-white px-3 py-1.5 text-xs text-[#17241c] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#354c3e] block mb-1">Natural Language Description</label>
                <input
                  type="text"
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g. Show sum of revenue grouped by payment method for completed orders"
                  className="w-full rounded-lg border border-[--border] bg-white px-3 py-1.5 text-xs text-[#17241c] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#354c3e] block mb-1">PostgreSQL Query (SELECT)</label>
                <textarea
                  required
                  rows={3}
                  value={newSql}
                  onChange={(e) => setNewSql(e.target.value)}
                  placeholder="SELECT payment_method, SUM(amount) FROM payments WHERE status = 'succeeded' GROUP BY payment_method;"
                  className="w-full font-mono rounded-lg border border-[--border] bg-[#0d1613] text-[#c4e6d2] p-3 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#cde5d4]">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="gap-1.5 font-semibold"
                >
                  {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  <span>Save Snippet</span>
                </Button>
              </div>
            </form>
          )}

          {loading && (
            <div className="py-12 text-center text-xs text-[#6e8074] flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-[#34c06a]" />
              <span>Loading saved query notebooks…</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-[#8a9e93]">
              No saved query snippets match your filter.
            </div>
          )}

          {!loading &&
            filtered.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-[--border] bg-white p-4 space-y-2.5 shadow-2xs hover:border-[#b8d4bc] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-[#17241c]">{q.title}</span>
                    {(q.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#edf5ef] border border-[#d6ebd9] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#1b6b3a]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(q.sql_query, q.id)}
                      className="h-7 text-xs text-[#607266] gap-1 hover:text-[#17241c]"
                    >
                      {copiedId === q.id ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      <span className="text-[11px]">{copiedId === q.id ? "Copied" : "Copy"}</span>
                    </Button>

                    {onSelectQuery && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectQuery(q.sql_query, q.user_prompt)
                          onClose()
                        }}
                        className="h-7 text-xs bg-[#1f7a47] hover:bg-[#186038] text-white gap-1"
                      >
                        <Play className="size-3" />
                        <span className="text-[11px]">Load in Chat</span>
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#8b9b90] hover:text-red-600 transition"
                      title="Delete from Notebook"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#607266] leading-relaxed">{q.user_prompt}</p>

                <pre className="overflow-x-auto rounded-lg bg-[#0d1613] p-3 font-mono text-[11px] text-[#c4e6d2]">
                  <code>{q.sql_query}</code>
                </pre>
              </div>
            ))}

        </div>

      </div>
    </div>
  )
}
