"use client"

import { RefreshCw } from "lucide-react"

interface DashboardHeaderProps {
  signalsFlagged: number
  avgDivergence: number
  total: number
  mostDiscussed: string | null
  isLoading?: boolean
}

export function DashboardHeader({ signalsFlagged, avgDivergence, total, mostDiscussed, isLoading }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Pulse Tracker</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Polymarket odds vs. social sentiment - {total} tracked markets
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Signals</p>
          <p className="font-bold text-yellow-300">{signalsFlagged} flagged</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Divergence</p>
          <p className="font-bold text-white">{avgDivergence}pts</p>
        </div>
        {mostDiscussed && (
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Most Discussed</p>
            <p className="font-bold text-white truncate max-w-32">{mostDiscussed}</p>
          </div>
        )}
        {isLoading && <RefreshCw size={14} className="animate-spin text-gray-400" />}
      </div>
    </div>
  )
}
