import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  formatCurrency,
  formatNumber,
  formatSignedPercent,
} from "./chart-helpers"
import type { BudgetVarianceRow } from "@/types/finance-budget"

interface BulletBudgetChartProps {
  data: BudgetVarianceRow[]
}

const STATUS_COLOR = {
  achieved: "#10b981",
  warning: "#f59e0b",
  unmet: "#ef4444",
} as const

export function BulletBudgetChart({ data }: BulletBudgetChartProps) {
  // 横棒: yAxis=category(部門), xAxis=value
  // 予算バー(淡色・太い) + 実績バー(濃色・細い) を barGap:-100% で重ねる
  const sorted = [...data].sort(
    (a, b) => Math.abs(b.varianceRate) - Math.abs(a.varianceRate),
  )

  const categories = sorted.map((r) => r.department)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number; seriesName: string; value: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const row = sorted[idx]
        return [
          `<strong>${row.department}</strong>`,
          `予算: ${formatCurrency(row.budget, { short: true })}`,
          `実績: ${formatCurrency(row.actual, { short: true })}`,
          `差異: ${row.variance >= 0 ? "+" : ""}${formatCurrency(row.variance, { short: true })} (${formatSignedPercent(row.varianceRate)})`,
        ].join("<br/>")
      },
    },
    legend: {
      bottom: 0,
      data: ["予算", "実績"],
    },
    grid: { left: "3%", right: "12%", bottom: "14%", top: "3%", containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true,
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: "予算",
        type: "bar",
        data: sorted.map((r) => r.budget),
        itemStyle: { color: "#94a3b840", borderRadius: [0, 4, 4, 0] },
        barWidth: "64%",
        barGap: "-100%",
        z: 1,
      },
      {
        name: "実績",
        type: "bar",
        data: sorted.map((r) => ({
          value: r.actual,
          itemStyle: {
            color: STATUS_COLOR[r.status],
            borderRadius: [0, 3, 3, 0],
          },
        })),
        barWidth: "28%",
        z: 2,
        markPoint: {
          symbol: "pin",
          symbolSize: 0,
          label: {
            show: true,
            position: "right",
            formatter: (p: { dataIndex: number }) => {
              const r = sorted[p.dataIndex]
              return formatSignedPercent(r.varianceRate)
            },
            color: "inherit",
            fontSize: 11,
            fontWeight: "bold",
          },
          data: sorted.map((_, i) => ({
            xAxis: sorted[i].actual,
            yAxis: i,
          })),
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="部門別 予実バレット"
      description="淡バー=予算 / 濃バー=実績。ステータス別カラーで乖離を即時把握"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
