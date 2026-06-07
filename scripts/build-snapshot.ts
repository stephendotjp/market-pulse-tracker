import fs from "fs/promises"
import path from "path"
import Anthropic from "@anthropic-ai/sdk"
import { readBrief } from "../src/lib/last30days"
import { TRACKED_MARKETS } from "../src/lib/markets-config"
import type { SentimentResult } from "../src/lib/types"

const client = new Anthropic()

const PARSE_PROMPT = `You are a financial sentiment analyst. You've been given a research brief from last30days-skill (a tool that searched Reddit, X, Hacker News, YouTube, TikTok, and Polymarket over the last 30 days).

Return ONLY a JSON object (no markdown, no code fences) with this exact shape:
{
  "score": <integer -100..100: -100 extremely bearish, 0 neutral, 100 extremely bullish>,
  "confidence": <"high"|"medium"|"low">,
  "summary": "<2-3 sentence synthesis>",
  "best_takes": [ { "source": "<Reddit|X|HN|YouTube|TikTok>", "text": "<paraphrase, <25 words>", "engagement": "<e.g. 4.2K upvotes>" } ],
  "signals": ["<key signal>"],
  "volume_score": <integer 0..100 estimating total discussion volume/engagement>,
  "volume_label": "<human readable, e.g. '4.2K upvotes across 12 threads'>",
  "data_sources": ["<platforms with data>"]
}
Return at most 4 best_takes. Score by engagement-weighted sentiment: a 4,000-upvote bullish thread outweighs 10 low-engagement bearish posts.

Brief:
`

async function parse(slug: string): Promise<SentimentResult | null> {
  const brief = await readBrief(slug)
  if (!brief) return null
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: PARSE_PROMPT + brief.rawMarkdown }],
  })
  const text = msg.content.filter(b => b.type === "text")
    .map(b => (b as { type: "text"; text: string }).text).join("")
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
    return { ...parsed, slug, brief_saved_at: brief.savedAt, parsed_at: new Date().toISOString() }
  } catch (e) {
    console.error(`Failed to parse ${slug}:`, e)
    return null
  }
}

async function main() {
  const out: Record<string, SentimentResult> = {}
  for (const m of TRACKED_MARKETS) {
    process.stdout.write(`Parsing ${m.slug}... `)
    const r = await parse(m.slug)
    if (r) { out[m.slug] = r; console.log("ok") }
    else console.log("SKIPPED (no brief found — run /last30days first)")
  }
  const dest = path.join(process.cwd(), "src/data/sentiment-snapshot.json")
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, JSON.stringify(out, null, 2))
  console.log(`\nWrote ${Object.keys(out).length} markets to ${dest}`)
}

main()
