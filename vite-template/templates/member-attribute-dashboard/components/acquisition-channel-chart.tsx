import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber, formatCurrency } from "./chart-helpers"
import type { AcquisitionChannelPoint } from "@/types/member-attribute-dashboard"

interface AcquisitionChannelChartProps {
  data: AcquisitionChannelPoint[]
}

export function AcquisitionChannelChart({ data }: AcquisitionChannelChartProps) {
  // Sort ascending so the largest bar sits at the top of a horizontal chart
  const sorted = [...data].sort((a, b) => a.newMembers - b.newMembers)
  const labels = sorted.map((d) => d.channelLabel)
  const counts = sorted.map((d) => d.newMembers)
  const ltvs = sorted.map((d) => d.avgLtv)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { name: string; seriesName: string; value: number }[]
        if (!arr.length) return ""
        const name = arr[0].name
        const lines = [`<strong>${name}</strong>`]
        for (const item of arr) {
          const isLtv = item.seriesName === "Avg LTV"
          lines.push(
            `${item.seriesName}: ${isLtv ? formatCurrency(item.value) : item.value.toLocaleString("en-US")}`,
          )
        }
        return lines.join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: [
      {
        type: "value",
        name: "New members",
        nameLocation: "middle",
        nameGap: 28,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Avg LTV",
        nameLocation: "middle",
        nameGap: 28,
        axisLabel: { formatter: (v: number) => formatCurrency(v, { short: true }) },
      },
    ],
    yAxis: {
      type: "category",
      data: labels,
    },
    series: [
      {
        name: "New members",
        type: "bar",
        data: counts,
        xAxisIndex: 0,
        barMaxWidth: 24,
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }) => formatNumber(params.value),
        },
      },
      {
        name: "Avg LTV",
        type: "scatter",
        xAxisIndex: 1,
        data: ltvs,
        symbolSize: 12,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="New-Member Acquisition by Channel"
      description="New members joined this period, with quality (avg LTV) overlaid"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
