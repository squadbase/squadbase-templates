import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatHoursShort } from "./chart-helpers"
import type { OvertimeTrendPoint } from "@/types/attendance-dashboard"

interface OvertimeTrendChartProps {
  data: OvertimeTrendPoint[]
}

export function OvertimeTrendChart({ data }: OvertimeTrendChartProps) {
  const months = data.map((d) => d.month.slice(2)) // YY-MM

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => formatHoursShort(v as number),
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
        name: "Total OT",
        min: 0,
        axisLabel: { formatter: (v: number): string => formatHoursShort(v) },
      },
      {
        type: "value",
        name: "Avg / member",
        min: 0,
        axisLabel: { formatter: (v: number): string => `${v}h` },
      },
    ],
    series: [
      {
        name: "Total overtime",
        type: "bar",
        yAxisIndex: 0,
        data: data.map((d) => Math.round(d.totalOvertime)),
        barMaxWidth: 28,
      },
      {
        name: "Average per member",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: true,
        data: data.map((d) => Number(d.averageOvertimePerMember.toFixed(1))),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Monthly Overtime Trend"
      description="Total overtime hours (bar) and average overtime per member (line) over the last 12 months."
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
