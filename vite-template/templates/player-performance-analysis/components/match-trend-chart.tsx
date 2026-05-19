import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { MatchPerformancePoint } from "@/types/player-performance-analysis"

interface MatchTrendChartProps {
  data: MatchPerformancePoint[]
}

export function MatchTrendChart({ data }: MatchTrendChartProps) {
  const labels = data.map((d) => d.matchLabel)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const arr = params as Array<{
          seriesName: string
          value: number
          dataIndex: number
        }>
        if (!arr.length) return ""
        const idx = arr[0].dataIndex
        const m = data[idx]
        const lines = [
          `<strong>${m.matchLabel} vs ${m.opponent}</strong>`,
          `Date: ${m.date}`,
          `Avg distance: ${(m.avgDistanceM / 1000).toFixed(2)} km`,
          `Avg sprints: ${m.avgSprintCount}`,
          `Avg minutes: ${m.avgMinutesPlayed}`,
          `Condition: ${m.conditionIndex.toFixed(1)}`,
        ]
        return lines.join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "Distance (m)",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Condition",
        min: 0,
        max: 100,
        position: "right",
      },
    ],
    series: [
      {
        name: "Avg Distance",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.avgDistanceM),
        areaStyle: { opacity: 0.15 },
        yAxisIndex: 0,
      },
      {
        name: "Condition Index",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, type: "dashed" },
        data: data.map((d) => d.conditionIndex),
        yAxisIndex: 1,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Match-by-Match Performance"
      description="Squad-average distance and condition index across the last 10 matches"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
