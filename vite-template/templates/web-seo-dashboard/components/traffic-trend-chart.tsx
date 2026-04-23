import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { DailyTrafficTrend } from "@/types/web-seo"

interface TrafficTrendChartProps {
  data: DailyTrafficTrend[]
}

export function TrafficTrendChart({ data }: TrafficTrendChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => formatNumber(v as number),
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
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Pageviews",
        type: "line",
        smooth: true,
        data: data.map((d) => d.pageviews),
        showSymbol: false,
      },
      {
        name: "Unique Users",
        type: "line",
        smooth: true,
        data: data.map((d) => d.uniqueUsers),
        showSymbol: false,
      },
      {
        name: "Sessions",
        type: "line",
        smooth: true,
        data: data.map((d) => d.sessions),
        showSymbol: false,
      },
    ],
  }

  return (
    <DashboardCardPreset title="Daily Traffic Trend">
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
