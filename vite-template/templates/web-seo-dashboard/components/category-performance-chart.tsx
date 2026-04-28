import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getDualAxisGrid, formatNumber, formatPercent } from "./chart-helpers"
import type { CategoryPerformance } from "@/types/web-seo"

interface CategoryPerformanceChartProps {
  data: CategoryPerformance[]
}

export function CategoryPerformanceChart({ data }: CategoryPerformanceChartProps) {
  const categories = data.map((d) => d.category)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: categories,
    },
    yAxis: [
      {
        type: "value",
        name: "Pageviews",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "CVR",
        min: 0,
        max: 10,
        axisLabel: { formatter: (v: number) => formatPercent(v) },
      },
    ],
    series: [
      {
        name: "Pageviews",
        type: "bar",
        barMaxWidth: 48,
        data: data.map((d) => d.pageviews),
      },
      {
        name: "Conversion Rate",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.conversionRate),
        symbol: "circle",
        symbolSize: 8,
      },
    ],
  }

  return (
    <DashboardCardPreset title="Performance by Category">
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
