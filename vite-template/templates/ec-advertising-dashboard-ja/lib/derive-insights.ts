import {
  adVsOrganic,
  campaignPerformance,
  headerKpis,
  keywordRanking,
} from "@/lib/ec-advertising-dashboard-mock-data"

export interface InsightItem {
  id: "acos-leader" | "organic-mix" | "keyword-spotlight"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ACoS リーダー / 課題キャンペーン
  const best = campaignPerformance[0]
  const worst = campaignPerformance[campaignPerformance.length - 1]
  const avgAcos =
    campaignPerformance.reduce((s, r) => s + r.acos, 0) /
    campaignPerformance.length

  // 2. オーガニック比率の推移 (直近 7 日 vs その前 7 日)
  const last7 = adVsOrganic.slice(-7)
  const prev7 = adVsOrganic.slice(-14, -7)
  const organicShare = (rows: typeof last7) => {
    const ad = rows.reduce((s, d) => s + d.adRevenue, 0)
    const org = rows.reduce((s, d) => s + d.organicRevenue, 0)
    return (org / Math.max(1, ad + org)) * 100
  }
  const last7Organic = organicShare(last7)
  const prev7Organic = organicShare(prev7)
  const organicDelta = last7Organic - prev7Organic

  // 3. キーワードハイライト — CV 最多
  const topKeyword = keywordRanking[0]

  const acosKpi = headerKpis[1]

  return [
    {
      id: "acos-leader",
      label: "ACoS リーダー",
      text: `${best.campaignName} が ACoS ${best.acos.toFixed(1)}% で最も効率的 (ポートフォリオ平均 ${avgAcos.toFixed(1)}% を ${(((avgAcos - best.acos) / avgAcos) * 100).toFixed(0)}% 下回る)。一方で ${worst.campaignName} は ${worst.acos.toFixed(1)}% — 予算配分の見直しを検討。`,
      sentiment: acosKpi.change <= 0 ? "positive" : "neutral",
    },
    {
      id: "organic-mix",
      label: "オーガニック ハロー効果",
      text:
        organicDelta >= 1.5
          ? `オーガニック比率は直近 7 日で ${last7Organic.toFixed(1)}% (前週比 +${organicDelta.toFixed(1)}pt)。広告が自然流入を押し上げ、TACoS は好転傾向。`
          : organicDelta >= -1.5
            ? `オーガニック比率は ${last7Organic.toFixed(1)}% (前 7 日比 ${organicDelta >= 0 ? "+" : ""}${organicDelta.toFixed(1)}pt) で横ばい。TACoS の推移を週次でチェック。`
            : `オーガニック比率は ${last7Organic.toFixed(1)}% まで低下 (前 7 日比 ${organicDelta.toFixed(1)}pt)。広告のカニバリゼーションを疑い、指名系キーワードの入札を再点検。`,
      sentiment:
        organicDelta >= 1.5 ? "positive" : organicDelta >= -1.5 ? "neutral" : "attention",
    },
    {
      id: "keyword-spotlight",
      label: "注目キーワード",
      text: `「${topKeyword.keyword}」(${topKeyword.marketplaceLabel}) が CV ${topKeyword.conversions.toLocaleString("ja-JP")} 件、CPC ¥${topKeyword.cpc.toLocaleString("ja-JP")}、CVR ${topKeyword.cvr.toFixed(1)}% で期間内トップ。`,
      sentiment: "positive",
    },
  ]
}
