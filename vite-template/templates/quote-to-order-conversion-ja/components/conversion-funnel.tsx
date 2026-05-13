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
          `件数: ${step.count.toLocaleString("ja-JP")}`,
          `見積発行比: ${step.rate.toFixed(1)}%`,
          `前ステージ比: ${step.conversionFromPrev.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    series: [
      {
        name: "見積 → 受注",
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
      title="見積 → 受注 ファネル"
      description="見積発行から顧客返答・交渉・受注までの段階別ファネル"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
