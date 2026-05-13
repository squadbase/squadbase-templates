import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { LineOutputItem } from "@/types/production-monitor"

interface LineOutputChartProps {
  data: LineOutputItem[]
}

export function LineOutputChart({ data }: LineOutputChartProps) {
  const categories = data.map((d) => d.lineName)
  const planned = data.map((d) => d.plannedQty)
  const actual = data.map((d) => d.actualQty)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : `${formatNumber(v as number)} units`,
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { interval: 0 },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Planned",
        type: "bar",
        data: planned,
        barGap: 0,
      },
      {
        name: "Actual",
        type: "bar",
        data: actual,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Output by Line (today)"
      description="Planned vs actual units per production line"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
