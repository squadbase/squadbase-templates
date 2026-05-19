import {
  campaignRoas,
  creatives,
  budgetPacing,
} from "@/lib/campaign-performance-analysis-mock-data"

export interface InsightItem {
  id: "top-roas" | "learning-phase" | "budget-pacing"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Top-ROAS campaign vs blended baseline
  const top = campaignRoas[0]
  const blendedRoas =
    campaignRoas.reduce((s, c) => s + c.revenue, 0) /
    campaignRoas.reduce((s, c) => s + c.spend, 0)
  const liftPct = ((top.roas - blendedRoas) / blendedRoas) * 100

  // 2. Learning-phase health — % of creatives still learning
  const learning = creatives.filter((c) => c.learningPhase === "learning").length
  const limited = creatives.filter((c) => c.learningPhase === "limited").length
  const active = creatives.filter((c) => c.learningPhase === "active").length
  const learningPct = (learning / creatives.length) * 100
  const limitedPct = (limited / creatives.length) * 100

  // 3. Budget pacing — campaigns ahead vs behind
  const ahead = budgetPacing.filter((b) => b.paceStatus === "ahead").length
  const behind = budgetPacing.filter((b) => b.paceStatus === "behind").length
  const fastest = budgetPacing[0]

  return [
    {
      id: "top-roas",
      label: "Top Performer",
      text: `${top.campaignName} (${top.channel}) is the ROAS leader at ${top.roas.toFixed(2)}x — ${liftPct >= 0 ? "+" : ""}${liftPct.toFixed(0)}% above the blended baseline of ${blendedRoas.toFixed(2)}x. Consider scaling budget to this campaign first.`,
      sentiment: liftPct > 30 ? "positive" : "neutral",
    },
    {
      id: "learning-phase",
      label: "Learning Phase Health",
      text: `${active} of ${creatives.length} creatives have exited learning into active delivery. ${learning} are still learning (${learningPct.toFixed(0)}%) and ${limited} are limited (${limitedPct.toFixed(0)}%). Pause limited creatives and consolidate spend on active winners.`,
      sentiment:
        limitedPct > 25 ? "attention" : learningPct < 35 ? "positive" : "neutral",
    },
    {
      id: "budget-pacing",
      label: "Budget Pacing",
      text:
        ahead > behind
          ? `${ahead} campaigns are pacing ahead of the month — ${fastest.campaignName} is at ${fastest.pctSpent.toFixed(0)}% spent on day ${fastest.daysElapsed}/${fastest.daysInPeriod}. Verify ROAS holds before letting spend continue.`
          : behind > ahead
            ? `${behind} campaigns are under-pacing for the month. Re-allocate from over-pacers or raise daily caps where ROAS is healthy.`
            : `Pacing is broadly on-track across ${budgetPacing.length} campaigns. Maintain current daily caps and revisit at end-of-week.`,
      sentiment:
        ahead > behind ? "attention" : behind > ahead ? "attention" : "neutral",
    },
  ]
}
