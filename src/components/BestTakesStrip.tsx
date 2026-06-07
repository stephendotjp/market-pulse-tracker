"use client"

export interface StripTake {
  source: string
  text: string
  engagement: string
  marketLabel?: string
}

interface BestTakesStripProps {
  takes: StripTake[]
}

export function BestTakesStrip({ takes }: BestTakesStripProps) {
  if (!takes || takes.length === 0) return null
  return (
    <div>
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-lo)",
        marginBottom: 10,
      }}>
        Best takes this week
      </p>
      <div style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        paddingBottom: 6,
        scrollbarWidth: "none",
      }}>
        {takes.map((t, i) => (
          <div key={i} style={{
            flexShrink: 0,
            width: 228,
            padding: "10px 12px",
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <p style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--text-mid)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {t.text}
            </p>
            {t.marketLabel && (
              <p style={{ fontSize: 10, color: "var(--text-lo)", margin: 0 }}>
                {t.marketLabel}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
