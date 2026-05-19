import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { CourseCompletion } from "@/types/learning-progress-dashboard"

interface CourseCompletionRankingProps {
  data: CourseCompletion[]
}

export function CourseCompletionRanking({ data }: CourseCompletionRankingProps) {
  // Ranking: highest completion at top — for horizontal bars, ECharts paints
  // the first category at the bottom, so reverse for natural reading order.
  const sorted = [...data].sort((a, b) => a.completionRate - b.completionRate)
  const names = sorted.map((c) => c.courseName)
  const rates = sorted.map((c) => c.completionRate)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatPercent(v as number),
    },
    grid: { ...getBaseGrid(), left: "1%", right: "8%", bottom: "4%" },
    xAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    yAxis: {
      type: "category",
      data: names,
      axisLabel: { interval: 0 },
    },
    series: [
      {
        name: "Completion rate",
        type: "bar",
        data: rates,
        label: {
          show: true,
          position: "right",
          formatter: (p) => formatPercent(p.value as number),
        },
        barWidth: 14,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Course Completion Ranking"
      description="Completion rate per course — find which courses learners actually finish"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
