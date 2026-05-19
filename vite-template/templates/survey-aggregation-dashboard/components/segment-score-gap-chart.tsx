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
          `Average score: ${formatScore(s.avgScore)} / 5`,
          `Delta vs overall: ${s.deltaVsOverall >= 0 ? "+" : ""}${formatScore(s.deltaVsOverall)}`,
          `Responses: ${s.responseCount.toLocaleString("en-US")}`,
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
        name: "Delta vs overall",
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
      title="Segment Score Gap"
      description="Each segment's average score expressed as delta from overall average"
    >
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
