import {
  trendSeries,
  comparisonSeries,
  breakdownSlices,
  headerKpis,
} from "@/lib/ui-template-kpi-chart-advanced-mock-data"

export interface InsightItem {
  id: "growth-direction" | "channel-mix" | "campaign-lever"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

function fmtUsd(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toLocaleString("en-US")}`
}

export function deriveInsights(): InsightItem[] {
  const latest = comparisonSeries[comparisonSeries.length - 1]
  const totalCurrent = comparisonSeries.reduce((s, p) => s + p.current, 0)
  const totalPrevious = comparisonSeries.reduce((s, p) => s + p.previous, 0)
  const overallGrowth = ((totalCurrent - totalPrevious) / totalPrevious) * 100

  const totalBreakdown = breakdownSlices.reduce((s, b) => s + b.value, 0)
  const sorted = [...breakdownSlices].sort((a, b) => b.value - a.value)
  const leader = sorted[0]
  const leaderShare = (leader.value / totalBreakdown) * 100

  const trendStart = trendSeries.slice(0, 5).reduce((s, p) => s + p.value, 0) / 5
  const trendEnd = trendSeries.slice(-5).reduce((s, p) => s + p.value, 0) / 5
  const trendDelta = ((trendEnd - trendStart) / trendStart) * 100

  const revenueKpi = headerKpis.find((k) => k.id === "revenue")
  const revenueChange = revenueKpi?.change ?? 0

  return [
    {
      id: "growth-direction",
      label: "Growth Direction",
      text:
        overallGrowth > 5
          ? `Period total reached ${fmtUsd(totalCurrent)} — up ${overallGrowth.toFixed(1)}% YoY across the 6-month window. Latest month ${latest.period} grew ${latest.growth.toFixed(1)}%.`
          : `Period total of ${fmtUsd(totalCurrent)} grew ${overallGrowth.toFixed(1)}% YoY — momentum is modest, watch the next 2 months.`,
      sentiment: overallGrowth > 8 ? "positive" : overallGrowth > 2 ? "neutral" : "attention",
    },
    {
      id: "channel-mix",
      label: "Channel Mix",
      text: `${leader.segment} leads the channel mix at ${leaderShare.toFixed(1)}% (${fmtUsd(leader.value)}) of total — diversification across ${sorted.length} channels keeps no single source above 35%.`,
      sentiment: leaderShare > 45 ? "attention" : "neutral",
    },
    {
      id: "campaign-lever",
      label: "Recent Trend",
      text:
        trendDelta > 0
          ? `Daily revenue accelerated ${trendDelta.toFixed(1)}% in the latest 5 days vs. the first 5 days — overall ${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% period-over-period.`
          : `Daily revenue softened ${Math.abs(trendDelta).toFixed(1)}% in the latest 5 days vs. the first 5 days — worth investigating drivers.`,
      sentiment: trendDelta > 5 ? "positive" : trendDelta < -5 ? "attention" : "neutral",
    },
  ]
}
