"use client"

interface OddsPillProps {
  odds: number | null
}

export function OddsPill({ odds }: OddsPillProps) {
  if (odds === null) {
    return <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">N/A</span>
  }
  const color =
    odds >= 70 ? "bg-green-500/20 text-green-300" :
    odds >= 40 ? "bg-yellow-500/20 text-yellow-300" :
    "bg-red-500/20 text-red-300"
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {odds}%
    </span>
  )
}
