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
          `<strong>Discount ${bin.label}</strong>`,
          `Transactions: ${bin.count}`,
          `Revenue: ${formatCurrency(bin.revenue, { short: true })}`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((b) => b.label),
      axisLabel: { interval: 0, fontSize: 11, rotate: 30 },
      name: "Discount rate",
      nameLocation: "middle",
      nameGap: 42,
    },
    yAxis: {
      type: "value",
      name: "Transactions",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Transactions",
        type: "bar",
        // barCategoryGap: 0 gives a true histogram look
        barCategoryGap: "5%",
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((b) => b.count),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Discount Rate Distribution"
      description="How transactions are distributed across 5% discount bands"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
