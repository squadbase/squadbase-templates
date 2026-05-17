import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { StageFunnelStep } from "@/types/deal-pipeline"

interface StageFunnelProps {
  data: StageFunnelStep[]
}

export function StageFunnel({ data }: StageFunnelProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name: string; dataIndex: number }
        const step = data[p.dataIndex]
        return [
          `<strong>${step.stage}</strong>`,
          `案件数: ${step.count}`,
          `金額: ${formatCurrency(step.amount, { short: true })}`,
          `加重: ${formatCurrency(step.weightedAmount, { short: true })}`,
          `転換率: ${step.conversionFromPrev.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    series: [
      {
        name: "パイプライン",
        type: "funnel",
        left: "8%",
        right: "8%",
        top: 12,
        bottom: 30,
        sort: "descending",
        gap: 4,
        label: {
          show: true,
          position: "inside",
          fontWeight: "bold",
          formatter: (p: unknown) => {
            const pp = p as { name: string; value: number }
            return `${pp.name}\n${pp.value} 件`
          },
        },
        labelLine: { show: false },
        data: data.map((s) => ({ name: s.stage, value: s.count })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="ステージ別ファネル"
      description="案件数のステージ別ファネル — リード → 受注"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
