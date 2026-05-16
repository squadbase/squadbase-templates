import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { TrendPoint } from "@/types/ui-template-table-focus"

interface SupportChartProps {
  data: TrendPoint[]
}

export function SupportChart({ data }: SupportChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
    },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "日次合計",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.value),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="日次アクティビティ"
      description="テーブルを補完する日次集計トレンド"
    >
      <EChart option={option} height="220px" />
    </DashboardCardPreset>
  )
}
