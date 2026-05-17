import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getDualAxisGrid,
  formatCurrency,
  formatNumber,
  formatSignedPercent,
} from "./chart-helpers"
import type { MonthlyTrendPoint } from "@/types/monthly-sales-dashboard"

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const months = data.map((d) => d.yearMonth)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { axisValue: string; dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>${point.yearMonth}</strong>`,
          `売上: ${formatCurrency(point.revenue, { short: true })}`,
          `前年: ${formatCurrency(point.prevYearRevenue, { short: true })}`,
          `YoY: ${formatSignedPercent(point.yoyPct)}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: months,
    },
    yAxis: [
      {
        type: "value",
        name: "売上",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "YoY %",
        min: -20,
        max: 40,
        axisLabel: { formatter: (v: number) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "月次売上",
        type: "bar",
        yAxisIndex: 0,
        barMaxWidth: 36,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: data.map((d) => d.revenue),
      },
      {
        name: "YoY %",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2 },
        data: data.map((d) => d.yoyPct),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="月次売上 & 前年同月比 (直近12ヶ月)"
      description="月次売上バーに前年同月比 (YoY%) 折れ線を重ねて表示"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
