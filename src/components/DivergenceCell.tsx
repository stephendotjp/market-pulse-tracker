"use client"

import type { DivergenceResult } from "@/lib/divergence"

interface DivergenceCellProps {
  divergence: DivergenceResult | null
}

export function DivergenceCell({ divergence }: DivergenceCellProps) {
  if (!divergence) {
    return (
      <span className="mono" style={{ color: "var(--text-lo)", fontSize: 16 }}>—</span>
    )
  }

  const { raw, signal } = divergence
  const color =
    signal === "crowd_bullish" ? "var(--bull)" :
    signal === "crowd_bearish" ? "var(--bear)" :
    signal === "watch"         ? "var(--watch)" :
    "var(--neutral)"

  const arrow = raw > 5 ? "↑" : raw < -5 ? "↓" : "≈"
  const sign  = raw > 0 ? "+" : ""

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
      <span style={{ fontSize: 13, color, opacity: 0.7 }}>{arrow}</span>
      <span
        className="mono"
        style={{
          fontSize: 20,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {sign}{raw}
      </span>
    </div>
  )
}
