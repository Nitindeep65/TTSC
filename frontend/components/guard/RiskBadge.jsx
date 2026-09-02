"use client"

import React from "react"
import { ShieldCheck, AlertTriangle, ShieldX, Info } from "lucide-react"

/**
 * RiskBadge — Unified 3-tier risk classification display component.
 *
 * Maps the backend's LOW/MEDIUM/HIGH risk_level (from EXPLAIN analysis) to
 * a visual badge with icon, label, and optional explanation tooltip.
 */

const RISK_CONFIG = {
  LOW: {
    icon: ShieldCheck,
    label: "Safe to Execute",
    shortLabel: "LOW RISK",
    description: "Query is optimally planned with indexed access. Safe to run.",
    colorClass: "risk-badge--low",
  },
  MEDIUM: {
    icon: AlertTriangle,
    label: "Review Recommended",
    shortLabel: "MEDIUM RISK",
    description: "Query has moderate cost or uses sequential scans. Review before executing on large datasets.",
    colorClass: "risk-badge--medium",
  },
  HIGH: {
    icon: ShieldX,
    label: "Execution Blocked",
    shortLabel: "HIGH RISK",
    description: "Dangerous query pattern detected (unindexed scan, cross join, or excessive cost). Index required.",
    colorClass: "risk-badge--high",
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
  const config = RISK_CONFIG[level] || RISK_CONFIG.LOW
  const Icon = config.icon

  return (
    <div className={`risk-badge-wrapper risk-badge-wrapper--${size} ${className}`}>
      <div className={`risk-badge ${config.colorClass} risk-badge--${size}`}>
        <Icon className="risk-badge__icon" />
        {showLabel && (
          <span className="risk-badge__label">{config.shortLabel}</span>
        )}
      </div>

      {showDetails && (
        <div className="risk-badge-details">
          <p className="risk-badge-details__desc">{config.description}</p>

          {cost !== null && (
            <div className="risk-badge-details__meta">
              <span className="risk-badge-details__tag">
                <strong>EXPLAIN Cost:</strong> {typeof cost === "number" ? cost.toFixed(1) : cost}
              </span>
              {hasSeqScan && (
                <span className="risk-badge-details__tag risk-badge-details__tag--warn">
                  Sequential Scan Detected
                </span>
              )}
            </div>
          )}

          {indexSuggestions.length > 0 && (
            <div className="risk-badge-details__indexes">
              <p className="risk-badge-details__indexes-title">
                <Info size={12} />
                Suggested Indexes:
              </p>
              {indexSuggestions.map((idx, i) => (
                <code key={i} className="risk-badge-details__index-code">
                  {idx}
                </code>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * RiskBanner — Full-width inline banner for use above SQL results.
 * Displays nothing for LOW risk (silent pass). Shows amber/red for MEDIUM/HIGH.
 */
export function RiskBanner({ level = "LOW", cost = null, hasSeqScan = false, indexSuggestions = [], onDismiss }) {
  const config = RISK_CONFIG[level] || RISK_CONFIG.LOW
  const Icon = config.icon

  if (level === "LOW") return null

  return (
    <div className={`risk-banner risk-banner--${level.toLowerCase()}`}>
      <div className="risk-banner__header">
        <div className="risk-banner__title">
          <Icon className="risk-banner__icon" />
          <span>{config.label}</span>
          <span className={`risk-banner__badge ${config.colorClass}`}>{level}</span>
        </div>
        {onDismiss && (
          <button className="risk-banner__dismiss" onClick={onDismiss} aria-label="Dismiss">
            ✕
          </button>
        )}
      </div>

      <p className="risk-banner__desc">{config.description}</p>

      {cost !== null && (
        <div className="risk-banner__meta">
          <span className="risk-banner__chip">
            EXPLAIN Cost: <strong>{typeof cost === "number" ? cost.toFixed(1) : cost}</strong>
          </span>
          {hasSeqScan && (
            <span className="risk-banner__chip risk-banner__chip--warn">
              ⚠ Sequential Scan
            </span>
          )}
        </div>
      )}

      {indexSuggestions.length > 0 && (
        <div className="risk-banner__indexes">
          <p className="risk-banner__indexes-title">Required Infrastructure Action:</p>
          {indexSuggestions.map((idx, i) => (
            <code key={i} className="risk-banner__index-code">{idx}</code>
          ))}
        </div>
      )}
    </div>
  )
}

export default RiskBadge
