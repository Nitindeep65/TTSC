"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
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

const API = "http://127.0.0.1:8000"

export default function TableDataProfilerModal({ isOpen, onClose, tableName, connectionUri }) {
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    async function load(tbl) {
      setLoading(true)
      setError("")
      try {
        const res = await axios.post(`${API}/api/database/sample`, {
          connection_uri: connectionUri || "",
          table_name: tbl,
          limit: 5,
        })
        if (!ignore) {
          setProfileData(res.data)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[--border] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[--border] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
              <Table2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#17241c] font-mono">
                  {tableName || "Table"}
                </h2>
                <Badge variant="emerald" className="text-[9.5px] uppercase font-bold">
                  Data Profiler
                </Badge>
                {profileData && (
                  <span className="text-xs text-[#8a9e93] font-mono">
                    ({profileData.row_count} sample rows)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#607266]">
                Safe 5-row live preview &amp; categorical value distribution for zero-hallucination WHERE filters.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#738478] hover:text-[#17241c]"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-[#34c06a]">
              <Loader2 className="size-7 animate-spin" />
              <span className="text-xs font-semibold text-[#526458]">
                Introspecting records &amp; categorical distributions…
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && profileData && (
            <>
              {/* Categorical Value Distribution Pill Card */}
              {profilesWithEnums.length > 0 && (
                <div className="rounded-xl border border-[#cde5d4] bg-[#f4faf6] p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-[#2b7948]" />
                    <span className="text-xs font-bold text-[#1a4d2e] uppercase tracking-wide">
                      Categorical Value Enums (Injected into AI Grounding)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {profilesWithEnums.map((p) => (
                      <div key={p.name} className="rounded-lg bg-white border border-[#d3e8da] p-2.5 space-y-1 shadow-2xs">
                        <span className="font-mono text-xs font-bold text-[#17241c] block">
                          {p.name}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {p.distinct_values.map((val) => (
                            <span
                              key={val}
                              className="rounded-md bg-[#eef7f1] border border-[#c1e2cd] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#1f6b3d]"
                            >
                              &apos;{val}&apos;
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#55675c] uppercase tracking-wider block">
                  Live Sample Records Preview
                </span>
                <div className="rounded-xl border border-[--border] overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="bg-[#f0f4f1] border-b border-[--border]">
                          {profileData.columns.map((c) => (
                            <th key={c} className="p-2.5 font-bold text-[#1b432e] whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf1ee] bg-white">
                        {profileData.rows.map((r, ri) => (
                          <tr key={ri} className="hover:bg-[#fbfdfb] transition-colors">
                            {profileData.columns.map((c) => (
                              <td key={c} className="p-2.5 text-[#2c3d33] whitespace-nowrap max-w-xs truncate">
                                {r[c] === null || r[c] === undefined ? (
                                  <span className="text-[#a0b2a7] italic font-sans">NULL</span>
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
        <div className="flex justify-end pt-4 border-t border-[--border] mt-2 shrink-0">
          <Button variant="default" size="sm" onClick={onClose} className="px-5 font-semibold">
            Done
          </Button>
        </div>

      </div>
    </div>
  )
}
