"use client"

import { formatDistanceToNow } from "date-fns"

interface BriefAgeProps {
  savedAt: string | null
}

export function BriefAge({ savedAt }: BriefAgeProps) {
  if (!savedAt) return <span style={{ fontSize: 11, color: "var(--text-lo)" }}>No brief</span>
  try {
    const d = new Date(savedAt)
    const stale = Date.now() - d.getTime() > 7 * 24 * 60 * 60 * 1000
    return (
      <span style={{ fontSize: 11, color: stale ? "var(--watch)" : "var(--text-lo)" }}>
        Brief {formatDistanceToNow(d, { addSuffix: true })}
      </span>
    )
  } catch {
    return <span style={{ fontSize: 11, color: "var(--text-lo)" }}>—</span>
  }
}
