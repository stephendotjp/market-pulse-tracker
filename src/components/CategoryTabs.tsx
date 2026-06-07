"use client"

interface CategoryTabsProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
  counts?: Record<string, number>
}

export function CategoryTabs({ categories, active, onChange, counts }: CategoryTabsProps) {
  const all = ["all", ...categories]
  return (
    <div className="flex gap-1 overflow-x-auto">
      {all.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
            active === cat
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {cat}
          {counts && counts[cat] !== undefined && (
            <span className="ml-1 opacity-60">{counts[cat]}</span>
          )}
        </button>
      ))}
    </div>
  )
}
