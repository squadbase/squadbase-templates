import {
  mediaSummaries,
  monthlyCvTrend,
} from "@/lib/affiliate-performance-dashboard-mock-data"

export interface InsightItem {
  id: "roas-leader" | "new-media-momentum" | "cpa-efficiency"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ROAS leader — top media by ROAS (with meaningful CV volume)
  const meaningful = mediaSummaries.filter((m) => m.conversions >= 30)
  const sortedByRoas = [...meaningful].sort((a, b) => b.roas - a.roas)
  const leader = sortedByRoas[0]
  const totalSpend = mediaSummaries.reduce((s, m) => s + m.spend, 0)
  const totalRevenue = mediaSummaries.reduce((s, m) => s + m.revenue, 0)
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const leaderLift = blendedRoas > 0
    ? ((leader.roas - blendedRoas) / blendedRoas) * 100
    : 0

  // 2. New media momentum — share of CV from new media in last 3 months
  const last3 = monthlyCvTrend.slice(-3)
  const last3Total = last3.reduce((s, m) => s + m.conversions, 0)
  const last3New = last3.reduce((s, m) => s + m.newMediaConversions, 0)
  const newShare = last3Total > 0 ? (last3New / last3Total) * 100 : 0
  const newMediaCount = mediaSummaries.filter((m) => m.isNew).length

  // 3. CPA efficiency — find the cluster of high-spend, high-CPA media (cost drag)
  const totalCv = mediaSummaries.reduce((s, m) => s + m.conversions, 0)
  const blendedCpa = totalCv > 0 ? totalSpend / totalCv : 0
  const drag = mediaSummaries
    .filter((m) => m.cpa > blendedCpa * 1.25 && m.spend > totalSpend * 0.05)
    .sort((a, b) => b.spend - a.spend)
  const dragSpend = drag.reduce((s, m) => s + m.spend, 0)
  const dragShare = totalSpend > 0 ? (dragSpend / totalSpend) * 100 : 0

  return [
    {
      id: "roas-leader",
      label: "ROAS Leader",
      text:
        leader && leaderLift > 0
          ? `${leader.mediaName} (${leader.asp}) leads with ROAS ${leader.roas.toFixed(2)}x — ${leaderLift.toFixed(1)}% above the blended ${blendedRoas.toFixed(2)}x. Consider reallocating budget from lower-ROAS media to scale this channel.`
          : leader
            ? `${leader.mediaName} (${leader.asp}) tops ROAS at ${leader.roas.toFixed(2)}x, in line with the blended ${blendedRoas.toFixed(2)}x.`
            : `No media meets the minimum CV threshold for ROAS comparison this period.`,
      sentiment: leaderLift > 10 ? "positive" : "neutral",
    },
    {
      id: "new-media-momentum",
      label: "New Media Momentum",
      text:
        newShare >= 12
          ? `${newMediaCount} new media now contribute ${newShare.toFixed(1)}% of the trailing 3-month CV. The diversification thesis is working — keep onboarding selectively.`
          : newShare >= 4
            ? `${newMediaCount} new media account for ${newShare.toFixed(1)}% of recent CV. Ramping as expected but still concentrated on established partners.`
            : `New media contribution is only ${newShare.toFixed(1)}% of recent CV. Review onboarding velocity and revisit the partner pipeline.`,
      sentiment:
        newShare >= 12 ? "positive" : newShare >= 4 ? "neutral" : "attention",
    },
    {
      id: "cpa-efficiency",
      label: "CPA Efficiency",
      text:
        drag.length === 0
          ? `No high-spend media is running above 1.25x of the blended $${blendedCpa.toFixed(2)} CPA. Spend efficiency is well distributed.`
          : `${drag.length} media (${dragShare.toFixed(1)}% of total spend) run above 1.25x the blended $${blendedCpa.toFixed(2)} CPA. Tightening caps on ${drag[0].mediaName} could reclaim budget for ROAS leaders.`,
      sentiment:
        drag.length === 0 ? "positive" : dragShare > 20 ? "attention" : "neutral",
    },
  ]
}
