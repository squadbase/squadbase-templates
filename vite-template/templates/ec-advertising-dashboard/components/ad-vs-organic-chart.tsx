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
        name: "Ad Revenue",
        type: "bar",
        stack: "revenue",
        data: data.map((d) => d.adRevenue),
        emphasis: { focus: "series" },
        barMaxWidth: 28,
      },
      {
        name: "Organic Revenue",
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
      title="Ad vs. Organic Revenue (last 30 days)"
      description="Stacked daily revenue split shows total topline and how much is ad-driven vs organic"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
