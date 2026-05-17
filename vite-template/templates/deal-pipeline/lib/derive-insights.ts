import {
  deals,
  stageFunnel,
  forecastTrend,
} from "@/lib/deal-pipeline-mock-data"

export interface InsightItem {
  id: "conversion" | "at-risk" | "forecast"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const weakest = [...stageFunnel.slice(1)].sort(
    (a, b) => a.conversionFromPrev - b.conversionFromPrev,
  )[0]
  const overall =
    (stageFunnel[stageFunnel.length - 1].count / stageFunnel[0].count) * 100

  const atRisk = deals.filter(
    (d) =>
      d.daysToClose <= 14 &&
      d.daysToClose >= 0 &&
      (d.stage === "Lead" || d.stage === "Qualified"),
  )
  const atRiskAmount = atRisk.reduce((s, d) => s + d.amount, 0)

  const upcoming = forecastTrend.filter(
    (p) => p.closedActual === null,
  )[0]
  const target = upcoming
    ? upcoming.commitForecast * 1.1
    : 0
  const gap = upcoming ? target - upcoming.weightedForecast : 0
  const onTrack = upcoming ? upcoming.weightedForecast >= target * 0.95 : true

  return [
    {
      id: "conversion",
      label: "Stage Conversion",
      text: `Lead → Closed Won runs at ${overall.toFixed(1)}%. The weakest step is "${weakest.stage}" at ${weakest.conversionFromPrev.toFixed(1)}% from the prior stage — focus enablement there.`,
      sentiment: overall >= 28 ? "positive" : overall >= 15 ? "neutral" : "attention",
    },
    {
      id: "at-risk",
      label: "At-Risk Deals (≤14d)",
      text:
        atRisk.length > 0
          ? `${atRisk.length} deals worth $${Math.round(atRiskAmount / 1000)}K are stuck in early stages with the close date within 2 weeks. Push qualification activities now.`
          : "No deals closing within 14 days are stuck in early stages — current week looks clean.",
      sentiment: atRisk.length > 4 ? "attention" : atRisk.length > 0 ? "neutral" : "positive",
    },
    {
      id: "forecast",
      label: "Next Month Forecast",
      text: upcoming
        ? `Weighted forecast for ${upcoming.month} is $${Math.round(upcoming.weightedForecast / 1000)}K vs target ~$${Math.round(target / 1000)}K — ${onTrack ? "on track." : `gap of $${Math.round(gap / 1000)}K`}.`
        : "No future-month projections in the dataset.",
      sentiment: onTrack ? "positive" : "attention",
    },
  ]
}
