import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { HourlyCumulativePoint } from "@/types/sales-revenue"
import { CURRENT_HOUR } from "@/lib/sales-revenue-mock-data"

interface HourlyCumulativeChartProps {
  data: HourlyCumulativePoint[]
}

export function HourlyCumulativeChart({ data }: HourlyCumulativeChartProps) {
  const hours = data.map((d) => d.hour)

  // Treat any data past the current hour as "not yet occurred" and leave it null on the chart
  const todayRevenue = data.map((d, i) =>
    i <= CURRENT_HOUR ? d.cumulativeRevenue : null,
  )

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v == null ? "-" : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: hours,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Today (cumulative)",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        data: todayRevenue,
        areaStyle: { opacity: 0.2 },
        markLine: {
          symbol: "none",
          lineStyle: { type: "solid", width: 1 },
          label: { formatter: `Now ${hours[CURRENT_HOUR]}`, position: "end" },
          data: [{ xAxis: hours[CURRENT_HOUR] }],
        },
      },
      {
        name: "Yesterday (cumulative)",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.prevDayCumulative),
      },
      {
        name: "Target",
        type: "line",
        smooth: false,
        showSymbol: false,
        lineStyle: { type: "dotted", width: 1.5 },
        data: data.map((d) => d.target),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Hourly Cumulative Revenue"
      description="Today vs. yesterday vs. target"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
