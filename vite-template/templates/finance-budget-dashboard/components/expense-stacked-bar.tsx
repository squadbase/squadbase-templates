import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import { COST_CATEGORIES } from "@/lib/finance-budget-mock-data"
import type { ExpenseStackPoint } from "@/types/finance-budget"

interface ExpenseStackedBarProps {
  data: ExpenseStackPoint[]
}

export function ExpenseStackedBar({ data }: ExpenseStackedBarProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) => formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0, type: "scroll" },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.month.slice(5)),
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: COST_CATEGORIES.map((cat) => ({
      name: cat,
      type: "bar",
      stack: "total",
      data: data.map((d) => d.values[cat]),
      emphasis: { focus: "series" },
      barMaxWidth: 36,
    })),
  }

  return (
    <DashboardCardPreset
      title="Monthly Expense by Category"
      description="Stacked bars visualize the breakdown across cost categories"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
