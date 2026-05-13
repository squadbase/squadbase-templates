import {
  adVsOrganic,
  campaignPerformance,
  headerKpis,
  keywordRanking,
} from "@/lib/ec-advertising-dashboard-mock-data"

export interface InsightItem {
  id: "acos-leader" | "organic-mix" | "keyword-spotlight"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ACoS leader / laggard
  const best = campaignPerformance[0]
  const worst = campaignPerformance[campaignPerformance.length - 1]
  const avgAcos =
    campaignPerformance.reduce((s, r) => s + r.acos, 0) /
    campaignPerformance.length

  // 2. Organic share trend — last 7 vs prior 7
  const last7 = adVsOrganic.slice(-7)
  const prev7 = adVsOrganic.slice(-14, -7)
  const organicShare = (rows: typeof last7) => {
    const ad = rows.reduce((s, d) => s + d.adRevenue, 0)
    const org = rows.reduce((s, d) => s + d.organicRevenue, 0)
    return (org / Math.max(1, ad + org)) * 100
  }
  const last7Organic = organicShare(last7)
  const prev7Organic = organicShare(prev7)
  const organicDelta = last7Organic - prev7Organic

  // 3. Keyword spotlight — top converter
  const topKeyword = keywordRanking[0]

  const acosKpi = headerKpis[1]

  return [
    {
      id: "acos-leader",
      label: "ACoS Leader",
      text: `${best.campaignName} is the most efficient campaign with ${best.acos.toFixed(1)}% ACoS (${(((avgAcos - best.acos) / avgAcos) * 100).toFixed(0)}% below the portfolio average of ${avgAcos.toFixed(1)}%). ${worst.campaignName} is the laggard at ${worst.acos.toFixed(1)}% — consider reallocating budget.`,
      sentiment: acosKpi.change <= 0 ? "positive" : "neutral",
    },
    {
      id: "organic-mix",
      label: "Organic Halo",
      text:
        organicDelta >= 1.5
          ? `Organic share rose to ${last7Organic.toFixed(1)}% in the last 7 days (+${organicDelta.toFixed(1)}pt vs prior week). Ads appear to be lifting organic discovery — TACoS is moving in your favor.`
          : organicDelta >= -1.5
            ? `Organic share is steady at ${last7Organic.toFixed(1)}% (${organicDelta >= 0 ? "+" : ""}${organicDelta.toFixed(1)}pt vs prior 7 days). Mix is holding; review TACoS pacing weekly.`
            : `Organic share slipped to ${last7Organic.toFixed(1)}% (${organicDelta.toFixed(1)}pt vs prior 7 days). Watch for ad cannibalization and revisit branded keyword bids.`,
      sentiment:
        organicDelta >= 1.5 ? "positive" : organicDelta >= -1.5 ? "neutral" : "attention",
    },
    {
      id: "keyword-spotlight",
      label: "Keyword Spotlight",
      text: `"${topKeyword.keyword}" (${topKeyword.marketplaceLabel}) drove ${topKeyword.conversions.toLocaleString("en-US")} conversions at $${topKeyword.cpc.toFixed(2)} CPC and ${topKeyword.cvr.toFixed(1)}% CVR — the strongest keyword in the period.`,
      sentiment: "positive",
    },
  ]
}
