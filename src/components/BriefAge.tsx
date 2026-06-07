"use client"

import { formatDistanceToNow } from "date-fns"

interface BriefAgeProps {
  savedAt: string | null
}

export function BriefAge({ savedAt }: BriefAgeProps) {
  if (!savedAt) return <span className="text-xs text-gray-500">No brief</span>
  let label = "Unknown"
  let stale = false
  try {
    const d = new Date(savedAt)
    label = formatDistanceToNow(d, { addSuffix: true })
    stale = Date.now() - d.getTime() > 7 * 24 * 60 * 60 * 1000
  } catch {
    label = "Unknown"
  }
  return (
    <span className={`text-xs ${stale ? "text-yellow-400" : "text-gray-400"}`}>
      Brief {label}
    </span>
  )
}
