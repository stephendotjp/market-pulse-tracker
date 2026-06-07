import { notFound } from "next/navigation"
import Link from "next/link"
import { TRACKED_MARKETS } from "@/lib/markets-config"
import { getMarketByConditionId } from "@/lib/polymarket"
import { getSentiment } from "@/lib/sentiment"
import { calculateDivergence } from "@/lib/divergence"
import { OddsPill } from "@/components/OddsPill"
import { SentimentBar } from "@/components/SentimentBar"
import { DivergenceSignal } from "@/components/DivergenceSignal"
import { BriefAge } from "@/components/BriefAge"
import { TrendChart } from "@/components/TrendChart"
import { BestTakes } from "@/components/BestTakes"
import { MissingBriefBanner } from "@/components/MissingBriefBanner"
import { ArrowLeft } from "lucide-react"

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return TRACKED_MARKETS.map(m => ({ slug: m.slug }))
}

export default async function MarketPage({ params }: Props) {
  const { slug } = await params
  const tracked = TRACKED_MARKETS.find(m => m.slug === slug)
  if (!tracked) notFound()

  const isPlaceholder = tracked.condition_id.startsWith("REPLACE_")
  const market = isPlaceholder ? null : await getMarketByConditionId(tracked.condition_id)
  const sentiment = getSentiment(slug)
  const divergence = market && sentiment
    ? calculateDivergence(market.odds, sentiment.score, market.volume)
    : null

  const sentimentOdds = sentiment ? Math.round((sentiment.score + 100) / 2) : undefined
  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

  return (
    <main className="min-h-screen bg-[#0d1117] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href={`${BASE}/`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-400 capitalize">
              {tracked.category}
            </span>
            <BriefAge savedAt={sentiment?.brief_saved_at ?? null} />
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">{tracked.label}</h1>
          {tracked.description && (
            <p className="mt-1 text-sm text-gray-400">{tracked.description}</p>
          )}
        </div>

        {/* Odds + Signal */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Market Odds</p>
            <OddsPill odds={market?.odds ?? null} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Signal</p>
            <DivergenceSignal divergence={divergence} />
          </div>
          {market?.volume != null && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Volume</p>
              <p className="text-sm font-medium text-white">
                ${(market.volume / 1_000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>

        {!sentiment && (
          <MissingBriefBanner slug={slug} query={tracked.last30days_query} />
        )}

        {/* Sentiment */}
        {sentiment && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Social Sentiment</p>
            <SentimentBar score={sentiment.score} confidence={sentiment.confidence} />
            {sentiment.summary && (
              <p className="text-sm text-gray-300 leading-relaxed">{sentiment.summary}</p>
            )}
          </div>
        )}

        {/* Chart */}
        {market?.history && market.history.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-xs text-gray-500 uppercase tracking-wide">7-Day Price History</p>
            <TrendChart history={market.history} sentimentOdds={sentimentOdds} />
          </div>
        )}

        {/* Key Signals */}
        {sentiment?.signals && sentiment.signals.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Key Signals</p>
            <ul className="space-y-1">
              {sentiment.signals.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Best Takes */}
        {sentiment?.best_takes && sentiment.best_takes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Top Community Takes</p>
            <BestTakes takes={sentiment.best_takes} />
          </div>
        )}

        {sentiment?.volume_label && (
          <p className="text-xs text-gray-500">Discussion volume: {sentiment.volume_label}</p>
        )}

        {market?.question && (
          <p className="text-xs text-gray-600">Polymarket: {market.question}</p>
        )}
      </div>
    </main>
  )
}
