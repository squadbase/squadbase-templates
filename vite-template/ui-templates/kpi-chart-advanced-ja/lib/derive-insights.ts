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

function fmtJpy(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}億円`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}万円`
  return `${sign}¥${abs.toLocaleString("ja-JP")}`
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
      label: "成長方向",
      text:
        overallGrowth > 5
          ? `期間合計 ${fmtJpy(totalCurrent)}、6ヶ月の前年同期比 +${overallGrowth.toFixed(1)}% で推移。直近月 ${latest.period} は +${latest.growth.toFixed(1)}% を記録しました。`
          : `期間合計 ${fmtJpy(totalCurrent)} は前年同期比 ${overallGrowth.toFixed(1)}% で推移。勢いは控えめ、今後2ヶ月の動向に注目です。`,
      sentiment: overallGrowth > 8 ? "positive" : overallGrowth > 2 ? "neutral" : "attention",
    },
    {
      id: "channel-mix",
      label: "チャネル構成",
      text: `${leader.segment} がチャネル構成首位で ${leaderShare.toFixed(1)}% (${fmtJpy(leader.value)})。${sorted.length} チャネルへの分散により単一チャネル35%以下に抑えられています。`,
      sentiment: leaderShare > 45 ? "attention" : "neutral",
    },
    {
      id: "campaign-lever",
      label: "直近トレンド",
      text:
        trendDelta > 0
          ? `直近5日の日次売上が初日5日比 +${trendDelta.toFixed(1)}% で加速。期間全体では ${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% 推移です。`
          : `直近5日の日次売上が初日5日比 ${Math.abs(trendDelta).toFixed(1)}% 鈍化。要因を確認する必要があります。`,
      sentiment: trendDelta > 5 ? "positive" : trendDelta < -5 ? "attention" : "neutral",
    },
  ]
}
