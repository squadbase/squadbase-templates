import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type {
  QuadrantPoint,
  Quadrant,
} from "@/types/product-bestseller-deadstock-ranking"
import { QUADRANT_BOUNDARIES } from "@/lib/product-bestseller-deadstock-ranking-mock-data"

interface QuadrantMapProps {
  data: QuadrantPoint[]
}

const QUADRANTS: Array<{ id: Quadrant; label: string }> = [
  { id: "star", label: "Stars" },
  { id: "workhorse", label: "Workhorses" },
  { id: "niche", label: "Niche" },
  { id: "deadstock", label: "Deadstock" },
]

export function QuadrantMap({ data }: QuadrantMapProps) {
  const maxRevenue = Math.max(...data.map((p) => p.revenue))
  const maxTurnover = Math.max(...data.map((p) => p.turnoverRate))

  const series = QUADRANTS.map(({ id, label }) => {
    const points = data.filter((p) => p.quadrant === id)
    return {
      name: label,
      type: "scatter" as const,
      symbolSize: (v: number[]) => {
        const units = v[2]
        return Math.min(36, Math.max(8, Math.sqrt(units) * 1.4))
      },
      itemStyle: { opacity: 0.78 },
      emphasis: { focus: "series" as const, itemStyle: { opacity: 1 } },
      data: points.map((p) => ({
        value: [p.revenue, p.turnoverRate, p.unitsSold],
        productId: p.productId,
        productName: p.productName,
        category: p.category,
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
            category: string
          }
        }
        const [rev, turn, units] = p.data.value
        return [
          `<strong>${p.data.productName}</strong>`,
          `<span style="color:#737373">${p.data.productId} · ${p.data.category}</span>`,
          `<span style="color:#737373">${p.seriesName}</span>`,
          `Revenue: ${formatCurrency(rev, { short: true })}`,
          `Turnover: ${turn.toFixed(2)}×`,
          `Units sold: ${units}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "16%",
      top: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "Revenue",
      nameLocation: "middle",
      nameGap: 30,
      min: 0,
      max: Math.ceil(maxRevenue * 1.05),
      axisLabel: { formatter: (v: number) => formatCurrency(v, { short: true }) },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    yAxis: {
      type: "value",
      name: "Turnover (units / stock)",
      nameLocation: "middle",
      nameGap: 42,
      min: 0,
      max: Math.ceil(maxTurnover * 1.05),
      axisLabel: { formatter: (v: number) => `${v.toFixed(1)}×` },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series: [
      ...series,
      {
        name: "Median",
        type: "line",
        silent: true,
        showSymbol: false,
        data: [],
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: "#a3a3a3", type: "dashed" },
          label: { show: false },
          data: [
            { xAxis: QUADRANT_BOUNDARIES.revenueMedian },
            { yAxis: QUADRANT_BOUNDARIES.turnoverMedian },
          ],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Bestseller × Deadstock Quadrant Map"
      description="X = revenue, Y = stock turnover. Dashed median lines split the catalog into 4 management quadrants"
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
