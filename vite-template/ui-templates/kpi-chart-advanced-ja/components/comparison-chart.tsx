import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Skeleton } from "@/components/ui/skeleton"
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
        name: "Series A",
        type: "bar",
        data: data.map((d) => d.current),
        barMaxWidth: 28,
      },
      {
        name: "Series B",
        type: "bar",
        data: data.map((d) => d.previous),
        barMaxWidth: 28,
      },
      {
        name: "Series C",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.growth),
      },
    ],
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <EChart option={option} height="320px" />
      </DashboardCardContent>
    </DashboardCard>
  )
}
