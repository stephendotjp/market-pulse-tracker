"use client"

interface OddsPillProps {
  odds: number | null
}

export function OddsPill({ odds }: OddsPillProps) {
  const invalid = odds === null || odds === undefined || odds <= 0
  if (invalid) {
    return (
      <span className="mono" style={{
        padding: "3px 10px", borderRadius: 100, fontSize: 13,
        background: "var(--bg-base)", color: "var(--text-lo)",
        border: "1px solid var(--border)",
      }}>
        —
      </span>
    )
  }
  const style =
    odds >= 65 ? { bg: "var(--bull-dim)", text: "var(--bull)", border: "var(--bull)" } :
    odds <= 35 ? { bg: "var(--bear-dim)", text: "var(--bear)", border: "var(--bear)" } :
    { bg: "var(--bg-base)", text: "var(--text-mid)", border: "var(--border)" }

  return (
    <span className="mono" style={{
      padding: "3px 10px", borderRadius: 100, fontSize: 14, fontWeight: 700,
      background: style.bg, color: style.text,
      border: `1px solid ${style.border}22`,
    }}>
      {odds}%
    </span>
  )
}
