import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { BreakdownSlice } from "@/types/ui-template-kpi-chart-advanced"

interface BreakdownChartProps {
  data: BreakdownSlice[]
}

export function BreakdownChart({ data }: BreakdownChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        data: data.map((d) => ({ name: d.segment, value: d.value })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="チャネル構成"
      description="チャネル別の売上分布"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
