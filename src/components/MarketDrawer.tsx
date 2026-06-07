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

export function MarketDrawer({ row, onClose }: MarketDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!row) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [row, onClose])

  if (!row) return null

  const signal = row.divergence
    ? ({
        crowd_bullish: { label: "Crowd ahead",  color: "var(--info)" },
        crowd_bearish: { label: "Crowd behind", color: "var(--bear)" },
        aligned:       { label: "Aligned",      color: "var(--neutral)" },
        watch:         { label: "Watch",         color: "var(--watch)" },
      })[row.divergence.signal]
    : null

  return (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
      }} />

      {/* Panel */}
      <div
        className="drawer-animate"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ minWidth: 0 }}>
            <BriefAge savedAt={row.sentiment?.brief_saved_at ?? null} />
            <h2 style={{
              margin: "4px 0 2px",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text-hi)",
              lineHeight: 1.3,
            }}>
              {row.label}
            </h2>
            {row.market?.question && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-lo)" }}>
                {row.market.question}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              padding: 6,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-mid)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Metrics row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Market Odds</p>
              <OddsPill odds={row.market?.odds ?? null} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Divergence</p>
              <DivergenceCell divergence={row.divergence} />
            </div>
            {signal && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Signal</p>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: signal.color,
                  background: `${signal.color}18`,
                  padding: "4px 10px",
                  borderRadius: 100,
                }}>
                  {signal.label}
                </span>
              </div>
            )}
            {row.market?.volume != null && row.market.volume > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Volume</p>
                <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>
                  ${(row.market.volume / 1_000).toFixed(0)}K
                </span>
              </div>
            )}
          </div>

          {/* Sentiment */}
          {row.sentiment && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
                Social Sentiment
              </p>
              <SentimentBar score={row.sentiment.score} />
              {row.sentiment.summary && (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>
                  {row.sentiment.summary}
                </p>
              )}
            </div>
          )}

          {/* Sparkline chart */}
          {row.market?.history && row.market.history.length >= 2 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
                7-Day Price History
              </p>
              <div style={{
                background: "var(--bg-base)",
                borderRadius: 8,
                border: "1px solid var(--border)",
                padding: "10px 12px 8px",
              }}>
                <Sparkline
                  history={row.market.history}
                  currentOdds={row.market.odds > 0 ? row.market.odds : undefined}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text-lo)" }}>7d ago</span>
                  <span style={{ fontSize: 10, color: "var(--text-lo)" }}>now</span>
                </div>
              </div>
            </div>
          )}

          {/* Key signals */}
          {row.sentiment?.signals && row.sentiment.signals.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
                Key Signals
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {row.sentiment.signals.map((s, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-mid)" }}>
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
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 8 }}>
                Top Community Takes
              </p>
              <BestTakes takes={row.sentiment.best_takes} />
            </div>
          )}

          {/* Volume label */}
          {row.sentiment?.volume_label && (
            <p style={{ fontSize: 11, color: "var(--text-lo)", margin: 0 }}>
              Discussion volume: {row.sentiment.volume_label}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
