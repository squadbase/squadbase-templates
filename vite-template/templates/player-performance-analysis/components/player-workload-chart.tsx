import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { PlayerWorkloadRow } from "@/types/player-performance-analysis"

interface PlayerWorkloadChartProps {
  data: PlayerWorkloadRow[]
}

export function PlayerWorkloadChart({ data }: PlayerWorkloadChartProps) {
  // Sort descending by distance for a clear ranking read
  const sorted = [...data].sort((a, b) => b.distanceM - a.distanceM)
  const labels = sorted.map((r) => r.playerName)
  const distanceKm = sorted.map((r) => Math.round((r.distanceM / 1000) * 100) / 100)
  const sprints = sorted.map((r) => r.sprintCount)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as Array<{
          seriesName: string
          value: number
          dataIndex: number
        }>
        if (!arr.length) return ""
        const idx = arr[0].dataIndex
        const row = sorted[idx]
        const lines = [
          `<strong>${row.playerName} (${row.position})</strong>`,
          `Distance: ${(row.distanceM / 1000).toFixed(2)} km`,
          `Sprints: ${row.sprintCount}`,
          `Minutes: ${row.minutesPlayed}`,
        ]
        return lines.join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: { ...getBaseGrid(), left: "12%" },
    xAxis: [
      {
        type: "value",
        position: "bottom",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
    ],
    yAxis: {
      type: "category",
      data: labels,
      inverse: true,
    },
    series: [
      {
        name: "Distance (km)",
        type: "bar",
        data: distanceKm,
        barGap: 0,
      },
      {
        name: "Sprints",
        type: "bar",
        data: sprints,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Player Workload"
      description="Per-player running distance and sprint count, ranked by distance"
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
