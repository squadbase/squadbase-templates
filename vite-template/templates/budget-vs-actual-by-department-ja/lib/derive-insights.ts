import {
  deptTotals,
  cumulative,
} from "@/lib/budget-vs-actual-by-department-mock-data"

export interface InsightItem {
  id: "over-budget" | "under-budget" | "pace"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const sorted = [...deptTotals].sort(
    (a, b) => b.achievementPct - a.achievementPct,
  )
  const winner = sorted[0]
  const laggard = sorted[sorted.length - 1]

  const latest = cumulative[cumulative.length - 1]
  const paceVariance =
    ((latest.actualCum - latest.budgetCum) / latest.budgetCum) * 100

  return [
    {
      id: "over-budget",
      label: "好調部門",
      text: `「${winner.department}」が対ペース ${winner.achievementPct.toFixed(1)}%、着地予測 ${winner.forecastVsBudget >= 0 ? "+" : ""}${winner.forecastVsBudget.toFixed(1)}% (対予算)。ストレッチ目標の再配分余地あり。`,
      sentiment: "positive",
    },
    {
      id: "under-budget",
      label: "要注意部門",
      text: `「${laggard.department}」が対ペース ${laggard.achievementPct.toFixed(1)}% と未達。着地予測 ${laggard.forecastVsBudget >= 0 ? "+" : ""}${laggard.forecastVsBudget.toFixed(1)}% — 差分要因の洗い出しと計画見直しを。`,
      sentiment: laggard.achievementPct < 92 ? "attention" : "neutral",
    },
    {
      id: "pace",
      label: "全社ペース",
      text: `全社累計の対予算ペースは ${paceVariance >= 0 ? "+" : ""}${paceVariance.toFixed(1)}%。${Math.abs(paceVariance) < 2 ? "計画通り。" : paceVariance > 0 ? "計画超過。" : "計画ビハインド。"}`,
      sentiment:
        paceVariance >= 2 ? "positive" : paceVariance < -2 ? "attention" : "neutral",
    },
  ]
}
