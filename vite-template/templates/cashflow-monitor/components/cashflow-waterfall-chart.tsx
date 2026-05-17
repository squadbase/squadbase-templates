import type { EChartsOption } from "echarts"
import { EChart, useEChartsContrastColor } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { WaterfallStep } from "@/types/cashflow-monitor"

interface CashflowWaterfallChartProps {
  data: WaterfallStep[]
}

export function CashflowWaterfallChart({ data }: CashflowWaterfallChartProps) {
  // Resolve colors from CSS variables so the chart tracks light/dark themes.
  const colorStart = useEChartsContrastColor("--chart-3")
  const colorOperating = useEChartsContrastColor("--chart-1")
  const colorInvesting = useEChartsContrastColor("--chart-4")
  const colorFinancing = useEChartsContrastColor("--chart-2")
  const colorPositive = useEChartsContrastColor("--chart-1")
  const colorNegative = useEChartsContrastColor("--chart-5")

  const colorByType = (
    type: WaterfallStep["type"],
    value: number,
  ): string => {
    if (type === "start" || type === "end") return colorStart
    if (type === "operating") return value >= 0 ? colorOperating : colorNegative
    if (type === "investing") return value >= 0 ? colorPositive : colorInvesting
    if (type === "financing") return value >= 0 ? colorPositive : colorFinancing
    return colorOperating
  }

  // Placeholders: transparent bars used to "float" each step
  const placeholders = data.map((s) => {
    if (s.type === "start" || s.type === "end") return 0
    if (s.value >= 0) {
      // Positive: floor is the previous cumulative
      return s.cumulative - s.value
    }
    // Negative: floor sits at the post-step cumulative
    return s.cumulative
  })

  const bars = data.map((s) => {
    if (s.type === "start" || s.type === "end") return s.value
    return Math.abs(s.value)
  })

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const step = data[idx]
        if (step.type === "start" || step.type === "end") {
          return [
            `<strong>${step.label}</strong>`,
            `Cash position: ${formatCurrency(step.cumulative, { short: true })}`,
          ].join("<br/>")
        }
        return [
          `<strong>${step.label}</strong>`,
          `${step.value >= 0 ? "Inflow" : "Outflow"}: ${formatCurrency(Math.abs(step.value), { short: true })}`,
          `Running cash: ${formatCurrency(step.cumulative, { short: true })}`,
        ].join("<br/>")
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
        name: "Cash Flow",
        type: "bar",
        stack: "waterfall",
        data: data.map((s, i) => ({
          value: bars[i],
          itemStyle: {
            color: colorByType(s.type, s.value),
            borderRadius: [3, 3, 0, 0],
          },
        })),
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "inherit",
          formatter: (p: { dataIndex: number }): string => {
            const s = data[p.dataIndex]
            if (s.type === "start" || s.type === "end") {
              return formatCurrency(s.value, { short: true })
            }
            return s.value >= 0
              ? `+${formatCurrency(s.value, { short: true })}`
              : `-${formatCurrency(Math.abs(s.value), { short: true })}`
          },
        },
        barMaxWidth: 64,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Cash Flow Waterfall by CF Category"
      description="From opening cash through operating, investing and financing CF to closing cash (latest month)"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
