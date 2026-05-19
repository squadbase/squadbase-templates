import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber, formatCurrency } from "./chart-helpers"
import type { AcquisitionChannelPoint } from "@/types/member-attribute-dashboard"

interface AcquisitionChannelChartProps {
  data: AcquisitionChannelPoint[]
}

export function AcquisitionChannelChart({ data }: AcquisitionChannelChartProps) {
  // 水平バーで最大バーが上に来るように昇順ソート
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
          const isLtv = item.seriesName === "平均 LTV"
          lines.push(
            `${item.seriesName}: ${isLtv ? formatCurrency(item.value) : item.value.toLocaleString("ja-JP")}`,
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
        name: "新規会員数",
        nameLocation: "middle",
        nameGap: 28,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "平均 LTV",
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
        name: "新規会員数",
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
        name: "平均 LTV",
        type: "scatter",
        xAxisIndex: 1,
        data: ltvs,
        symbolSize: 12,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="新規会員の獲得チャネル"
      description="期間内の新規会員数とチャネル別の質 (平均 LTV) を重ねて表示"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
