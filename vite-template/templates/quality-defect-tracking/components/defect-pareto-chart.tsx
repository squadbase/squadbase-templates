import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber, formatPercent } from "./chart-helpers"
import type { ParetoPoint } from "@/types/quality-defect-tracking"

interface DefectParetoChartProps {
  data: ParetoPoint[]
}

export function DefectParetoChart({ data }: DefectParetoChartProps) {
  const causes = data.map((p) => p.cause)
  const quantities = data.map((p) => p.qty)
  const cumulative = data.map((p) => Number(p.cumulativeShare.toFixed(1)))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as Array<{
          axisValue: string
          seriesName: string
          value: number
          marker: string
        }>
        if (!arr || arr.length === 0) return ""
        const header = `<strong>${arr[0].axisValue}</strong>`
        const lines = arr.map((p) => {
          const isShare = p.seriesName === "Cumulative %"
          const val = isShare
            ? formatPercent(p.value)
            : formatNumber(p.value)
          return `${p.marker} ${p.seriesName}: ${val}`
        })
        return [header, ...lines].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: causes,
      axisLabel: { interval: 0, rotate: 25 },
    },
    yAxis: [
      {
        type: "value",
        name: "Defect qty",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Cumulative %",
        min: 0,
        max: 100,
        axisLabel: { formatter: (v: number): string => `${v}%` },
      },
    ],
    series: [
      {
        name: "Defect quantity",
        type: "bar",
        data: quantities,
        barWidth: "55%",
      },
      {
        name: "Cumulative %",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: cumulative,
        markLine: {
          symbol: "none",
          lineStyle: { type: "dashed" },
          data: [{ yAxis: 80 }],
          label: { formatter: "80%", position: "end" },
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Defect Cause Pareto"
      description="Where to focus countermeasures first — the few causes that drive most defects"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
