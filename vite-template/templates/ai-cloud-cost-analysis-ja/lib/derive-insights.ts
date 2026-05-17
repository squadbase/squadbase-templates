import {
  serviceMonthly,
  modelTokenCost,
  resourceTop,
} from "@/lib/ai-cloud-cost-analysis-mock-data"

export interface InsightItem {
  id: "spend-trajectory" | "ai-share" | "top-resource"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const current = serviceMonthly[serviceMonthly.length - 1]
  const prev = serviceMonthly[serviceMonthly.length - 2]
  const firstMonth = serviceMonthly[0]

  // 1. 直近12ヶ月の総コスト推移
  const annualGrowthPct =
    ((current.total - firstMonth.total) / firstMonth.total) * 100
  const momPct =
    prev.total === 0 ? 0 : ((current.total - prev.total) / prev.total) * 100

  // 2. AIの占有率と AI 前月比
  const aiCurrent =
    current.series.find((s) => s.service === "AI推論 (LLM API)")?.cost ?? 0
  const aiPrev =
    prev.series.find((s) => s.service === "AI推論 (LLM API)")?.cost ?? 0
  const aiShare = (aiCurrent / current.total) * 100
  const aiMoM = aiPrev === 0 ? 0 : ((aiCurrent - aiPrev) / aiPrev) * 100

  const topModel = modelTokenCost[0]
  const totalTokenCost = modelTokenCost.reduce((s, m) => s + m.totalCost, 0)
  const topModelShare = (topModel.totalCost / totalTokenCost) * 100

  // 3. リソース別ホットスポット
  const topResource = resourceTop[0]
  const topResourceShare = (topResource.monthlyCost / current.total) * 100

  return [
    {
      id: "spend-trajectory",
      label: "コスト推移",
      text:
        momPct > 8
          ? `今月のクラウド総コストは ¥${(current.total / 10_000).toFixed(1)}万 (前月比 +${momPct.toFixed(1)}%、年初比 +${annualGrowthPct.toFixed(1)}%)。コミットが膨らむ前に増加要因の特定が必要。`
          : momPct >= -2
            ? `今月のクラウド総コストは ¥${(current.total / 10_000).toFixed(1)}万 (前月比 ${momPct >= 0 ? "+" : ""}${momPct.toFixed(1)}%、年初比 ${annualGrowthPct >= 0 ? "+" : ""}${annualGrowthPct.toFixed(1)}%) — おおむねトレンド通り。`
            : `今月のクラウド総コストは ¥${(current.total / 10_000).toFixed(1)}万 と前月比 ${momPct.toFixed(1)}% の下振れ。データ欠損や停止中ワークロードが原因でないかを確認。`,
      sentiment:
        momPct > 8 ? "attention" : momPct >= -2 ? "neutral" : "positive",
    },
    {
      id: "ai-share",
      label: "AIコスト構成比",
      text: `AI推論は今月の総コストの ${aiShare.toFixed(1)}% (前月比 ${aiMoM >= 0 ? "+" : ""}${aiMoM.toFixed(1)}%)。${topModel.model} 単体で トークンコストの ${topModelShare.toFixed(1)}% を占有 — ルーティング設計とプロンプトキャッシュで増加抑制を検討。`,
      sentiment: aiMoM > 12 ? "attention" : "neutral",
    },
    {
      id: "top-resource",
      label: "最大リソースのホットスポット",
      text: `最大リソースは ${topResource.resourceName} (${topResource.service})。月額 ¥${topResource.monthlyCost.toLocaleString("ja-JP")} で総コストの約 ${topResourceShare.toFixed(1)}%。${topResource.changePct >= 5 ? `前月比 +${topResource.changePct.toFixed(1)}% — 適正化・オートスケール・予約購入の見直しが必要。` : "コストは安定しているが、寄与度が高いため担当者を明確化し四半期レビュー対象に。"}`,
      sentiment: topResource.changePct >= 10 ? "attention" : "neutral",
    },
  ]
}
