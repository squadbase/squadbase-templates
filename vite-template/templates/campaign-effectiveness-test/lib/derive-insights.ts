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
  // 1. Headline lift — compare avg test vs control ARPU in the post window
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

  // 2. Top ROI campaign vs portfolio baseline
  const top = campaignRoi[0]
  const totalIncremental = campaignRoi.reduce(
    (s, c) => s + c.incrementalRevenue,
    0,
  )
  const totalCost = campaignRoi.reduce((s, c) => s + c.cost, 0)
  const portfolioRoi = ((totalIncremental - totalCost) / totalCost) * 100

  // 3. Coupon redemption — best vs worst
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
      label: "Headline Lift",
      text: `Exposed customers spent +${liftPct.toFixed(1)}% more than control in the post window (vs ${baselineGapPct >= 0 ? "+" : ""}${baselineGapPct.toFixed(1)}% baseline gap pre-launch) — the campaign is clearly driving incremental revenue.`,
      sentiment:
        liftPct - Math.abs(baselineGapPct) > 5
          ? "positive"
          : liftPct > 0
            ? "neutral"
            : "attention",
    },
    {
      id: "top-roi",
      label: "Top ROI",
      text: `${top.campaignName} (${top.channel}) leads with a ${top.roi >= 0 ? "+" : ""}${top.roi.toFixed(0)}% ROI on $${top.cost.toLocaleString("en-US")} spend, well ahead of the ${portfolioRoi >= 0 ? "+" : ""}${portfolioRoi.toFixed(0)}% portfolio average. Consider expanding the test cell or rolling out.`,
      sentiment: top.roi > portfolioRoi + 60 ? "positive" : "neutral",
    },
    {
      id: "coupon-quality",
      label: "Coupon Quality",
      text: `Coupon redemption averages ${portfolioRedemption.toFixed(1)}% across campaigns. ${best.couponCode} (${best.discountLabel}) is the top performer at ${best.redemptionRate.toFixed(1)}%, while ${worst.couponCode} sits at ${worst.redemptionRate.toFixed(1)}% — review offer strength or audience targeting.`,
      sentiment:
        worst.redemptionRate < 4
          ? "attention"
          : portfolioRedemption > 8
            ? "positive"
            : "neutral",
    },
  ]
}
