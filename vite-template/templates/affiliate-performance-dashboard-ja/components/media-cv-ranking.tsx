import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber, formatCurrency, formatRoas } from "./chart-helpers"
import type { MediaSummary } from "@/types/affiliate-performance-dashboard"

interface MediaCvRankingProps {
  data: MediaSummary[]
}

export function MediaCvRanking({ data }: MediaCvRankingProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const accentColor = useEChartsContrastColor("--chart-2")

  const sorted = [...data].sort((a, b) => b.conversions - a.conversions)
  const categories = sorted.map((r) => `${r.mediaName} / ${r.asp}`)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const row = sorted[idx]
        return [
          `<strong>${row.mediaName}</strong>`,
          `ASP: ${row.asp}${row.isNew ? " (新規)" : ""}`,
          `CV数: ${formatNumber(row.conversions)}`,
          `支出: ${formatCurrency(row.spend, { short: true })}`,
          `売上: ${formatCurrency(row.revenue, { short: true })}`,
          `ROAS: ${formatRoas(row.roas)}`,
        ].join("<br/>")
      },
    },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "6%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true,
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: "CV数",
        type: "bar",
        data: sorted.map((row) => ({
          value: row.conversions,
          itemStyle:
            row.isNew && accentColor
              ? { color: withAlpha(accentColor, 0.85), borderRadius: [0, 4, 4, 0] }
              : baseColor
                ? { color: withAlpha(baseColor, 0.8), borderRadius: [0, 4, 4, 0] }
                : { borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: "62%",
        label: {
          show: true,
          position: "right",
          formatter: (p: { value: number }) => formatNumber(p.value),
          fontSize: 11,
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="媒体／ASP別CVランキング"
      description="媒体×ASP別のCV数。新規媒体はハイライト表示。"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
