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
          `Cum. Budget: ${formatCurrency(p.budgetCum, { short: true })}`,
          `Cum. Actual: ${formatCurrency(p.actualCum, { short: true })}`,
          `Month Budget: ${formatCurrency(p.monthBudget, { short: true })}`,
          `Month Actual: ${formatCurrency(p.monthActual, { short: true })}`,
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
        name: "Cum. Budget",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { type: "dashed", width: 2 },
        data: data.map((d) => d.budgetCum),
      },
      {
        name: "Cum. Actual",
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
      title="Cumulative Actual vs Budget"
      description="Company-wide cumulative actual revenue tracked against the budget line"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
