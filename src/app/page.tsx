"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import type { DashboardResponse, DashboardRow } from "@/app/api/dashboard/route"
import { DashboardHeader } from "@/components/DashboardHeader"
import { CategoryTabs } from "@/components/CategoryTabs"
import { MarketRow } from "@/components/MarketRow"
import { MarketDrawer } from "@/components/MarketDrawer"
import { MissingBriefsWarning } from "@/components/MissingBriefsWarning"
import { MetricCard } from "@/components/MetricCard"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const { data, isLoading, error } = useSWR<DashboardResponse>(
    `${BASE}/api/dashboard`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  )

  const [activeCategory, setActiveCategory] = useState("all")
  const [activeRow, setActiveRow] = useState<DashboardRow | null>(null)

  const categories = useMemo(() => {
    if (!data?.rows) return []
    return [...new Set(data.rows.map(r => r.category))]
  }, [data?.rows])

  const categoryCounts = useMemo(() => {
    if (!data?.rows) return {}
    const counts: Record<string, number> = { all: data.rows.length }
    for (const r of data.rows) {
      counts[r.category] = (counts[r.category] ?? 0) + 1
    }
    return counts
  }, [data?.rows])

  const filteredRows = useMemo(() => {
    if (!data?.rows) return []
    if (activeCategory === "all") return data.rows
    return data.rows.filter(r => r.category === activeCategory)
  }, [data?.rows, activeCategory])

  if (error) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <p className="text-red-400">Failed to load dashboard. Is the dev server running?</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0d1117] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <DashboardHeader
          total={data?.stats.total ?? 0}
          signalsFlagged={data?.stats.signals_flagged ?? 0}
          avgDivergence={data?.stats.avg_divergence ?? 0}
          mostDiscussed={data?.stats.most_discussed ?? null}
          isLoading={isLoading}
        />

        {data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Markets" value={data.stats.total} />
            <MetricCard
              label="Signals Flagged"
              value={data.stats.signals_flagged}
              highlight={data.stats.signals_flagged > 0}
            />
            <MetricCard label="Avg Divergence" value={`${data.stats.avg_divergence}pts`} />
            <MetricCard
              label="Missing Briefs"
              value={data.missing_briefs.length}
              highlight={data.missing_briefs.length > 0}
            />
          </div>
        )}

        {data?.missing_briefs && data.missing_briefs.length > 0 && (
          <MissingBriefsWarning slugs={data.missing_briefs} />
        )}

        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          counts={categoryCounts}
        />

        <div className="space-y-3">
          {isLoading && !data &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
            ))
          }
          {filteredRows.map(row => (
            <MarketRow key={row.slug} row={row} onClick={() => setActiveRow(row)} />
          ))}
          {!isLoading && filteredRows.length === 0 && data && (
            <p className="py-8 text-center text-sm text-gray-500">No markets in this category.</p>
          )}
        </div>

        <p className="text-center text-xs text-gray-600">
          Refreshes every 5 minutes. Sentiment from last30days briefs.
        </p>
      </div>

      <MarketDrawer row={activeRow} onClose={() => setActiveRow(null)} />
    </main>
  )
}
