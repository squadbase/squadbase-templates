import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getBaseGrid,
  formatCurrency,
  formatNumber,
} from "./chart-helpers"
import type { WaterfallStep } from "@/types/monthly-sales-dashboard"

interface BudgetActualWaterfallProps {
  data: WaterfallStep[]
}

export function BudgetActualWaterfall({ data }: BudgetActualWaterfallProps) {
  // Resolve theme colors via runtime hooks — keeps the chart palette in sync
  // with the active theme (light/dark) without hardcoded hex.
  const baseColor = useEChartsContrastColor("--chart-1")
  const positiveColor = useEChartsContrastColor("--chart-2")
  const negativeColor = useEChartsContrastColor("--chart-4")

  const colorMap: Record<WaterfallStep["type"], string> = {
    base: baseColor,
    total: baseColor,
    positive: positiveColor,
    negative: negativeColor,
  }

  // Placeholder series makes each variance bar "float" on the stack.
  // base & total sit on the axis (placeholder = 0).
  const placeholders = data.map((step, i) => {
    if (step.type === "base" || step.type === "total") return 0
    const prev = data[i - 1]
    if (step.value >= 0) return prev.cumulative
    return step.cumulative
  })

  const bars = data.map((s) =>
    s.type === "base" || s.type === "total"
      ? s.cumulative
      : Math.abs(s.value),
  )

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const step = data[idx]
        const lines = [`<strong>${step.label}</strong>`]
        if (step.type === "base" || step.type === "total") {
          lines.push(`${formatCurrency(step.cumulative, { short: true })}`)
        } else {
          lines.push(
            `${step.value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(step.value), { short: true })}`,
          )
          lines.push(`Running: ${formatCurrency(step.cumulative, { short: true })}`)
        }
        return lines.join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((s) => s.label),
      axisLabel: { interval: 0, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "placeholder",
        type: "bar",
        stack: "waterfall",
        silent: true,
        itemStyle: { color: "transparent" },
        emphasis: { itemStyle: { color: "transparent" } },
        data: placeholders,
      },
      {
        name: "Budget vs Actual",
        type: "bar",
        stack: "waterfall",
        barMaxWidth: 52,
        data: data.map((s, i) => ({
          value: bars[i],
          itemStyle: {
            color: colorMap[s.type] || baseColor,
            borderRadius: [3, 3, 0, 0],
          },
        })),
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          formatter: (p: { dataIndex: number }) => {
            const s = data[p.dataIndex]
            if (s.type === "base" || s.type === "total") {
              return formatCurrency(s.cumulative, { short: true })
            }
            return `${s.value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(s.value), { short: true })}`
          },
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Budget vs Actual Waterfall (latest month)"
      description="Decompose budget-to-actual variance by driver (Volume, Mix, Price, Promo, FX)"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
