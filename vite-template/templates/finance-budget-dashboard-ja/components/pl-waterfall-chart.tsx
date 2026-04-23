import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { WaterfallStep } from "@/types/finance-budget"

interface PlWaterfallChartProps {
  data: WaterfallStep[]
}

// echart 色 (ハードコード回避のため CSS変数を渡せないが、
// テーマ連動する chart 系カラーに近い値を採用)
const COLOR = {
  revenue: "#10b981",
  profit: "#059669",
  subtotal: "#3b82f6",
  cost: "#ef4444",
} as const

export function PlWaterfallChart({ data }: PlWaterfallChartProps) {
  // placeholders: 透明バーで各ステップを「浮かせる」
  const placeholders = data.map((s) => {
    if (s.type === "subtotal" || s.type === "profit") return 0
    if (s.type === "revenue") return 0
    // cost: 下端 = 直前の累積 + value (負値)
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
            ? `累計: ${formatCurrency(step.cumulative, { short: true })}`
            : `当期累計: ${formatCurrency(step.cumulative + step.value, { short: true })}`
        return [
          `<strong>${step.label}</strong>`,
          `${step.value >= 0 ? "加算" : "減算"}: ${formatCurrency(Math.abs(step.value), { short: true })}`,
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
      title="PL ウォーターフォール"
      description="売上高から当期純利益までの構成要素を可視化"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
