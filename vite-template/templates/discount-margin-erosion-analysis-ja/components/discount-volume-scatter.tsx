import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type {
  Channel,
  DiscountScatterPoint,
} from "@/types/discount-margin-erosion-analysis"
import { CHANNEL_LIST } from "@/lib/discount-margin-erosion-analysis-mock-data"

interface DiscountVolumeScatterProps {
  data: DiscountScatterPoint[]
}

export function DiscountVolumeScatter({ data }: DiscountVolumeScatterProps) {
  const maxRevenue = data.reduce((m, p) => (p.revenue > m ? p.revenue : m), 0)

  const series = CHANNEL_LIST.map((ch: Channel) => {
    const points = data.filter((p) => p.channel === ch)
    return {
      name: ch,
      type: "scatter" as const,
      symbolSize: (v: number[]) => {
        const rev = v[2]
        return (rev / maxRevenue) * 26 + 6
      },
      itemStyle: { opacity: 0.55 },
      emphasis: { focus: "series" as const, itemStyle: { opacity: 1 } },
      data: points.map((p) => ({
        value: [p.discountRate * 100, p.quantity, p.revenue],
        customerId: p.customerId,
        transactionId: p.transactionId,
      })),
    }
  })

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          seriesName: string
          data: {
            value: [number, number, number]
            customerId: string
            transactionId: string
          }
        }
        const [discountPct, qty, rev] = p.data.value
        return [
          `<strong>${p.data.transactionId}</strong>`,
          `<span style="color:#737373">${p.seriesName} · ${p.data.customerId}</span>`,
          `値引き率: ${discountPct.toFixed(1)}%`,
          `数量: ${qty}`,
          `売上: ${formatCurrency(rev, { short: true })}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "16%", top: "8%", containLabel: true },
    xAxis: {
      type: "value",
      name: "値引き率 %",
      nameLocation: "middle",
      nameGap: 28,
      min: 0,
      max: 60,
      axisLabel: { formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    yAxis: {
      type: "value",
      name: "数量",
      nameLocation: "middle",
      nameGap: 38,
      min: 0,
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series,
  }

  return (
    <DashboardCardPreset
      title="値引き率 × 数量"
      description="深い値引きと数量が重なる領域を可視化。バブルサイズ = 取引売上"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
