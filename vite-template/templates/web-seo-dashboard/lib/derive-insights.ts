import {
  trafficKpis,
  seoKpis,
  keywordRankings,
  channelBreakdown,
  categoryPerformance,
} from "@/lib/web-seo-mock-data"

export interface InsightItem {
  id: string
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Rising SEO trend: keyword with the largest positive rankChange
  const bestRising = [...keywordRankings]
    .filter((kw) => kw.rankChange > 0)
    .sort((a, b) => b.rankChange - a.rankChange)[0]

  // 2. Channel x Content opportunity: dominant channel share x top CVR category
  const dominantChannel = channelBreakdown[0]
  const topCvrCat = [...categoryPerformance].sort(
    (a, b) => b.conversionRate - a.conversionRate,
  )[0]
  const lowestPvCat = [...categoryPerformance].sort(
    (a, b) => a.pageviews - b.pageviews,
  )[0]

  // 3. Performance momentum this month: PV change + bounce rate change + position change
  const pvKpi = trafficKpis[0]
  const bounceKpi = trafficKpis[3]
  const posKpi = seoKpis[3]

  return [
    {
      id: "seo-rising",
      label: "Rising SEO Trend",
      text: `"${bestRising.keyword}" climbed ${bestRising.rankChange} positions (now rank ${bestRising.rank}) — a high-opportunity keyword with ${bestRising.searchVolume.toLocaleString()} monthly searches.`,
      sentiment: "positive",
    },
    {
      id: "channel-opportunity",
      label: "Channel x Content Opportunity",
      text: `${dominantChannel.channel} drives ${dominantChannel.percentage}% of sessions, yet "${topCvrCat.category}" — the highest-converting category (${topCvrCat.conversionRate}%) — has ${topCvrCat.category === lowestPvCat.category ? "the lowest" : "low"} pageviews. Consider reallocating SEO focus.`,
      sentiment: "attention",
    },
    {
      id: "momentum",
      label: "Monthly Performance Momentum",
      text: `Pageviews ${pvKpi.change > 0 ? "+" : ""}${pvKpi.change}% MoM, bounce rate ${bounceKpi.change > 0 ? "+" : ""}${bounceKpi.change}pt, avg. position improved by ${posKpi.change > 0 ? "+" : ""}${posKpi.change}. Overall momentum is positive.`,
      sentiment: "positive",
    },
  ]
}
