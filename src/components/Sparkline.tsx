"use client"

import type { PricePoint } from "@/lib/polymarket"

interface SparklineProps {
  history: PricePoint[]
  currentOdds?: number
}

export function Sparkline({ history, currentOdds }: SparklineProps) {
  if (!history || history.length < 2) {
    return (
      <div style={{
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border)",
        borderRadius: 8,
        color: "var(--text-lo)",
        fontSize: 12,
      }}>
        No price history
      </div>
    )
  }

  const VW = 400
  const VH = 80
  const PAD = { t: 10, r: 4, b: 10, l: 4 }
  const W = VW - PAD.l - PAD.r
  const H = VH - PAD.t - PAD.b

  const ts = history.map(p => p.t)
  const tMin = Math.min(...ts)
  const tMax = Math.max(...ts)
  const tRange = tMax - tMin || 1

  const toX = (t: number) => PAD.l + ((t - tMin) / tRange) * W
  const toY = (p: number) => PAD.t + H - p * H  // p is 0-1

  const points = history.map(p =>
    `${toX(p.t).toFixed(1)},${toY(p.p).toFixed(1)}`
  ).join(" ")

  const last = history[history.length - 1]
  const lx = toX(last.t).toFixed(1)
  const ly = toY(last.p).toFixed(1)

  const refY = currentOdds !== undefined
    ? toY(currentOdds / 100).toFixed(1)
    : null

  // Area fill: close the polygon at bottom
  const areaPoints = `${PAD.l},${PAD.t + H} ${points} ${(PAD.l + W).toFixed(1)},${PAD.t + H}`

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      height="80"
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--info)" stopOpacity={0.18} />
          <stop offset="100%" stopColor="var(--info)" stopOpacity={0}    />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon points={areaPoints} fill="url(#sg)" />

      {/* Sentiment reference line */}
      {refY && (
        <line
          x1={PAD.l} y1={refY}
          x2={PAD.l + W} y2={refY}
          stroke="var(--watch)" strokeWidth={0.8} strokeDasharray="4,3"
        />
      )}

      {/* Price line */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--info)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Last point dot */}
      <circle cx={lx} cy={ly} r="3" fill="var(--info)" />
    </svg>
  )
}
