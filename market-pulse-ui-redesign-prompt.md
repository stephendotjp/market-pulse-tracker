# Market Pulse Tracker — UI Redesign Prompt

## Context

The app is built and deployed, and the data layer works (Polymarket odds + last30days sentiment + divergence are all flowing correctly). **This task is purely a UI/UX redesign of the existing frontend. Do not touch the data layer, API routes, `lib/` logic, or the sentiment snapshot — only the components, pages, and styling.**

The current UI is a vertical stack of tall cards. It's functional but hard to read: you can't compare markets at a glance, the odds and sentiment aren't visually paired, and the divergence signal — which is the entire point of the product — is buried in a small pill. The Reddit quote inside every card makes each row enormous, so only ~3 markets fit on screen.

**Goal: rebuild the dashboard as a dense, scannable data table** where every tracked market is one row, columns line up, and your eye can run straight down to spot where the crowd disagrees with the money.

---

## Read the design skill first

Before writing any UI code, read the frontend-design skill at `/mnt/skills/public/frontend-design/SKILL.md` and follow it. The guidance below is the concrete spec; the skill is the quality bar. This is a **refined, information-dense, editorial/terminal** aesthetic — think Bloomberg terminal meets a well-designed analytics dashboard. Restraint and precision, not decoration.

---

## The core layout: a divergence table

Replace the stacked cards on the dashboard with a single table. One row per market. Columns, left to right:

| Column | Content | Notes |
|---|---|---|
| **Market** | Category tag (small, colored) + market label (bold) + one-line question (muted, truncated) | ~30% width, left-aligned |
| **Odds** | Polymarket YES % as a number + tiny colored dot | the "money" side |
| **Sentiment** | A compact horizontal bar centered at zero (red left / green right) + numeric score | the "crowd" side — make odds and sentiment visually adjacent so the gap is obvious |
| **Divergence** | The signed number, large and bold, color-coded, with arrow (↑ crowd ahead / ↓ crowd behind / ≈ aligned) | **THIS IS THE HERO COLUMN** — biggest, boldest, most colorful thing in the row |
| **Signal** | Badge: "Crowd ahead" (blue) / "Crowd behind" (red) / "Aligned" (gray) / "Watch" (amber) | |
| **Freshness** | "1h ago" muted, small | red if >24h stale |

The row is clickable → opens the existing detail drawer (keep the drawer, just restyle it per the tokens below). **Do not put the Reddit quote / best-take inside the table row** — that's what's making rows huge. Best takes belong in the drawer and in a separate strip below the table.

Rows should be compact: ~56–64px tall. The whole table of 4–12 markets should be visible without scrolling on a normal laptop screen.

Sort the table by absolute divergence descending by default — the biggest disagreements float to the top, since those are the signals worth acting on. Make column headers clickable to re-sort.

---

## Visual hierarchy (the thing that's currently broken)

The current build gives every element similar weight on a murky dark background. Fix the hierarchy so importance is obvious:

1. **Divergence number** — loudest. Large (20–24px), bold, saturated color.
2. **Market label + odds + sentiment** — medium weight, clearly readable.
3. **Question text, category tag, freshness** — quiet, muted, small.

Use weight, size, and color — not boxes — to create hierarchy. Right now everything is in a bordered box; lean on whitespace and type instead.

---

## Design tokens

Commit to these as CSS variables. Dark theme (keep dark, but fix the contrast — current version is too low-contrast and muddy).

```css
:root {
  /* Backgrounds — layered, not flat */
  --bg-base:    #0A0B0D;   /* page */
  --bg-panel:   #131519;   /* table container */
  --bg-row:     transparent;
  --bg-row-hover: #1A1D23;
  --border:     #23262D;   /* hairline dividers, 1px */

  /* Text */
  --text-hi:    #F2F4F7;   /* primary */
  --text-mid:   #9BA1AC;   /* secondary */
  --text-lo:    #5E646E;   /* tertiary / muted */

  /* Semantic — odds & sentiment & divergence */
  --bull:       #2FBF71;   /* green — bullish / crowd ahead */
  --bull-dim:   #1C3A2C;   /* green bar track / bg */
  --bear:       #E5484D;   /* red — bearish / crowd behind */
  --bear-dim:   #3A1E20;
  --neutral:    #8A909B;   /* aligned */
  --watch:      #E2A33B;   /* amber — thin volume watch */
  --info:       #3E9DE8;   /* blue — crowd ahead signal */

  /* Category accents (small tags) */
  --cat-macro:  #7C8CF8;
  --cat-crypto: #F5A623;
  --cat-equities:#4FD1C5;
  --cat-politics:#E573B5;
}
```

### Typography

