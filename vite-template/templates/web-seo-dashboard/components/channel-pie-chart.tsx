import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber } from "./chart-helpers"
import type { ChannelBreakdown } from "@/types/web-seo"

interface ChannelPieChartProps {
  data: ChannelBreakdown[]
}

export function ChannelPieChart({ data }: ChannelPieChartProps) {
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0)

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return `${p.name}<br/>${formatNumber(p.value)} セッション (${p.percent}%)`
      },
    },
    legend: { bottom: 0, type: "scroll" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: "bold" },
        },
        data: data.map((d) => ({
          name: d.channel,
          value: d.sessions,
        })),
      },
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "40%",
        style: {
          text: formatNumber(totalSessions),
          fontSize: 20,
          fontWeight: "bold",
        },
      },
      {
        type: "text",
        left: "center",
        top: "48%",
        style: {
          text: "総セッション",
          fontSize: 12,
          fill: "#999",
        },
      },
    ],
  }

  return (
    <DashboardCardPreset title="流入チャネル構成">
      <EChart option={option} height="300px" />
    </DashboardCardPreset>
  )
}
