import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { PlanVsActualPoint } from "@/types/production-monitor"

interface PlanVsActualChartProps {
  data: PlanVsActualPoint[]
}

export function PlanVsActualChart({ data }: PlanVsActualChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : `${formatNumber(v as number)} units`,
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Planned",
        type: "line",
        smooth: false,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.plannedQty),
      },
      {
        name: "Actual",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.actualQty),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Plan vs Actual (last 30 days)"
      description="Daily planned vs actual output across all lines"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
