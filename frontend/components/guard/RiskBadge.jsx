"use client"

import React from "react"
import { ShieldCheck, AlertTriangle, ShieldX, Info } from "lucide-react"

/**
 * RiskBadge — Unified 3-tier risk classification display component.
 * Maps the backend's LOW/MEDIUM/HIGH risk_level (from EXPLAIN analysis) to
 * a visual badge with icon, label, and optional explanation.
 */

const RISK_CONFIG = {
  LOW: {
    icon: ShieldCheck,
    label: "Safe to Execute",
    shortLabel: "LOW RISK",
    description: "Query is optimally planned with indexed access. Safe to run.",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    bannerClass: "border-emerald-500/30 bg-emerald-500/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  MEDIUM: {
    icon: AlertTriangle,
    label: "Review Recommended",
    shortLabel: "MEDIUM RISK",
    description: "Query has moderate cost or uses sequential scans. Review before executing on large datasets.",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    bannerClass: "border-amber-500/30 bg-amber-500/5",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  HIGH: {
    icon: ShieldX,
    label: "Execution Blocked",
    shortLabel: "HIGH RISK",
    description: "Dangerous query pattern detected (unindexed scan, cross join, or excessive cost). Index required.",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    bannerClass: "border-rose-500/30 bg-rose-500/5",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
}

export function RiskBadge({
  level = "LOW",
  showLabel = true,
  showDetails = false,
  cost = null,
  hasSeqScan = false,
  indexSuggestions = [],
  size = "sm",
  className = "",
}) {
  const normLevel = (level || "LOW").toUpperCase()
  const config = RISK_CONFIG[normLevel] || RISK_CONFIG.LOW
  const Icon = config.icon

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1",
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span
        className={`inline-flex items-center font-mono font-bold uppercase rounded-md border tracking-wider transition-colors ${
          config.badgeClass
        } ${sizeClasses[size] || sizeClasses.sm}`}
      >
        <Icon size={iconSizes[size] || 12} className={config.iconColor} />
        {showLabel && <span>{config.shortLabel}</span>}
      </span>

      {showDetails && (
        <div className="text-[11px] text-muted-foreground space-y-1 mt-1">
          <p>{config.description}</p>
          {cost !== null && (
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span>Cost: <strong>{typeof cost === "number" ? cost.toFixed(1) : cost}</strong></span>
              {hasSeqScan && <span className="text-amber-500 font-semibold">⚠ Seq Scan</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function RiskBanner({
  level = "MEDIUM",
  cost = null,
  hasSeqScan = false,
  indexSuggestions = [],
  onDismiss = null,
}) {
  const normLevel = (level || "MEDIUM").toUpperCase()
  const config = RISK_CONFIG[normLevel] || RISK_CONFIG.MEDIUM
  const Icon = config.icon

  if (normLevel === "LOW") return null

  return (
    <div className={`rounded-xl border p-3.5 sm:p-4 my-2.5 ${config.bannerClass} transition-all`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className={config.iconColor} />
          <span className="font-bold text-xs text-foreground">{config.label}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${config.badgeClass}`}>
            {normLevel}
          </span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground text-xs p-1 rounded hover:bg-muted transition"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{config.description}</p>

      {cost !== null && (
        <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs">
          <span className="rounded bg-muted/60 border border-border px-2 py-0.5 text-[10px]">
            Estimated Cost: <strong className="text-foreground">{typeof cost === "number" ? cost.toFixed(1) : cost}</strong>
          </span>
          {hasSeqScan && (
            <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              ⚠ Sequential Scan Detected
            </span>
          )}
        </div>
      )}

      {indexSuggestions.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-border/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Recommended Remediation DDL:
          </p>
          <div className="space-y-1">
            {indexSuggestions.map((idx, i) => (
              <code key={i} className="block text-[11px] font-mono bg-muted/70 text-foreground px-2.5 py-1.5 rounded-md overflow-x-auto border border-border">
                {idx}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskBadge
