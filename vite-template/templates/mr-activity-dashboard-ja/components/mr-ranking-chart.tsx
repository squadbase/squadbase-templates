import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { MrRankingRow } from "@/types/mr-activity-dashboard"

interface MrRankingChartProps {
  data: MrRankingRow[]
}

export function MrRankingChart({ data }: MrRankingChartProps) {
  // 上位10名を表示 (バー: 訪問件数 / 面談数)
  const top = data.slice(0, 10)
  // ECharts 横棒は配列の末尾が上に並ぶため、表示用に反転
  const display = [...top].reverse()
  const names = display.map((r) => r.mrName)
  const visits = display.map((r) => r.visits)
  const meetings = display.map((r) => r.meetings)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) => formatNumber(v as number),
    },
    legend: { bottom: 0 },
    grid: { ...getBaseGrid(), left: "4%", right: "6%" },
    xAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      type: "category",
      data: names,
    },
    series: [
      {
        name: "訪問件数",
        type: "bar",
        data: visits,
        barWidth: 12,
      },
      {
        name: "面談数",
        type: "bar",
        data: meetings,
        barWidth: 12,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="MR別活動量ランキング (上位10名)"
      description="訪問件数の多い順に並んだ MR ごとの訪問・面談数"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
