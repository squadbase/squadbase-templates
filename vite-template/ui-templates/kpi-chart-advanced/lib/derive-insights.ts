import {
  trendSeries,
  comparisonSeries,
  breakdownSlices,
} from "@/lib/ui-template-kpi-chart-advanced-mock-data"

export interface InsightItem {
  id: "growth-direction" | "channel-mix" | "campaign-lever"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
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

  return [
    {
      id: "growth-direction",
      label: "Growth",
      text: "Overall performance is trending up versus the previous period.",
      sentiment: overallGrowth > 8 ? "positive" : overallGrowth > 2 ? "neutral" : "attention",
    },
    {
      id: "channel-mix",
      label: "Mix",
      text: "A single segment drives the largest share of the total.",
      sentiment: leaderShare > 45 ? "attention" : "neutral",
    },
    {
      id: "campaign-lever",
      label: "Momentum",
      text: "Recent activity points to a positive shift in the trend.",
      sentiment: trendDelta > 5 ? "positive" : trendDelta < -5 ? "attention" : "neutral",
    },
  ]
}
