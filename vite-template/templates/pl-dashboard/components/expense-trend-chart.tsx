import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import { EXPENSE_CATEGORIES } from "@/lib/pl-dashboard-mock-data"
import type { ExpenseMonthlyPoint } from "@/types/pl-dashboard"

interface ExpenseTrendChartProps {
  data: ExpenseMonthlyPoint[]
}

// Color palette tracking chart-1..chart-6 (concrete values required for ECharts)
const CATEGORY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#6b7280",
]

export function ExpenseTrendChart({ data }: ExpenseTrendChartProps) {
  const months = data.map((d) => d.month)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined
          ? "-"
          : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0, type: "scroll" },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: EXPENSE_CATEGORIES.map((c, i) => ({
      name: c,
      type: "bar",
      stack: "expense",
      itemStyle: { color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] },
      data: data.map((d) => d.values[c]),
      barMaxWidth: 36,
    })),
  }

  return (
    <DashboardCardPreset
      title="Monthly Cost Trend by Category"
      description="Stacked monthly breakdown of operating expenses by category"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
