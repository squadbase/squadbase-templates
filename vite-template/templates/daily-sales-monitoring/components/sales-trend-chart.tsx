import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { DailySalesPoint } from "@/types/daily-sales-monitoring"

interface SalesTrendChartProps {
  data: DailySalesPoint[]
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number),
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
        name: "Daily Sales",
        type: "line",
        smooth: false,
        showSymbol: false,
        data: data.map((d) => d.revenue),
        areaStyle: { opacity: 0.15 },
      },
      {
        name: "7-day Moving Avg",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.movingAvg7),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Daily Sales (last 30 days)"
      description="Daily revenue with 7-day moving average"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
