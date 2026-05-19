import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { MonthlyCvPoint } from "@/types/affiliate-performance-dashboard"

interface MonthlyCvTrendProps {
  data: MonthlyCvPoint[]
}

export function MonthlyCvTrend({ data }: MonthlyCvTrendProps) {
  const months = data.map((d) => d.month)
  const established = data.map((d) =>
    Math.max(0, d.conversions - d.newMediaConversions),
  )
  const newMedia = data.map((d) => d.newMediaConversions)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatNumber(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Established media",
        type: "line",
        stack: "total",
        smooth: true,
        showSymbol: false,
        data: established,
        areaStyle: { opacity: 0.45 },
      },
      {
        name: "New media",
        type: "line",
        stack: "total",
        smooth: true,
        showSymbol: false,
        data: newMedia,
        areaStyle: { opacity: 0.65 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Monthly Conversions (last 12 months)"
      description="Stacked area splits established vs. new-media contribution"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
