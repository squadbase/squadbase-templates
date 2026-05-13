import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { CourseCompletion } from "@/types/learning-progress-dashboard"

interface CourseCompletionRankingProps {
  data: CourseCompletion[]
}

export function CourseCompletionRanking({ data }: CourseCompletionRankingProps) {
  // 横棒チャートは ECharts が先頭カテゴリを下に描くため、自然な並び (上=高い) に
  // するには昇順ソートしておく。
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
        name: "受講完了率",
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
      title="コース別完了率ランキング"
      description="どのコースが最後まで受講されているかをコース単位で可視化"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
