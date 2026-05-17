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
        name: "売上",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "成長率",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "当期",
        type: "bar",
        data: data.map((d) => d.current),
        barMaxWidth: 28,
      },
      {
        name: "前期",
        type: "bar",
        data: data.map((d) => d.previous),
        barMaxWidth: 28,
      },
      {
        name: "成長率",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.growth),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="パフォーマンス比較"
      description="当期と前期の比較に成長率を重ねたチャート"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
