import snapshot from "@/data/sentiment-snapshot.json"
import type { SentimentResult } from "./types"

const data = snapshot as Record<string, SentimentResult>

export function getSentiment(slug: string): SentimentResult | null {
  return data[slug] ?? null
}

export function allSentiment(): Record<string, SentimentResult> {
  return data
}
