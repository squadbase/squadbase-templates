import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { ForecastPoint } from "@/types/deal-pipeline"

interface ForecastTrendProps {
  data: ForecastPoint[]
}

export function ForecastTrend({ data }: ForecastTrendProps) {
  const months = data.map((d) => d.month)
  const cutoffIdx = data.findIndex((d) => d.closedActual === null)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        const lines = [`<strong>${point.month}</strong>`]
        if (point.closedActual !== null) {
          lines.push(`Closed: ${formatCurrency(point.closedActual, { short: true })}`)
        }
        lines.push(
          `Weighted: ${formatCurrency(point.weightedForecast, { short: true })}`,
        )
        lines.push(
          `Commit: ${formatCurrency(point.commitForecast, { short: true })}`,
        )
        lines.push(`Best: ${formatCurrency(point.bestCase, { short: true })}`)
        lines.push(`Worst: ${formatCurrency(point.worstCase, { short: true })}`)
        return lines.join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Best case",
        type: "line",
        stack: "band-top",
        symbol: "none",
        lineStyle: { opacity: 0 },
        stackStrategy: "all",
        data: data.map((d) => d.worstCase),
      },
      {
        name: "Range",
        type: "line",
        stack: "band-top",
        symbol: "none",
        areaStyle: { opacity: 0.18 },
        lineStyle: { opacity: 0 },
        data: data.map((d) => d.bestCase - d.worstCase),
      },
      {
        name: "Weighted Forecast",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.weightedForecast),
      },
      {
        name: "Closed (Actual)",
        type: "bar",
        barMaxWidth: 26,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.closedActual),
      },
      {
        name: "Forecast Cutoff",
        type: "line",
        silent: true,
        showSymbol: false,
        data: [],
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: "#a3a3a3", type: "dashed" },
          label: { fontSize: 10, formatter: "Today" },
          data: cutoffIdx >= 0 ? [{ xAxis: cutoffIdx - 0.5 }] : [],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Monthly Forecast"
      description="Closed actuals (bars) and forward weighted forecast (line) with best/worst case band"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
