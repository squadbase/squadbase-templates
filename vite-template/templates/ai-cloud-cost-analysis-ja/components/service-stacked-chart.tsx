import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { ServiceMonthlyPoint } from "@/types/ai-cloud-cost-analysis"

interface ServiceStackedChartProps {
  data: ServiceMonthlyPoint[]
  services: string[]
}

export function ServiceStackedChart({ data, services }: ServiceStackedChartProps) {
  const months = data.map((p) => p.month)

  const series = services.map((svcLabel) => ({
    name: svcLabel,
    type: "bar" as const,
    stack: "cost",
    emphasis: { focus: "series" as const },
    data: data.map(
      (p) => p.series.find((s) => s.service === svcLabel)?.cost ?? 0,
    ),
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined
          ? "-"
          : formatCurrency(v as number, { short: true }),
    },
    legend: { bottom: 0, type: "scroll" },
    grid: { ...getBaseGrid(), bottom: "18%" },
    xAxis: {
      type: "category",
      data: months,
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series,
  }

  return (
    <DashboardCardPreset
      title="サービス別月次クラウドコスト"
      description="直近12ヶ月の月次コストをサービス別に積み上げ表示"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
