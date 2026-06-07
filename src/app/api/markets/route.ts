import { NextResponse } from "next/server"
import { TRACKED_MARKETS } from "@/lib/markets-config"
import { getMarketByConditionId } from "@/lib/polymarket"

export const revalidate = 300

export async function GET() {
  const results = await Promise.all(
    TRACKED_MARKETS.map(async (m) => {
      const isPlaceholder = m.condition_id.startsWith("REPLACE_")
      const market = isPlaceholder ? null : await getMarketByConditionId(m.condition_id)
      return { slug: m.slug, label: m.label, category: m.category, market }
    })
  )
  return NextResponse.json(results)
}
