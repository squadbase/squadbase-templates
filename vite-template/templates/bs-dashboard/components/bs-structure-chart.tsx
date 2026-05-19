import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { BsStructure } from "@/types/bs-dashboard"

interface BsStructureChartProps {
  data: BsStructure
}

export function BsStructureChart({ data }: BsStructureChartProps) {
  const total = data.totalAssets

  // Two stacked bars: Assets vs Liabilities + Equity
  // Side A: assets in priority order
  // Side B: liabilities then equity (stacked)
  const assetSeries = data.assets.map((item) => ({
    name: item.label,
    type: "bar" as const,
    stack: "assets",
    data: [item.amount, 0],
    emphasis: { focus: "series" as const },
    label: {
      show: item.share >= 6,
      position: "inside" as const,
      formatter: () => `${item.label}\n${item.share.toFixed(1)}%`,
      fontSize: 10,
    },
  }))

  const liabilitySeries = data.liabilities.map((item) => ({
    name: item.label,
    type: "bar" as const,
    stack: "liabilities",
    data: [0, item.amount],
    emphasis: { focus: "series" as const },
    label: {
      show: (item.amount / (data.totalLiabilities + data.totalEquity)) * 100 >= 6,
      position: "inside" as const,
      formatter: () =>
        `${item.label}\n${formatPercent((item.amount / (data.totalLiabilities + data.totalEquity)) * 100)}`,
      fontSize: 10,
    },
  }))

  const equitySeries = data.equity.map((item) => ({
    name: item.label,
    type: "bar" as const,
    stack: "liabilities",
    data: [0, item.amount],
    emphasis: { focus: "series" as const },
    label: {
      show: (item.amount / (data.totalLiabilities + data.totalEquity)) * 100 >= 6,
      position: "inside" as const,
      formatter: () =>
        `${item.label}\n${formatPercent((item.amount / (data.totalLiabilities + data.totalEquity)) * 100)}`,
      fontSize: 10,
    },
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          seriesName: string
          value: number
          dataIndex: number
        }
        const side = p.dataIndex === 0 ? "Assets" : "Liabilities & Equity"
        const denom =
          p.dataIndex === 0 ? data.totalAssets : data.totalLiabilities + data.totalEquity
        const sharePct = denom === 0 ? 0 : (p.value / denom) * 100
        return [
          `<strong>${p.seriesName}</strong>`,
          `Side: ${side}`,
          `Amount: ${formatCurrency(p.value, { short: true })}`,
          `Share: ${sharePct.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0, type: "scroll" },
    grid: { left: "3%", right: "4%", top: "8%", bottom: "20%", containLabel: true },
    xAxis: {
      type: "value",
      max: Math.max(data.totalAssets, data.totalLiabilities + data.totalEquity) * 1.02,
      axisLabel: { formatter: (v: number) => formatCurrency(v, { short: true }) },
    },
    yAxis: {
      type: "category",
      data: ["Assets", "Liabilities & Equity"],
    },
    series: [...assetSeries, ...liabilitySeries, ...equitySeries],
  }

  return (
    <DashboardCardPreset
      title="Balance Sheet Structure"
      description="Latest snapshot — assets vs. liabilities & equity composition"
    >
      <EChart option={option} height="320px" />
      <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3 text-xs">
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Total Assets</div>
          <div className="font-semibold tabular-nums">
            {formatCurrency(data.totalAssets, { short: true })}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Total Liabilities</div>
          <div className="font-semibold tabular-nums">
            {formatCurrency(data.totalLiabilities, { short: true })}
            <span className="ml-1 text-muted-foreground">
              ({((data.totalLiabilities / total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Total Equity</div>
          <div className="font-semibold tabular-nums">
            {formatCurrency(data.totalEquity, { short: true })}
            <span className="ml-1 text-muted-foreground">
              ({((data.totalEquity / total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </DashboardCardPreset>
  )
}
