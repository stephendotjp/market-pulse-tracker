"use client"

import { useEffect, useRef } from "react"
import type { DashboardRow } from "@/app/api/dashboard/route"
import { X } from "lucide-react"
import { OddsPill } from "./OddsPill"
import { SentimentBar } from "./SentimentBar"
import { DivergenceCell } from "./DivergenceCell"
import { BriefAge } from "./BriefAge"
import { BestTakes } from "./BestTakes"
import { Sparkline } from "./Sparkline"

interface MarketDrawerProps {
  row: DashboardRow | null
  onClose: () => void
}

const signalMap: Record<string, { label: string; action: string; color: string; dim: string }> = {
  crowd_bullish: { label: "Crowd says YES ↑", action: "The crowd is more optimistic than the market. YES may be underpriced.", color: "var(--bull)", dim: "var(--bull-dim)" },
  crowd_bearish: { label: "Crowd says NO ↓",  action: "The crowd is more pessimistic than the market. NO may be underpriced.", color: "var(--bear)", dim: "var(--bear-dim)" },
  aligned:       { label: "Aligned",           action: "Crowd sentiment and market odds broadly agree. No strong signal.", color: "var(--neutral)", dim: "var(--bg-base)" },
  watch:         { label: "Watch — low volume", action: "Notable divergence but thin market volume. Treat with caution.", color: "var(--watch)", dim: "var(--watch-dim)" },
}

export function MarketDrawer({ row, onClose }: MarketDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!row) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [row, onClose])

  if (!row) return null

  const sig = row.divergence ? signalMap[row.divergence.signal] : null
  const odds = row.market?.odds
  const hasValidOdds = odds !== null && odds !== undefined && odds > 0

  return (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)" }} />

      <div className="drawer-animate" style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 540,
        maxHeight: "88vh",
        display: "flex", flexDirection: "column",
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderBottom: "none",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ minWidth: 0 }}>
            <BriefAge savedAt={row.sentiment?.brief_saved_at ?? null} />
            <h2 style={{ margin: "4px 0 2px", fontSize: 17, fontWeight: 700, color: "var(--text-hi)", lineHeight: 1.3 }}>
              {row.label}
            </h2>
            {row.market?.question && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-lo)" }}>{row.market.question}</p>
            )}
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-mid)", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "16px 20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Signal action */}
          {sig && (
            <div style={{ padding: "12px 14px", background: sig.dim, borderRadius: 10, borderLeft: `3px solid ${sig.color}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: sig.color, marginBottom: 4 }}>
                {sig.label}
                {row.divergence && (
                  <span className="mono" style={{ marginLeft: 8, fontSize: 13 }}>
                    {row.divergence.raw > 0 ? "+" : ""}{row.divergence.raw}pt gap
                  </span>
                )}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.55, margin: 0 }}>{sig.action}</p>
            </div>
          )}

          {/* Metrics */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Market Odds</p>
              <OddsPill odds={hasValidOdds ? odds! : null} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Divergence</p>
              <DivergenceCell divergence={row.divergence} />
            </div>
            {row.market?.volume != null && row.market.volume > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Volume</p>
                <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>${(row.market.volume / 1_000).toFixed(0)}K</span>
              </div>
            )}
          </div>

          {row.sentiment && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>Social Sentiment</p>
              <SentimentBar score={row.sentiment.score} />
              {row.sentiment.summary && <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{row.sentiment.summary}</p>}
            </div>
          )}

          {row.market?.history && row.market.history.length >= 2 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>7-Day Price History</p>
              <div style={{ background: "var(--bg-base)", borderRadius: 8, border: "1px solid var(--border)", padding: "10px 12px 6px" }}>
                <Sparkline history={row.market.history} currentOdds={hasValidOdds ? odds : undefined} />
              </div>
            </div>
          )}

          {row.sentiment?.signals && row.sentiment.signals.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>Key Signals</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {row.sentiment.signals.map((s, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-mid)" }}>
                    <span style={{ marginTop: 6, flexShrink: 0, width: 4, height: 4, borderRadius: "50%", background: "var(--info)", display: "block" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {row.sentiment?.best_takes && row.sentiment.best_takes.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>Top Takes</p>
              <BestTakes takes={row.sentiment.best_takes} />
            </div>
          )}

          {row.market?.marketUrl && (
            <a
              href={row.market.marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 16px",
                background: "var(--info)",
                color: "#fff",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View on Polymarket ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
