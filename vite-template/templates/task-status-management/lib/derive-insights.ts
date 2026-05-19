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
  // 1. Overdue pressure
  const totalActive = statusSummary[0].count + statusSummary[1].count
  const overdueCount = overdueTasks.length
  const overdueShare =
    totalActive > 0 ? (overdueCount / totalActive) * 100 : 0
  const topOverdue = overdueTasks[0]

  // 2. Workload balance — variance of active load across owners
  const activeLoads = ownerLoad.map((o) => o.totalActive)
  const meanLoad =
    activeLoads.reduce((s, v) => s + v, 0) / Math.max(activeLoads.length, 1)
  const maxOwner = ownerLoad[0]
  const minOwner = ownerLoad[ownerLoad.length - 1]
  const spread = maxOwner.totalActive - minOwner.totalActive

  // 3. Completion pace
  const completed = statusSummary[2].count
  const completionRate = (completed / tasks.length) * 100

  return [
    {
      id: "overdue-pressure",
      label: "Overdue Pressure",
      text:
        overdueCount === 0
          ? `No overdue tasks right now — every active item is within its target date.`
          : overdueShare < 15
            ? `${overdueCount} of ${totalActive} active tasks are overdue (${overdueShare.toFixed(0)}%). The oldest is "${topOverdue.title}" (${topOverdue.daysOverdue}d past due).`
            : `${overdueCount} of ${totalActive} active tasks are overdue (${overdueShare.toFixed(0)}%). Triage the longest-running items first — "${topOverdue.title}" has slipped ${topOverdue.daysOverdue} days.`,
      sentiment:
        overdueCount === 0
          ? "positive"
          : overdueShare < 15
            ? "neutral"
            : "attention",
    },
    {
      id: "workload-balance",
      label: "Workload Balance",
      text:
        spread <= 2
          ? `Active load is evenly distributed — owners hold between ${minOwner.totalActive} and ${maxOwner.totalActive} active tasks (mean ${meanLoad.toFixed(1)}).`
          : `${maxOwner.owner} carries ${maxOwner.totalActive} active tasks while ${minOwner.owner} has ${minOwner.totalActive}. Consider rebalancing — the spread is ${spread} tasks above mean ${meanLoad.toFixed(1)}.`,
      sentiment: spread <= 2 ? "positive" : spread <= 5 ? "neutral" : "attention",
    },
    {
      id: "completion-pace",
      label: "Completion Pace",
      text: `${completed} of ${tasks.length} tasks completed (${completionRate.toFixed(0)}%). ${statusSummary[1].count} remain in progress and ${statusSummary[0].count} have not started.`,
      sentiment:
        completionRate >= 35
          ? "positive"
          : completionRate >= 20
            ? "neutral"
            : "attention",
    },
  ]
}
