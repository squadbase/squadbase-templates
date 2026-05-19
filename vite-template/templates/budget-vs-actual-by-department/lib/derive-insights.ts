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
      label: "Top Performer",
      text: `"${winner.department}" is at ${winner.achievementPct.toFixed(1)}% of pace, with year-end forecast ${winner.forecastVsBudget >= 0 ? "+" : ""}${winner.forecastVsBudget.toFixed(1)}% vs budget. Reallocate stretch goals here.`,
      sentiment: "positive",
    },
    {
      id: "under-budget",
      label: "Attention Needed",
      text: `"${laggard.department}" is trailing at ${laggard.achievementPct.toFixed(1)}% of pace. Year-end forecast ${laggard.forecastVsBudget >= 0 ? "+" : ""}${laggard.forecastVsBudget.toFixed(1)}% — investigate gaps and adjust plan.`,
      sentiment: laggard.achievementPct < 92 ? "attention" : "neutral",
    },
    {
      id: "pace",
      label: "Company Pace",
      text: `Company-wide cumulative is ${paceVariance >= 0 ? "+" : ""}${paceVariance.toFixed(1)}% vs cumulative budget. ${Math.abs(paceVariance) < 2 ? "On plan." : paceVariance > 0 ? "Ahead of plan." : "Behind plan."}`,
      sentiment:
        paceVariance >= 2 ? "positive" : paceVariance < -2 ? "attention" : "neutral",
    },
  ]
}
