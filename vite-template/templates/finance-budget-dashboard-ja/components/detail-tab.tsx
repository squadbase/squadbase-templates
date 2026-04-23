import { useMemo, useState } from "react"
import { DepartmentFilter } from "./department-filter"
import { CostHeatmapChart } from "./cost-heatmap-chart"
import { CostCategoryDonut } from "./cost-category-donut"
import { MonthlyTrendChart } from "./monthly-trend-chart"
import { BsCompositionChart } from "./bs-composition-chart"
import { ExpenseStackedBar } from "./expense-stacked-bar"
import { BudgetVarianceTable } from "./budget-variance-table"
import {
  costHeatmap,
  monthlyCostTrend,
  expenseStack,
  bsAssets,
  bsLiabilities,
  budgetVariance,
  DEPARTMENTS,
  COST_CATEGORIES,
} from "@/lib/finance-budget-mock-data"
import type { CostCategoryShare, Department } from "@/types/finance-budget"

export function DetailTab() {
  const [selected, setSelected] = useState<Department[]>([...DEPARTMENTS])

  const filteredHeatmap = useMemo(
    () => costHeatmap.filter((c) => selected.includes(c.department)),
    [selected],
  )

  const filteredCategoryShare = useMemo<CostCategoryShare[]>(() => {
    const totals: Record<string, number> = {}
    filteredHeatmap.forEach((c) => {
      totals[c.costCategory] = (totals[c.costCategory] ?? 0) + c.amount
    })
    const sum = Object.values(totals).reduce((s, v) => s + v, 0) || 1
    return COST_CATEGORIES.map((c) => ({
      category: c,
      amount: totals[c] ?? 0,
      percentage: ((totals[c] ?? 0) / sum) * 100,
    }))
      .filter((s) => s.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [filteredHeatmap])

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <DepartmentFilter selected={selected} onChange={setSelected} />
      </aside>

      <div className="lg:col-span-3 space-y-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ExpenseStackedBar data={expenseStack} />
          </div>
          <div className="lg:col-span-2">
            <BsCompositionChart assets={bsAssets} liabilities={bsLiabilities} />
          </div>
        </div>

        <CostHeatmapChart data={filteredHeatmap} />

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CostCategoryDonut data={filteredCategoryShare} />
          </div>
          <div className="lg:col-span-3">
            <MonthlyTrendChart data={monthlyCostTrend} />
          </div>
        </div>

        <BudgetVarianceTable data={budgetVariance} />
      </div>
    </div>
  )
}
