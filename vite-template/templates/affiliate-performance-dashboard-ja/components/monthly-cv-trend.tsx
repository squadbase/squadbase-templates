import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { MonthlyCvPoint } from "@/types/affiliate-performance-dashboard"

interface MonthlyCvTrendProps {
  data: MonthlyCvPoint[]
}

export function MonthlyCvTrend({ data }: MonthlyCvTrendProps) {
  const months = data.map((d) => d.month)
  const established = data.map((d) =>
    Math.max(0, d.conversions - d.newMediaConversions),
  )
  const newMedia = data.map((d) => d.newMediaConversions)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatNumber(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "既存媒体",
        type: "line",
        stack: "total",
        smooth: true,
        showSymbol: false,
        data: established,
        areaStyle: { opacity: 0.45 },
      },
      {
        name: "新規媒体",
        type: "line",
        stack: "total",
        smooth: true,
        showSymbol: false,
        data: newMedia,
        areaStyle: { opacity: 0.65 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="月次CV推移 (直近12ヶ月)"
      description="既存媒体と新規媒体の寄与を積み上げで表示"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
