import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { TestScoreBin } from "@/types/learning-progress-dashboard"

interface TestScoreDistributionProps {
  data: TestScoreBin[]
}

export function TestScoreDistribution({ data }: TestScoreDistributionProps) {
  const passColor = useEChartsContrastColor("--chart-1")
  const failColor = useEChartsContrastColor("--chart-4")

  const ranges = data.map((b) => b.range)
  const passedValues = data.map((b) => (b.passed ? b.count : 0))
  const failedValues = data.map((b) => (b.passed ? 0 : b.count))

  const total = data.reduce((s, b) => s + b.count, 0)
  const passed = data.filter((b) => b.passed).reduce((s, b) => s + b.count, 0)
  const passRate = total > 0 ? (passed / total) * 100 : 0

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { axisValue: string; value: number; seriesName: string }[]
        if (!Array.isArray(arr) || arr.length === 0) return ""
        const score = arr[0].axisValue
        const sum = arr.reduce((s, p) => s + (p.value || 0), 0)
        const share = total > 0 ? (sum / total) * 100 : 0
        return [
          `<strong>Score ${score}</strong>`,
          `Attempts: ${sum.toLocaleString("en-US")}`,
          `Share: ${share.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: ranges,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => v.toLocaleString("en-US") },
    },
    series: [
      {
        name: "Failed",
        type: "bar",
        stack: "scores",
        data: failedValues,
        itemStyle: failColor ? { color: withAlpha(failColor, 0.85) } : undefined,
      },
      {
        name: "Passed",
        type: "bar",
        stack: "scores",
        data: passedValues,
        itemStyle: passColor ? { color: withAlpha(passColor, 0.95) } : undefined,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Test Score Distribution"
      description={`Pass / fail mix across score bands — overall pass rate ${passRate.toFixed(1)}% (pass line 70)`}
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
