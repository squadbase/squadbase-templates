import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getBaseGrid,
  formatCurrencyMillions,
  formatNumber,
} from "./chart-helpers"
import type { AnnualPoint } from "@/types/shareholder-return-dashboard"

interface DividendBarChartProps {
  data: AnnualPoint[]
}

export function DividendBarChart({ data }: DividendBarChartProps) {
  const labels = data.map((d) => d.fiscalLabel)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrencyMillions(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: labels,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => `$${formatNumber(v)}M` },
    },
    series: [
      {
        name: "Dividend Total",
        type: "bar",
        barMaxWidth: 36,
        data: data.map((d) => d.dividendTotal),
        label: {
          show: true,
          position: "top",
          formatter: (p: { value: number }) =>
            p.value >= 1_000
              ? `$${(p.value / 1_000).toFixed(2)}B`
              : `$${Math.round(p.value)}M`,
          fontSize: 11,
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Dividend Total by Fiscal Year"
      description="Annual dividend amount paid to shareholders (USD millions)"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
