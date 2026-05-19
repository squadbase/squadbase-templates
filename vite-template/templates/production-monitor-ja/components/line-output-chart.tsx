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
        v === null || v === undefined ? "-" : `${formatNumber(v as number)}個`,
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
        name: "計画",
        type: "bar",
        data: planned,
        barGap: 0,
      },
      {
        name: "実績",
        type: "bar",
        data: actual,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="ライン別生産実績 (本日)"
      description="ライン別の計画 vs 実績生産数"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
