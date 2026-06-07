"use client"

interface OddsPillProps {
  odds: number | null
}

export function OddsPill({ odds }: OddsPillProps) {
  const invalid = odds === null || odds === undefined || odds <= 0
  if (invalid) {
    return (
      <span className="mono" style={{
        padding: "2px 8px",
        borderRadius: 100,
        fontSize: 12,
        background: "var(--border)",
        color: "var(--text-lo)",
      }}>
        —
      </span>
    )
  }
  const color =
    odds >= 65 ? { bg: "var(--bull-dim)", text: "var(--bull)" } :
    odds <= 35 ? { bg: "var(--bear-dim)", text: "var(--bear)" } :
    { bg: "var(--border)",  text: "var(--text-mid)" }

  return (
    <span className="mono" style={{
      padding: "2px 8px",
      borderRadius: 100,
      fontSize: 12,
      fontWeight: 600,
      background: color.bg,
      color: color.text,
    }}>
      {odds}%
    </span>
  )
}
