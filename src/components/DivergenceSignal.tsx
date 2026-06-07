"use client"

import type { DivergenceResult } from "@/lib/divergence"
import { TrendingUp, TrendingDown, Minus, Eye } from "lucide-react"

interface DivergenceSignalProps {
  divergence: DivergenceResult | null
  showLabel?: boolean
}

const signalConfig = {
  crowd_bullish: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/15 border-green-500/30" },
  crowd_bearish: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
  aligned: { icon: Minus, color: "text-gray-400", bg: "bg-white/5 border-white/10" },
  watch: { icon: Eye, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30" },
}

export function DivergenceSignal({ divergence, showLabel = true }: DivergenceSignalProps) {
  if (!divergence) {
    return <span className="text-xs text-gray-500">No data</span>
  }
  const cfg = signalConfig[divergence.signal]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} />
      {showLabel && divergence.label}
    </span>
  )
}
