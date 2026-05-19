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
          `<span style="color:#737373">${point.customerId} · Class ${point.abcClass}</span>`,
          `Revenue: ${formatCurrency(point.revenue, { short: true })}`,
          `Cumulative: ${point.cumulativePct.toFixed(1)}%`,
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
        name: "Revenue",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Cumulative %",
        min: 0,
        max: 100,
        axisLabel: { formatter: (v: number) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Revenue",
        type: "bar",
        yAxisIndex: 0,
        barWidth: "70%",
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.revenue),
      },
      {
        name: "Cumulative %",
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
      title="ABC Pareto Analysis"
      description="Revenue bars (descending) overlaid with the cumulative share line — A-class accounts drive the bulk of revenue"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
