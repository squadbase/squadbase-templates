import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber } from "./chart-helpers"
import type { FunnelStep } from "@/types/sales-revenue"

interface ConversionFunnelChartProps {
  data: FunnelStep[]
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          name: string
          value: number
          data: { rate: number; conversionFromPrev: number }
        }
        return [
          `<strong>${p.name}</strong>`,
          `Users: ${formatNumber(p.value)}`,
          `Overall rate: ${p.data.rate.toFixed(2)}%`,
          `Step-over-step: ${p.data.conversionFromPrev.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: { show: false },
    series: [
      {
        name: "Purchase Funnel",
        type: "funnel",
        top: 12,
        bottom: 12,
        left: "8%",
        width: "84%",
        min: 0,
        max: data[0]?.users ?? 0,
        minSize: "20%",
        maxSize: "100%",
        sort: "descending",
        gap: 3,
        label: {
          show: true,
          position: "inside",
          formatter: (params: unknown) => {
            const p = params as {
              name: string
              data: { rate: number }
            }
            return `${p.name}\n${p.data.rate.toFixed(1)}%`
          },
          color: "#fff",
          fontWeight: "bold",
        },
        labelLine: { show: false },
        itemStyle: {
          borderColor: "transparent",
          borderWidth: 0,
        },
        emphasis: {
          label: { fontSize: 14 },
        },
        data: data.map((d) => ({
          name: d.step,
          value: d.users,
          rate: d.rate,
          conversionFromPrev: d.conversionFromPrev,
        })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Purchase Conversion Funnel"
      description="Drop-off and pass-through from visit to purchase"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
