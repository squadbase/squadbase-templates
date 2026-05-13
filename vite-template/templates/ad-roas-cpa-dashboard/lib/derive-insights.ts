import {
  channelPerformance,
  dailySpendConv,
  headerKpis,
} from "@/lib/ad-roas-cpa-dashboard-mock-data"

export interface InsightItem {
  id: "top-channel" | "efficiency-shift" | "budget-rebalance"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Best ROAS channel
  const best = channelPerformance[0]
  const worst = channelPerformance[channelPerformance.length - 1]
  const avgRoas =
    channelPerformance.reduce((s, r) => s + r.roas, 0) / channelPerformance.length

  // 2. Efficiency shift — last 7 vs prior 7 (spend per conversion)
  const last7 = dailySpendConv.slice(-7)
  const prev7 = dailySpendConv.slice(-14, -7)
  const last7Cpa =
    last7.reduce((s, d) => s + d.spend, 0) /
    Math.max(1, last7.reduce((s, d) => s + d.conversions, 0))
  const prev7Cpa =
    prev7.reduce((s, d) => s + d.spend, 0) /
    Math.max(1, prev7.reduce((s, d) => s + d.conversions, 0))
  const cpaDeltaPct = ((last7Cpa - prev7Cpa) / prev7Cpa) * 100

  // 3. Budget rebalance — share of spend going to under-performing channels
  const totalSpend = channelPerformance.reduce((s, r) => s + r.spend, 0)
  const underShare =
    channelPerformance
      .filter((r) => r.roas < avgRoas * 0.8)
      .reduce((s, r) => s + r.spend, 0) / totalSpend

  const roasKpi = headerKpis[3]

  return [
    {
      id: "top-channel",
      label: "Top ROAS Channel",
      text: `${best.channelLabel} is leading with ${best.roas.toFixed(2)}x ROAS at $${best.cpa.toFixed(0)} CPA, ${(((best.roas - avgRoas) / avgRoas) * 100).toFixed(0)}% above the portfolio average of ${avgRoas.toFixed(2)}x. ${worst.channelLabel} is the trailing channel at ${worst.roas.toFixed(2)}x.`,
      sentiment: roasKpi.change >= 0 ? "positive" : "neutral",
    },
    {
      id: "efficiency-shift",
      label: "Efficiency Trend",
      text:
        cpaDeltaPct <= -2
          ? `CPA improved by ${Math.abs(cpaDeltaPct).toFixed(1)}% over the last 7 days vs the prior week (now $${last7Cpa.toFixed(0)}). Campaign efficiency is trending in the right direction.`
          : cpaDeltaPct < 5
            ? `CPA is stable at $${last7Cpa.toFixed(0)} (${cpaDeltaPct >= 0 ? "+" : ""}${cpaDeltaPct.toFixed(1)}% vs prior 7 days). Holding spend levels until ROAS confirms an inflection.`
            : `CPA worsened by ${cpaDeltaPct.toFixed(1)}% over the last 7 days (now $${last7Cpa.toFixed(0)}). Check creative fatigue and bidding strategy for affected campaigns.`,
      sentiment:
        cpaDeltaPct <= -2 ? "positive" : cpaDeltaPct < 5 ? "neutral" : "attention",
    },
    {
      id: "budget-rebalance",
      label: "Budget Rebalancing",
      text: `${(underShare * 100).toFixed(0)}% of spend is going to channels running below 80% of average ROAS. Shifting a portion of that budget toward ${best.channelLabel} could lift portfolio ROAS by an estimated ${((best.roas - avgRoas) * underShare * 0.5).toFixed(2)}x.`,
      sentiment: underShare > 0.2 ? "attention" : "neutral",
    },
  ]
}
