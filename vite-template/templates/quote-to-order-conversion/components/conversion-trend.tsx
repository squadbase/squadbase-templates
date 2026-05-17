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
          `Issued: ${p.issued}`,
          `Won: ${p.won}`,
          `Conversion: ${p.conversionPct.toFixed(1)}%`,
          `Lead time: ${p.avgLeadTimeDays}d`,
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
      name: "Conversion %",
      min: 0,
      max: 50,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Conversion %",
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
      title="Conversion Trend (last 12 months)"
      description="Monthly quote-to-order conversion with hover-revealed quote volume and lead time"
    >
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
