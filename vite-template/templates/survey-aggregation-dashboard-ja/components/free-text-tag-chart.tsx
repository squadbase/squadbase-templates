import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatScore } from "./chart-helpers"
import type { FreeTextTag } from "@/types/survey-aggregation-dashboard"

interface FreeTextTagChartProps {
  data: FreeTextTag[]
}

export function FreeTextTagChart({ data }: FreeTextTagChartProps) {
  const accent = useEChartsContrastColor("--chart-1")
  const warn = useEChartsContrastColor("--chart-4")

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const tags = sorted.map((t) => t.tag)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const t = sorted[idx]
        return [
          `<strong>${t.tag}</strong>`,
          `言及件数: ${t.count.toLocaleString("ja-JP")}`,
          `構成比: ${(t.share * 100).toFixed(1)}%`,
          `このタグの平均スコア: ${formatScore(t.avgScore)} / 5`,
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
      axisLabel: { formatter: (v: number) => v.toLocaleString("ja-JP") },
    },
    yAxis: {
      type: "category",
      data: [...tags].reverse(),
    },
    series: [
      {
        name: "言及件数",
        type: "bar",
        barMaxWidth: 18,
        itemStyle: { borderRadius: 3 },
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number; dataIndex: number }) => {
            const reversedIdx = sorted.length - 1 - params.dataIndex
            const t = sorted[reversedIdx]
            return `${(t.share * 100).toFixed(0)}%`
          },
        },
        data: [...sorted].reverse().map((t) => ({
          value: t.count,
          itemStyle: {
            color: t.avgScore >= 3.8 ? accent : warn,
          },
        })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="自由記述のタグ分布"
      description="自由記述から抽出したタグ分布。タグ内の平均スコアで色分け"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
