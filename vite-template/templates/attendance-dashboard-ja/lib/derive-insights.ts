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
  // 1. 過重労働リスク: 警告ライン超え人数
  const overWarning = members.filter(
    (m) => m.overtimeHours >= OVERTIME_WARNING,
  )
  const overCaution = members.filter(
    (m) => m.overtimeHours >= OVERTIME_CAUTION,
  )

  // 2. 有給取得ギャップ: 最も取得率が低い部署
  const sortedDept = [...paidLeaveByDept].sort(
    (a, b) => a.usageRatePct - b.usageRatePct,
  )
  const lowest = sortedDept[0]
  const overallUsage =
    paidLeaveByDept.reduce((s, d) => s + d.usedDays, 0) /
    paidLeaveByDept.reduce((s, d) => s + d.grantedDays, 0)
  const overallPct = Math.round(overallUsage * 1000) / 10

  // 3. 残業推移: 直近月 vs 過去3ヶ月平均
  const last = overtimeTrend[overtimeTrend.length - 1]
  const recentWindow = overtimeTrend.slice(-3)
  const recentAvg =
    recentWindow.reduce((s, p) => s + p.averageOvertimePerMember, 0) /
    recentWindow.length
  const trendDelta = last.averageOvertimePerMember - recentAvg

  return [
    {
      id: "overload-risk",
      label: "過重労働リスク",
      text:
        overWarning.length > 0
          ? `今期に残業${OVERTIME_WARNING}h超のメンバーが${overWarning.length}名発生。業務負荷の見直しと休養指示を検討。注意ライン${OVERTIME_CAUTION}h超は${overCaution.length}名。`
          : overCaution.length > 0
            ? `警告ライン${OVERTIME_WARNING}h超は0名。注意ライン${OVERTIME_CAUTION}h超が${overCaution.length}名のため、週次でモニタリング継続を推奨。`
            : `残業は抑制された状態。注意ライン${OVERTIME_CAUTION}h超のメンバーはいません。`,
      sentiment:
        overWarning.length > 0
          ? "attention"
          : overCaution.length > 3
            ? "neutral"
            : "positive",
    },
    {
      id: "leave-gap",
      label: "有給取得ギャップ",
      text: `全社の取得率は ${overallPct.toFixed(1)}%。${lowest.departmentLabel} が最も低く ${lowest.usageRatePct.toFixed(1)}% (${lowest.usedDays.toFixed(1)} / ${lowest.grantedDays} 日)。年度末までの計画的取得を促したい。`,
      sentiment:
        overallPct >= 75
          ? "positive"
          : overallPct >= 60
            ? "neutral"
            : "attention",
    },
    {
      id: "overtime-trend",
      label: "残業時間の推移",
      text:
        trendDelta > 1.5
          ? `直近月の平均残業は3ヶ月平均より +${trendDelta.toFixed(1)}h と増加傾向。プロジェクト繁忙や人員不足の有無を点検したい。`
          : trendDelta < -1.5
            ? `直近月の平均残業は3ヶ月平均より ${trendDelta.toFixed(1)}h 改善。`
            : `平均残業は3ヶ月平均近辺で安定 (${recentAvg.toFixed(1)}h / 人)。`,
      sentiment:
        trendDelta > 1.5
          ? "attention"
          : trendDelta < -1.5
            ? "positive"
            : "neutral",
    },
  ]
}
