"use client"

import type { DashboardRow } from "@/app/api/dashboard/route"
import { OddsPill } from "./OddsPill"
import { SentimentBar } from "./SentimentBar"
import { DivergenceSignal } from "./DivergenceSignal"
import { BriefAge } from "./BriefAge"
import { BestTakesStrip } from "./BestTakesStrip"

interface MarketRowProps {
  row: DashboardRow
  onClick: () => void
}

export function MarketRow({ row, onClick }: MarketRowProps) {
  const hasMissingData = !row.market || !row.sentiment

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-white/20 hover:bg-white/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-400 capitalize">
              {row.category}
            </span>
            <BriefAge savedAt={row.sentiment?.brief_saved_at ?? null} />
          </div>
          <h3 className="mt-1.5 font-semibold text-white">{row.label}</h3>
          {row.market?.question && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{row.market.question}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <OddsPill odds={row.market?.odds ?? null} />
          <DivergenceSignal divergence={row.divergence} />
        </div>
      </div>

      {!hasMissingData && (
        <div className="mt-3 space-y-2">
          <SentimentBar
            score={row.sentiment!.score}
            confidence={row.sentiment!.confidence}
          />
          {row.sentiment!.best_takes?.length > 0 && (
            <BestTakesStrip takes={row.sentiment!.best_takes} />
          )}
        </div>
      )}

      {hasMissingData && (
        <p className="mt-2 text-xs text-gray-500">
          {!row.market && "Market data unavailable. "}
          {!row.sentiment && "Brief not yet generated."}
        </p>
      )}
    </button>
  )
}
