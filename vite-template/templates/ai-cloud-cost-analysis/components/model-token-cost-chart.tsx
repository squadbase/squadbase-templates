import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatTokens } from "./chart-helpers"
import type { ModelTokenCost } from "@/types/ai-cloud-cost-analysis"

interface ModelTokenCostChartProps {
  data: ModelTokenCost[]
}

export function ModelTokenCostChart({ data }: ModelTokenCostChartProps) {
  // Models on the y-axis (descending by total cost), input/output stacked as horizontal bars
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
            `Input tokens: ${formatTokens(detail.inputTokens)} @ $${detail.inputUnitPrice.toFixed(4)}/1K`,
          )
          lines.push(
            `Output tokens: ${formatTokens(detail.outputTokens)} @ $${detail.outputUnitPrice.toFixed(4)}/1K`,
          )
          lines.push(`Total: ${formatCurrency(detail.totalCost, { short: true })}`)
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
        name: "Input cost",
        type: "bar",
        stack: "cost",
        emphasis: { focus: "series" },
        data: inputs,
      },
      {
        name: "Output cost",
        type: "bar",
        stack: "cost",
        emphasis: { focus: "series" },
        data: outputs,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="AI Model Token Cost"
      description="Input vs. output token cost per model (tokens × unit price)"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
