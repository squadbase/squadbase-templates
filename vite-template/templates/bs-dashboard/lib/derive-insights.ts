import {
  bsStructure,
  ratioTrend,
  accountTrend,
} from "@/lib/bs-dashboard-mock-data"

export interface InsightItem {
  id: "capital-structure" | "liquidity-trend" | "cash-position"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Capital structure — equity ratio (latest)
  const latestRatio = ratioTrend[ratioTrend.length - 1]
  const firstRatio = ratioTrend[0]
  const equityRatioDelta = latestRatio.equityRatio - firstRatio.equityRatio

  // 2. Liquidity — current ratio trend
  const currentRatioDelta = latestRatio.currentRatio - firstRatio.currentRatio
  const currentRatio = latestRatio.currentRatio

  // 3. Cash position — cash trajectory
  const cashSeries = accountTrend.map((p) => p.cash)
  const cashLatest = cashSeries[cashSeries.length - 1]
  const cashStart = cashSeries[0]
  const cashGrowthPct = cashStart === 0 ? 0 : ((cashLatest - cashStart) / cashStart) * 100

  const totalAssetsM = bsStructure.totalAssets / 1_000_000

  return [
    {
      id: "capital-structure",
      label: "Capital Structure",
      text:
        latestRatio.equityRatio >= 40
          ? `Equity ratio is ${latestRatio.equityRatio.toFixed(1)}% — a comfortable buffer (${equityRatioDelta >= 0 ? "+" : ""}${equityRatioDelta.toFixed(1)} pts over 12 months) on a total asset base of $${totalAssetsM.toFixed(0)}M.`
          : latestRatio.equityRatio >= 25
            ? `Equity ratio is ${latestRatio.equityRatio.toFixed(1)}% — within a healthy range (${equityRatioDelta >= 0 ? "+" : ""}${equityRatioDelta.toFixed(1)} pts over 12 months) but worth monitoring as debt grows.`
            : `Equity ratio is ${latestRatio.equityRatio.toFixed(1)}% — leverage is elevated. Review debt repayment cadence and retained earnings policy.`,
      sentiment:
        latestRatio.equityRatio >= 40
          ? "positive"
          : latestRatio.equityRatio >= 25
            ? "neutral"
            : "attention",
    },
    {
      id: "liquidity-trend",
      label: "Liquidity Trend",
      text:
        currentRatio >= 150
          ? `Current ratio is ${currentRatio.toFixed(0)}% (${currentRatioDelta >= 0 ? "+" : ""}${currentRatioDelta.toFixed(1)} pts YoY) — short-term obligations are well-covered by current assets.`
          : currentRatio >= 100
            ? `Current ratio is ${currentRatio.toFixed(0)}% (${currentRatioDelta >= 0 ? "+" : ""}${currentRatioDelta.toFixed(1)} pts YoY) — short-term liabilities are covered, but the buffer is thin.`
            : `Current ratio is ${currentRatio.toFixed(0)}% — short-term liquidity is tight. Reassess working-capital and short-term debt rollovers.`,
      sentiment:
        currentRatio >= 150
          ? "positive"
          : currentRatio >= 100
            ? "neutral"
            : "attention",
    },
    {
      id: "cash-position",
      label: "Cash Position",
      text: `Cash & deposits stand at $${(cashLatest / 1_000_000).toFixed(1)}M (${cashGrowthPct >= 0 ? "+" : ""}${cashGrowthPct.toFixed(1)}% over the trailing 12 months). Monitor against operating cash outflow run-rate.`,
      sentiment:
        cashGrowthPct >= 5
          ? "positive"
          : cashGrowthPct >= -5
            ? "neutral"
            : "attention",
    },
  ]
}
