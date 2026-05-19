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

function fmtJpyShort(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}¥${(abs / 100_000_000).toFixed(2)}億`
  if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(0)}万`
  return `${sign}¥${abs.toLocaleString("ja-JP")}`
}

export function deriveInsights(): InsightItem[] {
  const latest = monthlyTotals[monthlyTotals.length - 1]

  // 1. 流動性ランウェイ — 現金残高 / 直近平均の月次出金
  const trailing6 = monthlyTotals.slice(-6)
  const avgOutflow =
    trailing6.reduce(
      (s, m) => s + Math.max(0, -(m.operating + m.investing)),
      0,
    ) / trailing6.length
  const runwayMonths = avgOutflow > 0 ? latest.cashBalance / avgOutflow : 0

  // 2. FCF トレンド — 直近 6 ヶ月の前半 vs 後半
  const fcfSeries = trailing6.map((m) => m.freeCashFlow)
  const firstHalfAvg =
    fcfSeries.slice(0, 3).reduce((s, v) => s + v, 0) / 3
  const secondHalfAvg =
    fcfSeries.slice(3).reduce((s, v) => s + v, 0) / 3
  const fcfDelta = secondHalfAvg - firstHalfAvg
  const fcfImproving = fcfDelta > 0

  // 3. カテゴリウォッチ — 出金カテゴリで最も変動の大きい項目
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
      label: "流動性ランウェイ",
      text:
        runwayMonths > 12
          ? `期末現金 ${fmtJpyShort(latest.cashBalance)} は直近の月次出金水準で約 ${runwayMonths.toFixed(1)} ヶ月分。流動性は健全に確保されています。`
          : runwayMonths > 6
            ? `期末現金 ${fmtJpyShort(latest.cashBalance)} は直近の月次出金水準で約 ${runwayMonths.toFixed(1)} ヶ月分。月次バーンを継続的に注視してください。`
            : `期末現金 ${fmtJpyShort(latest.cashBalance)} は直近の月次出金水準で ${runwayMonths.toFixed(1)} ヶ月分にとどまります。資金繰りの引き締めを検討してください。`,
      sentiment:
        runwayMonths > 12 ? "positive" : runwayMonths > 6 ? "neutral" : "attention",
    },
    {
      id: "fcf-trend",
      label: "フリーCF トレンド",
      text: fcfImproving
        ? `直近3ヶ月のフリーCF平均は ${fmtJpyShort(secondHalfAvg)}、前3ヶ月から ${fmtJpyShort(fcfDelta)} 改善。投資後でも現金創出が拡大しています。`
        : `直近3ヶ月のフリーCF平均は ${fmtJpyShort(secondHalfAvg)}、前3ヶ月から ${fmtJpyShort(Math.abs(fcfDelta))} 悪化。投資負担または営業CFの低下が要因です。`,
      sentiment: fcfImproving
        ? "positive"
        : Math.abs(fcfDelta) < latest.cashBalance * 0.02
          ? "neutral"
          : "attention",
    },
    {
      id: "category-watch",
      label: "カテゴリウォッチ",
      text: topMover
        ? `「${topMover.category}」（${topMover.cfType === "operating" ? "営業" : topMover.cfType === "investing" ? "投資" : "財務"}CF）は前月比 ${topMover.deltaRate >= 0 ? "+" : ""}${topMover.deltaRate.toFixed(1)}% で ${fmtJpyShort(topMover.current)}。出金カテゴリで最大の変動${balanceChange < 0 ? `、現金残高 ${balanceChange.toFixed(1)}% の変動要因です。` : "です。"}`
        : "出金カテゴリで前月から目立った変動はありません。",
      sentiment:
        topMover && topMover.deltaRate > 15
          ? "attention"
          : topMover && topMover.deltaRate < -10
            ? "positive"
            : "neutral",
    },
  ]
}
