import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getDualAxisGrid,
  formatCurrency,
  formatNumber,
} from "./chart-helpers"
import type { DailySpendConvPoint } from "@/types/ad-roas-cpa-dashboard"

interface SpendVsConversionsChartProps {
  data: DailySpendConvPoint[]
}

export function SpendVsConversionsChart({ data }: SpendVsConversionsChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown): string => {
        const arr = params as { axisValue: string; dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>${point.date}</strong>`,
          `Spend: ${formatCurrency(point.spend)}`,
          `Conversions: ${point.conversions.toLocaleString("en-US")}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "Spend",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Conversions",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Daily Spend",
        type: "line",
        yAxisIndex: 0,
        smooth: false,
        showSymbol: false,
        areaStyle: { opacity: 0.15 },
        data: data.map((d) => d.spend),
      },
      {
        name: "Conversions",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.conversions),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Daily Spend vs. Conversions (last 30 days)"
      description="Track spend pacing against conversion volume on a dual-axis view"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
