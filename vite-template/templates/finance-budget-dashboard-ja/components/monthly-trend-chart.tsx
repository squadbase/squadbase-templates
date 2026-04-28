import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { MonthlyCostPoint } from "@/types/finance-budget"

interface MonthlyTrendChartProps {
  data: MonthlyCostPoint[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.month.slice(5)),
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "当期",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.currentYear),
        areaStyle: { opacity: 0.18 },
      },
      {
        name: "前期",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.previousYear),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="月次コスト推移 (前期比較)"
      description="当期と前期の総コストを重ねて表示"
    >
      <EChart option={option} height="300px" />
    </DashboardCardPreset>
  )
}
