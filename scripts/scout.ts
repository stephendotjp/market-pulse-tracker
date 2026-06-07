// Usage: npm run scout -- "nvidia earnings" "bitcoin etf" "fed rate"
// For each topic: finds Polymarket markets resolving in 1-30 days, matches against
// any last30days brief you've already run, and scores each market for edge.

import fs from "fs/promises"
import path from "path"
import Anthropic from "@anthropic-ai/sdk"
import { listBriefSlugs, readBrief } from "../src/lib/last30days"

const GAMMA = "https://gamma-api.polymarket.com"
const OUT = path.join(process.cwd(), "src/data/scout-results.json")

// ── Types ────────────────────────────────────────────────────────────────────

export type Recommendation = "bet_yes" | "bet_no" | "watch" | "skip" | "no_brief"

export interface ScoutMarket {
  question: string
  conditionId: string
  marketUrl: string | null
  odds: number
  volume: number
  daysToExpiry: number
  recommendation: Recommendation
  reasoning: string
}

export interface TopicResult {
  topic: string
  hasBrief: boolean
  briefSlug?: string
  briefAgeHours?: number
  direction?: "bullish" | "bearish" | "neutral" | "unclear"
  confidence?: "high" | "medium" | "low"
  headline?: string
  signals?: string[]
  markets: ScoutMarket[]
}

export interface ScoutResults {
  generated_at: string
  topics: TopicResult[]
}

// ── Polymarket search ────────────────────────────────────────────────────────

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === "string") { try { return JSON.parse(v) } catch { return [] } }
  return []
}

async function searchPolymarket(keywords: string[]): Promise<any[]> {
  const url = `${GAMMA}/markets?closed=false&limit=500&order=endDate&ascending=true`
  const res = await fetch(url)
  if (!res.ok) return []
  const markets = await res.json()

  const now = Date.now()

  return (Array.isArray(markets) ? markets : []).filter((m: any) => {
    if (!m.endDate) return false
    const daysOut = (new Date(m.endDate).getTime() - now) / 86_400_000
    if (daysOut < 1 || daysOut > 30) return false

    const vol = Number(m.volumeNum ?? 0)
    if (vol < 5_000) return false

    // Binary market only (has Yes/No)
    const outcomes = parseArr(m.outcomes).map((o: string) => o.toLowerCase())
    if (!outcomes.includes("yes")) return false

    const q = (m.question ?? "").toLowerCase()
    return keywords.some(k => q.includes(k.toLowerCase()))
  })
}

// ── Brief matching ───────────────────────────────────────────────────────────

async function findBriefForTopic(topic: string): Promise<{ slug: string; ageHours: number } | null> {
  const slugs = await listBriefSlugs()
  const words = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2)

  let best: { slug: string; score: number; mtime: number } | null = null
  for (const slug of slugs) {
    const score = words.filter(w => slug.includes(w)).length
    if (score === 0) continue
    const brief = await readBrief(slug)
    if (!brief) continue
    const mtime = new Date(brief.savedAt).getTime()
    if (!best || score > best.score || (score === best.score && mtime > best.mtime)) {
      best = { slug, score, mtime }
    }
  }

  if (!best) return null
  const ageHours = (Date.now() - best.mtime) / 3_600_000
  return { slug: best.slug, ageHours }
}

// ── Brief parsing ────────────────────────────────────────────────────────────

const SCOUT_PROMPT = `You are evaluating a social research brief to find prediction market betting edges.

Return ONLY a JSON object:
{
  "direction": "bullish" | "bearish" | "neutral" | "unclear",
  "confidence": "high" | "medium" | "low",
  "headline": "<one sentence: the clearest signal from the research>",
  "signals": ["<signal 1>", "<signal 2>", "<signal 3>"]
}

Rules:
- "high" confidence = clear consensus, multiple sources, strong engagement
- "medium" = directional lean but mixed signals
- "low" = noise, contradictory, or thin coverage
- Keep signals under 12 words each, factual not opinionated

Brief:
`

async function parseBrief(slug: string, client: Anthropic): Promise<{ direction: string; confidence: string; headline: string; signals: string[] } | null> {
  const brief = await readBrief(slug)
  if (!brief) return null

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{ role: "user", content: SCOUT_PROMPT + brief.rawMarkdown.slice(0, 8000) }],
  })

  const text = msg.content.filter(b => b.type === "text").map(b => (b as any).text).join("")
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}")
  } catch {
    return null
  }
}

// ── Scoring ──────────────────────────────────────────────────────────────────

