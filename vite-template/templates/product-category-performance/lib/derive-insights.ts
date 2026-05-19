import {
  categorySummary,
  newVsExisting,
  heatmap,
} from "@/lib/product-category-performance-mock-data"

export interface InsightItem {
  id: "growth-driver" | "new-vs-existing" | "yoy-pattern"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const sorted = [...categorySummary].sort((a, b) => b.yoyChange - a.yoyChange)
  const winner = sorted[0]
  const laggard = sorted[sorted.length - 1]

  const trailing = newVsExisting.slice(-6)
  const avgNewShare =
    trailing.reduce((s, p) => s + p.newContributionPct, 0) / trailing.length
  const trend =
    trailing[trailing.length - 1].newContributionPct -
    trailing[0].newContributionPct

  // YoY pattern — count cells with negative YoY
  const negCount = heatmap.filter((c) => c.yoyChange < -5).length
  const posCount = heatmap.filter((c) => c.yoyChange > 5).length

  return [
    {
      id: "growth-driver",
      label: "Category Growth Driver",
      text: `"${winner.category}" leads at +${winner.yoyChange.toFixed(1)}% YoY (${winner.shareOfTotal.toFixed(1)}% share), while "${laggard.category}" trails at ${laggard.yoyChange >= 0 ? "+" : ""}${laggard.yoyChange.toFixed(1)}%. Consider reallocating marketing and shelf space.`,
      sentiment: "neutral",
    },
    {
      id: "new-vs-existing",
      label: "New vs Existing Mix",
      text: `New products are averaging ${avgNewShare.toFixed(1)}% of revenue across the last 6 months and the share is ${trend >= 1 ? "rising" : trend <= -1 ? "falling" : "flat"}. ${avgNewShare > 25 ? "Strong innovation pipeline." : avgNewShare > 15 ? "Reasonable refresh cadence." : "Innovation pipeline is thin — consider boosting new launches."}`,
      sentiment:
        avgNewShare > 25 ? "positive" : avgNewShare < 12 ? "attention" : "neutral",
    },
    {
      id: "yoy-pattern",
      label: "YoY Pattern",
      text: `${posCount} category-months grew >5% YoY, ${negCount} declined >5%. ${posCount > negCount * 1.5 ? "Broad-based growth across the portfolio." : posCount < negCount ? "More categories declining than growing — investigate macro headwinds." : "Mixed YoY pattern across categories."}`,
      sentiment:
        posCount > negCount * 1.5
          ? "positive"
          : negCount > posCount
            ? "attention"
            : "neutral",
    },
  ]
}
