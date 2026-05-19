import {
  categorySummary,
  newVsExisting,
  heatmap,
} from "@/lib/product-category-performance-mock-data"

export interface InsightItem {
  id: "growth-driver" | "new-vs-existing" | "yoy-pattern"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const sorted = [...categorySummary].sort((a, b) => b.yoyChange - a.yoyChange)
  const winner = sorted[0]
  const laggard = sorted[sorted.length - 1]

  const trailing = newVsExisting.slice(-6)
  const avgNewShare =
    trailing.reduce((s, p) => s + p.newContributionPct, 0) / trailing.length
  const trend =
    trailing[trailing.length - 1].newContributionPct -
    trailing[0].newContributionPct

  const negCount = heatmap.filter((c) => c.yoyChange < -5).length
  const posCount = heatmap.filter((c) => c.yoyChange > 5).length

  return [
    {
      id: "growth-driver",
      label: "成長ドライバー",
      text: `「${winner.category}」が +${winner.yoyChange.toFixed(1)}% YoY (構成比 ${winner.shareOfTotal.toFixed(1)}%) で首位、「${laggard.category}」は ${laggard.yoyChange >= 0 ? "+" : ""}${laggard.yoyChange.toFixed(1)}% で劣位。販促・棚割の再配分を検討。`,
      sentiment: "neutral",
    },
    {
      id: "new-vs-existing",
      label: "新商品 vs 既存",
      text: `新商品が直近6ヶ月で平均 ${avgNewShare.toFixed(1)}% を占め、構成比は${trend >= 1 ? "上昇傾向" : trend <= -1 ? "低下傾向" : "横ばい"}。${avgNewShare > 25 ? "イノベーションパイプラインは強い。" : avgNewShare > 15 ? "新陳代謝は妥当な水準。" : "新商品が薄い — 新規投入の強化を検討。"}`,
      sentiment:
        avgNewShare > 25 ? "positive" : avgNewShare < 12 ? "attention" : "neutral",
    },
    {
      id: "yoy-pattern",
      label: "YoY パターン",
      text: `${posCount} のカテゴリ月が +5% 超の YoY、${negCount} が -5% 超の YoY。${posCount > negCount * 1.5 ? "ポートフォリオ全体で成長基調。" : posCount < negCount ? "減少が成長を上回る — 外部要因の点検を推奨。" : "YoY 傾向はまだら模様。"}`,
      sentiment:
        posCount > negCount * 1.5
          ? "positive"
          : negCount > posCount
            ? "attention"
            : "neutral",
    },
  ]
}
