import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getDualAxisGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { ParetoPoint } from "@/types/customer-sales-dashboard"

interface AbcParetoChartProps {
  data: ParetoPoint[]
}

export function AbcParetoChart({ data }: AbcParetoChartProps) {
  const xLabels = data.map((d) => d.customerId)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>${point.customerName}</strong>`,
          `<span style="color:#737373">${point.customerId} · ${point.abcClass} 区分</span>`,
          `売上: ${formatCurrency(point.revenue, { short: true })}`,
          `累計比率: ${point.cumulativePct.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: xLabels,
      axisLabel: { show: false },
    },
    yAxis: [
      {
        type: "value",
        name: "売上",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "累計 %",
        min: 0,
        max: 100,
        axisLabel: { formatter: (v: number) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "売上",
        type: "bar",
        yAxisIndex: 0,
        barWidth: "70%",
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.revenue),
      },
      {
        name: "累計 %",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2.5 },
        markLine: {
          symbol: "none",
          silent: true,
          label: { fontSize: 10 },
          data: [
            { yAxis: 70, label: { formatter: "70% (A/B)" } },
            { yAxis: 90, label: { formatter: "90% (B/C)" } },
          ],
        },
        data: data.map((d) => d.cumulativePct),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="ABC 分析 (パレート図)"
      description="売上降順の棒グラフに累計比率の折れ線を重ね、A 区分が売上の大半を担うことを可視化"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
