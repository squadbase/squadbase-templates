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
        name: "残業合計",
        min: 0,
        axisLabel: { formatter: (v: number): string => formatHoursShort(v) },
      },
      {
        type: "value",
        name: "平均/人",
        min: 0,
        axisLabel: { formatter: (v: number): string => `${v}h` },
      },
    ],
    series: [
      {
        name: "残業時間合計",
        type: "bar",
        yAxisIndex: 0,
        data: data.map((d) => Math.round(d.totalOvertime)),
        barMaxWidth: 28,
      },
      {
        name: "1人あたり平均",
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
      title="残業時間の月次推移"
      description="直近12ヶ月の残業時間合計 (棒) と1人あたり平均残業 (折れ線)。"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
