"use client"

interface Take {
  source: string
  text: string
  engagement: string
}

interface BestTakesProps {
  takes: Take[]
}

export function BestTakes({ takes }: BestTakesProps) {
  if (!takes || takes.length === 0) return null
  return (
    <div className="space-y-2">
      {takes.map((t, i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-300">{t.source}</span>
            <span className="text-xs text-gray-500">{t.engagement}</span>
          </div>
          <p className="mt-1.5 text-sm text-gray-300">{t.text}</p>
        </div>
      ))}
    </div>
  )
}
