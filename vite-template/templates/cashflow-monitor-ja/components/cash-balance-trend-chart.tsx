import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import type { CashBalancePoint } from "@/types/cashflow-monitor"

interface CashBalanceTrendChartProps {
  data: CashBalancePoint[]
}

export function CashBalanceTrendChart({ data }: CashBalanceTrendChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined
          ? "-"
          : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.month),
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "現金残高",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "純CF",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "現金残高",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.cashBalance),
        areaStyle: { opacity: 0.18 },
      },
      {
        name: "純キャッシュフロー",
        type: "bar",
        yAxisIndex: 1,
        data: data.map((d) => d.netCashFlow),
        barMaxWidth: 28,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="現金残高の月次推移"
      description="月末現金残高と月次の純キャッシュフロー"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
