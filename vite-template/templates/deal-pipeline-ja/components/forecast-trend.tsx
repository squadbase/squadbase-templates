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
          lines.push(`受注実績: ${formatCurrency(point.closedActual, { short: true })}`)
        }
        lines.push(`加重予測: ${formatCurrency(point.weightedForecast, { short: true })}`)
        lines.push(`コミット: ${formatCurrency(point.commitForecast, { short: true })}`)
        lines.push(`ベスト: ${formatCurrency(point.bestCase, { short: true })}`)
        lines.push(`ワースト: ${formatCurrency(point.worstCase, { short: true })}`)
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
        name: "ワースト",
        type: "line",
        stack: "band-top",
        symbol: "none",
        lineStyle: { opacity: 0 },
        stackStrategy: "all",
        data: data.map((d) => d.worstCase),
      },
      {
        name: "幅",
        type: "line",
        stack: "band-top",
        symbol: "none",
        areaStyle: { opacity: 0.18 },
        lineStyle: { opacity: 0 },
        data: data.map((d) => d.bestCase - d.worstCase),
      },
      {
        name: "加重予測",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.weightedForecast),
      },
      {
        name: "受注実績",
        type: "bar",
        barMaxWidth: 26,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.closedActual),
      },
      {
        name: "予測カットオフ",
        type: "line",
        silent: true,
        showSymbol: false,
        data: [],
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: "#a3a3a3", type: "dashed" },
          label: { fontSize: 10, formatter: "現在" },
          data: cutoffIdx >= 0 ? [{ xAxis: cutoffIdx - 0.5 }] : [],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="月次受注見込みの予測"
      description="受注実績バーと将来月の加重予測ライン、ベスト/ワースト案を帯で表示"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
