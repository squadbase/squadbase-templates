import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { SalesTrendPoint } from "@/types/sales-revenue"

interface SalesTrendChartProps {
  data: SalesTrendPoint[]
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => formatCurrency(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "売上",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.revenue),
        areaStyle: { opacity: 0.15 },
      },
      {
        name: "目標",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.target),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="売上推移"
      description="日次売上と目標の推移 (直近90日)"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
