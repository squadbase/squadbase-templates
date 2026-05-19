import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { FacilityRxSeries } from "@/types/mr-activity-dashboard"

interface FacilityRxShareChartProps {
  data: FacilityRxSeries[]
}

export function FacilityRxShareChart({ data }: FacilityRxShareChartProps) {
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
      title="施設別の処方シェア推移 (直近12週)"
      description="主要5施設の週次処方シェア。早期に変化点を察知して対応"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
