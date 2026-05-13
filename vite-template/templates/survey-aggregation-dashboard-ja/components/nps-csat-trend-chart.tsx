import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { TrendPoint } from "@/types/survey-aggregation-dashboard"

interface NpsCsatTrendChartProps {
  data: TrendPoint[]
}

export function NpsCsatTrendChart({ data }: NpsCsatTrendChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown): string => {
        const arr = params as Array<{
          axisValue: string
          seriesName: string
          value: number
          marker: string
        }>
        if (!arr || arr.length === 0) return ""
        const header = `<strong>${arr[0].axisValue}</strong>`
        const lines = arr.map((p) => {
          const val =
            p.seriesName === "CSAT"
              ? `${p.value.toFixed(2)} / 5`
              : `${p.value >= 0 ? "+" : ""}${p.value}`
          return `${p.marker} ${p.seriesName}: ${val}`
        })
        return [header, ...lines].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "NPS",
        min: -100,
        max: 100,
        axisLabel: { formatter: (v: number) => `${v}` },
      },
      {
        type: "value",
        name: "CSAT",
        min: 1,
        max: 5,
        axisLabel: { formatter: (v: number) => v.toFixed(1) },
      },
    ],
    series: [
      {
        name: "NPS",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.nps),
        areaStyle: { opacity: 0.15 },
      },
      {
        name: "CSAT",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        lineStyle: { type: "dashed", width: 1.8 },
        data: data.map((d) => d.csat),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="NPS・CSAT の時系列推移 (直近12週)"
      description="週次のNPS (左軸 -100〜+100) と CSAT (右軸 1〜5)"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
