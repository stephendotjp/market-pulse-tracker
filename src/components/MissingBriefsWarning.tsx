"use client"

import { TRACKED_MARKETS } from "@/lib/markets-config"
import { MissingBriefBanner } from "./MissingBriefBanner"

interface MissingBriefsWarningProps {
  slugs: string[]
}

export function MissingBriefsWarning({ slugs }: MissingBriefsWarningProps) {
  if (slugs.length === 0) return null
  return (
    <div className="space-y-2">
      {slugs.map(slug => {
        const market = TRACKED_MARKETS.find(m => m.slug === slug)
        return (
          <MissingBriefBanner
            key={slug}
            slug={slug}
            query={market?.last30days_query ?? slug}
          />
        )
      })}
    </div>
  )
}
