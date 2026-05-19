import {
  members,
  overtimeTrend,
  paidLeaveByDept,
  OVERTIME_WARNING,
  OVERTIME_CAUTION,
} from "@/lib/attendance-dashboard-mock-data"

export interface InsightItem {
  id: "overload-risk" | "leave-gap" | "overtime-trend"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Overload risk — members exceeding the warning threshold
  const overWarning = members.filter(
    (m) => m.overtimeHours >= OVERTIME_WARNING,
  )
  const overCaution = members.filter(
    (m) => m.overtimeHours >= OVERTIME_CAUTION,
  )

  // 2. Paid-leave gap — department with the lowest usage rate
  const sortedDept = [...paidLeaveByDept].sort(
    (a, b) => a.usageRatePct - b.usageRatePct,
  )
  const lowest = sortedDept[0]
  const overallUsage =
    paidLeaveByDept.reduce((s, d) => s + d.usedDays, 0) /
    paidLeaveByDept.reduce((s, d) => s + d.grantedDays, 0)
  const overallPct = Math.round(overallUsage * 1000) / 10

  // 3. Overtime trend — last month vs 3-month moving average
  const last = overtimeTrend[overtimeTrend.length - 1]
  const recentWindow = overtimeTrend.slice(-3)
  const recentAvg =
    recentWindow.reduce((s, p) => s + p.averageOvertimePerMember, 0) /
    recentWindow.length
  const trendDelta = last.averageOvertimePerMember - recentAvg

  return [
    {
      id: "overload-risk",
      label: "Overload Risk",
      text:
        overWarning.length > 0
          ? `${overWarning.length} member(s) exceeded ${OVERTIME_WARNING}h of overtime this period — review workloads and follow up with mandatory rest. ${overCaution.length} member(s) are above the ${OVERTIME_CAUTION}h caution line.`
          : overCaution.length > 0
            ? `${overCaution.length} member(s) crossed the ${OVERTIME_CAUTION}h caution line but no one passed the ${OVERTIME_WARNING}h warning line. Keep monitoring weekly.`
            : `Overtime is contained — no member exceeded the ${OVERTIME_CAUTION}h caution line this period.`,
      sentiment:
        overWarning.length > 0
          ? "attention"
          : overCaution.length > 3
            ? "neutral"
            : "positive",
    },
    {
      id: "leave-gap",
      label: "Paid-Leave Gap",
      text: `Company-wide usage is ${overallPct.toFixed(1)}%. ${lowest.departmentLabel} is the lowest at ${lowest.usageRatePct.toFixed(1)}% (${lowest.usedDays.toFixed(1)} / ${lowest.grantedDays} days). Consider encouraging planned leave before fiscal year end.`,
      sentiment:
        overallPct >= 75
          ? "positive"
          : overallPct >= 60
            ? "neutral"
            : "attention",
    },
    {
      id: "overtime-trend",
      label: "Overtime Trend",
      text:
        trendDelta > 1.5
          ? `Average overtime is climbing — last month was +${trendDelta.toFixed(1)}h above the 3-month average. Check for ongoing project crunch or staffing shortages.`
          : trendDelta < -1.5
            ? `Average overtime is easing — last month was ${trendDelta.toFixed(1)}h below the 3-month average.`
            : `Average overtime is stable around the 3-month average (${recentAvg.toFixed(1)}h / member).`,
      sentiment:
        trendDelta > 1.5
          ? "attention"
          : trendDelta < -1.5
            ? "positive"
            : "neutral",
    },
  ]
}
