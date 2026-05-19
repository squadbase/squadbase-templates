import {
  headerKpis,
  equipmentUptime,
  preventiveMaintenanceTasks,
  failureTrend,
} from "@/lib/equipment-maintenance-dashboard-mock-data"

export interface InsightItem {
  id: "availability-risk" | "pm-backlog" | "failure-trend"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 稼働率リスク — 最も低い設備
  const worst = equipmentUptime[0] // 稼働率昇順でソート済
  const fleetKpi = headerKpis[0]
  const fleetPct = parseFloat(fleetKpi.value)

  // 2. PM 滞留 — 期日超過タスク数
  const overdueTasks = preventiveMaintenanceTasks.filter(
    (t) => t.status === "overdue",
  )
  const overdueCount = overdueTasks.length
  const oldestOverdue = overdueTasks.reduce(
    (acc, t) => (t.daysOffset < acc ? t.daysOffset : acc),
    0,
  )

  // 3. 故障件数トレンド — 直近3ヶ月 vs その前3ヶ月
  const last3 = failureTrend.slice(-3).reduce((s, m) => s + m.failureCount, 0)
  const prior3 = failureTrend
    .slice(-6, -3)
    .reduce((s, m) => s + m.failureCount, 0)
  const failureDelta = prior3 === 0 ? 0 : ((last3 - prior3) / prior3) * 100

  return [
    {
      id: "availability-risk",
      label: "稼働率リスク",
      text:
        worst.uptimePct < 90
          ? `全体稼働率は ${fleetPct.toFixed(1)}% だが、${worst.name} が ${worst.uptimePct.toFixed(1)}% (故障 ${worst.failureCount} 件) と最も低い。優先的に深掘り点検を。`
          : `全体稼働率は ${fleetPct.toFixed(1)}%。最も低いのは ${worst.name} (${worst.uptimePct.toFixed(1)}%) — 健全域だが要観察。`,
      sentiment: worst.uptimePct < 90 ? "attention" : "neutral",
    },
    {
      id: "pm-backlog",
      label: "PM 滞留",
      text:
        overdueCount === 0
          ? "期日超過の予防保全タスクはなし。このペースを維持しましょう。"
          : `期日超過の予防保全タスクが ${overdueCount} 件 (最古 ${Math.abs(oldestOverdue)} 日超過)。遅延が長引くほど突発停止リスクが上がります。`,
      sentiment:
        overdueCount === 0
          ? "positive"
          : overdueCount <= 2
            ? "neutral"
            : "attention",
    },
    {
      id: "failure-trend",
      label: "故障件数トレンド",
      text:
        failureDelta <= -5
          ? `直近3ヶ月の故障件数は前3ヶ月比 ${Math.abs(failureDelta).toFixed(1)}% 減少。信頼性改善策が効果を発揮しています。`
          : failureDelta >= 5
            ? `直近3ヶ月の故障件数は前3ヶ月比 +${failureDelta.toFixed(1)}%。来月の PM 計画前に主要な原因クラスタを確認しましょう。`
            : `故障件数は概ね横ばい (前3ヶ月比 ${failureDelta >= 0 ? "+" : ""}${failureDelta.toFixed(1)}%)。現行の PM 周期を維持。`,
      sentiment:
        failureDelta <= -5
          ? "positive"
          : failureDelta >= 5
            ? "attention"
            : "neutral",
    },
  ]
}
