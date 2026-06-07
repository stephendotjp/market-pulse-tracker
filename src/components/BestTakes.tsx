"use client"

interface Take {
  source: string
  text: string
  engagement: string
}

interface BestTakesProps {
  takes: Take[]
}

export function BestTakes({ takes }: BestTakesProps) {
  if (!takes || takes.length === 0) return null
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {takes.map((t, i) => (
        <div key={i} style={{
          padding: "10px 12px",
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              padding: "1px 6px",
              borderRadius: 3,
              background: "var(--border)",
              color: "var(--text-mid)",
            }}>
              {t.source}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-lo)" }}>{t.engagement}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5 }}>{t.text}</p>
        </div>
      ))}
    </div>
  )
}
