import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type {
  CategoryMonthPoint,
  Category,
} from "@/types/product-category-performance"
import { CATEGORY_LIST } from "@/lib/product-category-performance-mock-data"

interface CategoryStackChartProps {
  data: CategoryMonthPoint[]
}

export function CategoryStackChart({ data }: CategoryStackChartProps) {
  const months = data.map((d) => d.yearMonth)

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
      data: months,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: CATEGORY_LIST.map((cat: Category) => ({
      name: cat,
      type: "bar",
      stack: "category",
      barMaxWidth: 36,
      data: data.map((d) => d.values[cat]),
    })),
  }

  return (
    <DashboardCardPreset
      title="Revenue by Category (last 12 months)"
      description="Monthly stacked breakdown across product categories"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
