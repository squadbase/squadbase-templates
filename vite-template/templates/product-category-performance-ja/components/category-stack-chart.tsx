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
      title="カテゴリ別売上 (直近12ヶ月)"
      description="月次スタック表示で商品カテゴリの構成変化を把握"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
