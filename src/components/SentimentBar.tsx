"use client"

interface SentimentBarProps {
  score: number
  confidence?: "high" | "medium" | "low"
}

export function SentimentBar({ score }: SentimentBarProps) {
  const half = Math.abs(score) / 2  // 0–50, fills half the bar
  const isPos = score >= 0
  const color = isPos ? "var(--bull)" : "var(--bear)"
  const sign  = score > 0 ? "+" : ""

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        position: "relative",
        height: 6,
        width: 96,
        background: "var(--border)",
        borderRadius: 100,
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute",
          top: 0, height: "100%",
          borderRadius: 100,
          background: color,
          left: isPos ? "50%" : `${50 - half}%`,
          width: `${half}%`,
          transition: "width 0.4s ease, left 0.4s ease",
        }} />
        <div style={{
          position: "absolute",
          top: 0, bottom: 0, left: "50%",
          width: 1,
          transform: "translateX(-50%)",
          background: "var(--bg-panel)",
        }} />
      </div>
      <span className="mono" style={{
        fontSize: 11, color, minWidth: "3.5ch", textAlign: "right",
      }}>
        {sign}{score}
      </span>
    </div>
  )
}
