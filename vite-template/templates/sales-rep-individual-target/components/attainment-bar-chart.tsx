import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { RepAttainment } from "@/types/sales-rep-individual-target"

interface AttainmentBarChartProps {
  data: RepAttainment[]
}

export function AttainmentBarChart({ data }: AttainmentBarChartProps) {
  // ECharts renders the first category at the bottom of a horizontal bar by
  // default. We want the highest attainment on top, so we reverse the order.
  const ordered = [...data].sort((a, b) => a.attainmentPct - b.attainmentPct)
  const names = ordered.map((r) => r.salesRep)

  // Color per rep based on status — encoded via per-data itemStyle
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
          `Attainment: ${r.attainmentPct.toFixed(1)}%`,
          `Target: ${formatCurrency(r.target, { short: true })}`,
          `Actual: ${formatCurrency(r.actual, { short: true })}`,
          `Remaining: ${formatCurrency(r.remaining, { short: true })}`,
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
        name: "Attainment",
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
            formatter: "Target",
            color: "hsl(var(--muted-foreground))",
          },
          data: [{ xAxis: 100 }],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Attainment by Sales Rep"
      description="Horizontal view of actual ÷ target for the current month. Colors reflect pace status (ahead / on track / behind)."
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