function score(m: any, direction: string, confidence: string): { recommendation: Recommendation; reasoning: string } {
  const daysOut = (new Date(m.endDate).getTime() - Date.now()) / 86_400_000
  const outcomes = parseArr(m.outcomes)
  const prices = parseArr(m.outcomePrices)
  const yesIdx = outcomes.findIndex((o: string) => o.toLowerCase() === "yes")
  const odds = Math.round(parseFloat(prices[yesIdx >= 0 ? yesIdx : 0] ?? "0") * 100)
  const vol = Number(m.volumeNum ?? 0)

  if (odds < 5 || odds > 95) return { recommendation: "skip", reasoning: "Extreme odds — market already settled, no edge available" }
  if (vol < 10_000) return { recommendation: "skip", reasoning: "Low volume — thin liquidity, price can't be trusted" }
  if (daysOut < 3) return { recommendation: "skip", reasoning: "Resolves in under 3 days — news already priced in" }

  if (direction === "bullish") {
    if (confidence === "high" && odds <= 55) return { recommendation: "bet_yes", reasoning: `Strong bullish consensus vs ${odds}% market odds` }
    if (confidence === "high" && odds <= 65) return { recommendation: "watch", reasoning: `Bullish consensus — but market at ${odds}% already reflects some optimism` }
    if (confidence === "medium" && odds <= 45) return { recommendation: "bet_yes", reasoning: `Moderate bullish lean vs ${odds}% — worth a small position` }
    if (confidence === "medium") return { recommendation: "watch", reasoning: `Bullish lean but mixed signals, market at ${odds}%` }
  }

  if (direction === "bearish") {
    if (confidence === "high" && odds >= 45) return { recommendation: "bet_no", reasoning: `Strong bearish consensus vs ${odds}% market odds` }
    if (confidence === "high" && odds >= 35) return { recommendation: "watch", reasoning: `Bearish consensus — but market at ${odds}% already reflects some pessimism` }
    if (confidence === "medium" && odds >= 55) return { recommendation: "bet_no", reasoning: `Moderate bearish lean vs ${odds}% — worth a small position` }
    if (confidence === "medium") return { recommendation: "watch", reasoning: `Bearish lean but mixed signals, market at ${odds}%` }
  }

  return { recommendation: "watch", reasoning: "Neutral or unclear signal — no strong edge identified" }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const topics = process.argv.slice(2)
  if (topics.length === 0) {
    console.error('Usage: npm run scout -- "topic 1" "topic 2"')
    console.error('Example: npm run scout -- "nvidia earnings" "bitcoin" "fed rate"')
    process.exit(1)
  }

  const client = new Anthropic()
  const results: TopicResult[] = []

  for (const topic of topics) {
    console.log(`\nScouting: ${topic}`)

    const keywords = topic.split(/\s+/).filter(w => w.length > 2)
    const rawMarkets = await searchPolymarket(keywords)
    console.log(`  ${rawMarkets.length} markets found (1-30 days, vol >$5k)`)

    const match = await findBriefForTopic(topic)
    let parsed: any = null

    if (match) {
      console.log(`  Brief: ${match.slug} (${Math.round(match.ageHours)}h ago)`)
      parsed = await parseBrief(match.slug, client)
      console.log(`  Parsed: ${parsed?.direction} / ${parsed?.confidence}`)
    } else {
      console.log(`  No brief — run: /last30days ${topic}`)
    }

    const markets: ScoutMarket[] = rawMarkets.map((m: any) => {
      const daysToExpiry = Math.round((new Date(m.endDate).getTime() - Date.now()) / 86_400_000)
      const outcomes = parseArr(m.outcomes)
      const prices = parseArr(m.outcomePrices)
      const yesIdx = outcomes.findIndex((o: string) => o.toLowerCase() === "yes")
      const odds = Math.round(parseFloat(prices[yesIdx >= 0 ? yesIdx : 0] ?? "0") * 100)
      const eventSlug = Array.isArray(m.events) ? m.events[0]?.slug : null

      const { recommendation, reasoning } = parsed
        ? score(m, parsed.direction, parsed.confidence)
        : { recommendation: "no_brief" as Recommendation, reasoning: `Run /last30days "${topic}" to get a recommendation` }

      return {
        question: m.question ?? "",
        conditionId: m.conditionId ?? "",
        marketUrl: eventSlug ? `https://polymarket.com/event/${eventSlug}` : null,
        odds,
        volume: Number(m.volumeNum ?? 0),
        daysToExpiry,
        recommendation,
        reasoning,
      }
    })

    const order: Record<Recommendation, number> = { bet_yes: 0, bet_no: 0, watch: 1, skip: 2, no_brief: 3 }
    markets.sort((a, b) => order[a.recommendation] - order[b.recommendation])

    results.push({
      topic,
      hasBrief: !!match,
      ...(match ? { briefSlug: match.slug, briefAgeHours: Math.round(match.ageHours) } : {}),
      ...(parsed ? { direction: parsed.direction, confidence: parsed.confidence, headline: parsed.headline, signals: parsed.signals } : {}),
      markets,
    })

    // Print actionable summary
    const actionable = markets.filter(m => m.recommendation === "bet_yes" || m.recommendation === "bet_no")
    if (actionable.length > 0) {
      console.log(`  ${actionable.length} actionable:`)
      for (const m of actionable) {
        console.log(`    [${m.recommendation.toUpperCase()}] ${m.question} (${m.odds}% odds, ${m.daysToExpiry}d)`)
      }
    }
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true })
  await fs.writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), topics: results }, null, 2))
  console.log(`\nWrote scout-results.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
