import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { LossReasonItem } from "@/types/quote-to-order-conversion"

interface LossReasonsTreemapProps {
  data: LossReasonItem[]
}

export function LossReasonsTreemap({ data }: LossReasonsTreemapProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          name: string
          value: number | number[]
          data?: { share?: number; amount?: number }
        }
        const count = Array.isArray(p.value) ? p.value[0] : p.value
        const share = p.data?.share
        const amount = p.data?.amount
        return [
          `<strong>${p.name}</strong>`,
          `Losses: ${count}`,
          share != null ? `Share: ${share.toFixed(1)}%` : "",
          amount != null
            ? `Lost pipeline: ${formatCurrency(amount, { short: true })}`
            : "",
        ]
          .filter(Boolean)
          .join("<br/>")
      },
    },
    series: [
      {
        name: "Loss Reasons",
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: (p: unknown) => {
            const pp = p as { name: string; value: number | number[] }
            const v = Array.isArray(pp.value) ? pp.value[0] : pp.value
            return `${pp.name}\n${v} losses`
          },
          fontSize: 12,
          fontWeight: "bold",
        },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2, gapWidth: 2 },
        levels: [
          {
            itemStyle: { gapWidth: 2, borderRadius: 4 },
          },
        ],
        data: data.map((r) => ({
          name: r.reason,
          value: r.count,
          amount: r.amount,
          share: r.share,
        })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Loss Reason Breakdown"
      description="Treemap of why deals are lost — area is proportional to loss count"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
