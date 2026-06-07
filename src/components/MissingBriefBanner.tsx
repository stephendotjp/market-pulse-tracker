"use client"

import { AlertCircle } from "lucide-react"

interface MissingBriefBannerProps {
  slug: string
  query: string
}

export function MissingBriefBanner({ slug, query }: MissingBriefBannerProps) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 14px", borderRadius: 8,
      border: "1px solid var(--watch)",
      background: "var(--watch-dim)",
    }}>
      <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0, color: "var(--watch)" }} />
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--watch)", margin: 0, marginBottom: 3 }}>
          Brief missing for <code style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>{slug}</code>
        </p>
        <p style={{ fontSize: 11, color: "var(--text-mid)", margin: 0 }}>
          Run <code style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, background: "var(--border)", padding: "0 4px", borderRadius: 3 }}>/last30days {query}</code> then <code style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, background: "var(--border)", padding: "0 4px", borderRadius: 3 }}>npm run snapshot</code>
        </p>
      </div>
    </div>
  )
}
