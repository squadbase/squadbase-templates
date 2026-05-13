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
          `失注件数: ${count}`,
          share != null ? `構成比: ${share.toFixed(1)}%` : "",
          amount != null
            ? `失注パイプライン: ${formatCurrency(amount, { short: true })}`
            : "",
        ]
          .filter(Boolean)
          .join("<br/>")
      },
    },
    series: [
      {
        name: "失注理由",
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: (p: unknown) => {
            const pp = p as { name: string; value: number | number[] }
            const v = Array.isArray(pp.value) ? pp.value[0] : pp.value
            return `${pp.name}\n${v} 件`
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
      title="失注理由の構成比"
      description="失注理由をツリーマップで可視化 — 面積は失注件数に比例"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
