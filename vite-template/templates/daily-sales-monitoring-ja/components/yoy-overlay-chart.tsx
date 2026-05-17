import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { YoYSalesPoint } from "@/types/daily-sales-monitoring"

interface YoYOverlayChartProps {
  data: YoYSalesPoint[]
}

export function YoYOverlayChart({ data }: YoYOverlayChartProps) {
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
        name: "今年",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.currentRevenue),
        areaStyle: { opacity: 0.18 },
      },
      {
        name: "前年同期",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.prevYearRevenue),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="前年同期比 (直近30日)"
      description="今年と前年同期の日次売上をオーバーレイ"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
