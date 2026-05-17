import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { AdVsOrganicPoint } from "@/types/ec-advertising-dashboard"

interface AdVsOrganicChartProps {
  data: AdVsOrganicPoint[]
}

export function AdVsOrganicChart({ data }: AdVsOrganicChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined
          ? "-"
          : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: dates,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "広告売上",
        type: "bar",
        stack: "revenue",
        data: data.map((d) => d.adRevenue),
        emphasis: { focus: "series" },
        barMaxWidth: 28,
      },
      {
        name: "オーガニック売上",
        type: "bar",
        stack: "revenue",
        data: data.map((d) => d.organicRevenue),
        emphasis: { focus: "series" },
        barMaxWidth: 28,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="広告売上 vs オーガニック売上 (直近 30 日)"
      description="日次売上を積み上げ、広告経由とオーガニックの割合を可視化"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
