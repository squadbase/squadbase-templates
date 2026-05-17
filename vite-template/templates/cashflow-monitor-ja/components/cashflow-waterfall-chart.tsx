import type { EChartsOption } from "echarts"
import { EChart, useEChartsContrastColor } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { WaterfallStep } from "@/types/cashflow-monitor"

interface CashflowWaterfallChartProps {
  data: WaterfallStep[]
}

export function CashflowWaterfallChart({ data }: CashflowWaterfallChartProps) {
  // CSS 変数からカラーを解決し、ライト/ダークテーマに追従させる
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

  // 各ステップを「浮かす」ための透明バー
  const placeholders = data.map((s) => {
    if (s.type === "start" || s.type === "end") return 0
    if (s.value >= 0) {
      return s.cumulative - s.value
    }
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
            `現金水準: ${formatCurrency(step.cumulative, { short: true })}`,
          ].join("<br/>")
        }
        return [
          `<strong>${step.label}</strong>`,
          `${step.value >= 0 ? "入金" : "出金"}: ${formatCurrency(Math.abs(step.value), { short: true })}`,
          `現金残高（累計）: ${formatCurrency(step.cumulative, { short: true })}`,
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
        name: "キャッシュフロー",
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
      title="CF区分別ウォーターフォール"
      description="期首現金から営業CF・投資CF・財務CFを経て期末現金に至る流れ（最新月）"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
