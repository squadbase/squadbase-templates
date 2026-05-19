import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatPercent } from "./chart-helpers"
import type { AnnualPoint } from "@/types/shareholder-return-dashboard"

interface PayoutRatioTrendChartProps {
  data: AnnualPoint[]
}

export function PayoutRatioTrendChart({ data }: PayoutRatioTrendChartProps) {
  const labels = data.map((d) => d.fiscalLabel)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatPercent(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Dividend Payout Ratio",
        type: "bar",
        stack: "payout",
        barMaxWidth: 32,
        data: data.map((d) => Math.round(d.payoutRatio * 10) / 10),
      },
      {
        name: "Buyback Ratio",
        type: "bar",
        stack: "payout",
        barMaxWidth: 32,
        data: data.map((d) => Math.round(d.buybackRatio * 10) / 10),
      },
      {
        name: "Total Payout Ratio",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: data.map((d) => Math.round(d.totalReturnRatio * 10) / 10),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Total Payout Ratio by Fiscal Year"
      description="Dividend ratio + buyback ratio, with the total payout ratio overlaid"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
