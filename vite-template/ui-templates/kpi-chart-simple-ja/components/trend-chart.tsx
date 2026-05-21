import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { formatNumber, getBaseGrid } from "./chart-helpers"
import type { TrendPoint } from "@/types/ui-template-kpi-chart-simple"

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
      axisLabel: {
        formatter: (value: string) => value.slice(5),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "系列A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.revenue),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }

  return <EChart option={option} height="320px" />
}
