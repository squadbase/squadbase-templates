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
        name: "Current year",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.currentYear),
        areaStyle: { opacity: 0.18 },
      },
      {
        name: "Prior year",
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
      title="Monthly Cost Trend (YoY)"
      description="Overlay total cost for current and prior year"
    >
      <EChart option={option} height="300px" />
    </DashboardCardPreset>
  )
}
