"use client"

import type { DashboardRow } from "@/app/api/dashboard/route"
import { DivergenceCell } from "./DivergenceCell"
import { SentimentBar } from "./SentimentBar"
import { formatDistanceToNow } from "date-fns"

const catColors: Record<string, string> = {
  macro:    "var(--cat-macro)",
  crypto:   "var(--cat-crypto)",
  equities: "var(--cat-equities)",
  politics: "var(--cat-politics)",
}

// Renamed to be immediately understandable
const signalConfig: Record<string, { label: string; color: string; dim: string }> = {
  crowd_bullish: { label: "Crowd: YES ↑", color: "var(--bull)",    dim: "var(--bull-dim)" },
  crowd_bearish: { label: "Crowd: NO ↓",  color: "var(--bear)",    dim: "var(--bear-dim)" },
  aligned:       { label: "Aligned",      color: "var(--neutral)", dim: "var(--bg-base)"  },
  watch:         { label: "Watch ⚠",      color: "var(--watch)",   dim: "var(--watch-dim)" },
}

interface MarketRowProps {
  row: DashboardRow
  onClick: () => void
  isLast: boolean
  index: number
  isSelected: boolean
}

export function MarketRow({ row, onClick, isLast, index, isSelected }: MarketRowProps) {
  const odds = row.market?.odds
  const hasValidOdds = odds !== null && odds !== undefined && odds > 0
  const sig = row.divergence ? signalConfig[row.divergence.signal] : null
  const catColor = catColors[row.category] ?? "var(--text-mid)"

  const freshnessEl = (() => {
    const savedAt = row.sentiment?.brief_saved_at
    if (!savedAt) return <span style={{ color: "var(--text-lo)", fontSize: 11 }}>—</span>
    try {
      const d = new Date(savedAt)
      const stale = Date.now() - d.getTime() > 24 * 60 * 60 * 1000
      return (
        <span className="mono" style={{ fontSize: 11, color: stale ? "var(--watch)" : "var(--text-lo)" }}>
          {formatDistanceToNow(d, { addSuffix: false })}
        </span>
      )
    } catch {
      return <span style={{ color: "var(--text-lo)", fontSize: 11 }}>—</span>
    }
  })()

  return (
    <tr
      onClick={onClick}
      className="row-enter"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        cursor: "pointer",
        background: isSelected ? "var(--info-dim)" : "var(--bg-row)",
        animationDelay: `${index * 40}ms`,
        transition: "background 0.1s",
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--bg-row-hover)"
      }}
      onMouseLeave={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--bg-row)"
      }}
    >
      {/* Market */}
      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: catColor, background: `${catColor}15`, padding: "1px 5px", borderRadius: 3,
            alignSelf: "flex-start",
          }}>
            {row.category}
          </span>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-hi)", lineHeight: 1.3 }}>
            {row.label}
          </span>
          {row.market?.question && (
            <span style={{
              fontSize: 11, color: "var(--text-lo)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280,
            }}>
              {row.market.question}
            </span>
          )}
        </div>
      </td>

      {/* Odds */}
      <td style={{ padding: "13px 16px", textAlign: "right", verticalAlign: "middle" }}>
        {hasValidOdds ? (
          <span className="mono" style={{
            fontSize: 15, fontWeight: 700,
            color: odds! >= 60 ? "var(--bull)" : odds! <= 40 ? "var(--bear)" : "var(--text-hi)",
          }}>
            {odds}%
          </span>
        ) : (
          <span className="mono" style={{ color: "var(--text-lo)", fontSize: 15 }}>—</span>
        )}
      </td>

      {/* Sentiment */}
      <td style={{ padding: "13px 16px", verticalAlign: "middle", minWidth: 170 }}>
        {row.sentiment
          ? <SentimentBar score={row.sentiment.score} />
          : <span style={{ fontSize: 11, color: "var(--text-lo)" }}>No brief</span>
        }
      </td>

      {/* Divergence — hero */}
      <td style={{ padding: "13px 16px", textAlign: "right", verticalAlign: "middle" }}>
        <DivergenceCell divergence={row.divergence} />
      </td>

      {/* Signal — actionable label */}
      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
        {sig ? (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: sig.color, background: sig.dim,
            padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap",
          }}>
            {sig.label}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--text-lo)" }}>—</span>
        )}
      </td>

      {/* Freshness */}
      <td style={{ padding: "13px 16px", textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        {freshnessEl}
      </td>
    </tr>
  )
}
