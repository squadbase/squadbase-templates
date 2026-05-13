import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { MonthlyTrendPoint } from "@/types/quality-defect-tracking"

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const months = data.map((d) => d.month)
  const uclSeries = data.map((d) => d.ucl)
  const lclSeries = data.map((d) => d.lcl)
  const meanSeries = data.map((d) => d.mean)
  const qtySeries = data.map((d) => d.qty)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatNumber(v as number),
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
        name: "不良件数",
        type: "line",
        smooth: false,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2.5 },
        data: qtySeries,
        areaStyle: { opacity: 0.12 },
      },
      {
        name: "平均",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: meanSeries,
      },
      {
        name: "上方管理限界 (+3σ)",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dotted", width: 1.5 },
        data: uclSeries,
      },
      {
        name: "下方管理限界 (-3σ)",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dotted", width: 1.5 },
        data: lclSeries,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="月次不良件数トレンド（直近12か月）"
      description="月次不良件数と長期平均、±3σ の管理限界線"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
