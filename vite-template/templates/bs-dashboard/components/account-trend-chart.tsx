import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { AccountTrendPoint } from "@/types/bs-dashboard"

interface AccountTrendChartProps {
  data: AccountTrendPoint[]
}

export function AccountTrendChart({ data }: AccountTrendChartProps) {
  const months = data.map((d) => d.month.slice(2))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined
          ? "-"
          : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0, type: "scroll" },
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
        name: "Cash & Deposits",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.cash),
      },
      {
        name: "Accounts Receivable",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.receivable),
      },
      {
        name: "Inventory",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.inventory),
      },
      {
        name: "Fixed Assets",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.fixedAssets),
      },
      {
        name: "Short-term Debt",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.shortTermDebt),
      },
      {
        name: "Long-term Debt",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: data.map((d) => d.longTermDebt),
      },
      {
        name: "Equity",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        data: data.map((d) => d.equity),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Monthly Account Trend"
      description="Track movement of major accounts month-over-month"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
