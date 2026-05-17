import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatScore } from "./chart-helpers"
import type { QuestionAggregation } from "@/types/survey-aggregation-dashboard"

interface QuestionAggregationChartProps {
  data: QuestionAggregation[]
}

export function QuestionAggregationChart({
  data,
}: QuestionAggregationChartProps) {
  const okColor = useEChartsContrastColor("--chart-1")
  const warnColor = useEChartsContrastColor("--chart-4")
  const trackColor = useEChartsContrastColor("--chart-1")

  const sorted = [...data].sort((a, b) => a.avgScore - b.avgScore)
  const labels = sorted.map((q) => q.questionText)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const q = sorted[idx]
        const dist = q.distribution
          .map((c, i) => `${i + 1}: ${c}`)
          .join(" / ")
        return [
          `<strong>${q.questionText}</strong>`,
          `平均スコア: ${formatScore(q.avgScore)} / 5`,
          `回答数: ${q.responseCount.toLocaleString("ja-JP")}`,
          `分布 (1〜5): ${dist}`,
        ].join("<br/>")
      },
    },
    grid: {
      left: "3%",
      right: "8%",
      top: "4%",
      bottom: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      min: 0,
      max: 5,
      axisLabel: { formatter: (v: number) => v.toFixed(1) },
    },
    yAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        width: 220,
        overflow: "truncate",
        interval: 0,
      },
    },
    series: [
      {
        name: "スケール (1〜5)",
        type: "bar",
        barGap: "-100%",
        barMaxWidth: 22,
        silent: true,
        itemStyle: trackColor
          ? { color: withAlpha(trackColor, 0.12), borderRadius: 3 }
          : { borderRadius: 3 },
        data: labels.map(() => 5),
      },
      {
        name: "平均スコア",
        type: "bar",
        barMaxWidth: 14,
        z: 3,
        itemStyle: { borderRadius: 3 },
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }) =>
            formatScore(params.value as number),
        },
        data: sorted.map((q) => ({
          value: q.avgScore,
          itemStyle: {
            color: q.avgScore >= 4 ? okColor : warnColor,
          },
        })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="設問別の平均スコア"
      description="設問ごとの平均スコア (1〜5 段階)、低い順に並び替え"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
