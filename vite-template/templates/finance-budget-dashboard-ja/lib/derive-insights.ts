import {
  financeKpis,
  budgetVariance,
  costCategoryShare,
  OVERALL_ACHIEVEMENT_RATE,
  ALERT_COUNT,
} from "@/lib/finance-budget-mock-data"

export interface InsightItem {
  id: string
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const grossMargin = financeKpis.find((k) => k.id === "gross-margin")!
  const opMargin = financeKpis.find((k) => k.id === "operating-margin")!

  const worstDept = [...budgetVariance].sort(
    (a, b) => Math.abs(b.varianceRate) - Math.abs(a.varianceRate),
  )[0]

  const topCost = costCategoryShare[0]

  return [
    {
      id: "profit-health",
      label: "利益構造の健全性",
      text:
        grossMargin.status === "achieved" && opMargin.status !== "achieved"
          ? `粗利率 ${grossMargin.value} は目標達成も、営業利益率 ${opMargin.value} は未達。販管費の抑制余地を確認してください`
          : grossMargin.status === "achieved" && opMargin.status === "achieved"
            ? `粗利率 ${grossMargin.value} / 営業利益率 ${opMargin.value} ともに目標水準を確保`
            : `粗利率 ${grossMargin.value} が目標を下回り、営業利益率 ${opMargin.value} に波及。原価構造の見直しが急務`,
      sentiment:
        grossMargin.status === "achieved" && opMargin.status === "achieved"
          ? "positive"
          : grossMargin.status === "achieved"
            ? "neutral"
            : "attention",
    },
    {
      id: "variance-hotspot",
      label: "予実の乖離ホットスポット",
      text: `${worstDept.department}の予実乖離が ${worstDept.varianceRate > 0 ? "+" : ""}${worstDept.varianceRate.toFixed(1)}% と最大。${Math.abs(worstDept.varianceRate) > 10 ? "当月中の四半期着地再予測を推奨" : "月次での継続モニタリングを推奨"}`,
      sentiment:
        Math.abs(worstDept.varianceRate) > 10
          ? "attention"
          : Math.abs(worstDept.varianceRate) > 5
            ? "neutral"
            : "positive",
    },
    {
      id: "cost-structure",
      label: "コスト構造と監視状況",
      text: `最大費目は「${topCost.category}」(${topCost.percentage.toFixed(1)}%)。全社予実達成率は ${OVERALL_ACHIEVEMENT_RATE.toFixed(1)}%、閾値超過アラートは ${ALERT_COUNT} 件を検知中`,
      sentiment:
        ALERT_COUNT === 0
          ? "positive"
          : ALERT_COUNT <= 2
            ? "neutral"
            : "attention",
    },
  ]
}
