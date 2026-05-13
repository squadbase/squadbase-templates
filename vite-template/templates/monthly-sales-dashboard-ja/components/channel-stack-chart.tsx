import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getBaseGrid,
  formatCurrency,
  formatNumber,
} from "./chart-helpers"
import type {
  ChannelMonthlyPoint,
  Channel,
} from "@/types/monthly-sales-dashboard"
import { CHANNEL_LIST } from "@/lib/monthly-sales-dashboard-mock-data"

interface ChannelStackChartProps {
  data: ChannelMonthlyPoint[]
}

export function ChannelStackChart({ data }: ChannelStackChartProps) {
  const months = data.map((d) => d.yearMonth)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) => formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0, type: "scroll" },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: CHANNEL_LIST.map((ch: Channel) => ({
      name: ch,
      type: "bar",
      stack: "channel",
      barMaxWidth: 36,
      data: data.map((d) => d.values[ch]),
    })),
  }

  return (
    <DashboardCardPreset
      title="チャネル別売上"
      description="月次スタック表示で販売チャネルの構成変化を把握"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
