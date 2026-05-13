import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  getBaseGrid,
  formatCurrencyOku,
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
        v === null || v === undefined ? "-" : formatCurrencyOku(v as number),
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
      axisLabel: { formatter: (v: number) => `${formatNumber(v)}億円` },
    },
    series: [
      {
        name: "配当総額",
        type: "bar",
        barMaxWidth: 36,
        data: data.map((d) => d.dividendTotal),
        label: {
          show: true,
          position: "top",
          formatter: (p: { value: number }) =>
            p.value >= 10_000
              ? `${(p.value / 10_000).toFixed(2)}兆円`
              : `${Math.round(p.value)}億円`,
          fontSize: 11,
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="年度別 配当総額"
      description="株主への年間配当支払額 (億円)"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
