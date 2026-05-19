import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { declineReasonLabels } from "@/lib/offer-acceptance-tracking-mock-data"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { DeclineReasonBreakdown } from "@/types/offer-acceptance-tracking"

interface DeclineReasonsChartProps {
  data: DeclineReasonBreakdown[]
}

export function DeclineReasonsChart({ data }: DeclineReasonsChartProps) {
  // Sort descending by count for horizontal bar layout (largest at top)
  const sorted = [...data].sort((a, b) => a.count - b.count)
  const labels = sorted.map((d) => declineReasonLabels[d.reason])
  const counts = sorted.map((d) => d.count)
  const shares = sorted.map((d) => d.share)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const label = labels[idx]
        const count = counts[idx]
        const share = shares[idx]
        return [
          `<strong>${label}</strong>`,
          `Declines: ${count.toLocaleString("en-US")}`,
          `Share: ${share.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      type: "category",
      data: labels,
    },
    series: [
      {
        name: "Declines",
        type: "bar",
        barMaxWidth: 24,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: "right",
          formatter: (params: { dataIndex: number; value: number }) => {
            const share = shares[params.dataIndex] ?? 0
            return `${params.value} (${share.toFixed(1)}%)`
          },
        },
        data: counts,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Decline Reasons"
      description="Distribution of decline reasons — surface the most actionable themes for hiring managers"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
