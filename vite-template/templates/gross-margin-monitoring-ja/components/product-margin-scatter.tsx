import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type {
  Category,
  ProductMarginScatterPoint,
} from "@/types/gross-margin-monitoring"
import { CATEGORY_LIST } from "@/lib/gross-margin-monitoring-mock-data"

interface ProductMarginScatterProps {
  data: ProductMarginScatterPoint[]
}

export function ProductMarginScatter({ data }: ProductMarginScatterProps) {
  const maxRevenue = data.reduce(
    (m, p) => (p.revenue > m ? p.revenue : m),
    0,
  )

  const series = CATEGORY_LIST.map((cat: Category) => {
    const points = data.filter((p) => p.category === cat)
    return {
      name: cat,
      type: "scatter" as const,
      symbolSize: (v: number[]) => {
        const revenue = v[2]
        const normalized = (revenue / maxRevenue) * 36 + 8
        return normalized
      },
      itemStyle: { opacity: 0.78 },
      emphasis: {
        focus: "series" as const,
        itemStyle: { opacity: 1, shadowBlur: 8, shadowColor: "rgba(0,0,0,0.25)" },
      },
      data: points.map((p) => ({
        value: [p.marginPct, p.grossProfit, p.revenue],
        productId: p.productId,
        productName: p.productName,
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
            productId: string
            productName: string
          }
        }
        const [marginPct, grossProfit, revenue] = p.data.value
        return [
          `<strong>${p.data.productName}</strong>`,
          `<span style="color:#737373">${p.data.productId} · ${p.seriesName}</span>`,
          `粗利率: ${marginPct.toFixed(1)}%`,
          `粗利額: ${formatCurrency(grossProfit, { short: true })}`,
          `売上: ${formatCurrency(revenue, { short: true })}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0, type: "scroll" },
    grid: { left: "3%", right: "4%", bottom: "16%", top: "8%", containLabel: true },
    xAxis: {
      type: "value",
      name: "粗利率 %",
      nameLocation: "middle",
      nameGap: 28,
      min: 0,
      max: 80,
      axisLabel: { formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    yAxis: {
      type: "value",
      name: "粗利額",
      nameLocation: "middle",
      nameGap: 56,
      min: 0,
      axisLabel: { formatter: (v: number) => formatCurrency(v, { short: true }) },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series,
  }

  return (
    <DashboardCardPreset
      title="商品別 粗利散布図 (粗利率 × 粗利額)"
      description="X = 粗利率, Y = 粗利額, バブルサイズ = 売上, 色 = カテゴリ"
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
