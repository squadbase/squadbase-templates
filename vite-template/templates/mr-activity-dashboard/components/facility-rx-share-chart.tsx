import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { FacilityRxSeries } from "@/types/mr-activity-dashboard"

interface FacilityRxShareChartProps {
  data: FacilityRxSeries[]
}

export function FacilityRxShareChart({ data }: FacilityRxShareChartProps) {
  // Assume all series share the same weekLabel order
  const xAxisLabels = data[0]?.data.map((p) => p.weekLabel) ?? []

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatPercent(v as number),
    },
    legend: { bottom: 0, type: "scroll" },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: xAxisLabels,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: data.map((series) => ({
      name: series.facilityName,
      type: "line",
      smooth: true,
      showSymbol: false,
      data: series.data.map((p) => p.rxShare),
    })),
  }

  return (
    <DashboardCardPreset
      title="Facility Rx Share Trend (last 12 weeks)"
      description="Weekly prescription share at top 5 facilities — spot trajectories before they harden"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
