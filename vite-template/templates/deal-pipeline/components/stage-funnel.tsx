import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { StageFunnelStep } from "@/types/deal-pipeline"

interface StageFunnelProps {
  data: StageFunnelStep[]
}

export function StageFunnel({ data }: StageFunnelProps) {
  // Funnel expects descending values — already true given pipeline shape
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name: string; dataIndex: number }
        const step = data[p.dataIndex]
        return [
          `<strong>${step.stage}</strong>`,
          `Deals: ${step.count}`,
          `Amount: ${formatCurrency(step.amount, { short: true })}`,
          `Weighted: ${formatCurrency(step.weightedAmount, { short: true })}`,
          `Stage conv.: ${step.conversionFromPrev.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    series: [
      {
        name: "Pipeline",
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
            return `${pp.name}\n${pp.value} deals`
          },
        },
        labelLine: { show: false },
        data: data.map((s) => ({ name: s.stage, value: s.count })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Stage Funnel"
      description="Active deals by pipeline stage — Lead → Closed Won"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
