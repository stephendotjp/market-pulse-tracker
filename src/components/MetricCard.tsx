"use client"

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
  accentColor?: string
}

export function MetricCard({ label, value, sub, highlight, accentColor }: MetricCardProps) {
  const accent = accentColor ?? (highlight ? "var(--watch)" : "var(--border)")
  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--bg-panel)",
      borderRadius: 10,
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <p style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "var(--text-lo)", margin: 0, marginBottom: 6,
      }}>
        {label}
      </p>
      <p className="mono" style={{
        fontSize: 22, fontWeight: 700,
        color: highlight ? accent : "var(--text-hi)",
        lineHeight: 1, margin: 0,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: "var(--text-lo)", margin: 0, marginTop: 4 }}>{sub}</p>}
    </div>
  )
}
