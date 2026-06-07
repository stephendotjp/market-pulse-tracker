"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import type { PricePoint } from "@/lib/polymarket"
import { format } from "date-fns"

interface TrendChartProps {
  history: PricePoint[]
  sentimentOdds?: number
}

export function TrendChart({ history, sentimentOdds }: TrendChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        <p className="text-xs text-gray-500">No price history</p>
      </div>
    )
  }

  const data = history.map(p => ({
    t: format(new Date(p.t * 1000), "MMM d"),
    odds: Math.round(p.p * 100),
  }))

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -24 }}>
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#60a5fa" }}
          />
          {sentimentOdds !== undefined && (
            <ReferenceLine y={sentimentOdds} stroke="#facc15" strokeDasharray="4 2" strokeWidth={1} label={{ value: "Sentiment", position: "insideTopRight", fontSize: 9, fill: "#facc15" }} />
          )}
          <Line type="monotone" dataKey="odds" stroke="#60a5fa" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
