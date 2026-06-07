import { NextRequest, NextResponse } from "next/server"
import { TRACKED_MARKETS } from "@/lib/markets-config"
import { getMarketByConditionId } from "@/lib/polymarket"
import { getSentiment } from "@/lib/sentiment"
import { calculateDivergence } from "@/lib/divergence"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const rawSlug = req.nextUrl.searchParams.get("slug") ?? ""
  const slug = rawSlug.replace(/[^a-z0-9-]/gi, "")

  const tracked = TRACKED_MARKETS.find(m => m.slug === slug)
  if (!tracked) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 })
  }

  const isPlaceholder = tracked.condition_id.startsWith("REPLACE_")
  const market = isPlaceholder ? null : await getMarketByConditionId(tracked.condition_id)
  const sentiment = getSentiment(slug)
  const divergence =
    market && sentiment
      ? calculateDivergence(market.odds, sentiment.score, market.volume)
      : null

  return NextResponse.json({
    slug,
    label: tracked.label,
    category: tracked.category,
    description: tracked.description,
    last30days_query: tracked.last30days_query,
    market,
    sentiment,
    divergence,
    brief_saved_at: sentiment?.brief_saved_at ?? null,
  })
}
