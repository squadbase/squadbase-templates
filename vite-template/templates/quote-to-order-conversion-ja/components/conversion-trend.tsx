import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { ConversionTrendPoint } from "@/types/quote-to-order-conversion"

interface ConversionTrendChartProps {
  data: ConversionTrendPoint[]
}

export function ConversionTrendChart({ data }: ConversionTrendChartProps) {
  const months = data.map((d) => d.month)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const p = data[idx]
        return [
          `<strong>${p.month}</strong>`,
          `見積数: ${p.issued}`,
          `受注数: ${p.won}`,
          `転換率: ${p.conversionPct.toFixed(1)}%`,
          `リードタイム: ${p.avgLeadTimeDays}日`,
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
      name: "転換率 %",
      min: 0,
      max: 50,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "転換率 %",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.18 },
        data: data.map((d) => d.conversionPct),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="転換率の月次推移 (直近12ヶ月)"
      description="月次の見積→受注 転換率。tooltip で見積数・リードタイムも確認"
    >
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
