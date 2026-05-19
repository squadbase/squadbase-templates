import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import { EXPENSE_CATEGORIES } from "@/lib/pl-dashboard-mock-data"
import type { ExpenseMonthlyPoint } from "@/types/pl-dashboard"

interface ExpenseTrendChartProps {
  data: ExpenseMonthlyPoint[]
}

// chart-1..chart-6 に近い具体値 (ECharts には CSS 変数を直接渡せないため)
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
      title="費用カテゴリ別の月次推移"
      description="営業費用を月次でカテゴリ別に積み上げ表示"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
