import { notFound } from "next/navigation"
import Link from "next/link"
import { TRACKED_MARKETS } from "@/lib/markets-config"
import { getMarketByConditionId } from "@/lib/polymarket"
import { getSentiment } from "@/lib/sentiment"
import { calculateDivergence } from "@/lib/divergence"
import { OddsPill } from "@/components/OddsPill"
import { SentimentBar } from "@/components/SentimentBar"
import { DivergenceCell } from "@/components/DivergenceCell"
import { BriefAge } from "@/components/BriefAge"
import { Sparkline } from "@/components/Sparkline"
import { BestTakes } from "@/components/BestTakes"
import { MissingBriefBanner } from "@/components/MissingBriefBanner"
import { ArrowLeft } from "lucide-react"

export const revalidate = 300

const catColors: Record<string, string> = {
  macro:    "#7C8CF8",
  crypto:   "#F5A623",
  equities: "#4FD1C5",
  politics: "#E573B5",
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return TRACKED_MARKETS.map(m => ({ slug: m.slug }))
}

export default async function MarketPage({ params }: Props) {
  const { slug } = await params
  const tracked = TRACKED_MARKETS.find(m => m.slug === slug)
  if (!tracked) notFound()

  const isPlaceholder = tracked.condition_id.startsWith("REPLACE_")
  const market = isPlaceholder ? null : await getMarketByConditionId(tracked.condition_id)
  const sentiment = getSentiment(slug)
  const divergence = market && sentiment
    ? calculateDivergence(market.odds, sentiment.score, market.volume)
    : null

  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  const catColor = catColors[tracked.category] ?? "#9BA1AC"

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "20px 16px 48px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        <Link href={`${BASE}/`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "var(--text-lo)", textDecoration: "none",
        }}>
          <ArrowLeft size={13} />
          Dashboard
        </Link>

        {/* Title */}
        <div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: catColor, background: `${catColor}18`, padding: "2px 6px", borderRadius: 3,
          }}>
            {tracked.category}
          </span>
          <h1 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>
            {tracked.label}
          </h1>
          {tracked.description && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-lo)" }}>{tracked.description}</p>
          )}
          <div style={{ marginTop: 6 }}>
            <BriefAge savedAt={sentiment?.brief_saved_at ?? null} />
          </div>
        </div>

        {/* Metrics */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center",
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "14px 16px",
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Odds</p>
            <OddsPill odds={market?.odds ?? null} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Divergence</p>
            <DivergenceCell divergence={divergence} />
          </div>
          {market?.volume != null && market.volume > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 6 }}>Volume</p>
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>
                ${(market.volume / 1_000).toFixed(0)}K
              </span>
            </div>
          )}
        </div>

        {!sentiment && (
          <MissingBriefBanner slug={slug} query={tracked.last30days_query} />
        )}

        {/* Sentiment */}
        {sentiment && (
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 10 }}>
              Social Sentiment
            </p>
            <SentimentBar score={sentiment.score} />
            {sentiment.summary && (
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>
                {sentiment.summary}
              </p>
            )}
          </div>
        )}

        {/* Sparkline */}
        {market?.history && market.history.length >= 2 && (
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 10 }}>
              7-Day Price History
            </p>
            <div style={{ background: "var(--bg-base)", borderRadius: 6, padding: "10px 10px 4px" }}>
              <Sparkline history={market.history} currentOdds={market.odds > 0 ? market.odds : undefined} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 10, color: "var(--text-lo)" }}>7d ago</span>
                <span style={{ fontSize: 10, color: "var(--text-lo)" }}>now</span>
              </div>
            </div>
          </div>
        )}

        {/* Signals */}
        {sentiment?.signals && sentiment.signals.length > 0 && (
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 10 }}>
              Key Signals
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {sentiment.signals.map((s, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-mid)" }}>
                  <span style={{ marginTop: 6, flexShrink: 0, width: 4, height: 4, borderRadius: "50%", background: "var(--info)", display: "block" }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Best takes */}
        {sentiment?.best_takes && sentiment.best_takes.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-lo)", marginBottom: 10 }}>
              Top Community Takes
            </p>
            <BestTakes takes={sentiment.best_takes} />
          </div>
        )}

        {sentiment?.volume_label && (
          <p style={{ fontSize: 11, color: "var(--text-lo)" }}>
            Discussion volume: {sentiment.volume_label}
          </p>
        )}
      </div>
    </main>
  )
}
