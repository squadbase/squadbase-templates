import {
  headerKpis,
  lineOutputToday,
  defectRateTrend,
  planVsActualSeries,
} from "@/lib/production-monitor-mock-data"

export interface InsightItem {
  id: "attainment-snapshot" | "line-spotlight" | "defect-control"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 計画達成サマリー — 当日と直近 7 日の達成状況
  const attainmentKpi = headerKpis[1]
  const last7 = planVsActualSeries.slice(-7)
  const plannedSum7 = last7.reduce((s, d) => s + d.plannedQty, 0)
  const actualSum7 = last7.reduce((s, d) => s + d.actualQty, 0)
  const attain7 = (actualSum7 / plannedSum7) * 100

  // 2. ライン別ハイライト — 当日達成率の最高/最低ライン
  const sortedByAttain = [...lineOutputToday].sort(
    (a, b) => b.attainmentPct - a.attainmentPct,
  )
  const bestLine = sortedByAttain[0]
  const worstLine = sortedByAttain[sortedByAttain.length - 1]

  // 3. 不良率の管理状況 — 管理外データ点・トレンド
  const ooc = defectRateTrend.filter((p) => p.isOutOfControl)
  const recent7 = defectRateTrend.slice(-7).map((p) => p.defectRatePct)
  const prev7 = defectRateTrend.slice(-14, -7).map((p) => p.defectRatePct)
  const recent7Avg = recent7.reduce((s, v) => s + v, 0) / recent7.length
  const prev7Avg = prev7.reduce((s, v) => s + v, 0) / prev7.length
  const defectDelta = recent7Avg - prev7Avg
  const latest = defectRateTrend[defectRateTrend.length - 1]

  return [
    {
      id: "attainment-snapshot",
      label: "計画達成サマリー",
      text: `当日の達成率は ${attainmentKpi.value}、直近 7 日の平均は ${attain7.toFixed(1)}% です。${
        attain7 >= 98
          ? "計画通りに進捗中 — 段取り替えのボトルネックには引き続き注意。"
          : attain7 >= 92
            ? "計画にわずかに遅れ。要員配置と部材供給の見直しを推奨。"
            : "計画から大きく遅れ — シフトリーダーへ即時エスカレーションが必要です。"
      }`,
      sentiment:
        attain7 >= 98 ? "positive" : attain7 >= 92 ? "neutral" : "attention",
    },
    {
      id: "line-spotlight",
      label: "ライン別ハイライト",
      text: `${bestLine.lineName} が ${bestLine.attainmentPct.toFixed(1)}% でトップ、${worstLine.lineName} が ${worstLine.attainmentPct.toFixed(1)}% で最下位です。要因として工具・要員・前工程の供給を中心に差を確認してください。`,
      sentiment: worstLine.attainmentPct < 85 ? "attention" : "neutral",
    },
    {
      id: "defect-control",
      label: "不良率の管理状況",
      text: ooc.length > 0
        ? `直近 30 日のうち ${ooc.length} 日が管理限界を逸脱 (UCL ${latest.ucl.toFixed(2)}% / LCL ${latest.lcl.toFixed(2)}%)。直近 7 日は前週比 ${defectDelta >= 0 ? "+" : ""}${defectDelta.toFixed(2)}pp で推移しており、原因分析の実施を推奨します。`
        : `不良率は統計的に管理状態内 (UCL ${latest.ucl.toFixed(2)}% / LCL ${latest.lcl.toFixed(2)}%)。直近 7 日は前週比 ${defectDelta >= 0 ? "+" : ""}${defectDelta.toFixed(2)}pp で推移しています。`,
      sentiment:
        ooc.length > 0 ? "attention" : defectDelta <= 0 ? "positive" : "neutral",
    },
  ]
}
