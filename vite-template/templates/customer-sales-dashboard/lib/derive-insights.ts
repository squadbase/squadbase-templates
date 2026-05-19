import {
  customerRanking,
  paretoSeries,
  churnCandidates,
  headerKpis,
} from "@/lib/customer-sales-dashboard-mock-data"

export interface InsightItem {
  id: "concentration" | "yoy-momentum" | "churn-watch"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Concentration — how many customers cover 70% of revenue (A class)
  const totalRevenue = customerRanking.reduce(
    (s, r) => s + r.currentRevenue,
    0,
  )
  const aClassCount = paretoSeries.filter((p) => p.abcClass === "A").length
  const aSharePct =
    (paretoSeries
      .filter((p) => p.abcClass === "A")
      .reduce((s, p) => s + p.revenue, 0) /
      totalRevenue) *
    100
  const aSharePctOfBase = (aClassCount / customerRanking.length) * 100

  // 2. YoY momentum — overall YoY from KPI 2
  const yoyKpi = headerKpis[1]
  const decliners = customerRanking.filter((r) => r.yoyChange < -10).length

  // 3. Churn watch — biggest churn risk by previous revenue
  const top = [...churnCandidates].sort(
    (a, b) => b.prevYearRevenue - a.prevYearRevenue,
  )[0]
  const churnExposure = churnCandidates.reduce(
    (s, c) => s + c.prevYearRevenue,
    0,
  )

  return [
    {
      id: "concentration",
      label: "Revenue Concentration",
      text: `The top ${aClassCount} accounts (${aSharePctOfBase.toFixed(0)}% of the base) drive ${aSharePct.toFixed(1)}% of revenue — protect them with named-account coverage and proactive renewals.`,
      sentiment: aSharePct > 75 ? "attention" : "neutral",
    },
    {
      id: "yoy-momentum",
      label: "YoY Momentum",
      text:
        yoyKpi.change > 3
          ? `Customer base is up ${yoyKpi.change >= 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% YoY. ${decliners} accounts are down >10% — schedule QBRs there before the gap widens.`
          : yoyKpi.change >= -3
            ? `Customer base is broadly flat (${yoyKpi.change >= 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% YoY). ${decliners} accounts are down >10% and likely dragging the average.`
            : `Customer base is down ${yoyKpi.change.toFixed(1)}% YoY with ${decliners} accounts trailing by more than 10%. Re-engage the largest decliners this week.`,
      sentiment:
        yoyKpi.change > 3
          ? "positive"
          : yoyKpi.change >= -3
            ? "neutral"
            : "attention",
    },
    {
      id: "churn-watch",
      label: "Churn Watch",
      text: top
        ? `${churnCandidates.length} accounts haven't ordered in 45+ days, representing $${Math.round(churnExposure / 1000).toLocaleString("en-US")}K in last-year revenue. ${top.customerName} is the largest exposure — last order ${top.daysSinceLastOrder} days ago.`
        : `No accounts currently flagged as churn risk — keep monitoring weekly.`,
      sentiment: churnCandidates.length > 4 ? "attention" : "neutral",
    },
  ]
}
