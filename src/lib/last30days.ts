import fs from "fs/promises"
import path from "path"
import os from "os"

const DIR = process.env.LAST30DAYS_DIR
  ?? path.join(os.homedir(), "Documents", "Last30Days")

function safeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, "")
}

export interface RawBrief {
  slug: string
  rawMarkdown: string
  savedAt: string
}

export async function readBrief(slug: string): Promise<RawBrief | null> {
  const clean = safeSlug(slug)
  const filePath = path.join(DIR, `${clean}-raw-v3.md`)
  try {
    const rawMarkdown = await fs.readFile(filePath, "utf-8")
    const stat = await fs.stat(filePath)
    return { slug: clean, rawMarkdown, savedAt: stat.mtime.toISOString() }
  } catch {
    // Try without -v3 suffix as fallback
    try {
      const fallbackPath = path.join(DIR, `${clean}-raw.md`)
      const rawMarkdown = await fs.readFile(fallbackPath, "utf-8")
      const stat = await fs.stat(fallbackPath)
      return { slug: clean, rawMarkdown, savedAt: stat.mtime.toISOString() }
    } catch {
      return null
    }
  }
}

export async function listBriefSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(DIR)
    return files
      .filter(f => f.endsWith("-raw.md") || f.endsWith("-raw-v3.md"))
      .map(f => f.replace(/-raw-v3\.md$/, "").replace(/-raw\.md$/, ""))
  } catch {
    return []
  }
}