Do NOT use Inter, Roboto, Arial, or system-ui (the skill explicitly calls these out as generic). For a terminal/financial-data feel, pair:
- **Numbers & data** (odds, divergence, sentiment scores): a monospace with good figures — e.g. `"JetBrains Mono"`, `"IBM Plex Mono"`, or `"Geist Mono"`. Tabular figures are essential so columns align.
- **Labels & body**: a clean but characterful grotesque — e.g. `"Geist"`, `"Schibsted Grotesk"`, or `"Hanken Grotesk"`. Avoid Space Grotesk (overused).

Load via `next/font/google` in `layout.tsx`. Set `font-variant-numeric: tabular-nums` on all numeric cells.

---

## Component-by-component changes

### `DivergenceTable.tsx` (new — replaces the stacked `MarketRow` cards)
The table described above. Use a real semantic `<table>` for accessibility, styled with the tokens. Sticky header. Hairline `--border` dividers between rows, no boxes around each row. Hover state lifts the row to `--bg-row-hover`.

### `MarketRow.tsx` (restyle)
Becomes a `<tr>`, not a card. Strip out the embedded Reddit quote. Compact height.

### `SentimentBar.tsx` (restyle)
Make it a thin (6px) centered bar — zero in the middle, fills left (red) for negative, right (green) for positive. Put the numeric score next to it in mono. Currently it reads as a generic progress bar; it should read as a diverging gauge.

### `DivergenceCell.tsx` (new)
The hero. Big mono number, signed, colored by signal, with the arrow glyph. This is what someone scans for.

### `MetricCard.tsx` (restyle)
The 4 top stats (Markets / Signals flagged / Avg divergence / Most discussed) are fine conceptually but visually flat. Tighten them: smaller labels, larger mono numbers, a subtle accent underline or left-border in the relevant semantic color. Make "Signals flagged" pop in amber when > 0.

### `BestTakesStrip.tsx` (new placement)
Move best takes OUT of the rows into a horizontal-scroll strip below the table titled "Best takes this week" — source badge, quote, engagement count. This is where the Reddit quotes live now.

### `MarketDrawer.tsx` (restyle + fix chart)
Keep the structure but apply the tokens. **The 7-day price history chart is currently broken** (flat line, floating "Sentiment" label). Fix it:
- If recharts is misbehaving under React 19, replace it with a hand-rolled SVG sparkline (it's just a polyline over `history: {t,p}[]` — trivial and more reliable).
- Plot odds 0–100 over the time series. Drop the broken dashed "sentiment" overlay unless you have a real per-day sentiment series (you don't — sentiment is a single snapshot score, so don't fake a line for it). Instead show the current sentiment as a single labeled horizontal reference line, or omit it and just show odds history cleanly.

### `CategoryTabs.tsx` (restyle)
Keep the filter pills but align them to the table. Active = filled with `--text-hi` bg / dark text; inactive = hairline border, muted text.

---

## Specific fixes for what's wrong in the current build

1. **Rows too tall** → remove embedded quotes, target ~60px rows.
2. **Can't compare markets** → table columns, tabular-nums, aligned.
3. **Divergence buried** → make it the hero column, biggest + boldest.
4. **Odds & sentiment disconnected** → place them in adjacent columns.
5. **Murky low contrast** → use the layered bg tokens + `--text-hi` for primary data.
6. **Broken drawer chart** → SVG sparkline, no fake sentiment line.
7. **Generic fonts** → mono for numbers, characterful grotesque for labels.
8. **"0%" odds showing on some markets** → if Polymarket odds come back 0, that's likely a real data issue (a closed/invalid market or a YES-token mismatch). Show "—" instead of "0%" when odds are unavailable, and don't let a 0 distort the divergence math — treat missing odds as "no signal" rather than 0%. (Investigate separately if it persists; this redesign just shouldn't display a misleading 0%.)

---

## Constraints

- **Do not modify**: `src/lib/*` (except `polymarket.ts` ONLY if you confirm the 0% bug is a real fetch issue), API routes, `scripts/build-snapshot.ts`, `sentiment-snapshot.json`, `markets-config.ts`, `next.config.ts` (keep the basePath setup).
- Keep all existing data shapes and the SWR fetching — this is styling and layout only.
- Keep it a single dark theme; nail the contrast rather than adding a toggle.
- Run `npm run build` when done; fix any type errors introduced.
- Test responsive: the table should gracefully collapse on narrow screens (stack the less-critical columns or horizontal-scroll the table — your call, but it must not break).

---

## Definition of done

- The dashboard is a scannable table; 4–12 markets visible at once without scrolling.
- The divergence column is unmistakably the focal point of each row.
- Odds and sentiment sit side by side so the gap between money and crowd is instantly legible.
- Best takes live in a strip below, not inside rows.
- The drawer chart renders a clean odds sparkline (no broken flat line, no fake sentiment overlay).
- Numbers use tabular mono and align down the columns.
- Contrast is crisp — primary data pops, secondary text recedes.
- `npm run build` passes; deployed to Vercel.
