import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency } from "./chart-helpers"
import type { MarginTrendPoint } from "@/types/gross-margin-monitoring"

interface MarginTrendChartProps {
  data: MarginTrendPoint[]
}

export function MarginTrendChart({ data }: MarginTrendChartProps) {
  const months = data.map((d) => d.month)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>${point.month}</strong>`,
          `粗利率: ${point.marginPct.toFixed(1)}%`,
          `売上: ${formatCurrency(point.revenue, { short: true })}`,
          `原価: ${formatCurrency(point.cogs, { short: true })}`,
          `粗利額: ${formatCurrency(point.grossProfit, { short: true })}`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 60,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "粗利率 %",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.18 },
        data: data.map((d) => d.marginPct),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="粗利率の月次推移 (直近12ヶ月)"
      description="粗利率の月次推移。tooltip に売上・原価・粗利額を併記"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
