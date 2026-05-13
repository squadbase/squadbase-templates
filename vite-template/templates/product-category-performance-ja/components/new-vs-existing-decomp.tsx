import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getDualAxisGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { NewExistingDecompPoint } from "@/types/product-category-performance"

interface NewVsExistingDecompProps {
  data: NewExistingDecompPoint[]
}

export function NewVsExistingDecomp({ data }: NewVsExistingDecompProps) {
  const months = data.map((d) => d.yearMonth)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        const total = point.newRevenue + point.existingRevenue
        return [
          `<strong>${point.yearMonth}</strong>`,
          `既存商品: ${formatCurrency(point.existingRevenue, { short: true })} (${(100 - point.newContributionPct).toFixed(1)}%)`,
          `新商品: ${formatCurrency(point.newRevenue, { short: true })} (${point.newContributionPct.toFixed(1)}%)`,
          `合計: ${formatCurrency(total, { short: true })}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: months,
    },
    yAxis: [
      {
        type: "value",
        name: "売上",
        min: 0,
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "新商品 %",
        min: 0,
        max: 50,
        axisLabel: { formatter: (v: number) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "既存商品",
        type: "bar",
        yAxisIndex: 0,
        stack: "rev",
        barMaxWidth: 36,
        data: data.map((d) => d.existingRevenue),
      },
      {
        name: "新商品",
        type: "bar",
        yAxisIndex: 0,
        stack: "rev",
        barMaxWidth: 36,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: data.map((d) => d.newRevenue),
      },
      {
        name: "新商品寄与率",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.newContributionPct),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="新商品 vs 既存商品の寄与分解"
      description="新商品と既存商品の月次売上スタックに、新商品寄与率の折れ線を重ねて表示"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
