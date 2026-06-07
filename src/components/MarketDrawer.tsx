"use client"

import { useEffect, useRef } from "react"
import type { DashboardRow } from "@/app/api/dashboard/route"
import { X } from "lucide-react"
import { OddsPill } from "./OddsPill"
import { SentimentBar } from "./SentimentBar"
import { DivergenceSignal } from "./DivergenceSignal"
import { BriefAge } from "./BriefAge"
import { TrendChart } from "./TrendChart"
import { BestTakes } from "./BestTakes"

interface MarketDrawerProps {
  row: DashboardRow | null
  onClose: () => void
}

export function MarketDrawer({ row, onClose }: MarketDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!row) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [row, onClose])

  if (!row) return null

  const sentimentOdds = row.sentiment
    ? Math.round((row.sentiment.score + 100) / 2)
    : undefined

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-white/10 bg-gray-900 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-400 capitalize">
                {row.category}
              </span>
              <BriefAge savedAt={row.sentiment?.brief_saved_at ?? null} />
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">{row.label}</h2>
            {row.market?.question && (
              <p className="mt-0.5 text-xs text-gray-500">{row.market.question}</p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {/* Odds + Signal */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Market Odds</p>
              <OddsPill odds={row.market?.odds ?? null} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Signal</p>
              <DivergenceSignal divergence={row.divergence} />
            </div>
            {row.market?.volume != null && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Volume</p>
                <p className="text-sm font-medium text-white">
                  ${(row.market.volume / 1_000).toFixed(0)}K
                </p>
              </div>
            )}
          </div>

          {/* Sentiment */}
          {row.sentiment && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Social Sentiment</p>
              <SentimentBar score={row.sentiment.score} confidence={row.sentiment.confidence} />
              {row.sentiment.summary && (
                <p className="text-sm text-gray-300 leading-relaxed">{row.sentiment.summary}</p>
              )}
            </div>
          )}

          {/* Chart */}
          {row.market?.history && row.market.history.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-gray-500 uppercase tracking-wide">7-Day Price History</p>
              <TrendChart history={row.market.history} sentimentOdds={sentimentOdds} />
            </div>
          )}

          {/* Key Signals */}
          {row.sentiment?.signals && row.sentiment.signals.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-gray-500 uppercase tracking-wide">Key Signals</p>
              <ul className="space-y-1">
                {row.sentiment.signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best Takes */}
          {row.sentiment?.best_takes && row.sentiment.best_takes.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-gray-500 uppercase tracking-wide">Top Community Takes</p>
              <BestTakes takes={row.sentiment.best_takes} />
            </div>
          )}

          {/* Volume label */}
          {row.sentiment?.volume_label && (
            <p className="text-xs text-gray-500">
              Discussion volume: {row.sentiment.volume_label}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
