"use client"

interface SentimentBarProps {
  score: number
  confidence?: "high" | "medium" | "low"
}

export function SentimentBar({ score, confidence }: SentimentBarProps) {
  const normalized = (score + 100) / 2
  const color =
    score > 30 ? "bg-green-500" :
    score < -30 ? "bg-red-500" :
    "bg-yellow-500"
  const label =
    score > 30 ? "Bullish" :
    score < -30 ? "Bearish" :
    "Neutral"
  const confidenceColor =
    confidence === "high" ? "text-green-400" :
    confidence === "medium" ? "text-yellow-400" :
    "text-gray-400"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label} ({score > 0 ? "+" : ""}{score})</span>
        {confidence && (
          <span className={`capitalize ${confidenceColor}`}>{confidence}</span>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  )
}
