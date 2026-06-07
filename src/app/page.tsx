"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import type { DashboardResponse, DashboardRow } from "@/app/api/dashboard/route"
import { DivergenceTable } from "@/components/DivergenceTable"
import { MarketDrawer } from "@/components/MarketDrawer"
import { MissingBriefsWarning } from "@/components/MissingBriefsWarning"
import { MetricCard } from "@/components/MetricCard"
import { CategoryTabs } from "@/components/CategoryTabs"
import { BestTakesStrip, type StripTake } from "@/components/BestTakesStrip"
import { RefreshCw } from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardResponse>(
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

  const bestTakes = useMemo<StripTake[]>(() => {
    if (!data?.rows) return []
    const takes: StripTake[] = []
    for (const row of data.rows) {
      if (row.sentiment?.best_takes) {
        for (const t of row.sentiment.best_takes) {
          takes.push({ ...t, marketLabel: row.label })
        }
      }
    }
    return takes
  }, [data?.rows])

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "20px 16px 48px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>
              Market Pulse
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-lo)" }}>
              Polymarket odds vs. social sentiment divergence
            </p>
          </div>
          {isLoading && (
            <RefreshCw size={14} style={{ color: "var(--text-lo)", marginTop: 6 }} className="animate-spin" />
          )}
        </div>

        {/* Stats */}
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <MetricCard label="Markets" value={data.stats.total} />
            <MetricCard
              label="Signals"
              value={data.stats.signals_flagged}
              highlight={data.stats.signals_flagged > 0}
              accentColor={data.stats.signals_flagged > 0 ? "var(--watch)" : undefined}
            />
            <MetricCard label="Avg divergence" value={`${data.stats.avg_divergence}pt`} />
            <MetricCard
              label="Missing briefs"
              value={data.missing_briefs.length}
              highlight={data.missing_briefs.length > 0}
              accentColor={data.missing_briefs.length > 0 ? "var(--bear)" : undefined}
            />
          </div>
        )}

        {/* Missing briefs */}
        {data?.missing_briefs && data.missing_briefs.length > 0 && (
          <MissingBriefsWarning slugs={data.missing_briefs} />
        )}

        {/* Filters */}
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          counts={categoryCounts}
        />

        {/* Skeleton */}
        {isLoading && !data && (
          <div style={{
            background: "var(--bg-panel)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                height: 64,
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "transparent" : "var(--bg-row-hover)",
                animation: "pulse 1.5s ease infinite",
                opacity: 0.4,
              }} />
            ))}
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <DivergenceTable rows={filteredRows} onRowClick={setActiveRow} />
        )}

        {/* Best takes strip */}
        {bestTakes.length > 0 && (
          <BestTakesStrip takes={bestTakes} />
        )}

        <p style={{ fontSize: 11, color: "var(--text-lo)", textAlign: "center" }}>
          Refreshes every 5 min · Sentiment from last30days briefs
        </p>
      </div>

      <MarketDrawer row={activeRow} onClose={() => setActiveRow(null)} />
    </main>
  )
}
