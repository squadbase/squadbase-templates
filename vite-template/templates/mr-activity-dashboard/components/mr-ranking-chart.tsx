import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { MrRankingRow } from "@/types/mr-activity-dashboard"

interface MrRankingChartProps {
  data: MrRankingRow[]
}

export function MrRankingChart({ data }: MrRankingChartProps) {
  // Show top 10 in the bar chart (descending order)
  const top = data.slice(0, 10)
  // ECharts inverted bar chart — first item should appear at the top, so reverse for display
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
        name: "Visits",
        type: "bar",
        data: visits,
        barWidth: 12,
      },
      {
        name: "Meetings",
        type: "bar",
        data: meetings,
        barWidth: 12,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="MR Activity Ranking (top 10)"
      description="Visits and successful meetings per MR, ranked by visit volume"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
