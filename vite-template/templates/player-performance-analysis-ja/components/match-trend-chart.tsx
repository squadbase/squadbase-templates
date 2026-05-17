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
          `日付: ${m.date}`,
          `平均走行距離: ${(m.avgDistanceM / 1000).toFixed(2)} km`,
          `平均スプリント: ${m.avgSprintCount} 回`,
          `平均出場時間: ${m.avgMinutesPlayed} 分`,
          `コンディション: ${m.conditionIndex.toFixed(1)}`,
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
        name: "走行距離 (m)",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "コンディション",
        min: 0,
        max: 100,
        position: "right",
      },
    ],
    series: [
      {
        name: "平均走行距離",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.avgDistanceM),
        areaStyle: { opacity: 0.15 },
        yAxisIndex: 0,
      },
      {
        name: "コンディション指標",
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
      title="試合別パフォーマンス推移"
      description="直近10試合のチーム平均走行距離とコンディション指標"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
