import {
  statusSummary,
  ownerLoad,
  overdueTasks,
  tasks,
} from "@/lib/task-status-management-mock-data"

export interface InsightItem {
  id: "overdue-pressure" | "workload-balance" | "completion-pace"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 期日超過プレッシャー
  const totalActive = statusSummary[0].count + statusSummary[1].count
  const overdueCount = overdueTasks.length
  const overdueShare =
    totalActive > 0 ? (overdueCount / totalActive) * 100 : 0
  const topOverdue = overdueTasks[0]

  // 2. 負荷バランス — 担当者別アクティブ件数のばらつき
  const activeLoads = ownerLoad.map((o) => o.totalActive)
  const meanLoad =
    activeLoads.reduce((s, v) => s + v, 0) / Math.max(activeLoads.length, 1)
  const maxOwner = ownerLoad[0]
  const minOwner = ownerLoad[ownerLoad.length - 1]
  const spread = maxOwner.totalActive - minOwner.totalActive

  // 3. 完了ペース
  const completed = statusSummary[2].count
  const completionRate = (completed / tasks.length) * 100

  return [
    {
      id: "overdue-pressure",
      label: "期日超過プレッシャー",
      text:
        overdueCount === 0
          ? `現時点で期日超過のタスクはなし。アクティブ案件はすべて期日内で推移しています。`
          : overdueShare < 15
            ? `アクティブ ${totalActive} 件のうち ${overdueCount} 件が期日超過 (${overdueShare.toFixed(0)}%)。最古は「${topOverdue.title}」(${topOverdue.daysOverdue} 日超過)。`
            : `アクティブ ${totalActive} 件のうち ${overdueCount} 件が期日超過 (${overdueShare.toFixed(0)}%)。長期滞留案件を優先トリアージ — 「${topOverdue.title}」は ${topOverdue.daysOverdue} 日超過。`,
      sentiment:
        overdueCount === 0
          ? "positive"
          : overdueShare < 15
            ? "neutral"
            : "attention",
    },
    {
      id: "workload-balance",
      label: "担当者別負荷",
      text:
        spread <= 2
          ? `アクティブ負荷は均等 — 担当者あたり ${minOwner.totalActive}〜${maxOwner.totalActive} 件 (平均 ${meanLoad.toFixed(1)} 件)。`
          : `${maxOwner.owner} が ${maxOwner.totalActive} 件を抱える一方、${minOwner.owner} は ${minOwner.totalActive} 件。平均 ${meanLoad.toFixed(1)} 件に対し最大 ${spread} 件の偏りがあり、再配分の余地あり。`,
      sentiment: spread <= 2 ? "positive" : spread <= 5 ? "neutral" : "attention",
    },
    {
      id: "completion-pace",
      label: "完了ペース",
      text: `全 ${tasks.length} 件のうち ${completed} 件が完了 (${completionRate.toFixed(0)}%)。進行中 ${statusSummary[1].count} 件、未着手 ${statusSummary[0].count} 件。`,
      sentiment:
        completionRate >= 35
          ? "positive"
          : completionRate >= 20
            ? "neutral"
            : "attention",
    },
  ]
}
