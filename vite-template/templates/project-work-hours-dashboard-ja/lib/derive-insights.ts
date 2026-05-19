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
      label: "計画超過",
      text: `${projectHours.length} 件中 ${overruns.length} プロジェクトが計画超過 (合計 ${totalOverrun}h)。最大の乖離は「${biggestOverrun.projectName}」の ${biggestOverrun.variance >= 0 ? "+" : ""}${biggestOverrun.variancePct.toFixed(1)}%。`,
      sentiment:
        biggestOverrun.variancePct > 15
          ? "attention"
          : overruns.length > projectHours.length / 2
            ? "neutral"
            : "positive",
    },
    {
      id: "utilization",
      label: "稼働率の推移",
      text: `チーム稼働率は ${utilLatest.utilizationPct.toFixed(1)}% で、12 週で ${utilTrend >= 0 ? "+" : ""}${utilTrend.toFixed(1)}pp の${utilTrend >= 1 ? "上昇" : utilTrend <= -1 ? "低下" : "横ばい"}。${utilLatest.utilizationPct > 90 ? "燃え尽きリスク — 負荷再配分を検討。" : utilLatest.utilizationPct < 70 ? "余力あり — 新規案件の取り込み余地。" : "健全なレンジ。"}`,
      sentiment:
        utilLatest.utilizationPct > 92
          ? "attention"
          : utilLatest.utilizationPct < 65
            ? "attention"
            : "neutral",
    },
    {
      id: "member-load",
      label: "メンバー間負荷バランス",
      text: `「${topMember.name}」が ${topMember.hours}h を計上 (チーム平均の ${(topLoadFactor * 100).toFixed(0)}%)。${topLoadFactor > 1.5 ? "アサインの再配分を検討。" : "メンバー間の負荷は概ね均衡。"}`,
      sentiment: topLoadFactor > 1.7 ? "attention" : "neutral",
    },
  ]
}
