export type MarketCategory = "macro" | "crypto" | "equities" | "politics"

export interface TrackedMarket {
  slug: string              // EXACT last30days filename slug
  last30days_query: string
  label: string
  category: MarketCategory
  description: string
  condition_id: string      // Polymarket conditionId (0x...)
}

export const TRACKED_MARKETS: TrackedMarket[] = [
  {
    slug: "fed-rate-cut-2026",
    last30days_query: "Fed rate cut 2026",
    label: "Fed cuts rates (June 2026)",
    category: "macro",
    description: "Will the Fed decrease interest rates by 25 bps after the June 2026 meeting?",
    condition_id: "0xdde06286a7b9464d344f410ab0b3d2ebc6469904e72c27fd982f65fdbf78768d",
  },
  {
    slug: "bitcoin-price-prediction-2026",
    last30days_query: "Bitcoin price prediction 2026",
    label: "Bitcoin hits $150K by June",
    category: "crypto",
    description: "Will Bitcoin hit $150k by June 30, 2026?",
    condition_id: "0xa0f4c4924ea1a8b410b4ce821c2a9955fad21a1b19bdcfde90816732278b3dd5",
  },
  {
    slug: "nvidia-nvda-earnings-2026",
    last30days_query: "Nvidia NVDA earnings 2026",
    label: "NVIDIA largest by market cap",
    category: "equities",
    description: "Will NVIDIA be the largest company in the world by market cap on June 30?",
    condition_id: "0x79afea6a94f0b3dffb5e0886fa1dbd740d688029f7aba351dc46911bcb1b1f95",
  },
  {
    slug: "us-recession-2026",
    last30days_query: "US recession 2026",
    label: "US recession by end of 2026",
    category: "macro",
    description: "Will the US enter a recession by end of 2026?",
    condition_id: "0xfdc73f10edf0266756686f35b5712cffa828b0940fc015e0426c76c934c2105d",
  },
]
