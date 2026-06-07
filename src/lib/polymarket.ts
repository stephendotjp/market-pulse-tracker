const GAMMA = "https://gamma-api.polymarket.com"
const CLOB = "https://clob.polymarket.com"

export interface PricePoint { t: number; p: number }

export interface MarketOdds {
  odds: number
  volume: number
  question: string
  yesTokenId: string | null
  history: PricePoint[]
}

// Gamma returns outcomes/outcomePrices/clobTokenIds as JSON-encoded strings
function parseStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === "string") { try { return JSON.parse(v) } catch { return [] } }
  return []
}

export async function getMarketByConditionId(conditionId: string): Promise<MarketOdds | null> {
  const res = await fetch(`${GAMMA}/markets?condition_ids=${conditionId}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  const arr = await res.json()
  const m = Array.isArray(arr) ? arr[0] : null
  if (!m) return null

  const outcomes = parseStringArray(m.outcomes)
  const prices = parseStringArray(m.outcomePrices)
  const tokens = parseStringArray(m.clobTokenIds)

  const yesIdx = outcomes.findIndex((o: string) => o.toLowerCase() === "yes")
  const idx = yesIdx >= 0 ? yesIdx : 0
  const yesPrice = parseFloat(prices[idx] ?? "0")
  const yesTokenId = tokens[idx] ?? null

  const history = yesTokenId ? await getPriceHistory(yesTokenId) : []

  return {
    odds: Math.round(yesPrice * 100),
    volume: Number(m.volumeNum ?? 0),
    question: m.question ?? "",
    yesTokenId,
    history,
  }
}

export async function getPriceHistory(tokenId: string): Promise<PricePoint[]> {
  const res = await fetch(
    `${CLOB}/prices-history?market=${tokenId}&interval=1w&fidelity=180`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data?.history) ? data.history : []
}

export async function searchMarkets(query: string, limit = 10) {
  const res = await fetch(
    `${GAMMA}/markets?closed=false&limit=${limit}&order=volumeNum&ascending=false`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const arr = await res.json()
  return (Array.isArray(arr) ? arr : [])
    .filter((m: { question?: string }) =>
      m.question?.toLowerCase().includes(query.toLowerCase()))
    .map((m: { conditionId: string; question: string; volumeNum: number }) =>
      ({ conditionId: m.conditionId, question: m.question, volume: m.volumeNum }))
}
