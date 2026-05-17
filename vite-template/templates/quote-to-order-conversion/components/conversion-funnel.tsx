import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import type { FunnelStep } from "@/types/quote-to-order-conversion"

interface ConversionFunnelProps {
  data: FunnelStep[]
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name: string; dataIndex: number }
        const step = data[p.dataIndex]
        return [
          `<strong>${step.step}</strong>`,
          `Count: ${step.count.toLocaleString("en-US")}`,
          `Of issued: ${step.rate.toFixed(1)}%`,
          `Conv. from prev: ${step.conversionFromPrev.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    series: [
      {
        name: "Quote → Order",
        type: "funnel",
        left: "8%",
        right: "8%",
        top: 12,
        bottom: 12,
        sort: "descending",
        gap: 4,
        label: {
          show: true,
          position: "inside",
          fontWeight: "bold",
          formatter: (p: unknown) => {
            const pp = p as { name: string; value: number }
            return `${pp.name}\n${pp.value}`
          },
        },
        labelLine: { show: false },
        data: data.map((s) => ({ name: s.step, value: s.count })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Quote → Order Funnel"
      description="From quote issuance through customer response, negotiation, and win"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
