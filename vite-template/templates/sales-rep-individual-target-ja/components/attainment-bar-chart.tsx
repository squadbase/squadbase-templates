import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { RepAttainment } from "@/types/sales-rep-individual-target"

interface AttainmentBarChartProps {
  data: RepAttainment[]
}

export function AttainmentBarChart({ data }: AttainmentBarChartProps) {
  // 横棒は category 順の下からプロット — 上位を上に出すため反転する
  const ordered = [...data].sort((a, b) => a.attainmentPct - b.attainmentPct)
  const names = ordered.map((r) => r.salesRep)

  const seriesData = ordered.map((r) => ({
    value: Number(r.attainmentPct.toFixed(1)),
    itemStyle: {
      color:
        r.status === "ahead"
          ? "hsl(var(--chart-1))"
          : r.status === "on-track"
            ? "hsl(var(--chart-2))"
            : "hsl(var(--chart-5))",
    },
    extra: r,
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as Array<{
          name: string
          value: number
          data: { extra: RepAttainment }
        }>
        if (!arr.length) return ""
        const p = arr[0]
        const r = p.data.extra
        return [
          `<strong>${r.salesRep}</strong>`,
          `達成率: ${r.attainmentPct.toFixed(1)}%`,
          `目標: ${formatCurrency(r.target, { short: true })}`,
          `実績: ${formatCurrency(r.actual, { short: true })}`,
          `残目標: ${formatCurrency(r.remaining, { short: true })}`,
        ].join("<br/>")
      },
    },
    grid: { left: "4%", right: "10%", top: "4%", bottom: "10%", containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      max: (value: { max: number }) => Math.max(120, Math.ceil(value.max / 10) * 10),
      axisLabel: { formatter: (v: number): string => `${v}%` },
    },
    yAxis: {
      type: "category",
      data: names,
      axisTick: { show: false },
    },
    series: [
      {
        name: "達成率",
        type: "bar",
        data: seriesData,
        barWidth: "55%",
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }): string => `${params.value}%`,
        },
        markLine: {
          symbol: "none",
          lineStyle: { type: "dashed", color: "hsl(var(--muted-foreground))" },
          label: {
            position: "end",
            formatter: "目標",
            color: "hsl(var(--muted-foreground))",
          },
          data: [{ xAxis: 100 }],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="個人別の達成率"
      description="当月の実績 ÷ 目標を横棒で表示。色はペース判定 (先行 / 順調 / 遅れ) に対応します。"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
