import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { MonthlyAccuracyPoint } from "@/types/demand-forecast-vs-actual"

interface MonthlyAccuracyChartProps {
  data: MonthlyAccuracyPoint[]
}

export function MonthlyAccuracyChart({ data }: MonthlyAccuracyChartProps) {
  const months = data.map((d) => d.month.slice(2)) // yy-mm

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatPercent(v as number),
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
        name: "MAPE / Fill",
        position: "left",
        min: 0,
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
      },
      {
        type: "value",
        name: "Stockout",
        position: "right",
        min: 0,
        axisLabel: { formatter: (v: number) => `${v.toFixed(2)}%` },
      },
    ],
    series: [
      {
        name: "MAPE",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: data.map((d) => d.mape),
        areaStyle: { opacity: 0.15 },
      },
      {
        name: "Fill Rate",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: data.map((d) => d.fillRate),
      },
      {
        name: "Stockout Rate",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        lineStyle: { type: "dashed", width: 2 },
        data: data.map((d) => d.stockoutRate),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Monthly Forecast Accuracy Trend"
      description="MAPE, fill rate, and stockout rate over the last 6 months"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
