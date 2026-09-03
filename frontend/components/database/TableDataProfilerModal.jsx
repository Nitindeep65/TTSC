"use client"

import React, { useState, useEffect } from "react"
import { databaseApi } from "@/lib/api"
import {
  Columns,
  Database,
  Eye,
  Key,
  Layers,
  Loader2,
  Table2,
  Tag,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TableDataProfilerModal({ isOpen, onClose, tableName, connectionUri }) {
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState("")
  const [copiedVal, setCopiedVal] = useState(null)

  useEffect(() => {
    let ignore = false

    async function load(tbl) {
      setLoading(true)
      setError("")
      try {
        const data = await databaseApi.sample({
          connection_uri: connectionUri || "",
          table_name: tbl,
          limit: 5,
        })
        if (!ignore) {
          setProfileData(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.detail || err.message || "Failed to profile table data.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (isOpen && tableName) {
      load(tableName)
    }

    return () => {
      ignore = true
    }
  }, [isOpen, tableName, connectionUri])

  if (!isOpen) return null

  const profilesWithEnums = (profileData?.column_profiles || []).filter(
    (p) => p.distinct_values && p.distinct_values.length > 0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92dvh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5 shrink-0 bg-muted/30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Table2 className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-foreground font-mono truncate">
                  {tableName || "Table"}
                </h2>
                <Badge variant="emerald" className="text-[9px] uppercase font-bold shrink-0">
                  Data Profiler
                </Badge>
                {profileData && (
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0 hidden xs:inline">
                    ({profileData.row_count} rows)
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Safe 5-row live preview &amp; categorical value distribution.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-emerald-500">
              <Loader2 className="size-7 animate-spin" />
              <span className="text-xs font-semibold text-muted-foreground">
                Introspecting records &amp; categorical distributions…
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && profileData && (
            <>
              {/* Categorical Value Distribution Pill Card */}
              {profilesWithEnums.length > 0 && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Categorical Value Enums (Injected into AI Grounding)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {profilesWithEnums.map((p) => (
                      <div key={p.name} className="rounded-lg bg-card border border-border p-2.5 space-y-1 shadow-2xs">
                        <span className="font-mono text-xs font-bold text-foreground block">
                          {p.name}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {p.distinct_values.map((val) => {
                            const isThisCopied = copiedVal === `${p.name}:${val}`
                            const filterText = `${p.name} = '${val}'`
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(filterText)
                                  setCopiedVal(`${p.name}:${val}`)
                                  setTimeout(() => setCopiedVal(null), 1500)
                                }}
                                title={`Click to copy SQL filter: ${filterText}`}
                                className={`group/val relative rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                                  isThisCopied
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs scale-105"
                                    : "bg-muted border-border text-foreground hover:bg-muted/80 hover:border-border-hover shadow-2xs"
                                }`}
                              >
                                {isThisCopied ? "Copied filter!" : `'${val}'`}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Live Sample Records Preview
                </span>
                <div className="rounded-xl border border-border overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          {profileData.columns.map((c) => (
                            <th key={c} className="p-2.5 font-bold text-foreground whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-card">
                        {profileData.rows.map((r, ri) => (
                          <tr key={ri} className="hover:bg-muted/30 transition-colors">
                            {profileData.columns.map((c) => (
                              <td key={c} className="p-2.5 text-foreground whitespace-nowrap max-w-xs truncate">
                                {r[c] === null || r[c] === undefined ? (
                                  <span className="text-muted-foreground/60 italic font-sans">NULL</span>
                                ) : typeof r[c] === "object" ? (
                                  JSON.stringify(r[c])
                                ) : (
                                  String(r[c])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border shrink-0 bg-muted/20">
          <Button variant="default" size="sm" onClick={onClose} className="px-5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            Done
          </Button>
        </div>

      </div>
    </div>
  )
}
