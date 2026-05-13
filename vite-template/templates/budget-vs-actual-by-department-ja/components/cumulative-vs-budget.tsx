import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { CumulativePoint } from "@/types/budget-vs-actual-by-department"

interface CumulativeVsBudgetProps {
  data: CumulativePoint[]
}

export function CumulativeVsBudget({ data }: CumulativeVsBudgetProps) {
  const months = data.map((d) => d.month)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const p = data[idx]
        return [
          `<strong>${p.month}</strong>`,
          `累計予算: ${formatCurrency(p.budgetCum, { short: true })}`,
          `累計実績: ${formatCurrency(p.actualCum, { short: true })}`,
          `月予算: ${formatCurrency(p.monthBudget, { short: true })}`,
          `月実績: ${formatCurrency(p.monthActual, { short: true })}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "累計予算",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { type: "dashed", width: 2 },
        data: data.map((d) => d.budgetCum),
      },
      {
        name: "累計実績",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.16 },
        data: data.map((d) => d.actualCum),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="月次累計 vs 予算ライン"
      description="全社累計実績を予算ラインと比較"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
