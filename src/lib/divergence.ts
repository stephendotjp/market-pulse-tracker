export interface DivergenceResult {
  raw: number
  signal: "crowd_bullish" | "crowd_bearish" | "aligned" | "watch"
  label: string
  severity: "high" | "medium" | "low"
}

export function calculateDivergence(
  odds: number,
  sentimentScore: number,
  volume?: number
): DivergenceResult {
  const normalizedSentiment = (sentimentScore + 100) / 2
  const raw = Math.round(normalizedSentiment - odds)
  const abs = Math.abs(raw)
  const lowVolume = volume !== undefined && volume < 100_000

  let signal: DivergenceResult["signal"]
  if (lowVolume && abs > 15) signal = "watch"
  else if (raw > 20) signal = "crowd_bullish"
  else if (raw < -20) signal = "crowd_bearish"
  else signal = "aligned"

  const severity = abs > 30 ? "high" : abs > 15 ? "medium" : "low"
  const arrow = raw > 0 ? "↑" : raw < 0 ? "↓" : "≈"
  const sign = raw > 0 ? "+" : ""
  const label =
    signal === "aligned" ? `${abs} ≈ Aligned`
    : signal === "watch" ? `${sign}${raw} ${arrow} Watch — thin volume`
    : `${sign}${raw} ${arrow} Crowd ${raw > 0 ? "ahead of" : "behind"} money`

  return { raw, signal, label, severity }
}
