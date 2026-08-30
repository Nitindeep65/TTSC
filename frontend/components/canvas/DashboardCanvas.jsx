"use client"

import React, { useState, useMemo } from "react"
import {
  BarChart3,
  LineChart,
  PieChart as PieIcon,
  Table as TableIcon,
  TrendingUp,
  Download,
  Copy,
  Check,
  Code2,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  X,
  FileJson,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PALETTE = [
  "#34c06a", // Vibrant Emerald
  "#226f54", // Deep Jade
  "#38a3a5", // Teal Ocean
  "#3490c8", // Cerulean Blue
  "#e09b2e", // Amber Gold
  "#7c6ef7", // Indigo Violet
  "#e05c6a", // Coral Rose
  "#1f7a47", // Forest Green
]

function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0"
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return Number(num).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

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

/**
 * Individual Canvas Widget Card
 */
function CanvasWidgetCard({ widget, onZoom }) {
  const [chartType, setChartType] = useState(widget.recommended_chart || "bar")
  const [showSql, setShowSql] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const rows = widget.rows || []
  const columns = widget.columns || []

  // Metric & Dimension inference
  const { xKey, yKey, chartData, maxY, totalSum } = useMemo(() => {
    if (!rows.length || !columns.length) {
      return { xKey: null, yKey: null, chartData: [], maxY: 1, totalSum: 0 }
    }
    const numCols = columns.filter((c) =>
      rows.slice(0, 10).every((r) => r[c] !== null && !isNaN(Number(r[c])))
    )
    const strCols = columns.filter((c) => !numCols.includes(c))
    const x = strCols[0] || columns[0]
    const y = numCols[0] || columns[1] || columns[0]

    let sum = 0
    let max = 0
    const data = rows.map((r, i) => {
      const val = parseFloat(r[y]) || 0
      sum += val
      if (val > max) max = val
      return {
        ...r,
        __x: r[x] !== null && r[x] !== undefined ? String(r[x]).slice(0, 16) : `#${i + 1}`,
        __y: val,
        __rawIndex: i,
      }
    })
    return {
      xKey: x,
      yKey: y,
      chartData: data,
      maxY: max > 0 ? max * 1.15 : 1,
      totalSum: sum,
    }
  }, [rows, columns])

  const handleCopySql = () => {
    navigator.clipboard.writeText(widget.sql_query || "")
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 1800)
  }

  const handleExportCsv = () => {
    if (!rows.length) return
    const header = columns.join(",")
    const csvRows = rows.map((r) =>
      columns.map((c) => JSON.stringify(r[c] ?? "")).join(",")
    )
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...csvRows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${widget.id || "widget"}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // SVG dimensions
  const svgW = 460
  const svgH = 190
  const padL = 42
  const padR = 16
  const padT = 16
  const padB = 30
  const plotW = svgW - padL - padR
  const plotH = svgH - padT - padB

  const colSpanClass =
    widget.grid_span === 2
      ? "col-span-1 lg:col-span-2"
      : "col-span-1"

  return (
    <div
      className={`flex flex-col rounded-2xl border border-border bg-card p-4 shadow-2xs transition-all duration-150 hover:shadow-sm hover:border-border-hover ${colSpanClass}`}
    >
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0 flex-1 flex items-start gap-2">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground pt-0.5" title="Drag to reorder widget">
            <GripVertical className="size-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{widget.title}</h3>
              {widget.kpi_value && (
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20 tabular-nums">
                  {widget.kpi_value}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-normal">{widget.explanation}</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Chart Switcher Buttons */}
          <div className="flex items-center rounded-lg border border-[#e2eae4] bg-[#f8faf8] p-0.5">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1 rounded transition ${chartType === "bar" ? "bg-white text-emerald-700 shadow-2xs" : "text-[#718679] hover:text-[#141a17]"}`}
              title="Bar Chart"
            >
              <BarChart3 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={`p-1 rounded transition ${chartType === "line" ? "bg-white text-emerald-700 shadow-2xs" : "text-[#718679] hover:text-[#141a17]"}`}
              title="Line Trend"
            >
              <LineChart className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("pie")}
              className={`p-1 rounded transition ${chartType === "pie" ? "bg-white text-emerald-700 shadow-2xs" : "text-[#718679] hover:text-[#141a17]"}`}
              title="Pie / Donut"
            >
              <PieIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("table")}
              className={`p-1 rounded transition ${chartType === "table" ? "bg-white text-emerald-700 shadow-2xs" : "text-[#718679] hover:text-[#141a17]"}`}
              title="Data Table"
            >
              <TableIcon className="size-3.5" />
            </button>
          </div>

          {/* View SQL toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSql(!showSql)}
            className={`size-7 rounded-lg text-[#5a7263] hover:text-[#141a17] ${showSql ? "bg-emerald-50 text-emerald-700" : ""}`}
            title="View SQL query"
          >
            <Code2 className="size-3.5" />
          </Button>

          {/* Export CSV */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportCsv}
            className="size-7 rounded-lg text-[#5a7263] hover:text-[#141a17]"
            title="Export CSV"
          >
            <Download className="size-3.5" />
          </Button>

          {/* Fullscreen Zoom */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoom(widget)}
            className="size-7 rounded-lg text-[#5a7263] hover:text-[#141a17]"
            title="Expand widget"
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* SQL Drawer */}
      {showSql && (
        <div className="mt-2.5 rounded-xl border border-emerald-200/80 bg-[#16271c] p-3 text-xs text-white font-mono shadow-inner animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10px] text-emerald-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-400" />
              <span>Safe Read-Only · LIMIT 50</span>
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition cursor-pointer"
            >
              {copiedSql ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
              <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-[#cbf5dc] text-[11px]">
            {widget.sql_query}
          </pre>
        </div>
      )}

      {/* Visual Render Container */}
      <div className="mt-3 flex-1 flex flex-col justify-center min-h-[200px]">
        {chartType === "table" ? (
          <div className="max-h-[200px] overflow-auto rounded-xl border border-[#eef3ef]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#f7faf7] border-b border-[#e2ece4] text-[#4a5f52] font-bold text-[10px] uppercase">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="p-2 truncate">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {rows.slice(0, 15).map((r, ri) => (
                  <tr key={ri} className="hover:bg-[#fbfdfb]">
                    {columns.map((c) => (
                      <td key={c} className="p-2 text-[#243329] font-mono text-[11px] truncate">
                        {String(r[c] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : chartType === "pie" ? (
          /* SVG Pie / Donut Chart */
          <div className="flex items-center justify-around py-1">
            <svg viewBox="0 0 160 160" className="size-36 drop-shadow-xs">
              {(() => {
                let cumulativeAngle = 0
                return chartData.map((d, i) => {
                  const sliceFraction = totalSum > 0 ? d.__y / totalSum : 1 / chartData.length
                  const sliceAngle = sliceFraction * 360
                  const startAngle = cumulativeAngle
                  const endAngle = cumulativeAngle + sliceAngle
                  cumulativeAngle += sliceAngle

                  const rOuter = 65
                  const rInner = 38
                  const cx = 80
                  const cy = 80

                  const toRad = (deg) => (deg * Math.PI) / 180
                  const x1Outer = cx + rOuter * Math.cos(toRad(startAngle))
                  const y1Outer = cy + rOuter * Math.sin(toRad(startAngle))
                  const x2Outer = cx + rOuter * Math.cos(toRad(endAngle))
                  const y2Outer = cy + rOuter * Math.sin(toRad(endAngle))

                  const x1Inner = cx + rInner * Math.cos(toRad(startAngle))
                  const y1Inner = cy + rInner * Math.sin(toRad(startAngle))
                  const x2Inner = cx + rInner * Math.cos(toRad(endAngle))
                  const y2Inner = cy + rInner * Math.sin(toRad(endAngle))

                  const largeArc = sliceAngle > 180 ? 1 : 0
                  const pathData = `
                    M ${x1Outer} ${y1Outer}
                    A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}
                    L ${x2Inner} ${y2Inner}
                    A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}
                    Z
                  `
                  const color = PALETTE[i % PALETTE.length]
                  return (
                    <path
                      key={i}
                      d={pathData}
                      fill={color}
                      className="transition-transform duration-150 hover:opacity-90 cursor-pointer"
                      stroke="#ffffff"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  )
                })
              })()}
              <circle cx="80" cy="80" r="34" fill="#ffffff" />
              <text x="80" y="77" textAnchor="middle" className="text-[11px] font-bold fill-[#141a17]">
                {hoveredIdx !== null ? formatNumber(chartData[hoveredIdx]?.__y) : formatNumber(totalSum)}
              </text>
              <text x="80" y="90" textAnchor="middle" className="text-[8px] fill-[#718579] font-medium">
                {hoveredIdx !== null ? chartData[hoveredIdx]?.__x : "Total"}
              </text>
            </svg>

            {/* Legend */}
            <div className="space-y-1 max-h-36 overflow-y-auto pl-2 text-xs">
              {chartData.slice(0, 5).map((d, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 p-1 rounded-md transition cursor-pointer ${hoveredIdx === i ? "bg-[#eaf3ec] font-bold" : ""}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  <span className="truncate max-w-[100px] text-[11px] text-[#2c3d32]">{d.__x}</span>
                  <span className="text-[10px] text-[#63796c] font-mono ml-auto">
                    {totalSum > 0 ? `${((d.__y / totalSum) * 100).toFixed(0)}%` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : chartType === "line" || chartType === "area" ? (
          /* SVG Line / Area Trend Chart */
          <div className="relative w-full">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 0.33, 0.66, 1].map((pct) => {
                const y = padT + plotH * (1 - pct)
                const val = maxY * pct
                return (
                  <g key={pct}>
                    <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#edf2ee" strokeDasharray="3 3" strokeWidth="1" />
                    <text x={padL - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-[#889d90] font-mono">
                      {formatNumber(val)}
                    </text>
                  </g>
                )
              })}

              {/* Curve Points */}
              {(() => {
                const points = chartData.map((d, i) => {
                  const x = padL + (chartData.length > 1 ? (i / (chartData.length - 1)) * plotW : plotW / 2)
                  const y = padT + plotH - (d.__y / maxY) * plotH
                  return { x, y, data: d, index: i }
                })
                const curvePath = getSmoothCurvePath(points)
                const areaPath = points.length > 1
                  ? `${curvePath} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
                  : ""
                const avgY = totalSum / (chartData.length || 1)

                return (
                  <>
                    <defs>
                      <linearGradient id={`grad_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    {areaPath && <path d={areaPath} fill={`url(#grad_${widget.id})`} />}

                    {/* Average trend line */}
                    {chartData.length > 1 && (
                      <g>
                        <line
                          x1={padL}
                          y1={padT + plotH - (avgY / maxY) * plotH}
                          x2={svgW - padR}
                          y2={padT + plotH - (avgY / maxY) * plotH}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          strokeWidth="1.2"
                          opacity="0.5"
                        />
                        <text
                          x={svgW - padR}
                          y={padT + plotH - (avgY / maxY) * plotH - 3}
                          textAnchor="end"
                          className="text-[8.5px] fill-emerald-600 font-mono"
                        >
                          avg {formatNumber(avgY)}
                        </text>
                      </g>
                    )}

                    {/* Smooth curve line */}
                    <path d={curvePath} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Smooth Vertical Crosshair Guide */}
                    {hoveredIdx !== null && points[hoveredIdx] && (
                      <g className="pointer-events-none transition-opacity duration-150">
                        <line
                          x1={points[hoveredIdx].x}
                          y1={padT}
                          x2={points[hoveredIdx].x}
                          y2={padT + plotH}
                          stroke="#71717a"
                          strokeDasharray="2 2"
                          strokeWidth="1"
                          opacity="0.75"
                        />
                        <rect
                          x={Math.max(padL, Math.min(svgW - padR - 56, points[hoveredIdx].x - 28))}
                          y={Math.max(0, points[hoveredIdx].y - 22)}
                          width="56"
                          height="18"
                          rx="4"
                          fill="#09090b"
                          className="shadow-sm"
                        />
                        <text
                          x={Math.max(padL + 28, Math.min(svgW - padR - 28, points[hoveredIdx].x))}
                          y={Math.max(12, points[hoveredIdx].y - 10)}
                          textAnchor="middle"
                          className="text-[9.5px] font-mono font-medium fill-white"
                        >
                          {formatNumber(points[hoveredIdx].data.__y)}
                        </text>
                      </g>
                    )}

                    {/* Point circles */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredIdx === i ? 5 : 3.5}
                          fill={hoveredIdx === i ? "#047857" : "#ffffff"}
                          stroke="#059669"
                          strokeWidth="2"
                          className="transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(i)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        />
                        <text
                          x={p.x}
                          y={padT + plotH + 16}
                          textAnchor="middle"
                          className="text-[9px] fill-muted-foreground font-medium"
                        >
                          {p.data.__x.slice(0, 6)}
                        </text>
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>
          </div>
        ) : (
          /* SVG Bar Chart (Default) */
          <div className="relative w-full">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 0.5, 1].map((pct) => {
                const y = padT + plotH * (1 - pct)
                return (
                  <g key={pct}>
                    <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#edf2ee" strokeDasharray="3 3" strokeWidth="1" />
                    <text x={padL - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-[#889d90] font-mono">
                      {formatNumber(maxY * pct)}
                    </text>
                  </g>
                )
              })}

              {/* Bars */}
              {(() => {
                const count = chartData.length || 1
                const slotW = plotW / count
                const barW = Math.max(14, Math.min(36, slotW * 0.65))

                return chartData.map((d, i) => {
                  const barH = Math.max(4, (d.__y / maxY) * plotH)
                  const x = padL + i * slotW + (slotW - barW) / 2
                  const y = padT + plotH - barH
                  const isHover = hoveredIdx === i

                  return (
                    <g
                      key={i}
                      className="cursor-pointer transition"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        rx="4"
                        fill={isHover ? "#1f7a47" : PALETTE[i % PALETTE.length]}
                        className="transition-all duration-150"
                      />
                      <text
                        x={x + barW / 2}
                        y={y - 4}
                        textAnchor="middle"
                        className="text-[9px] fill-[#4a5f52] font-mono font-bold"
                      >
                        {formatNumber(d.__y)}
                      </text>
                      <text
                        x={x + barW / 2}
                        y={padT + plotH + 16}
                        textAnchor="middle"
                        className="text-[9px] fill-[#71887a] font-medium"
                      >
                        {d.__x.slice(0, 7)}
                      </text>
                    </g>
                  )
                })
              })()}
            </svg>
          </div>
        )}
      </div>

      {/* Footer / Performance info */}
      <div className="mt-3 flex items-center justify-between border-t border-[#f0f4f0] pt-2 text-[10px] text-[#718578]">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="size-3 text-emerald-600" />
          <span>{widget.execution_time_ms || 24}ms</span>
        </span>
        <span className="font-medium text-[#4e6456]">
          {widget.row_count || rows.length} records analyzed
        </span>
      </div>
    </div>
  )
}

/**
 * Main Dashboard Canvas Component
 */
export default function DashboardCanvas({ canvasData, onRefresh }) {
  const [zoomedWidget, setZoomedWidget] = useState(null)
  const [copiedSummary, setCopiedSummary] = useState(false)

  if (!canvasData || !canvasData.widgets || canvasData.widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfe0d4] bg-white/70 p-12 text-center">
        <Sparkles className="size-8 text-emerald-600 animate-pulse mb-3" />
        <h3 className="text-base font-bold text-[#141a17]">No Dashboard Canvas Generated Yet</h3>
        <p className="text-xs text-[#5e7769] max-w-md mt-1">
          Type an executive dashboard request above or click one of the quick template pills to watch the multi-agent supervisor build your dashboard.
        </p>
      </div>
    )
  }

  const { dashboard_title, executive_summary, theme, widgets, execution_time_total_ms } = canvasData

  const handleCopySummary = () => {
    navigator.clipboard.writeText(executive_summary || "")
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 1800)
  }

  const handleExportJson = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(canvasData, null, 2))
    const dl = document.createElement("a")
    dl.setAttribute("href", jsonStr)
    dl.setAttribute("download", `${dashboard_title.toLowerCase().replace(/\s+/g, "_")}_canvas.json`)
    document.body.appendChild(dl)
    dl.click()
    document.body.removeChild(dl)
  }

  return (
    <div className="space-y-5">
      {/* ── 1. Top Bar & Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#dce6df] bg-white p-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[#141a17]">{dashboard_title}</h2>
            <Badge variant="emerald" className="uppercase text-[9px] px-2 py-0.5 font-bold">
              {theme || "Executive"}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              <Zap className="size-3 text-emerald-600" />
              <span>{execution_time_total_ms || 420}ms · {widgets.length} Parallel Workers</span>
            </span>
          </div>
          <p className="text-xs text-[#63796d]">
            Multi-Agent Supervisor &amp; Canvas Mode · Strictly Grounded in Live Database Schema
          </p>
        </div>

        {/* Global Canvas Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-1.5 text-xs font-semibold text-[#293d31] h-8"
              title="Regenerate Dashboard"
            >
              <RefreshCw className="size-3.5" />
              <span>Re-run</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="gap-1.5 text-xs font-semibold text-[#293d31] h-8"
            title="Download Dashboard Canvas JSON"
          >
            <FileJson className="size-3.5 text-emerald-600" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* ── 2. AI Executive Summary Banner ── */}
      {executive_summary && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Autonomous Executive Synthesis &amp; Takeaways
                </span>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition cursor-pointer"
                >
                  {copiedSummary ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>{copiedSummary ? "Copied" : "Copy Brief"}</span>
                </button>
              </div>
              <p className="mt-1 text-xs text-[#203a2b] leading-relaxed font-medium">
                {executive_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. KPI Hero Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {widgets.map((w, idx) => (
          <div
            key={w.id || idx}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-2xs transition hover:border-border-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground truncate">{w.title}</span>
              <span className="size-2 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <p className="text-xl font-extrabold text-foreground font-mono tracking-tight">
                  {w.kpi_value || `${w.row_count} items`}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3 shrink-0" />
                  <span className="truncate">{w.kpi_delta || "Synced"}</span>
                </p>
              </div>

              {/* Mini Sparkline */}
              <svg className="w-16 h-7 shrink-0 text-emerald-500 overflow-visible" viewBox="0 0 60 25">
                <path
                  d={`M 0,${20 - (idx % 3) * 5} Q 15,${5 + (idx % 2) * 8} 30,${12} T 60,${4 + (idx % 3) * 3}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Multi-Widget Adaptive Grid (1440px+ 3 cols, 1024px 2 cols, mobile 1 col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <CanvasWidgetCard
            key={widget.id}
            widget={widget}
            onZoom={(w) => setZoomedWidget(w)}
          />
        ))}
      </div>

      {/* ── 5. Zoom Modal ── */}
      {zoomedWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d6e2d9] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#141a17]">{zoomedWidget.title}</h3>
                <p className="text-xs text-[#5e7769]">{zoomedWidget.explanation}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoomedWidget(null)}
                className="size-8 rounded-full text-[#5e7769] hover:bg-[#edf5ef]"
              >
                <X className="size-4" />
              </Button>
            </div>

            <CanvasWidgetCard widget={{ ...zoomedWidget, grid_span: 2 }} onZoom={() => {}} />
          </div>
        </div>
      )}
    </div>
  )
}
