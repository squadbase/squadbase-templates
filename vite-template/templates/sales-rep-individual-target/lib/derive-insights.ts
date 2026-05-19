import {
  repAttainments,
  repPaceRows,
  currentMonthMeta,
} from "@/lib/sales-rep-individual-target-mock-data"

export interface InsightItem {
  id: "team-pace" | "top-bottom" | "at-risk"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Team pace — share of reps on track vs behind
  const totalReps = repAttainments.length
  const aheadCount = repAttainments.filter((r) => r.status === "ahead").length
  const onTrackCount = repAttainments.filter((r) => r.status === "on-track").length
  const behindCount = repAttainments.filter((r) => r.status === "behind").length
  const teamAttainment =
    (repAttainments.reduce((s, r) => s + r.actual, 0) /
      repAttainments.reduce((s, r) => s + r.target, 0)) *
    100
  const expectedToDatePct =
    (currentMonthMeta.businessDaysElapsed / currentMonthMeta.businessDaysTotal) * 100
  const teamDelta = teamAttainment - expectedToDatePct

  // 2. Top vs bottom rep — same rank sort is already applied (desc by attainment)
  const top = repAttainments[0]
  const bottom = repAttainments[repAttainments.length - 1]

  // 3. At-risk reps — biggest pace gap
  const atRisk = repPaceRows[0] // sorted by paceDeltaPct ascending
  const atRiskCount = repPaceRows.filter((r) => r.status === "behind").length

  return [
    {
      id: "team-pace",
      label: "Team Pace",
      text: `${aheadCount} ahead, ${onTrackCount} on track, ${behindCount} behind of ${totalReps} reps. Team attainment is ${teamAttainment.toFixed(1)}% vs expected ${expectedToDatePct.toFixed(0)}% with ${currentMonthMeta.businessDaysRemaining} business days left — ${teamDelta >= 0 ? `+${teamDelta.toFixed(1)}` : teamDelta.toFixed(1)} pts vs straight-line target.`,
      sentiment: teamDelta >= 2 ? "positive" : teamDelta >= -2 ? "neutral" : "attention",
    },
    {
      id: "top-bottom",
      label: "Top / Bottom Performer",
      text: `${top.salesRep} leads at ${top.attainmentPct.toFixed(1)}% (remaining $${Math.round(top.remaining).toLocaleString("en-US")}), while ${bottom.salesRep} trails at ${bottom.attainmentPct.toFixed(1)}% — a ${(top.attainmentPct - bottom.attainmentPct).toFixed(1)}-pt spread. Consider pairing for end-of-month coaching.`,
      sentiment: "neutral",
    },
    {
      id: "at-risk",
      label: "At-Risk Watchlist",
      text:
        atRiskCount === 0
          ? `No reps are flagged as behind pace. Maintain momentum with ${currentMonthMeta.businessDaysRemaining} business days remaining.`
          : `${atRiskCount} rep${atRiskCount > 1 ? "s are" : " is"} pacing more than 5 pts below their required daily run-rate. ${atRisk.salesRep} needs $${Math.round(atRisk.requiredDailyAvg).toLocaleString("en-US")}/day to close (vs $${Math.round(atRisk.actualDailyAvg).toLocaleString("en-US")}/day so far).`,
      sentiment: atRiskCount === 0 ? "positive" : "attention",
    },
  ]
}
