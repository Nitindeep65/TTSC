"use client"

import React, { useState, useMemo } from "react"
import {
  BarChart3,
  LineChart,
  PieChart as PieIcon,
  Table as TableIcon,
  Check,
  Download,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpDown,
  Zap,
} from "lucide-react"

const PALETTE = [
  "#34c06a", // Vibrant Emerald
  "#1f7a47", // Forest Green
  "#38a3a5", // Teal Ocean
  "#226f54", // Deep Jade
  "#e09b2e", // Amber Gold
  "#3490c8", // Cerulean Blue
  "#7c6ef7", // Indigo Violet
  "#e05c6a", // Coral Rose
]

// Generate smooth cubic bezier SVG path from a series of points
function getSmoothCurvePath(points) {
  if (!points || points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const prev = points[i - 1] || curr
    const nextNext = points[i + 2] || next

    const cp1x = curr.x + (next.x - prev.x) / 6
    const cp1y = curr.y + (next.y - prev.y) / 6
    const cp2x = next.x - (nextNext.x - curr.x) / 6
    const cp2y = next.y - (nextNext.y - curr.y) / 6

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${next.x},${next.y}`
  }
  return d
}

function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0"
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return Number(num).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

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
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState("asc")

  // Dimension & Metric inference
  const { xKey, yKey, chartData, maxY, totalSum, avgVal, peakItem } = useMemo(() => {
    if (!rows?.length || !columns?.length) {
      return { xKey: null, yKey: null, chartData: [], maxY: 1, totalSum: 0, avgVal: 0, peakItem: null }
    }

    const numCols = columns.filter(c => rows.slice(0, 10).every(r => r[c] !== null && !isNaN(Number(r[c]))))
    const strCols = columns.filter(c => !numCols.includes(c))

    const x = strCols[0] || columns[0]
    const y = numCols[0] || columns[1] || columns[0]

    let sum = 0
    let peak = null
    let max = 0

    const data = rows.map((r, i) => {
      const val = parseFloat(r[y]) || 0
      sum += val
      if (val > max) {
        max = val
        peak = { label: String(r[x] ?? `#${i + 1}`), val }
      }
      return {
        ...r,
        __x: r[x] !== null && r[x] !== undefined ? String(r[x]).slice(0, 16) : `#${i + 1}`,
        __y: val,
        __rawIndex: i,
      }
    })

    const avg = data.length > 0 ? sum / data.length : 0
    const calculatedMax = max > 0 ? max * 1.15 : 1

    return {
      xKey: x,
      yKey: y,
      chartData: data,
      maxY: calculatedMax,
      totalSum: sum,
      avgVal: avg,
      peakItem: peak || (data[0] ? { label: data[0].__x, val: data[0].__y } : null),
    }
  }, [columns, rows])

  // Sorted rows for table view
  const sortedRows = useMemo(() => {
    if (!sortCol) return rows
    return [...rows].sort((a, b) => {
      const vA = a[sortCol]
      const vB = b[sortCol]
      if (vA === vB) return 0
      if (vA === null || vA === undefined) return 1
      if (vB === null || vB === undefined) return -1

      const numA = Number(vA)
      const numB = Number(vB)
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDir === "asc" ? numA - numB : numB - numA
      }
      return sortDir === "asc"
        ? String(vA).localeCompare(String(vB))
        : String(vB).localeCompare(String(vA))
    })
  }, [rows, sortCol, sortDir])

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(p => (p === "asc" ? "desc" : "asc"))
    } else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  const exportCsv = () => {
    if (!rows?.length) return
    const csv = [
      columns.join(","),
      ...rows.map(r => columns.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n")
    navigator.clipboard.writeText(csv)
    setCopiedCsv(true)
    setTimeout(() => setCopiedCsv(false), 1800)
  }

  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-[#dce7e0] bg-white overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e4ece6] bg-[#f9faf9] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100/80 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              0 rows (Empty Table)
            </span>
            {columns?.length > 0 && (
              <span className="text-[11px] text-[#6d8276] font-medium">
                {columns.length} {columns.length === 1 ? "column" : "columns"} detected
              </span>
            )}
          </div>
        </div>

        {columns?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#f2f6f3] border-b border-[#dce7e0]">
                  {columns.map(c => (
                    <th key={c} className="px-4 py-2.5 font-bold text-[#1a2920] uppercase tracking-wider text-[11px]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="px-4 py-9 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-center">
                      <div className="size-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-sm font-bold shadow-2xs">
                        0
                      </div>
                      <p className="text-[13px] font-bold text-[#111c16]">
                        Query executed successfully (0 records returned)
                      </p>
                      <p className="text-[11.5px] text-[#6d8276] max-w-md leading-relaxed">
                        This table exists in your connected database schema with the columns shown above, but contains no inserted records.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[13px] text-[#6d8276]">
            Query executed successfully. 0 rows returned.
          </div>
        )}
      </div>
    )
  }

  const chartSlice = chartData.slice(0, 16)
  const svgWidth = Math.max(chartSlice.length * 48, 380)
  const svgHeight = 130

  // Line & Area coordinates
  const curvePoints = chartSlice.map((d, i) => {
    const x = chartSlice.length === 1 ? svgWidth / 2 : (i / (chartSlice.length - 1)) * (svgWidth - 40) + 20
    const y = svgHeight - 20 - (d.__y / maxY) * (svgHeight - 35)
    return { x, y, data: d }
  })
  const smoothPath = getSmoothCurvePath(curvePoints)
  const areaPath = curvePoints.length > 0
    ? `${smoothPath} L ${curvePoints[curvePoints.length - 1].x} ${svgHeight - 15} L ${curvePoints[0].x} ${svgHeight - 15} Z`
    : ""

  // Donut chart math
  const donutRadius = 46
  const donutCircumference = 2 * Math.PI * donutRadius
  let cumulativeOffset = 0
  const donutSlices = chartSlice.slice(0, 8).map((d, i) => {
    const fraction = totalSum > 0 ? d.__y / totalSum : 1 / chartSlice.length
    const strokeLength = fraction * donutCircumference
    const strokeGap = donutCircumference - strokeLength
    const offset = cumulativeOffset
    cumulativeOffset += strokeLength
    const pct = Math.round(fraction * 100)
    return {
      data: d,
      pct,
      color: PALETTE[i % PALETTE.length],
      strokeDasharray: `${strokeLength.toFixed(2)} ${strokeGap.toFixed(2)}`,
      strokeDashoffset: (-offset).toFixed(2),
    }
  })

  return (
    <div className="rounded-2xl border border-[#dce7e0] bg-white shadow-xs overflow-hidden transition-all">

      {/* ── Top Control & Tab Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#e4ece6] bg-[#f9faf9] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 shadow-2xs">
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </span>
          {visualIntent?.should_visualize && (
            <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-blue-800">
              <TrendingUp className="size-3" /> Chart Detected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          {viewMode === "chart" && (
            <div className="flex items-center border border-[#d4e2d8] rounded-xl bg-white p-0.5 gap-0.5 shadow-2xs">
              {[
                { type: "bar", label: "Bar" },
                { type: "line", label: "Line" },
                { type: "area", label: "Area" },
                { type: "pie", label: "Donut" },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setChartType(type)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                    chartType === type
                      ? "bg-[#111c16] text-[#5de08a] shadow-xs"
                      : "text-[#667872] hover:bg-[#edf5ef] hover:text-[#111c16]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Table / Chart Mode Switcher */}
          <div className="flex items-center border border-[#d4e2d8] rounded-xl bg-white p-0.5 gap-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#111c16] text-white shadow-xs"
                  : "text-[#667872] hover:bg-[#edf5ef] hover:text-[#111c16]"
              }`}
            >
              <TableIcon className="size-3.5" />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                viewMode === "chart"
                  ? "bg-[#111c16] text-[#5de08a] shadow-xs"
                  : "text-[#667872] hover:bg-[#edf5ef] hover:text-[#111c16]"
              }`}
            >
              <BarChart3 className="size-3.5" />
              <span>Chart</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4e2d8] bg-white px-2.5 py-1 text-[11px] font-bold text-[#1b5c38] hover:bg-[#edf5ef] hover:border-[#b8d4bc] transition-all shadow-2xs cursor-pointer"
          >
            {copiedCsv ? (
              <>
                <Check className="size-3 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Download className="size-3" />
                <span>CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Executive KPI Summary Tiles ── */}
      {viewMode === "chart" && chartData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#fbfdfb] border-b border-[#e6efe9]">
          <div className="rounded-xl border border-[#dce7e0] bg-white p-2.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#73887d]">Total Sum</p>
            <p className="text-[14px] font-extrabold font-mono text-[#111c16] mt-0.5">{formatNumber(totalSum)}</p>
          </div>
          <div className="rounded-xl border border-[#dce7e0] bg-white p-2.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#73887d]">Average Value</p>
            <p className="text-[14px] font-extrabold font-mono text-[#111c16] mt-0.5">{formatNumber(avgVal)}</p>
          </div>
          <div className="rounded-xl border border-[#dce7e0] bg-white p-2.5 shadow-2xs truncate">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#73887d]">Peak Record</p>
            <p className="text-[14px] font-extrabold font-mono text-[#1f7a47] mt-0.5 truncate" title={peakItem?.label}>
              {peakItem ? `${formatNumber(peakItem.val)} (${peakItem.label})` : "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-[#dce7e0] bg-white p-2.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#73887d]">Dimensions</p>
            <p className="text-[14px] font-extrabold font-mono text-[#111c16] mt-0.5">{chartData.length} entries</p>
          </div>
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <div className="max-h-84 overflow-auto">
          <table className="w-full border-collapse text-[12.5px] font-mono">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#f2f6f3] border-b border-[#dce7e0]">
                {columns.map(c => (
                  <th
                    key={c}
                    onClick={() => handleSort(c)}
                    className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#22362b] whitespace-nowrap cursor-pointer hover:bg-[#e4ece6] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{c}</span>
                      <ArrowUpDown className="size-3 text-[#8ea396]" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`border-b border-[#f0f4f1] transition-colors duration-75 ${
                    hoveredIdx === i ? "bg-[#f4f9f5]" : i % 2 === 0 ? "bg-white" : "bg-[#fcfdfc]"
                  }`}
                >
                  {columns.map(c => (
                    <td key={c} className="px-4 py-2.5 text-[#111c16] whitespace-nowrap">
                      {row[c] === null || row[c] === undefined ? (
                        <span className="italic text-[#a8b8af]">null</span>
                      ) : (
                        String(row[c])
                      )}
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
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Active Hover / Metric Focus Ribbon */}
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#55695e]">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono font-bold text-[#111c16] bg-[#edf5ef] border border-[#cde2d4] px-2 py-0.5 rounded-md">
                {yKey}
              </span>
              <span className="text-[#8ea396]">grouped by</span>
              <span className="font-mono font-bold text-[#111c16] bg-[#edf5ef] border border-[#cde2d4] px-2 py-0.5 rounded-md">
                {xKey}
              </span>
            </div>

            {hoveredIdx !== null && chartSlice[hoveredIdx] && (
              <div className="flex items-center gap-2 rounded-xl bg-[#111c16] px-3.5 py-1 text-white font-mono text-[12px] shadow-sm animate-scale-in">
                <span>{chartSlice[hoveredIdx].__x}:</span>
                <strong className="text-[#5de08a]">{chartSlice[hoveredIdx].__y.toLocaleString()}</strong>
                <span className="text-[10px] text-[#97aba0]">
                  ({totalSum > 0 ? Math.round((chartSlice[hoveredIdx].__y / totalSum) * 100) : 0}%)
                </span>
              </div>
            )}
          </div>

          {/* 1. BAR CHART */}
          {chartType === "bar" && (
            <div className="relative h-56 pt-3 pb-2 px-1 flex flex-col justify-end">
              {/* Avg benchmark reference line */}
              {avgVal > 0 && maxY > 0 && (
                <div
                  style={{ bottom: `${(avgVal / maxY) * 100}%` }}
                  className="absolute left-0 right-0 border-b border-dashed border-emerald-400/60 pointer-events-none z-10 flex items-center justify-end px-2"
                >
                  <span className="bg-[#111c16] text-[#5de08a] text-[9px] font-mono px-1.5 py-0.2 rounded shadow-xs">
                    avg: {formatNumber(avgVal)}
                  </span>
                </div>
              )}

              <div className="flex items-end gap-2 sm:gap-3 h-full border-b-2 border-[#dce7e0] pb-1">
                {chartSlice.map((d, i) => {
                  const h = Math.max(6, (d.__y / maxY) * 100)
                  const isHov = hoveredIdx === i
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div
                        style={{ height: `${h}%` }}
                        className={`w-full max-w-11 rounded-t-xl transition-all duration-200 ${
                          isHov
                            ? "bg-gradient-to-t from-[#145330] to-[#34c06a] shadow-[0_0_12px_rgba(52,192,106,0.5)] scale-105"
                            : "bg-gradient-to-t from-[#1f7a47] to-[#34c06a] hover:from-[#145330] hover:to-[#34c06a]"
                        }`}
                      />
                      <span className="text-[10px] font-mono font-medium text-[#718578] truncate max-w-12 text-center group-hover:text-[#111c16]">
                        {d.__x}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. LINE CHART (Smooth Spline) */}
          {chartType === "line" && (
            <div className="h-56 flex flex-col justify-between pt-2">
              <svg className="flex-1 w-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34c06a" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#34c06a" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid */}
                {[20, 55, 90].map(y => (
                  <line key={y} x1="0" y1={y} x2={svgWidth} y2={y} stroke="#eaf0eb" strokeWidth="1" strokeDasharray="3 3" />
                ))}

                {/* Area under curve */}
                {areaPath && <path d={areaPath} fill="url(#lineGlow)" />}

                {/* Smooth Curve */}
                {smoothPath && (
                  <path
                    d={smoothPath}
                    fill="none"
                    stroke="#22874a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {curvePoints.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredIdx === i ? 6.5 : 4.5}
                      fill={hoveredIdx === i ? "#111c16" : "#34c06a"}
                      stroke="white"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                ))}
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-[#718578] px-2 pt-1 border-t border-[#dce7e0]">
                <span className="truncate">{chartSlice[0]?.__x}</span>
                <span className="truncate">{chartSlice[Math.floor(chartSlice.length / 2)]?.__x}</span>
                <span className="truncate">{chartSlice[chartSlice.length - 1]?.__x}</span>
              </div>
            </div>
          )}

          {/* 3. AREA CHART */}
          {chartType === "area" && (
            <div className="h-56 flex flex-col justify-between pt-2">
              <svg className="flex-1 w-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <defs>
                  <linearGradient id="areaRichGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34c06a" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#34c06a" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {[20, 55, 90].map(y => (
                  <line key={y} x1="0" y1={y} x2={svgWidth} y2={y} stroke="#eaf0eb" strokeWidth="1" strokeDasharray="3 3" />
                ))}

                {areaPath && <path d={areaPath} fill="url(#areaRichGlow)" />}
                {smoothPath && (
                  <path
                    d={smoothPath}
                    fill="none"
                    stroke="#1f7a47"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-[#718578] px-2 pt-1 border-t border-[#dce7e0]">
                <span>{chartSlice[0]?.__x}</span>
                <span>{chartSlice[chartSlice.length - 1]?.__x}</span>
              </div>
            </div>
          )}

          {/* 4. DONUT / PIE CHART */}
          {chartType === "pie" && (
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Circular SVG Donut */}
              <div className="relative size-44 shrink-0 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                  {donutSlices.map((slice, i) => (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={donutRadius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={hoveredIdx === i ? 18 : 14}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  ))}
                </svg>

                {/* Center KPI in Donut */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73887d]">Total</span>
                  <span className="text-[15px] font-extrabold font-mono text-[#111c16] leading-tight">
                    {formatNumber(totalSum)}
                  </span>
                </div>
              </div>

              {/* Segment Legend Cards */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-h-48 overflow-y-auto pr-1">
                {donutSlices.map((slice, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-all duration-150 ${
                      hoveredIdx === i
                        ? "border-[#34c06a] bg-emerald-50/80 shadow-xs"
                        : "border-[#dce7e0] bg-white hover:border-[#b8d4bc]"
                    }`}
                  >
                    <span className="size-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: slice.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11.5px] font-bold text-[#111c16] truncate">{slice.data.__x}</p>
                        <span className="text-[11px] font-mono font-bold text-[#1b6b3a]">{slice.pct}%</span>
                      </div>
                      <p className="text-[10.5px] font-mono text-[#6d8276] mt-0.5">
                        {slice.data.__y.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
