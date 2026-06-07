"use client"

import type { DashboardRow } from "@/app/api/dashboard/route"
import type { StripTake } from "./BestTakesStrip"
import { OddsPill } from "./OddsPill"
import { SentimentBar } from "./SentimentBar"
import { Sparkline } from "./Sparkline"
import { BestTakes } from "./BestTakes"

const signalMap: Record<string, { label: string; action: string; color: string; dim: string }> = {
  crowd_bullish: {
    label: "Crowd says YES",
    action: "The crowd is more optimistic than the market. If sentiment leads price, YES may be underpriced.",
    color: "var(--bull)",
    dim: "var(--bull-dim)",
  },
  crowd_bearish: {
    label: "Crowd says NO",
    action: "The crowd is more pessimistic than the market. If sentiment leads price, NO may be underpriced.",
    color: "var(--bear)",
    dim: "var(--bear-dim)",
  },
  aligned: {
    label: "Aligned",
    action: "Crowd sentiment and market odds are broadly in agreement. No strong edge signal.",
    color: "var(--neutral)",
    dim: "var(--bg-base)",
  },
  watch: {
    label: "Watch — low volume",
    action: "The divergence is notable but market volume is thin. Treat this signal with caution.",
    color: "var(--watch)",
    dim: "var(--watch-dim)",
  },
}

interface DetailPanelProps {
  row: DashboardRow | null
  bestTakes: StripTake[]
}

export function DetailPanel({ row, bestTakes }: DetailPanelProps) {
  if (!row) {
    return <DefaultState bestTakes={bestTakes} />
  }
  return <MarketDetail row={row} />
}

function DefaultState({ bestTakes }: { bestTakes: StripTake[] }) {
  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)", marginBottom: 4 }}>
          Select a market
        </p>
        <p style={{ fontSize: 12, color: "var(--text-lo)", lineHeight: 1.5 }}>
          Click any row in the table to see market details, price history, and community sentiment.
        </p>
      </div>

      {/* Divergence explainer */}
      <div style={{
        padding: "14px 16px",
        background: "var(--info-dim)",
        borderRadius: 10,
        borderLeft: "3px solid var(--info)",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--info)", marginBottom: 8 }}>
          How to read Divergence
        </p>
        <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6, margin: 0 }}>
          <strong>+36</strong> means the crowd is 36 points more optimistic than market odds suggest. If social sentiment anticipates market moves, that market&apos;s YES is underpriced.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6, margin: "8px 0 0" }}>
          <strong>−24</strong> means the crowd is more pessimistic — NO may be underpriced.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6, margin: "8px 0 0" }}>
          High divergence ≠ guaranteed edge. Use it as a starting point, not a signal to act on blindly.
        </p>
      </div>

      {/* Best takes */}
      {bestTakes.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 12 }}>
            Best takes this week
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bestTakes.map((t, i) => (
              <div key={i} style={{
                padding: "12px 14px",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: "1px 6px", borderRadius: 3,
                    background: "var(--border)", color: "var(--text-mid)",
                  }}>
                    {t.source}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-lo)" }}>{t.engagement}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5, margin: 0 }}>
                  {t.text}
                </p>
                {t.marketLabel && (
                  <p style={{ fontSize: 11, color: "var(--text-lo)", margin: "6px 0 0", fontStyle: "italic" }}>
                    {t.marketLabel}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MarketDetail({ row }: { row: DashboardRow }) {
  const sig = row.divergence ? signalMap[row.divergence.signal] : null
  const odds = row.market?.odds
  const hasValidOdds = odds !== null && odds !== undefined && odds > 0

  const catColors: Record<string, string> = {
    macro: "#4F46E5", crypto: "#D97706", equities: "#0369A1", politics: "#BE185D",
  }
  const catColor = catColors[row.category] ?? "var(--text-mid)"

  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title */}
      <div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: catColor, background: `${catColor}15`, padding: "2px 6px", borderRadius: 3,
        }}>
          {row.category}
        </span>
        <h2 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 700, color: "var(--text-hi)", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {row.label}
        </h2>
        {row.market?.question && (
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-lo)", lineHeight: 1.5 }}>
            {row.market.question}
          </p>
        )}
      </div>

      {/* Signal action card */}
      {sig && (
        <div style={{
          padding: "14px 16px",
          background: sig.dim,
          borderRadius: 10,
          borderLeft: `3px solid ${sig.color}`,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: sig.color, marginBottom: 6, letterSpacing: "0.03em" }}>
            {sig.label}
            {row.divergence && (
              <span className="mono" style={{ marginLeft: 8, fontSize: 13 }}>
                {row.divergence.raw > 0 ? "+" : ""}{row.divergence.raw}pt gap
              </span>
            )}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.55, margin: 0 }}>
            {sig.action}
          </p>
        </div>
      )}

      {/* Odds + Sentiment side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: "12px 14px", background: "var(--bg-base)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
            Market odds
          </p>
          <OddsPill odds={hasValidOdds ? odds! : null} />
          {hasValidOdds && (
            <p style={{ fontSize: 11, color: "var(--text-lo)", marginTop: 6 }}>Polymarket YES price</p>
          )}
        </div>
        {row.sentiment && (
          <div style={{ padding: "12px 14px", background: "var(--bg-base)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
              Social sentiment
            </p>
            <SentimentBar score={row.sentiment.score} />
            <p style={{ fontSize: 11, color: "var(--text-lo)", marginTop: 6 }}>
              {row.sentiment.confidence} confidence · {row.sentiment.volume_label?.split(",")[0] ?? ""}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {row.sentiment?.summary && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
            Summary
          </p>
          <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.65, margin: 0 }}>
            {row.sentiment.summary}
          </p>
        </div>
      )}

      {/* Sparkline */}
      {row.market?.history && row.market.history.length >= 2 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
            7-Day Price History
          </p>
          <div style={{
            background: "var(--bg-base)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            padding: "12px 12px 8px",
          }}>
            <Sparkline
              history={row.market.history}
              currentOdds={hasValidOdds ? odds : undefined}
            />
          </div>
        </div>
      )}

      {/* Key signals */}
      {row.sentiment?.signals && row.sentiment.signals.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
            Key signals
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {row.sentiment.signals.map((s, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5 }}>
                <span style={{ marginTop: 6, flexShrink: 0, width: 4, height: 4, borderRadius: "50%", background: "var(--info)", display: "block" }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best takes */}
      {row.sentiment?.best_takes && row.sentiment.best_takes.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
            Top community takes
          </p>
          <BestTakes takes={row.sentiment.best_takes} />
        </div>
      )}
    </div>
  )
}
