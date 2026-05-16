import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getDualAxisGrid } from "./chart-helpers"
import type { ComparisonPoint } from "@/types/ui-template-kpi-chart-advanced"

interface ComparisonChartProps {
  data: ComparisonPoint[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined
          ? "-"
          : (v as number) > 100
            ? formatCurrency(v as number, { short: true })
            : `${(v as number).toFixed(1)}%`,
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.period),
    },
    yAxis: [
      {
        type: "value",
        name: "Revenue",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Growth",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Current",
        type: "bar",
        data: data.map((d) => d.current),
        barMaxWidth: 28,
      },
      {
        name: "Previous",
        type: "bar",
        data: data.map((d) => d.previous),
        barMaxWidth: 28,
      },
      {
        name: "Growth %",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.growth),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Performance Comparison"
      description="Current vs. previous period with growth overlay"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
