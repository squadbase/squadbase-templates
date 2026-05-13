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
        name: "MAPE / 充足率",
        position: "left",
        min: 0,
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
      },
      {
        type: "value",
        name: "欠品率",
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
        name: "在庫充足率",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: data.map((d) => d.fillRate),
      },
      {
        name: "欠品率",
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
      title="予測精度の月次トレンド"
      description="直近 6 ヶ月の MAPE / 在庫充足率 / 欠品率"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
