import { readFileSync } from "fs"
import path from "path"
import type { ScoutResults, TopicResult, ScoutMarket, Recommendation } from "../../../scripts/scout"

function loadResults(): ScoutResults {
  const p = path.join(process.cwd(), "src/data/scout-results.json")
  try {
    return JSON.parse(readFileSync(p, "utf-8"))
  } catch {
    return { generated_at: null as any, topics: [] }
  }
}

const REC: Record<Recommendation, { label: string; bg: string; color: string }> = {
  bet_yes:  { label: "BET YES",  bg: "var(--bull-dim)",  color: "var(--bull)"    },
  bet_no:   { label: "BET NO",   bg: "var(--bear-dim)",  color: "var(--bear)"    },
  watch:    { label: "WATCH",    bg: "var(--watch-dim)", color: "var(--watch)"   },
  skip:     { label: "SKIP",     bg: "var(--bg-base)",   color: "var(--text-lo)" },
  no_brief: { label: "NO BRIEF", bg: "var(--info-dim)",  color: "var(--info)"    },
}

const DIR_LABEL: Record<string, { label: string; color: string }> = {
  bullish:  { label: "Bullish",  color: "var(--bull)"    },
  bearish:  { label: "Bearish",  color: "var(--bear)"    },
  neutral:  { label: "Neutral",  color: "var(--neutral)" },
  unclear:  { label: "Unclear",  color: "var(--text-lo)" },
}

function RecBadge({ r }: { r: Recommendation }) {
  const s = REC[r]
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
      padding: "3px 8px", borderRadius: 4,
      background: s.bg, color: s.color,
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {s.label}
    </span>
  )
}

function MarketCard({ m }: { m: ScoutMarket }) {
  const isActionable = m.recommendation === "bet_yes" || m.recommendation === "bet_no"
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: "10px 16px",
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      background: isActionable ? "var(--bg-panel)" : undefined,
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--text-hi)", lineHeight: 1.35 }}>
          {m.question}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "var(--text-lo)", lineHeight: 1.4 }}>
          {m.reasoning}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: m.odds >= 60 ? "var(--bull)" : m.odds <= 40 ? "var(--bear)" : "var(--text-hi)" }}>
            {m.odds}%
          </span>
          <RecBadge r={m.recommendation} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "var(--text-lo)" }}>{m.daysToExpiry}d · ${(m.volume / 1000).toFixed(0)}K vol</span>
          {m.marketUrl && (
            <a
              href={m.marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, fontWeight: 600, color: "var(--info)",
                textDecoration: "none", padding: "2px 8px",
                border: "1px solid var(--info)", borderRadius: 4,
              }}
            >
              Trade ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TopicCard({ t }: { t: TopicResult }) {
  const dirStyle = t.direction ? DIR_LABEL[t.direction] : null
  const actionable = t.markets.filter(m => m.recommendation === "bet_yes" || m.recommendation === "bet_no")

  return (
    <div style={{
      background: "var(--bg-panel)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Topic header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "#F9FAFB" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-hi)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {t.topic}
              </h2>
              {dirStyle && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                  background: `${dirStyle.color}18`, color: dirStyle.color,
                }}>
                  {dirStyle.label}
                </span>
              )}
              {t.confidence && (
                <span style={{ fontSize: 10, color: "var(--text-lo)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t.confidence} confidence
                </span>
              )}
            </div>
            {t.headline ? (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{t.headline}</p>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-lo)", fontStyle: "italic" }}>
                No brief — run <code style={{ background: "var(--border)", padding: "1px 5px", borderRadius: 3, fontStyle: "normal", fontSize: 12 }}>/last30days {t.topic}</code> then re-run the scout script
              </p>
            )}
          </div>
          {actionable.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
              background: "var(--bull-dim)", color: "var(--bull)", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {actionable.length} bet{actionable.length > 1 ? "s" : ""} flagged
            </span>
          )}
        </div>

        {t.signals && t.signals.length > 0 && (
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            {t.signals.map((s, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: "var(--text-mid)" }}>
                <span style={{ marginTop: 5, width: 4, height: 4, borderRadius: "50%", background: "var(--info)", flexShrink: 0, display: "block" }} />
                {s}
              </li>
            ))}
          </ul>
        )}

        {t.briefAgeHours != null && (
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--text-lo)" }}>
            Brief: {t.briefSlug} · {t.briefAgeHours}h ago
          </p>
        )}
      </div>

      {/* Markets */}
      {t.markets.length === 0 ? (
        <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--text-lo)", fontSize: 13 }}>
          No Polymarket markets found resolving in 1–30 days with $5k+ volume.
        </div>
      ) : (
        <div>
          {t.markets.map((m, i) => <MarketCard key={i} m={m} />)}
        </div>
      )}
    </div>
  )
}

export default function ScoutPage() {
  const data = loadResults()
  const hasResults = data.topics.length > 0

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>
              Market Scout
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-lo)" }}>
              Surface near-term Polymarket bets where your last30days research gives an edge
            </p>
          </div>
          {data.generated_at && (
            <span style={{ fontSize: 11, color: "var(--text-lo)", whiteSpace: "nowrap", flexShrink: 0 }}>
              Last run: {new Date(data.generated_at).toLocaleString()}
            </span>
          )}
        </div>

        {/* How to use */}
        <div style={{
          marginTop: 16, padding: "12px 16px",
          background: "var(--info-dim)", borderRadius: 8, borderLeft: "3px solid var(--info)",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--info)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            How to use
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6 }}>
            1. Run <code style={{ background: "var(--border)", padding: "1px 5px", borderRadius: 3 }}>/last30days [topic]</code> in Claude Code for each topic you want to research.
            &nbsp;2. Run <code style={{ background: "var(--border)", padding: "1px 5px", borderRadius: 3 }}>npm run scout -- &quot;topic 1&quot; &quot;topic 2&quot;</code> to find matching markets and score them.
            &nbsp;3. Refresh this page to see results.
          </p>
        </div>
      </div>

      {!hasResults ? (
        <div style={{
          padding: "48px 32px", textAlign: "center",
          background: "var(--bg-panel)", borderRadius: 12, border: "1px solid var(--border)",
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-hi)", marginBottom: 8 }}>No scout results yet</p>
          <p style={{ fontSize: 13, color: "var(--text-lo)", marginBottom: 16 }}>Run the scout script to find betting opportunities:</p>
          <code style={{
            display: "inline-block", fontSize: 13, padding: "8px 16px",
            background: "#1a1a2e", color: "#a8d8f0", borderRadius: 6, letterSpacing: "0.02em",
          }}>
            npm run scout -- &quot;nvidia earnings&quot; &quot;bitcoin&quot; &quot;fed rate&quot;
          </code>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {data.topics.map((t, i) => <TopicCard key={i} t={t} />)}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: "var(--text-lo)", textAlign: "right" }}>
        Markets: 1–30 days to expiry · Volume &gt;$5k · Odds 5–95% considered
      </p>
    </div>
  )
}
