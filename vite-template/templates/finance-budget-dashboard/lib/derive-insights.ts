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
      label: "Profit structure health",
      text:
        grossMargin.status === "achieved" && opMargin.status !== "achieved"
          ? `Gross margin ${grossMargin.value} is on target, but operating margin ${opMargin.value} is below plan. Review SG&A for reduction opportunities.`
          : grossMargin.status === "achieved" && opMargin.status === "achieved"
            ? `Gross margin ${grossMargin.value} and operating margin ${opMargin.value} are both at or above target.`
            : `Gross margin ${grossMargin.value} is below target and dragging operating margin ${opMargin.value} down. Cost structure review is urgent.`,
      sentiment:
        grossMargin.status === "achieved" && opMargin.status === "achieved"
          ? "positive"
          : grossMargin.status === "achieved"
            ? "neutral"
            : "attention",
    },
    {
      id: "variance-hotspot",
      label: "Budget variance hotspot",
      text: `${worstDept.department} has the largest variance at ${worstDept.varianceRate > 0 ? "+" : ""}${worstDept.varianceRate.toFixed(1)}%. ${Math.abs(worstDept.varianceRate) > 10 ? "Recommend re-forecasting the quarterly landing within the month." : "Continue monitoring on a monthly basis."}`,
      sentiment:
        Math.abs(worstDept.varianceRate) > 10
          ? "attention"
          : Math.abs(worstDept.varianceRate) > 5
            ? "neutral"
            : "positive",
    },
    {
      id: "cost-structure",
      label: "Cost structure and monitoring",
      text: `Top cost category is "${topCost.category}" (${topCost.percentage.toFixed(1)}%). Company-wide budget attainment is ${OVERALL_ACHIEVEMENT_RATE.toFixed(1)}%, with ${ALERT_COUNT} threshold-breach alerts currently open.`,
      sentiment:
        ALERT_COUNT === 0
          ? "positive"
          : ALERT_COUNT <= 2
            ? "neutral"
            : "attention",
    },
  ]
}
