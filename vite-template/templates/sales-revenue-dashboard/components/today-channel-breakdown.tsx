import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { ChannelBreakdown } from "@/types/sales-revenue"

interface TodayChannelBreakdownProps {
  data: ChannelBreakdown[]
}

export function TodayChannelBreakdown({ data }: TodayChannelBreakdownProps) {
  const total = data.reduce((s, d) => s + d.revenue, 0)

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return [
          `<strong>${p.name}</strong>`,
          `Revenue: ${formatCurrency(p.value, { short: true })}`,
          `Share: ${p.percent.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 0,
      top: "middle",
      itemHeight: 10,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        name: "Channel mix",
        type: "pie",
        radius: ["52%", "78%"],
        center: ["36%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 3, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: data.map((d) => ({ name: d.channel, value: d.revenue })),
      },
    ],
    graphic: [
      {
        type: "text",
        left: "36%",
        top: "50%",
        style: {
          text: `Today\n${formatCurrency(total, { short: true })}`,
          fontSize: 13,
          fontWeight: "bold",
          fill: "#64748b",
          align: "center",
          verticalAlign: "middle",
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Channel Mix (Today)"
      description="Today's revenue share by acquisition channel"
    >
      <EChart option={option} height="300px" />
    </DashboardCardPreset>
  )
}
