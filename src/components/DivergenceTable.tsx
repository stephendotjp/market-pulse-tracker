"use client"

import { useState, useMemo, useCallback } from "react"
import type { DashboardRow } from "@/app/api/dashboard/route"
import { MarketRow } from "./MarketRow"

type SortKey = "label" | "odds" | "sentiment" | "divergence"
type SortDir = "asc" | "desc"

const TH: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
  color: "var(--text-lo)",
  background: "#F0F2F5",
  userSelect: "none",
  position: "sticky", top: 0, zIndex: 10,
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--border)",
}

interface DivergenceTableProps {
  rows: DashboardRow[]
  onRowClick: (row: DashboardRow) => void
  selectedSlug?: string | null
}

export function DivergenceTable({ rows, onRowClick, selectedSlug }: DivergenceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("divergence")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = useCallback((key: SortKey) => {
    setSortDir(d => key === sortKey ? (d === "asc" ? "desc" : "asc") : "desc")
    setSortKey(key)
  }, [sortKey])

  const sorted = useMemo(() => {
    const arr = [...rows]
    arr.sort((a, b) => {
      let va: number, vb: number
      switch (sortKey) {
        case "odds":
          va = a.market?.odds ?? -1; vb = b.market?.odds ?? -1; break
        case "sentiment":
          va = a.sentiment?.score ?? -999; vb = b.sentiment?.score ?? -999; break
        case "divergence":
          va = a.divergence ? Math.abs(a.divergence.raw) : -1
          vb = b.divergence ? Math.abs(b.divergence.raw) : -1
          break
        default:
          return sortDir === "asc" ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)
      }
      return sortDir === "asc" ? va - vb : vb - va
    })
    return arr
  }, [rows, sortKey, sortDir])

  function Ind({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ opacity: 0.3, marginLeft: 3 }}>↕</span>
    return <span style={{ marginLeft: 3 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
  }

  return (
    <div style={{
      background: "var(--bg-panel)",
      borderRadius: 12,
      border: "1px solid var(--border)",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: "left", cursor: "pointer", width: "32%" }} onClick={() => handleSort("label")}>
                Market<Ind col="label" />
              </th>
              <th style={{ ...TH, textAlign: "right", cursor: "pointer" }} onClick={() => handleSort("odds")}>
                Odds<Ind col="odds" />
              </th>
              <th style={{ ...TH, textAlign: "left", cursor: "pointer", minWidth: 180 }} onClick={() => handleSort("sentiment")}>
                Sentiment<Ind col="sentiment" />
              </th>
              <th style={{ ...TH, textAlign: "right", cursor: "pointer" }} onClick={() => handleSort("divergence")}>
                Divergence<Ind col="divergence" />
              </th>
              <th style={{ ...TH, textAlign: "left" }}>Crowd Says</th>
              <th style={{ ...TH, textAlign: "right" }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <MarketRow
                key={row.slug}
                row={row}
                onClick={() => onRowClick(row)}
                isLast={i === sorted.length - 1}
                index={i}
                isSelected={row.slug === selectedSlug}
              />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-lo)", fontSize: 13 }}>
                  No markets in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{
        padding: "8px 16px",
        borderTop: "1px solid var(--border)",
        background: "#F9FAFB",
        fontSize: 11,
        color: "var(--text-lo)",
      }}>
        Divergence = social sentiment (0–100) minus market odds (%). Positive → crowd more bullish than market.
      </div>
    </div>
  )
}
