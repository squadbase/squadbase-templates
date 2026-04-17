import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getDualAxisGrid, formatNumber } from "./chart-helpers"
import type { DailySearchTrend } from "@/types/web-seo"

interface SeoDualAxisChartProps {
  data: DailySearchTrend[]
}

export function SeoDualAxisChart({ data }: SeoDualAxisChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: true,
    },
    yAxis: [
      {
        type: "value",
        name: "クリック数",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "表示回数",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
    ],
    series: [
      {
        name: "クリック数",
        type: "bar",
        barMaxWidth: 6,
        data: data.map((d) => d.clicks),
      },
      {
        name: "表示回数",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.impressions),
      },
    ],
  }

  return (
    <DashboardCardPreset title="検索パフォーマンス推移">
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
