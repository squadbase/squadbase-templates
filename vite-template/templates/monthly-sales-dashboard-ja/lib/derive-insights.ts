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

  const trailing = monthlyTrend.slice(-6)
  const avgYoy = trailing.reduce((s, m) => s + m.yoyPct, 0) / trailing.length
  const trendDirection =
    trailing[trailing.length - 1].yoyPct - trailing[0].yoyPct

  const drivers = budgetWaterfall.slice(1, -1)
  const topPositive = [...drivers]
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)[0]
  const topNegative = [...drivers]
    .filter((d) => d.value < 0)
    .sort((a, b) => a.value - b.value)[0]

  const segments = segmentContributions()
  const topSegment = segments[0]
  const concentration = topSegment.share

  return [
    {
      id: "budget-attainment",
      label: "予算達成度",
      text:
        variancePct >= 2
          ? `実績が予算を ¥${Math.round(variance / 1_000_000).toLocaleString("ja-JP")}百万 (+${variancePct.toFixed(1)}%) 上回りました。最大寄与は「${topPositive?.label ?? "数量"}」。`
          : variancePct >= -2
            ? `実績は予算比 ${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}% — 計画通りの着地。`
            : `実績が予算を ¥${Math.abs(Math.round(variance / 1_000_000)).toLocaleString("ja-JP")}百万 (${variancePct.toFixed(1)}%) 下回りました。最大の押し下げ要因は「${topNegative?.label ?? "販促"}」。`,
      sentiment:
        variancePct >= 2
          ? "positive"
          : variancePct >= -2
            ? "neutral"
            : "attention",
    },
    {
      id: "yoy-trajectory",
      label: "YoY 推移",
      text: `直近6ヶ月平均は ${avgYoy >= 0 ? "+" : ""}${avgYoy.toFixed(1)}% で、トレンドは${trendDirection >= 1 ? "加速中" : trendDirection <= -1 ? "減速中" : "横ばい"}。直近月は ${latest.yoyPct >= 0 ? "+" : ""}${latest.yoyPct.toFixed(1)}%。`,
      sentiment:
        avgYoy >= 5 && trendDirection >= 0
          ? "positive"
          : avgYoy < 0
            ? "attention"
            : "neutral",
    },
    {
      id: "segment-driver",
      label: "セグメント寄与度",
      text: `「${topSegment.name}」が売上の ${concentration.toFixed(1)}% を占有 (上位2セグメント合計 ${(segments[0].share + segments[1].share).toFixed(1)}%)。${concentration > 35 ? "依存度が高め — リスク分散の余地あり。" : "カテゴリ間のミックスはおおむね均衡。"}`,
      sentiment: concentration > 40 ? "attention" : "neutral",
    },
  ]
}
