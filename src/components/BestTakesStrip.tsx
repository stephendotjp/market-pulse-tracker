"use client"

interface Take {
  source: string
  text: string
  engagement: string
}

interface BestTakesStripProps {
  takes: Take[]
}

export function BestTakesStrip({ takes }: BestTakesStripProps) {
  if (!takes || takes.length === 0) return null
  const top = takes[0]
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="mt-0.5 rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-400 whitespace-nowrap">{top.source}</span>
      <p className="text-xs text-gray-400 line-clamp-2">{top.text}</p>
      <span className="ml-auto whitespace-nowrap text-xs text-gray-500">{top.engagement}</span>
    </div>
  )
}
