import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { DefectRatePoint } from "@/types/production-monitor"

interface DefectRateChartProps {
  data: DefectRatePoint[]
}

export function DefectRateChart({ data }: DefectRateChartProps) {
  const dates = data.map((d) => d.date.slice(5))
  const ucl = data[0]?.ucl ?? 0
  const lcl = data[0]?.lcl ?? 0
  const cl = data[0]?.centerline ?? 0

  const defectSeries = data.map((d) => ({
    value: d.defectRatePct,
    itemStyle: d.isOutOfControl
      ? { color: "hsl(var(--destructive))" }
      : undefined,
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : `${(v as number).toFixed(2)}%`,
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => `${v.toFixed(1)}%` },
    },
    series: [
      {
        name: "Defect rate",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        data: defectSeries,
        areaStyle: { opacity: 0.12 },
      },
      {
        name: "UCL",
        type: "line",
        data: data.map(() => ucl),
        lineStyle: { type: "dashed", width: 1.5 },
        showSymbol: false,
      },
      {
        name: "Centerline",
        type: "line",
        data: data.map(() => cl),
        lineStyle: { type: "dotted", width: 1 },
        showSymbol: false,
      },
      {
        name: "LCL",
        type: "line",
        data: data.map(() => lcl),
        lineStyle: { type: "dashed", width: 1.5 },
        showSymbol: false,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Defect Rate Trend (last 30 days)"
      description="Daily defect rate with statistical control limits (UCL / Centerline / LCL)"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
