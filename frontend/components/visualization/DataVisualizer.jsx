"use client"

import React, { useState, useMemo } from "react"
import { BarChart3, LineChart, PieChart, Table as TableIcon, Check, Download, Sparkles, TrendingUp } from "lucide-react"

const PALETTE = ["#34c06a", "#1f7a47", "#e09b2e", "#3490c8", "#7c6ef7", "#e05c6a", "#0fa8a8"]

export default function DataVisualizer({
  columns = [],
  rows = [],
  visualIntent = null,
  title = "Query Result",
}) {
  const defaultToChart = visualIntent?.should_visualize && visualIntent?.recommended_chart !== "table"
  const [viewMode, setViewMode] = useState(defaultToChart ? "chart" : "table")
  const [chartType, setChartType] = useState(
    visualIntent?.recommended_chart && visualIntent.recommended_chart !== "table"
      ? visualIntent.recommended_chart
      : "bar"
  )
  const [copiedCsv, setCopiedCsv] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const { xKey, yKey, chartData, maxY } = useMemo(() => {
    if (!rows?.length || !columns?.length) return { xKey: null, yKey: null, chartData: [], maxY: 1 }
    
    const numCols = columns.filter(c => rows.slice(0, 8).every(r => r[c] !== null && !isNaN(Number(r[c]))))
    const strCols = columns.filter(c => !numCols.includes(c))
    
    const x = strCols[0] || columns[0]
    const y = numCols[0] || columns[1] || columns[0]
    
    const data = rows.map((r, i) => ({
      ...r,
      __x: r[x] !== null && r[x] !== undefined ? String(r[x]).slice(0, 14) : `#${i + 1}`,
      __y: parseFloat(r[y]) || 0,
    }))
    const max = Math.max(...data.map(d => d.__y), 1)
    return { xKey: x, yKey: y, chartData: data, maxY: max }
  }, [columns, rows])

  const exportCsv = () => {
    if (!rows?.length) return
    const csv = [columns.join(","), ...rows.map(r => columns.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    navigator.clipboard.writeText(csv)
    setCopiedCsv(true)
    setTimeout(() => setCopiedCsv(false), 1800)
  }

  if (!rows?.length) return (
    <div className="py-8 text-center text-[13px] text-[#a3b5a9] italic">No rows returned.</div>
  )

  const chartSlice = chartData.slice(0, 14)

  return (
    <div className="rounded-xl border border-[#e0e8e2] bg-white overflow-hidden">

      {/* ── Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e0e8e2] bg-[#f8faf8] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </span>
          {visualIntent?.should_visualize && (
            <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
              <TrendingUp className="size-3" /> Chart detected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type picker (when chart mode) */}
          {viewMode === "chart" && (
            <div className="flex items-center border border-[#e0e8e2] rounded-lg bg-white p-0.5 gap-0.5">
              {[["bar","Bar"], ["line","Line"], ["area","Area"], ["pie","Donut"]].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setChartType(k)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
                    chartType === k ? "bg-[#1a2920] text-white shadow-sm" : "text-[#667872] hover:bg-[#f0f5f1]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center border border-[#e0e8e2] rounded-lg bg-white p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
                viewMode === "table" ? "bg-[#1a2920] text-white" : "text-[#667872] hover:bg-[#f0f5f1]"
              }`}
            >
              <TableIcon className="size-3" /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
                viewMode === "chart" ? "bg-[#1a2920] text-white" : "text-[#667872] hover:bg-[#f0f5f1]"
              }`}
            >
              <BarChart3 className="size-3 text-[#34c06a]" /> Chart
            </button>
          </div>

          {/* CSV */}
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-[#e0e8e2] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#4a5e53] hover:bg-[#f0f5f1] transition-colors"
          >
            {copiedCsv ? <><Check className="size-3 text-emerald-500" /> Copied</> : <><Download className="size-3" /> CSV</>}
          </button>
        </div>
      </div>

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <div className="max-h-80 overflow-auto">
          <table className="w-full border-collapse text-[12.5px] font-mono">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#f3f7f4] border-b border-[#e0e8e2]">
                {columns.map(c => (
                  <th key={c} className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-[#4a6e5a] whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`border-b border-[#f0f4f1] transition-colors duration-75 ${hoveredIdx === i ? "bg-[#f5f9f6]" : ""}`}
                >
                  {columns.map(c => (
                    <td key={c} className="px-4 py-2.5 text-[#1a2920] whitespace-nowrap">
                      {row[c] === null || row[c] === undefined
                        ? <span className="italic text-[#b0c0b7]">null</span>
                        : String(row[c])
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Chart View ── */}
      {viewMode === "chart" && (
        <div className="p-5 space-y-4">
          {/* Axis labels */}
          <div className="flex items-center gap-2 text-[11.5px] text-[#667872]">
            <span className="font-bold font-mono text-[#141a17]">{yKey}</span>
            <span className="text-[#b0c0b7]">by</span>
            <span className="font-bold font-mono text-[#141a17]">{xKey}</span>
            {hoveredIdx !== null && chartSlice[hoveredIdx] && (
              <span className="ml-auto rounded-lg bg-[#1a2920] px-3 py-1 font-mono text-[11.5px] text-white">
                {chartSlice[hoveredIdx].__x}: <strong className="text-[#5de08a]">{chartSlice[hoveredIdx].__y.toLocaleString()}</strong>
              </span>
            )}
          </div>

          {/* BAR CHART */}
          {chartType === "bar" && (
            <div className="flex items-end gap-2 h-48 pb-2 border-b-2 border-[#e0e8e2] px-1">
              {chartSlice.map((d, i) => {
                const h = Math.max(6, (d.__y / maxY) * 100)
                const isHov = hoveredIdx === i
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <div
                      style={{ height: `${h}%`, backgroundColor: isHov ? "#1f7a47" : "#34c06a" }}
                      className="w-full max-w-10 rounded-t-lg transition-all duration-150"
                    />
                    <span className="text-[9.5px] font-mono text-[#8a9e93] truncate max-w-10 text-center">{d.__x}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* LINE CHART */}
          {chartType === "line" && (
            <div className="h-48 flex flex-col">
              <svg className="flex-1 w-full overflow-visible" viewBox={`0 0 ${chartSlice.length * 50 || 400} 110`} preserveAspectRatio="none">
                {/* Gridlines */}
                {[25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="5000" y2={y} stroke="#e8ede9" strokeWidth="0.8" />
                ))}
                {/* Area fill */}
                <defs>
                  <linearGradient id="lgLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34c06a" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#34c06a" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#lgLine)"
                  points={`25,110 ${chartSlice.map((d, i) => `${i * 50 + 25},${108 - (d.__y / maxY) * 90}`).join(" ")} ${(chartSlice.length - 1) * 50 + 25},110`}
                />
                {/* Line */}
                <polyline
                  fill="none" stroke="#34c06a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points={chartSlice.map((d, i) => `${i * 50 + 25},${108 - (d.__y / maxY) * 90}`).join(" ")}
                />
                {/* Dots */}
                {chartSlice.map((d, i) => (
                  <circle
                    key={i}
                    cx={i * 50 + 25}
                    cy={108 - (d.__y / maxY) * 90}
                    r={hoveredIdx === i ? 6 : 4}
                    fill={hoveredIdx === i ? "#1a2920" : "#34c06a"}
                    stroke="white" strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}
              </svg>
              <div className="flex justify-between text-[9.5px] font-mono text-[#a3b5a9] mt-1 px-2">
                <span>{chartSlice[0]?.__x}</span>
                <span>{chartSlice[Math.floor(chartSlice.length / 2)]?.__x}</span>
                <span>{chartSlice[chartSlice.length - 1]?.__x}</span>
              </div>
            </div>
          )}

          {/* AREA CHART */}
          {chartType === "area" && (
            <div className="h-48 flex flex-col">
              <svg className="flex-1 w-full overflow-visible" viewBox={`0 0 ${chartSlice.length * 50 || 400} 110`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lgArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34c06a" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#34c06a" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="5000" y2={y} stroke="#e8ede9" strokeWidth="0.8" />
                ))}
                <polygon
                  fill="url(#lgArea)"
                  points={`25,110 ${chartSlice.map((d, i) => `${i * 50 + 25},${108 - (d.__y / maxY) * 90}`).join(" ")} ${(chartSlice.length - 1) * 50 + 25},110`}
                />
                <polyline
                  fill="none" stroke="#34c06a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points={chartSlice.map((d, i) => `${i * 50 + 25},${108 - (d.__y / maxY) * 90}`).join(" ")}
                />
              </svg>
            </div>
          )}

          {/* PIE / DONUT */}
          {chartType === "pie" && (
            <div className="flex gap-6 items-start h-48">
              <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto">
                {chartSlice.slice(0, 8).map((d, i) => {
                  const total = chartSlice.reduce((a, c) => a + c.__y, 0) || 1
                  const pct = Math.round((d.__y / total) * 100)
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-all duration-150 ${hoveredIdx === i ? "border-[#34c06a] bg-emerald-50" : "border-[#e0e8e2] bg-white hover:border-[#b8d4bc]"}`}
                    >
                      <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-bold text-[#141a17] truncate leading-none">{d.__x}</p>
                        <p className="text-[10.5px] font-mono text-[#667872] mt-0.5">{pct}% · {d.__y.toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
