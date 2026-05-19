import {
  projectHours,
  utilizationTrend,
} from "@/lib/project-work-hours-dashboard-mock-data"

export interface InsightItem {
  id: "overrun" | "utilization" | "member-load"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const overruns = projectHours.filter((p) => p.variance > 0)
  const totalOverrun = overruns.reduce((s, p) => s + p.variance, 0)
  const biggestOverrun = [...projectHours].sort(
    (a, b) => b.variance - a.variance,
  )[0]

  const utilLatest = utilizationTrend[utilizationTrend.length - 1]
  const utilFirst = utilizationTrend[0]
  const utilTrend = utilLatest.utilizationPct - utilFirst.utilizationPct

  // Member load: highest-loaded member
  const memberTotals = new Map<string, { hours: number; name: string }>()
  for (const p of projectHours) {
    for (const m of p.membersByHours) {
      const existing = memberTotals.get(m.memberId)
      memberTotals.set(m.memberId, {
        hours: (existing?.hours ?? 0) + m.hours,
        name: m.memberName,
      })
    }
  }
  const memberArr = Array.from(memberTotals.values()).sort(
    (a, b) => b.hours - a.hours,
  )
  const topMember = memberArr[0]
  const avgLoad =
    memberArr.reduce((s, m) => s + m.hours, 0) / memberArr.length
  const topLoadFactor = topMember.hours / avgLoad

  return [
    {
      id: "overrun",
      label: "Plan Overrun",
      text: `${overruns.length} of ${projectHours.length} projects are over plan, ${totalOverrun} hours total. The biggest gap is "${biggestOverrun.projectName}" at ${biggestOverrun.variance >= 0 ? "+" : ""}${biggestOverrun.variancePct.toFixed(1)}%.`,
      sentiment:
        biggestOverrun.variancePct > 15
          ? "attention"
          : overruns.length > projectHours.length / 2
            ? "neutral"
            : "positive",
    },
    {
      id: "utilization",
      label: "Utilization Trend",
      text: `Team utilization is at ${utilLatest.utilizationPct.toFixed(1)}%, ${utilTrend >= 1 ? "trending up" : utilTrend <= -1 ? "trending down" : "flat"} (${utilTrend >= 0 ? "+" : ""}${utilTrend.toFixed(1)}pp over 12 weeks). ${utilLatest.utilizationPct > 90 ? "Risk of burnout — consider rebalancing." : utilLatest.utilizationPct < 70 ? "Slack capacity — opportunity to pick up new work." : "Healthy band."}`,
      sentiment:
        utilLatest.utilizationPct > 92
          ? "attention"
          : utilLatest.utilizationPct < 65
            ? "attention"
            : "neutral",
    },
    {
      id: "member-load",
      label: "Member Load Balance",
      text: `"${topMember.name}" is logging ${topMember.hours}h, ${(topLoadFactor * 100).toFixed(0)}% of the team average. ${topLoadFactor > 1.5 ? "Consider redistributing assignments." : "Workload is relatively balanced across the team."}`,
      sentiment: topLoadFactor > 1.7 ? "attention" : "neutral",
    },
  ]
}
