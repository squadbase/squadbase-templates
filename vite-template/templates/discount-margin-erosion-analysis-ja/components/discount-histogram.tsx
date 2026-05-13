import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { DiscountBin } from "@/types/discount-margin-erosion-analysis"

interface DiscountHistogramProps {
  data: DiscountBin[]
}

export function DiscountHistogram({ data }: DiscountHistogramProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const bin = data[idx]
        return [
          `<strong>値引き ${bin.label}</strong>`,
          `取引数: ${bin.count}`,
          `売上: ${formatCurrency(bin.revenue, { short: true })}`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((b) => b.label),
      axisLabel: { interval: 0, fontSize: 11, rotate: 30 },
      name: "値引き率",
      nameLocation: "middle",
      nameGap: 42,
    },
    yAxis: {
      type: "value",
      name: "取引数",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "取引数",
        type: "bar",
        barCategoryGap: "5%",
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((b) => b.count),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="値引き率の分布"
      description="取引が 5% 刻みの値引き帯にどう分布しているかを確認"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
