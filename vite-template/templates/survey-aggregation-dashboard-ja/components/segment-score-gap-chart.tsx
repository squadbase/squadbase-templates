import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatScore } from "./chart-helpers"
import type { SegmentScore } from "@/types/survey-aggregation-dashboard"

interface SegmentScoreGapChartProps {
  data: SegmentScore[]
}

export function SegmentScoreGapChart({ data }: SegmentScoreGapChartProps) {
  const positive = useEChartsContrastColor("--chart-1")
  const negative = useEChartsContrastColor("--chart-4")

  const sorted = [...data].sort((a, b) => a.deltaVsOverall - b.deltaVsOverall)
  const labels = sorted.map((s) => s.segmentLabel)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const s = sorted[idx]
        return [
          `<strong>${s.segmentLabel}</strong>`,
          `平均スコア: ${formatScore(s.avgScore)} / 5`,
          `全体平均との差: ${s.deltaVsOverall >= 0 ? "+" : ""}${formatScore(s.deltaVsOverall)}`,
          `回答数: ${s.responseCount.toLocaleString("ja-JP")}`,
        ].join("<br/>")
      },
    },
    grid: {
      left: "3%",
      right: "10%",
      top: "4%",
      bottom: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`,
      },
    },
    yAxis: {
      type: "category",
      data: labels,
    },
    series: [
      {
        name: "全体平均との差",
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { borderRadius: 3 },
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }) =>
            `${params.value >= 0 ? "+" : ""}${formatScore(params.value as number)}`,
        },
        data: sorted.map((s) => ({
          value: s.deltaVsOverall,
          itemStyle: {
            color: s.deltaVsOverall >= 0 ? positive : negative,
          },
        })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="属性別スコア差"
      description="各セグメントの平均スコアを全体平均からの差分として可視化"
    >
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
