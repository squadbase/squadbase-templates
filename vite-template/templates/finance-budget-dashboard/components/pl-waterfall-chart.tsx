import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { WaterfallStep } from "@/types/finance-budget"

interface PlWaterfallChartProps {
  data: WaterfallStep[]
}

// ECharts colors: CSS variables can't be used directly, so we pick values
// that closely track the chart theme palette.
const COLOR = {
  revenue: "#10b981",
  profit: "#059669",
  subtotal: "#3b82f6",
  cost: "#ef4444",
} as const

export function PlWaterfallChart({ data }: PlWaterfallChartProps) {
  // Placeholders: transparent bars used to "float" each step
  const placeholders = data.map((s) => {
    if (s.type === "subtotal" || s.type === "profit") return 0
    if (s.type === "revenue") return 0
    // cost: bottom edge = previous cumulative + value (negative)
    return s.cumulative + s.value
  })

  const bars = data.map((s) => Math.abs(s.value))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { name: string; dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const step = data[idx]
        const subtotalLine =
          step.type === "subtotal" || step.type === "profit"
            ? `Cumulative: ${formatCurrency(step.cumulative, { short: true })}`
            : `Running total: ${formatCurrency(step.cumulative + step.value, { short: true })}`
        return [
          `<strong>${step.label}</strong>`,
          `${step.value >= 0 ? "Add" : "Subtract"}: ${formatCurrency(Math.abs(step.value), { short: true })}`,
          subtotalLine,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((s) => s.label),
      axisLabel: { interval: 0, rotate: 0, fontSize: 11 },
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
        name: "PL",
        type: "bar",
        stack: "waterfall",
        data: data.map((s, i) => ({
          value: bars[i],
          itemStyle: { color: COLOR[s.type], borderRadius: [3, 3, 0, 0] },
        })),
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "inherit",
          formatter: (p: { dataIndex: number }) => {
            const s = data[p.dataIndex]
            return s.value >= 0
              ? formatCurrency(s.value, { short: true })
              : `-${formatCurrency(Math.abs(s.value), { short: true })}`
          },
        },
        barMaxWidth: 52,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="P&L Waterfall"
      description="Visualize the components from revenue down to net income"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
