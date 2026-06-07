export interface SentimentResult {
  slug: string
  score: number
  confidence: "high" | "medium" | "low"
  summary: string
  best_takes: { source: string; text: string; engagement: string }[]
  signals: string[]
  volume_score: number      // 0..100, numeric — safe to sort on
  volume_label: string
  data_sources: string[]
  brief_saved_at: string    // ISO
  parsed_at: string         // ISO
}
