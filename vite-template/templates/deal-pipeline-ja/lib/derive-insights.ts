import {
  deals,
  stageFunnel,
  forecastTrend,
} from "@/lib/deal-pipeline-mock-data"

export interface InsightItem {
  id: "conversion" | "at-risk" | "forecast"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const weakest = [...stageFunnel.slice(1)].sort(
    (a, b) => a.conversionFromPrev - b.conversionFromPrev,
  )[0]
  const overall =
    (stageFunnel[stageFunnel.length - 1].count / stageFunnel[0].count) * 100

  const atRisk = deals.filter(
    (d) =>
      d.daysToClose <= 14 &&
      d.daysToClose >= 0 &&
      (d.stage === "リード" || d.stage === "適格"),
  )
  const atRiskAmount = atRisk.reduce((s, d) => s + d.amount, 0)

  const upcoming = forecastTrend.filter(
    (p) => p.closedActual === null,
  )[0]
  const target = upcoming ? upcoming.commitForecast * 1.1 : 0
  const gap = upcoming ? target - upcoming.weightedForecast : 0
  const onTrack = upcoming ? upcoming.weightedForecast >= target * 0.95 : true

  return [
    {
      id: "conversion",
      label: "ステージ転換率",
      text: `リード → 受注 までの転換率は ${overall.toFixed(1)}%。最も転換率が低いのは「${weakest.stage}」(${weakest.conversionFromPrev.toFixed(1)}%) — このステージのイネーブルメント強化を。`,
      sentiment:
        overall >= 28 ? "positive" : overall >= 15 ? "neutral" : "attention",
    },
    {
      id: "at-risk",
      label: "要注意案件 (≤14日)",
      text:
        atRisk.length > 0
          ? `2 週間以内クローズ予定の早期ステージ案件が ${atRisk.length} 件 (¥${Math.round(atRiskAmount / 10_000).toLocaleString("ja-JP")}万)。クォリフィケーション活動を加速。`
          : "2 週間以内クローズ予定で早期ステージ滞留の案件は無し — 今週はクリーン。",
      sentiment:
        atRisk.length > 4 ? "attention" : atRisk.length > 0 ? "neutral" : "positive",
    },
    {
      id: "forecast",
      label: "翌月予測",
      text: upcoming
        ? `${upcoming.month} の加重予測は ¥${Math.round(upcoming.weightedForecast / 10_000).toLocaleString("ja-JP")}万 (目標 ¥${Math.round(target / 10_000).toLocaleString("ja-JP")}万) — ${onTrack ? "概ね達成見込み。" : `差分 ¥${Math.round(gap / 10_000).toLocaleString("ja-JP")}万`}。`
        : "将来月の予測データなし。",
      sentiment: onTrack ? "positive" : "attention",
    },
  ]
}
