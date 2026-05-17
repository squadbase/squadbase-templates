import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { FailureTrendPoint } from "@/types/equipment-maintenance-dashboard"

interface FailureTrendChartProps {
  data: FailureTrendPoint[]
}

export function FailureTrendChart({ data }: FailureTrendChartProps) {
  const months = data.map((d) => d.month.slice(2)) // YY-MM

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : String(v),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
    },
    yAxis: [
      {
        type: "value",
        min: 0,
        name: "故障件数",
        nameTextStyle: { fontSize: 11 },
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        min: 0,
        name: "MTTR (h)",
        nameTextStyle: { fontSize: 11 },
        axisLabel: { formatter: (v: number) => `${v.toFixed(1)}` },
      },
    ],
    series: [
      {
        name: "故障件数",
        type: "bar",
        yAxisIndex: 0,
        data: data.map((d) => d.failureCount),
        barMaxWidth: 28,
      },
      {
        name: "MTTR (h)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.mttrHours),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="故障件数の月次推移"
      description="月次の故障件数 (棒) と平均修復時間 MTTR (折れ線)"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
