import {
  monthlyTotals,
  categoryRows,
  headerKpis,
} from "@/lib/cashflow-monitor-mock-data"

export interface InsightItem {
  id: "liquidity-runway" | "fcf-trend" | "category-watch"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

function fmtUsdShort(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  return `${sign}$${(abs / 1_000).toFixed(0)}K`
}

export function deriveInsights(): InsightItem[] {
  const latest = monthlyTotals[monthlyTotals.length - 1]

  // 1. Liquidity runway — current cash / average monthly outflow
  const trailing6 = monthlyTotals.slice(-6)
  const avgOutflow =
    trailing6.reduce(
      (s, m) => s + Math.max(0, -(m.operating + m.investing)),
      0,
    ) / trailing6.length
  const runwayMonths = avgOutflow > 0 ? latest.cashBalance / avgOutflow : 0

  // 2. FCF trend — slope across the last 6 months
  const fcfSeries = trailing6.map((m) => m.freeCashFlow)
  const firstHalfAvg =
    fcfSeries.slice(0, 3).reduce((s, v) => s + v, 0) / 3
  const secondHalfAvg =
    fcfSeries.slice(3).reduce((s, v) => s + v, 0) / 3
  const fcfDelta = secondHalfAvg - firstHalfAvg
  const fcfImproving = fcfDelta > 0

  // 3. Category watch — biggest outflow mover (deltaRate)
  const outflowMovers = categoryRows
    .filter((r) => r.direction === "outflow")
    .slice()
    .sort((a, b) => Math.abs(b.deltaRate) - Math.abs(a.deltaRate))
  const topMover = outflowMovers[0]

  const balanceKpi = headerKpis.find((k) => k.id === "cash-balance")
  const balanceChange = balanceKpi?.change ?? 0

  return [
    {
      id: "liquidity-runway",
      label: "Liquidity Runway",
      text:
        runwayMonths > 12
          ? `Closing cash of ${fmtUsdShort(latest.cashBalance)} covers about ${runwayMonths.toFixed(1)} months of recent outflows — liquidity position is healthy.`
          : runwayMonths > 6
            ? `Closing cash of ${fmtUsdShort(latest.cashBalance)} covers about ${runwayMonths.toFixed(1)} months of recent outflows. Monitor monthly burn closely.`
            : `Closing cash of ${fmtUsdShort(latest.cashBalance)} covers only ${runwayMonths.toFixed(1)} months at recent outflow levels. Consider tightening cash management.`,
      sentiment:
        runwayMonths > 12 ? "positive" : runwayMonths > 6 ? "neutral" : "attention",
    },
    {
      id: "fcf-trend",
      label: "Free Cash Flow Trend",
      text: fcfImproving
        ? `Trailing 3-month FCF averaged ${fmtUsdShort(secondHalfAvg)}, up ${fmtUsdShort(fcfDelta)} vs. the prior 3 months — operating engine is generating more cash after investing.`
        : `Trailing 3-month FCF averaged ${fmtUsdShort(secondHalfAvg)}, down ${fmtUsdShort(Math.abs(fcfDelta))} vs. the prior 3 months. Investing spend or operating drag is reducing free cash.`,
      sentiment: fcfImproving ? "positive" : Math.abs(fcfDelta) < latest.cashBalance * 0.02 ? "neutral" : "attention",
    },
    {
      id: "category-watch",
      label: "Category Watch",
      text: topMover
        ? `${topMover.category} (${topMover.cfType}) moved ${topMover.deltaRate >= 0 ? "+" : ""}${topMover.deltaRate.toFixed(1)}% MoM to ${fmtUsdShort(topMover.current)} — largest swing among outflow categories${balanceChange < 0 ? `, contributing to the ${balanceChange.toFixed(1)}% cash balance change.` : "."}`
        : "No material outflow swings vs. the prior month.",
      sentiment:
        topMover && topMover.deltaRate > 15
          ? "attention"
          : topMover && topMover.deltaRate < -10
            ? "positive"
            : "neutral",
    },
  ]
}
