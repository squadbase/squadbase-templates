import {
  mrRanking,
  facilityRxSeries,
  uncoveredFacilities,
  coverageStats,
  headerKpis,
} from "@/lib/mr-activity-dashboard-mock-data"

export interface InsightItem {
  id: "top-mr" | "facility-momentum" | "coverage-gap"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Top performing MR
  const topMr = mrRanking[0]
  const teamAvgVisits =
    mrRanking.reduce((s, r) => s + r.visits, 0) / mrRanking.length
  const topLift = ((topMr.visits - teamAvgVisits) / teamAvgVisits) * 100

  // 2. Facility with best Rx-share momentum (12-week delta)
  let bestFacility = facilityRxSeries[0]
  let bestDelta = -Infinity
  for (const fac of facilityRxSeries) {
    const first = fac.data[0]?.rxShare ?? 0
    const last = fac.data[fac.data.length - 1]?.rxShare ?? 0
    const delta = last - first
    if (delta > bestDelta) {
      bestDelta = delta
      bestFacility = fac
    }
  }

  // 3. Coverage gap
  const coverageKpi = headerKpis[3]
  const keyAccountUncovered = uncoveredFacilities.filter(
    (f) => f.segment === "key_account",
  ).length
  const oldestGap = uncoveredFacilities[0]?.daysSinceLastVisit ?? 0

  return [
    {
      id: "top-mr",
      label: "Top MR This Period",
      text: `${topMr.mrName} (${topMr.territory}) leads with ${topMr.visits} visits — ${topLift.toFixed(0)}% above the team average — and an Rx share of ${topMr.avgRxShare.toFixed(1)}%. Consider sharing their facility cadence with peers.`,
      sentiment: "positive",
    },
    {
      id: "facility-momentum",
      label: "Facility Rx Momentum",
      text:
        bestDelta > 2
          ? `${bestFacility.facilityName} gained +${bestDelta.toFixed(1)} pts of Rx share over the last 12 weeks — the strongest move in the territory. Lock in the cadence with the assigned MR.`
          : bestDelta >= -1
            ? `Rx share is broadly stable across covered facilities (top mover: ${bestFacility.facilityName} at ${bestDelta >= 0 ? "+" : ""}${bestDelta.toFixed(1)} pts).`
            : `Rx share is declining across facilities (top mover: ${bestFacility.facilityName} at ${bestDelta.toFixed(1)} pts). Review messaging and competitor activity.`,
      sentiment: bestDelta > 2 ? "positive" : bestDelta >= -1 ? "neutral" : "attention",
    },
    {
      id: "coverage-gap",
      label: "Coverage Gap",
      text: `${coverageStats.uncovered} of ${coverageStats.total} facilities are uncovered (${coverageKpi.value} coverage). ${keyAccountUncovered} key accounts have not been visited in over ${oldestGap >= 30 ? "a month" : "3 weeks"}. Prioritize re-engagement before EoQ.`,
      sentiment: keyAccountUncovered >= 2 ? "attention" : "neutral",
    },
  ]
}
