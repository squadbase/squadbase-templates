import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatTokens } from "./chart-helpers"
import type { ModelTokenCost } from "@/types/ai-cloud-cost-analysis"

interface ModelTokenCostChartProps {
  data: ModelTokenCost[]
}

export function ModelTokenCostChart({ data }: ModelTokenCostChartProps) {
  // Y軸にモデル (合計コスト昇順)、入力/出力コストを横方向に積み上げ
  const sorted = [...data].sort((a, b) => a.totalCost - b.totalCost)
  const models = sorted.map((m) => m.model)
  const inputs = sorted.map((m) => m.inputCost)
  const outputs = sorted.map((m) => m.outputCost)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { name: string; seriesName: string; value: number }[]
        if (!arr.length) return ""
        const model = arr[0].name
        const detail = sorted.find((m) => m.model === model)
        const lines = arr.map(
          (p) => `${p.seriesName}: ${formatCurrency(p.value, { short: true })}`,
        )
        if (detail) {
          lines.push(
            `入力トークン: ${formatTokens(detail.inputTokens)} @ ¥${detail.inputUnitPrice.toFixed(3)}/1K`,
          )
          lines.push(
            `出力トークン: ${formatTokens(detail.outputTokens)} @ ¥${detail.outputUnitPrice.toFixed(3)}/1K`,
          )
          lines.push(`合計: ${formatCurrency(detail.totalCost, { short: true })}`)
        }
        return [`<strong>${model}</strong>`, ...lines].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: { left: "3%", right: "6%", top: "6%", bottom: "18%", containLabel: true },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => formatCurrency(v, { short: true }),
      },
    },
    yAxis: {
      type: "category",
      data: models,
    },
    series: [
      {
        name: "入力コスト",
        type: "bar",
        stack: "cost",
        emphasis: { focus: "series" },
        data: inputs,
      },
      {
        name: "出力コスト",
        type: "bar",
        stack: "cost",
        emphasis: { focus: "series" },
        data: outputs,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="AIモデル別トークンコスト"
      description="モデル別の入出力トークンコスト (トークン数 × 単価)"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
