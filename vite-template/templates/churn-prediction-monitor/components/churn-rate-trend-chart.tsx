import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { ChurnRatePoint } from "@/types/churn-prediction-monitor"

interface ChurnRateTrendChartProps {
  data: ChurnRatePoint[]
}

export function ChurnRateTrendChart({ data }: ChurnRateTrendChartProps) {
  const months = data.map((d) => d.month.slice(2)) // YY-MM

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatPercent(v as number, 2),
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
        name: "Churn %",
        min: 0,
        axisLabel: { formatter: (v: number) => `${v.toFixed(1)}%` },
      },
      {
        type: "value",
        name: "Save %",
        min: 0,
        max: 100,
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
      },
    ],
    series: [
      {
        name: "Churn Rate",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.churnRate),
        areaStyle: { opacity: 0.15 },
      },
      {
        name: "Save Rate",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.saveRate),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Monthly Churn Rate Trend (last 12 months)"
      description="Churn rate alongside save rate from retention plays"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
