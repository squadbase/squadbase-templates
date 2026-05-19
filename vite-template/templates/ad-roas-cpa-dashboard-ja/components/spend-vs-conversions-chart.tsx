import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getDualAxisGrid,
  formatCurrency,
  formatNumber,
} from "./chart-helpers"
import type { DailySpendConvPoint } from "@/types/ad-roas-cpa-dashboard"

interface SpendVsConversionsChartProps {
  data: DailySpendConvPoint[]
}

export function SpendVsConversionsChart({ data }: SpendVsConversionsChartProps) {
  const dates = data.map((d) => d.date.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown): string => {
        const arr = params as { axisValue: string; dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>${point.date}</strong>`,
          `広告費: ${formatCurrency(point.spend)}`,
          `CV数: ${point.conversions.toLocaleString("ja-JP")}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "広告費",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "CV数",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "日次広告費",
        type: "line",
        yAxisIndex: 0,
        smooth: false,
        showSymbol: false,
        areaStyle: { opacity: 0.15 },
        data: data.map((d) => d.spend),
      },
      {
        name: "CV数",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.conversions),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="日次広告費 vs CV数 (直近30日)"
      description="広告費とCV数をデュアル軸で重ね、投資効率の推移を可視化"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
