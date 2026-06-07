"use client"

import { AlertCircle } from "lucide-react"

interface MissingBriefBannerProps {
  slug: string
  query: string
}

export function MissingBriefBanner({ slug, query }: MissingBriefBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-yellow-400" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-yellow-300">Brief missing for <code className="font-mono">{slug}</code></p>
        <p className="text-xs text-yellow-400/80">
          Run <code className="font-mono">/last30days {query}</code> in Claude Code, then <code className="font-mono">npm run snapshot</code>.
        </p>
      </div>
    </div>
  )
}
