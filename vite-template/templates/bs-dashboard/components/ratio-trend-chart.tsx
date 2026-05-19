import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent, formatRatio } from "./chart-helpers"
import type { RatioTrendPoint } from "@/types/bs-dashboard"

interface RatioTrendChartProps {
  data: RatioTrendPoint[]
}

export function RatioTrendChart({ data }: RatioTrendChartProps) {
  const months = data.map((d) => d.month.slice(2))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const items = params as Array<{
          axisValue: string
          seriesName: string
          value: number
          marker: string
        }>
        if (!items.length) return ""
        const header = `<strong>${items[0].axisValue}</strong>`
        const lines = items.map((item) => {
          const formatted =
            item.seriesName === "Debt-to-Equity"
              ? formatRatio(item.value)
              : formatPercent(item.value)
          return `${item.marker} ${item.seriesName}: ${formatted}`
        })
        return [header, ...lines].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "%",
        position: "left",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
      },
      {
        type: "value",
        name: "x",
        position: "right",
        axisLabel: { formatter: (v: number) => v.toFixed(1) },
      },
    ],
    series: [
      {
        name: "Equity Ratio",
        type: "line",
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        data: data.map((d) => Math.round(d.equityRatio * 10) / 10),
      },
      {
        name: "Current Ratio",
        type: "line",
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        data: data.map((d) => Math.round(d.currentRatio * 10) / 10),
      },
      {
        name: "Quick Ratio",
        type: "line",
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => Math.round(d.quickRatio * 10) / 10),
      },
      {
        name: "Debt-to-Equity",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dotted", width: 1.5 },
        data: data.map((d) => Math.round(d.debtToEquity * 100) / 100),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Financial Ratio Trend"
      description="Equity ratio, current ratio, quick ratio (left) and debt-to-equity (right)"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
