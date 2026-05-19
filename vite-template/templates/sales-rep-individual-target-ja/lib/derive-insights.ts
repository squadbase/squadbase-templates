import {
  repAttainments,
  repPaceRows,
  currentMonthMeta,
} from "@/lib/sales-rep-individual-target-mock-data"

export interface InsightItem {
  id: "team-pace" | "top-bottom" | "at-risk"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. チーム全体のペース
  const totalReps = repAttainments.length
  const aheadCount = repAttainments.filter((r) => r.status === "ahead").length
  const onTrackCount = repAttainments.filter((r) => r.status === "on-track").length
  const behindCount = repAttainments.filter((r) => r.status === "behind").length
  const teamAttainment =
    (repAttainments.reduce((s, r) => s + r.actual, 0) /
      repAttainments.reduce((s, r) => s + r.target, 0)) *
    100
  const expectedToDatePct =
    (currentMonthMeta.businessDaysElapsed / currentMonthMeta.businessDaysTotal) * 100
  const teamDelta = teamAttainment - expectedToDatePct

  // 2. トップ / 最下位
  const top = repAttainments[0]
  const bottom = repAttainments[repAttainments.length - 1]

  // 3. ペース遅れの担当者
  const atRisk = repPaceRows[0]
  const atRiskCount = repPaceRows.filter((r) => r.status === "behind").length

  return [
    {
      id: "team-pace",
      label: "チーム全体のペース",
      text: `${totalReps} 名のうち先行 ${aheadCount} 名 / 順調 ${onTrackCount} 名 / 遅れ ${behindCount} 名。チーム達成率は ${teamAttainment.toFixed(1)}% (期待値 ${expectedToDatePct.toFixed(0)}%) で、ストレートライン目標に対し ${teamDelta >= 0 ? "+" : ""}${teamDelta.toFixed(1)} pt。残営業日 ${currentMonthMeta.businessDaysRemaining} 日。`,
      sentiment: teamDelta >= 2 ? "positive" : teamDelta >= -2 ? "neutral" : "attention",
    },
    {
      id: "top-bottom",
      label: "トップ / ボトムパフォーマー",
      text: `${top.salesRep} がトップで達成率 ${top.attainmentPct.toFixed(1)}% (残目標 ¥${Math.round(top.remaining).toLocaleString("ja-JP")})。一方、${bottom.salesRep} は ${bottom.attainmentPct.toFixed(1)}% で、差分は ${(top.attainmentPct - bottom.attainmentPct).toFixed(1)} pt。月末に向けてペアコーチングの検討余地あり。`,
      sentiment: "neutral",
    },
    {
      id: "at-risk",
      label: "要注意担当者",
      text:
        atRiskCount === 0
          ? `ペース遅れの担当者はいません。残営業日 ${currentMonthMeta.businessDaysRemaining} 日、現状の勢いを維持してください。`
          : `必要日次平均を 5 pt 以上下回る担当者が ${atRiskCount} 名います。${atRisk.salesRep} は到達に ¥${Math.round(atRisk.requiredDailyAvg).toLocaleString("ja-JP")}/日 が必要 (実績平均は ¥${Math.round(atRisk.actualDailyAvg).toLocaleString("ja-JP")}/日)。`,
      sentiment: atRiskCount === 0 ? "positive" : "attention",
    },
  ]
}
