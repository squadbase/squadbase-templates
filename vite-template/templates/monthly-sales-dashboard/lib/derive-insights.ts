import {
  monthlyTrend,
  budgetWaterfall,
  segmentContributions,
} from "@/lib/monthly-sales-dashboard-mock-data"

export interface InsightItem {
  id: "budget-attainment" | "yoy-trajectory" | "segment-driver"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const latest = monthlyTrend[monthlyTrend.length - 1]
  const budget = budgetWaterfall[0].value
  const actual = latest.revenue
  const variance = actual - budget
  const variancePct = (variance / budget) * 100

  // Trailing 6-month YoY trajectory
  const trailing = monthlyTrend.slice(-6)
  const avgYoy =
    trailing.reduce((s, m) => s + m.yoyPct, 0) / trailing.length
  const trendDirection =
    trailing[trailing.length - 1].yoyPct - trailing[0].yoyPct

  // Driver with largest positive variance contribution
  const drivers = budgetWaterfall.slice(1, -1)
  const topPositive = [...drivers]
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)[0]
  const topNegative = [...drivers]
    .filter((d) => d.value < 0)
    .sort((a, b) => a.value - b.value)[0]

  // Top revenue segment
  const segments = segmentContributions()
  const topSegment = segments[0]
  const concentration = topSegment.share

  return [
    {
      id: "budget-attainment",
      label: "Budget Attainment",
      text:
        variancePct >= 2
          ? `Actuals beat budget by $${Math.round(variance / 1000).toLocaleString("en-US")}K (+${variancePct.toFixed(1)}%). ${topPositive?.label ?? "Volume"} is the largest contributor.`
          : variancePct >= -2
            ? `Actuals landed within ${Math.abs(variancePct).toFixed(1)}% of budget — broadly on plan.`
            : `Actuals fell short of budget by $${Math.abs(Math.round(variance / 1000)).toLocaleString("en-US")}K (${variancePct.toFixed(1)}%). ${topNegative?.label ?? "Promo"} dragged the most.`,
      sentiment:
        variancePct >= 2
          ? "positive"
          : variancePct >= -2
            ? "neutral"
            : "attention",
    },
    {
      id: "yoy-trajectory",
      label: "YoY Trajectory",
      text: `Trailing 6 months averaged ${avgYoy >= 0 ? "+" : ""}${avgYoy.toFixed(1)}% YoY, with the trend ${trendDirection >= 1 ? "accelerating" : trendDirection <= -1 ? "decelerating" : "holding steady"}. Latest month posted ${latest.yoyPct >= 0 ? "+" : ""}${latest.yoyPct.toFixed(1)}%.`,
      sentiment:
        avgYoy >= 5 && trendDirection >= 0
          ? "positive"
          : avgYoy < 0
            ? "attention"
            : "neutral",
    },
    {
      id: "segment-driver",
      label: "Segment Driver",
      text: `${topSegment.name} contributes ${concentration.toFixed(1)}% of revenue (${segments.slice(0, 2).map((s) => s.name).join(" + ")} together: ${(segments[0].share + segments[1].share).toFixed(1)}%). ${concentration > 35 ? "Heavy concentration — diversification could de-risk the book." : "Mix is fairly balanced across categories."}`,
      sentiment: concentration > 40 ? "attention" : "neutral",
    },
  ]
}
