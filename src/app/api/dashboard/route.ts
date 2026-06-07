import { NextResponse } from "next/server"
import { TRACKED_MARKETS } from "@/lib/markets-config"
import { getMarketByConditionId } from "@/lib/polymarket"
import { getSentiment, allSentiment } from "@/lib/sentiment"
import { calculateDivergence } from "@/lib/divergence"
import type { DivergenceResult } from "@/lib/divergence"
import type { MarketOdds } from "@/lib/polymarket"
import type { SentimentResult } from "@/lib/types"

export const dynamic = "force-dynamic"

export interface DashboardRow {
  slug: string
  label: string
  category: string
  description: string
  condition_id: string
  last30days_query: string
  market: MarketOdds | null
  sentiment: SentimentResult | null
  divergence: DivergenceResult | null
}

export interface DashboardResponse {
  rows: DashboardRow[]
  stats: {
    total: number
    signals_flagged: number
    avg_divergence: number
    most_discussed: string | null
  }
  missing_briefs: string[]
}

export async function GET() {
  const sentimentMap = allSentiment()
  const missing_briefs: string[] = []

  const rows: DashboardRow[] = await Promise.all(
    TRACKED_MARKETS.map(async (m) => {
      const isPlaceholder = m.condition_id.startsWith("REPLACE_")
      const market = isPlaceholder ? null : await getMarketByConditionId(m.condition_id)
      const sentiment = getSentiment(m.slug)

      if (!sentiment) missing_briefs.push(m.slug)

      const divergence =
        market && sentiment
          ? calculateDivergence(market.odds, sentiment.score, market.volume)
          : null

      return {
        slug: m.slug,
        label: m.label,
        category: m.category,
        description: m.description,
        condition_id: m.condition_id,
        last30days_query: m.last30days_query,
        market,
        sentiment,
        divergence,
      }
    })
  )

  const withDivergence = rows.filter(r => r.divergence !== null)
  const avg_divergence =
    withDivergence.length > 0
      ? Math.round(
          withDivergence.reduce((s, r) => s + Math.abs(r.divergence!.raw), 0) /
            withDivergence.length
        )
      : 0

  const signals_flagged = rows.filter(
    r => r.divergence && r.divergence.signal !== "aligned"
  ).length

  const sentimentEntries = Object.entries(sentimentMap)
  const mostDiscussedEntry = sentimentEntries.sort(
    (a, b) => (b[1].volume_score ?? 0) - (a[1].volume_score ?? 0)
  )[0]
  const most_discussed = mostDiscussedEntry ? mostDiscussedEntry[0] : null

  return NextResponse.json({
    rows,
    stats: { total: rows.length, signals_flagged, avg_divergence, most_discussed },
    missing_briefs,
  } satisfies DashboardResponse)
}
