import {
  marginTrend,
  categoryRanking,
  productScatter,
} from "@/lib/gross-margin-monitoring-mock-data"

export interface InsightItem {
  id: "margin-trajectory" | "category-leader" | "product-tail"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Margin trajectory — trailing 6m slope
  const trailing = marginTrend.slice(-6)
  const firstM = trailing[0].marginPct
  const lastM = trailing[trailing.length - 1].marginPct
  const slope = lastM - firstM
  const latest = marginTrend[marginTrend.length - 1]
  const prev = marginTrend[marginTrend.length - 2]
  const mom = latest.marginPct - prev.marginPct

  // 2. Category leader vs laggard
  const sortedByMargin = [...categoryRanking].sort((a, b) => b.marginPct - a.marginPct)
  const leader = sortedByMargin[0]
  const laggard = sortedByMargin[sortedByMargin.length - 1]

  // 3. Product tail — count of products below 15% margin
  const lowMarginCount = productScatter.filter((p) => p.marginPct < 15).length
  const totalProducts = productScatter.length
  const lowMarginShare = (lowMarginCount / totalProducts) * 100
  const lowMarginRevenue = productScatter
    .filter((p) => p.marginPct < 15)
    .reduce((s, p) => s + p.revenue, 0)
  const totalRevenue = productScatter.reduce((s, p) => s + p.revenue, 0)
  const lowMarginRevenueShare = (lowMarginRevenue / totalRevenue) * 100

  return [
    {
      id: "margin-trajectory",
      label: "Margin Trajectory",
      text:
        slope >= 0.5
          ? `Gross margin has climbed ${slope.toFixed(1)}pp over the last 6 months to ${lastM.toFixed(1)}%. The latest month added ${mom >= 0 ? "+" : ""}${mom.toFixed(1)}pp.`
          : slope >= -0.5
            ? `Margin has held flat (${slope >= 0 ? "+" : ""}${slope.toFixed(1)}pp over 6m) at ${lastM.toFixed(1)}%. Watch input costs as the next month shifts.`
            : `Margin has slipped ${Math.abs(slope).toFixed(1)}pp over 6 months to ${lastM.toFixed(1)}%. Investigate cost structure in COGS-heavy categories.`,
      sentiment:
        slope >= 0.5 ? "positive" : slope >= -0.5 ? "neutral" : "attention",
    },
    {
      id: "category-leader",
      label: "Category Leader / Laggard",
      text: `"${leader.category}" leads at ${leader.marginPct.toFixed(1)}% gross margin, while "${laggard.category}" lags at ${laggard.marginPct.toFixed(1)}% — a ${(leader.marginPct - laggard.marginPct).toFixed(1)}pp spread that's worth a pricing review in the laggard.`,
      sentiment: "neutral",
    },
    {
      id: "product-tail",
      label: "Low-Margin Tail",
      text: `${lowMarginCount} of ${totalProducts} products sit below 15% margin (${lowMarginShare.toFixed(0)}% of SKUs) and contribute ${lowMarginRevenueShare.toFixed(1)}% of revenue. ${lowMarginShare > 20 ? "Pruning or repricing the long tail could lift overall margin." : "The low-margin tail is contained."}`,
      sentiment: lowMarginShare > 25 ? "attention" : "neutral",
    },
  ]
}
