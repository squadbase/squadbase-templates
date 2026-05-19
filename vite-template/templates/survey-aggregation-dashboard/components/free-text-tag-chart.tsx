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
          `Mentions: ${t.count.toLocaleString("en-US")}`,
          `Share: ${(t.share * 100).toFixed(1)}%`,
          `Avg score in this tag: ${formatScore(t.avgScore)} / 5`,
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
      axisLabel: { formatter: (v: number) => v.toLocaleString("en-US") },
    },
    yAxis: {
      type: "category",
      data: [...tags].reverse(),
    },
    series: [
      {
        name: "Mentions",
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
      title="Free-Text Tag Distribution"
      description="Categories extracted from free-text responses, colored by average score within the category"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
