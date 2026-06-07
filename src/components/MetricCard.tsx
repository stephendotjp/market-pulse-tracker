"use client"

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export function MetricCard({ label, value, sub, highlight }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/10 bg-white/5"}`}>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}
