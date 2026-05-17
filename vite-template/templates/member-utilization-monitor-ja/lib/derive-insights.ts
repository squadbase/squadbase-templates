import {
  members,
  boxPlot,
} from "@/lib/member-utilization-monitor-mock-data"

export interface InsightItem {
  id: "balance" | "overtime" | "team-spread"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const avg = members.reduce((s, m) => s + m.utilizationPct, 0) / members.length
  const high = members.filter((m) => m.utilizationPct > 95).length
  const low = members.filter((m) => m.utilizationPct < 60).length

  const totalOvertime = members.reduce((s, m) => s + m.overtimeHours, 0)
  const highOvertime = members.filter((m) => m.overtimeHours > 30)

  const spreads = boxPlot.map((b) => ({
    team: b.team,
    spread: b.values[4] - b.values[0],
  }))
  const widest = spreads.sort((a, b) => b.spread - a.spread)[0]

  return [
    {
      id: "balance",
      label: "稼働バランス",
      text: `平均稼働率は ${avg.toFixed(1)}%。95% 超のメンバーが ${high} 名、60% 未満が ${low} 名 — ${high + low > members.length * 0.3 ? "負荷の偏りが大きく、再配分の検討余地あり。" : "概ね健全なバランス。"}`,
      sentiment:
        high + low > members.length * 0.3 ? "attention" : "positive",
    },
    {
      id: "overtime",
      label: "残業の集中",
      text:
        highOvertime.length > 0
          ? `30h 超の残業を抱えるメンバーが ${highOvertime.length} 名 (合計 ${totalOvertime}h)。まずはこのメンバーから負荷の再配分を。`
          : `残業合計 ${totalOvertime}h、30h 超のメンバー無し — 持続可能なレベル。`,
      sentiment: highOvertime.length > 0 ? "attention" : "positive",
    },
    {
      id: "team-spread",
      label: "チーム内ばらつき",
      text: `「${widest.team}」のチーム内ばらつきが最大 (${widest.spread.toFixed(1)}pp)。このチームを先に整えると全体バランスが改善しやすい。`,
      sentiment: widest.spread > 30 ? "attention" : "neutral",
    },
  ]
}
