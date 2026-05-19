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
  // 1. Availability risk — worst equipment
  const worst = equipmentUptime[0] // already sorted ascending by uptime
  const fleetKpi = headerKpis[0]
  const fleetPct = parseFloat(fleetKpi.value)

  // 2. PM backlog — count of overdue tasks
  const overdueTasks = preventiveMaintenanceTasks.filter(
    (t) => t.status === "overdue",
  )
  const overdueCount = overdueTasks.length
  const oldestOverdue = overdueTasks.reduce(
    (acc, t) => (t.daysOffset < acc ? t.daysOffset : acc),
    0,
  )

  // 3. Failure trend — 3-month vs prior 3-month delta
  const last3 = failureTrend.slice(-3).reduce((s, m) => s + m.failureCount, 0)
  const prior3 = failureTrend
    .slice(-6, -3)
    .reduce((s, m) => s + m.failureCount, 0)
  const failureDelta = prior3 === 0 ? 0 : ((last3 - prior3) / prior3) * 100

  return [
    {
      id: "availability-risk",
      label: "Availability Risk",
      text:
        worst.uptimePct < 90
          ? `Fleet availability is ${fleetPct.toFixed(1)}%, but ${worst.name} is trailing at ${worst.uptimePct.toFixed(1)}% with ${worst.failureCount} failures this period. Prioritise a deep-dive on this asset.`
          : `Fleet availability is ${fleetPct.toFixed(1)}%. ${worst.name} is the lowest performer at ${worst.uptimePct.toFixed(1)}% — still within healthy range but worth monitoring.`,
      sentiment: worst.uptimePct < 90 ? "attention" : "neutral",
    },
    {
      id: "pm-backlog",
      label: "PM Backlog",
      text:
        overdueCount === 0
          ? "No preventive-maintenance tasks are overdue. Keep the cadence going."
          : `${overdueCount} preventive-maintenance task${overdueCount === 1 ? " is" : "s are"} overdue (oldest by ${Math.abs(oldestOverdue)} day${Math.abs(oldestOverdue) === 1 ? "" : "s"}). Each day of slippage raises the risk of unplanned downtime.`,
      sentiment:
        overdueCount === 0
          ? "positive"
          : overdueCount <= 2
            ? "neutral"
            : "attention",
    },
    {
      id: "failure-trend",
      label: "Failure Trend",
      text:
        failureDelta <= -5
          ? `Failures in the last 3 months are ${Math.abs(failureDelta).toFixed(1)}% below the prior 3-month window — reliability work is paying off.`
          : failureDelta >= 5
            ? `Failures in the last 3 months are +${failureDelta.toFixed(1)}% vs the prior 3-month window. Review root-cause clusters before next month's PM plan.`
            : `Failures are stable (${failureDelta >= 0 ? "+" : ""}${failureDelta.toFixed(1)}% vs prior 3 months). Maintain the current PM cadence.`,
      sentiment:
        failureDelta <= -5
          ? "positive"
          : failureDelta >= 5
            ? "attention"
            : "neutral",
    },
  ]
}
