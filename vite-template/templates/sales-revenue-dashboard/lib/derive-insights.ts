import {
  salesKpis,
  categoryRanking,
  channelBreakdown,
  dailySalesTrend,
} from "@/lib/sales-revenue-mock-data"

export interface InsightItem {
  id: string
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. YoY momentum: GMV vs. same period last year
  const gmvKpi = salesKpis[0]

  // 2. Category opportunity: low share but high YoY growth
  const growthOpportunity = [...categoryRanking]
    .filter((c) => c.shareOfTotal < 20 && c.yoyChange > 15)
    .sort((a, b) => b.yoyChange - a.yoyChange)[0]

  // 3. Target outlook: trailing 30-day actual vs. target
  const recent = dailySalesTrend.slice(-30)
  const actual = recent.reduce((s, d) => s + d.revenue, 0)
  const target = recent.reduce((s, d) => s + d.target, 0)
  const achievement = (actual / target) * 100
  const dominantChannel = channelBreakdown[0]

  return [
    {
      id: "momentum",
      label: "YoY Momentum",
      text: `GMV is ${gmvKpi.change > 0 ? "+" : ""}${gmvKpi.change}% YoY. ${gmvKpi.change > 10 ? "Strong growth momentum is holding up." : gmvKpi.change > 0 ? "Modest growth is continuing." : "Trailing last year — consider revisiting current tactics."}`,
      sentiment:
        gmvKpi.change > 10
          ? "positive"
          : gmvKpi.change > 0
            ? "neutral"
            : "attention",
    },
    {
      id: "category-opportunity",
      label: "Category Growth Opportunity",
      text: growthOpportunity
        ? `"${growthOpportunity.category}" is growing +${growthOpportunity.yoyChange}% YoY while holding only ${growthOpportunity.shareOfTotal}% of revenue share — room to invest in ads and inventory.`
        : "Growth rates across major categories are balanced; no standout opportunity detected.",
      sentiment: growthOpportunity ? "positive" : "neutral",
    },
    {
      id: "target-outlook",
      label: "Target Outlook",
      text: `Trailing 30 days ${achievement >= 100 ? "hit" : "missed"} target at ${achievement.toFixed(1)}%. ${dominantChannel.channel} drives ${dominantChannel.percentage}% of traffic and is carrying the mix; ${achievement >= 100 ? "monthly goal is on track if this pace continues." : "prioritize high-performing channels to close the gap."}`,
      sentiment:
        achievement >= 100
          ? "positive"
          : achievement >= 90
            ? "neutral"
            : "attention",
    },
  ]
}
