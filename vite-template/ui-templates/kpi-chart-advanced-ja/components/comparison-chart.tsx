import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { formatNumber, getDualAxisGrid } from "./chart-helpers"
import type { ComparisonPoint } from "@/types/ui-template-kpi-chart-advanced"

interface ComparisonChartProps {
  data: ComparisonPoint[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.period),
    },
    yAxis: [
      {
        type: "value",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "系列A",
        type: "bar",
        data: data.map((d) => d.current),
        barMaxWidth: 28,
      },
      {
        name: "系列B",
        type: "bar",
        data: data.map((d) => d.previous),
        barMaxWidth: 28,
      },
      {
        name: "系列C",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.growth),
      },
    ],
  }

  return <EChart option={option} height="320px" />
}
