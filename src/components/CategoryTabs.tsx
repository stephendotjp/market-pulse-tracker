"use client"

const catColors: Record<string, string> = {
  macro:    "var(--cat-macro)",
  crypto:   "var(--cat-crypto)",
  equities: "var(--cat-equities)",
  politics: "var(--cat-politics)",
  all:      "var(--text-mid)",
}

interface CategoryTabsProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
  counts?: Record<string, number>
}

export function CategoryTabs({ categories, active, onChange, counts }: CategoryTabsProps) {
  const all = ["all", ...categories]
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {all.map(cat => {
        const isActive = active === cat
        const color = catColors[cat] ?? "var(--text-mid)"
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            style={{
              padding: "5px 13px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.12s",
              border: `1px solid ${isActive ? color : "var(--border)"}`,
              background: isActive ? color : "var(--bg-panel)",
              color: isActive ? "#fff" : "var(--text-mid)",
              whiteSpace: "nowrap",
              outline: "none",
              boxShadow: isActive ? `0 1px 4px ${color}40` : "none",
            }}
          >
            {cat}
            {counts?.[cat] !== undefined && (
              <span style={{ marginLeft: 5, opacity: 0.65, fontSize: 10 }}>{counts[cat]}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
