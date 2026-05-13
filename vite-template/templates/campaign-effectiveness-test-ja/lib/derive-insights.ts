import {
  prePostSeries,
  campaignRoi,
  couponRedemption,
} from "@/lib/campaign-effectiveness-test-mock-data"

export interface InsightItem {
  id: "headline-lift" | "top-roi" | "coupon-quality"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ヘッドラインのリフト — post 期間のテスト vs コントロール平均 ARPU
  const post = prePostSeries.filter((p) => p.phase === "post")
  const pre = prePostSeries.filter((p) => p.phase === "pre")
  const postTestAvg =
    post.reduce((s, p) => s + p.testRevenuePerCustomer, 0) / post.length
  const postControlAvg =
    post.reduce((s, p) => s + p.controlRevenuePerCustomer, 0) / post.length
  const preTestAvg =
    pre.reduce((s, p) => s + p.testRevenuePerCustomer, 0) / pre.length
  const preControlAvg =
    pre.reduce((s, p) => s + p.controlRevenuePerCustomer, 0) / pre.length
  const liftPct = ((postTestAvg - postControlAvg) / postControlAvg) * 100
  const baselineGapPct =
    ((preTestAvg - preControlAvg) / preControlAvg) * 100

  // 2. 最高 ROI キャンペーン vs ポートフォリオ平均
  const top = campaignRoi[0]
  const totalIncremental = campaignRoi.reduce(
    (s, c) => s + c.incrementalRevenue,
    0,
  )
  const totalCost = campaignRoi.reduce((s, c) => s + c.cost, 0)
  const portfolioRoi = ((totalIncremental - totalCost) / totalCost) * 100

  // 3. クーポン消化率 — 最良 vs 最弱
  const sorted = [...couponRedemption].sort(
    (a, b) => b.redemptionRate - a.redemptionRate,
  )
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const portfolioRedemption =
    (couponRedemption.reduce((s, c) => s + c.redeemed, 0) /
      couponRedemption.reduce((s, c) => s + c.distributed, 0)) *
    100

  return [
    {
      id: "headline-lift",
      label: "ヘッドラインのリフト",
      text: `露出顧客は施策後にコントロール比 +${liftPct.toFixed(1)}% の購買額 (施策前のベースライン差は ${baselineGapPct >= 0 ? "+" : ""}${baselineGapPct.toFixed(1)}%)。施策が増分売上を確実に生み出しています。`,
      sentiment:
        liftPct - Math.abs(baselineGapPct) > 5
          ? "positive"
          : liftPct > 0
            ? "neutral"
            : "attention",
    },
    {
      id: "top-roi",
      label: "最高 ROI",
      text: `${top.campaignName} (${top.channel}) が ROI ${top.roi >= 0 ? "+" : ""}${top.roi.toFixed(0)}% でトップ。投下費用 ¥${top.cost.toLocaleString("ja-JP")} に対しポートフォリオ平均 ${portfolioRoi >= 0 ? "+" : ""}${portfolioRoi.toFixed(0)}% を大きく上回ります。テストセル拡大または横展開を検討。`,
      sentiment: top.roi > portfolioRoi + 60 ? "positive" : "neutral",
    },
    {
      id: "coupon-quality",
      label: "クーポンの質",
      text: `クーポン消化率の平均は ${portfolioRedemption.toFixed(1)}%。最良は ${best.couponCode} (${best.discountLabel}) で ${best.redemptionRate.toFixed(1)}%、最弱は ${worst.couponCode} の ${worst.redemptionRate.toFixed(1)}% — オファー設計と配信対象を見直しましょう。`,
      sentiment:
        worst.redemptionRate < 4
          ? "attention"
          : portfolioRedemption > 8
            ? "positive"
            : "neutral",
    },
  ]
}
