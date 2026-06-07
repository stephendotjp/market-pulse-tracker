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
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        borderRadius: 8,
        fontSize: 13,
        color: "var(--text-lo)",
      }}>
        No price history available
      </div>
    )
  }

  const VW = 400
  const VH = 100
  const PAD = { t: 14, r: 8, b: 14, l: 8 }
  const W = VW - PAD.l - PAD.r
  const H = VH - PAD.t - PAD.b

  const pValues = history.map(p => p.p)
  const pRawMin = Math.min(...pValues)
  const pRawMax = Math.max(...pValues)
  const pRange = pRawMax - pRawMin

  // Autoscale: pad by 20% of range, minimum 2% absolute so flat lines show a band
  const pad = Math.max(pRange * 0.2, 0.02)
  const yMin = Math.max(0, pRawMin - pad)
  const yMax = Math.min(1, pRawMax + pad)
  const yRange = yMax - yMin || 0.01

  const ts = history.map(p => p.t)
  const tMin = Math.min(...ts)
  const tMax = Math.max(...ts)
  const tRange = tMax - tMin || 1

  const toX = (t: number) => PAD.l + ((t - tMin) / tRange) * W
  const toY = (p: number) => PAD.t + H - ((p - yMin) / yRange) * H

  const points = history
    .map(p => `${toX(p.t).toFixed(1)},${toY(p.p).toFixed(1)}`)
    .join(" ")

  const last = history[history.length - 1]
  const lx = toX(last.t).toFixed(1)
  const ly = toY(last.p).toFixed(1)

  // Area fill polygon
  const areaPoints = [
    `${PAD.l},${PAD.t + H}`,
    points,
    `${(PAD.l + W).toFixed(1)},${PAD.t + H}`,
  ].join(" ")

  // Y-axis labels: min and max of actual data
  const yLabelMin = Math.round(pRawMin * 100)
  const yLabelMax = Math.round(pRawMax * 100)
  const yLabelMid = Math.round(((pRawMin + pRawMax) / 2) * 100)

  return (
    <div>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        height={VH}
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--info)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--info)" stopOpacity={0}    />
          </linearGradient>
        </defs>

        {/* Horizontal grid at min and max */}
        <line x1={PAD.l} y1={toY(pRawMax)} x2={PAD.l + W} y2={toY(pRawMax)}
          stroke="var(--border)" strokeWidth={0.6} />
        <line x1={PAD.l} y1={toY(pRawMin)} x2={PAD.l + W} y2={toY(pRawMin)}
          stroke="var(--border)" strokeWidth={0.6} />

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#sg)" />

        {/* Current odds reference line */}
        {currentOdds !== undefined && (
          <line
            x1={PAD.l} y1={toY(currentOdds / 100)}
            x2={PAD.l + W} y2={toY(currentOdds / 100)}
            stroke="var(--watch)" strokeWidth={1} strokeDasharray="4,3"
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

      {/* Price range labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-lo)" }}>7d ago</span>
        <span style={{ fontSize: 10, color: "var(--text-lo)" }}>
          Range: <span className="mono">{yLabelMin}%</span>
          {yLabelMin !== yLabelMax && <> – <span className="mono">{yLabelMax}%</span></>}
          {yLabelMin === yLabelMax && <span style={{ color: "var(--watch)", marginLeft: 4 }}>stable</span>}
        </span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-lo)" }}>now</span>
      </div>
    </div>
  )
}
