import {
  funnel,
  conversionTrend,
  lossReasons,
} from "@/lib/quote-to-order-conversion-mock-data"

export interface InsightItem {
  id: "conversion-trend" | "weakest-step" | "loss-driver"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const recent3 =
    conversionTrend.slice(-3).reduce((s, p) => s + p.conversionPct, 0) / 3
  const prior3 =
    conversionTrend.slice(-6, -3).reduce((s, p) => s + p.conversionPct, 0) / 3
  const delta = recent3 - prior3

  const weakest = [...funnel.slice(1)].sort(
    (a, b) => a.conversionFromPrev - b.conversionFromPrev,
  )[0]

  const topLoss = lossReasons[0]
  const lossTotal = lossReasons.reduce((s, r) => s + r.amount, 0)

  return [
    {
      id: "conversion-trend",
      label: "転換率の推移",
      text: `直近3ヶ月の平均転換率は ${recent3.toFixed(1)}% (前3ヶ月比 ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}pp)。${delta >= 1 ? "勢いあり。" : delta <= -1 ? "低下傾向 — 営業活動の見直しを。" : "横ばい。"}`,
      sentiment: delta >= 1 ? "positive" : delta <= -1 ? "attention" : "neutral",
    },
    {
      id: "weakest-step",
      label: "最弱ステップ",
      text: `最大の脱落は「${weakest.step}」(前ステージから ${weakest.conversionFromPrev.toFixed(1)}%)。この段階で停滞する理由を要分析。`,
      sentiment: "neutral",
    },
    {
      id: "loss-driver",
      label: "失注の主要因",
      text: `「${topLoss.reason}」が失注の ${topLoss.share.toFixed(1)}% (¥${Math.round(topLoss.amount / 10_000).toLocaleString("ja-JP")}万 / 全失注 ¥${Math.round(lossTotal / 10_000).toLocaleString("ja-JP")}万)。${topLoss.reason === "価格" ? "価格柔軟性・バリュー訴求の強化を検討。" : "勝ち負け要因の集中レビューを推奨。"}`,
      sentiment: topLoss.share > 30 ? "attention" : "neutral",
    },
  ]
}
