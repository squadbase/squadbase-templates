import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { formatNumber, getBaseGrid } from "./chart-helpers"
import type { TrendPoint } from "@/types/ui-template-kpi-chart-advanced"

interface TrendChartProps {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Series A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.value),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="space-y-1">
          <DashboardCardTitle>Trend</DashboardCardTitle>
          <DashboardCardDescription>
            Values over the selected period
          </DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <EChart option={option} height="280px" />
      </DashboardCardContent>
    </DashboardCard>
  )
}
