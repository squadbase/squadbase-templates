import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatHours, formatSignedPercent } from "./chart-helpers"
import type { ProjectHoursRow } from "@/types/project-work-hours-dashboard"

interface PlanVsActualVarianceProps {
  data: ProjectHoursRow[]
}

export function PlanVsActualVariance({ data }: PlanVsActualVarianceProps) {
  const positiveColor = useEChartsContrastColor("--chart-4") // over plan (concerning)
  const negativeColor = useEChartsContrastColor("--chart-2") // under plan (good)

  // Sort: most overrun on top, most under at bottom
  const sorted = [...data].sort((a, b) => b.variance - a.variance)
  const projects = sorted.map((d) => d.projectName)
  const maxAbs = Math.max(...sorted.map((d) => Math.abs(d.variance)))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const row = [...sorted].reverse()[idx]
        return [
          `<strong>${row.projectName}</strong>`,
          `Planned: ${formatHours(row.totalPlanned)}`,
          `Actual: ${formatHours(row.totalActual)}`,
          `Variance: ${row.variance >= 0 ? "+" : ""}${row.variance}h (${formatSignedPercent(row.variancePct)})`,
        ].join("<br/>")
      },
    },
    grid: { left: "3%", right: "4%", bottom: "8%", top: "6%", containLabel: true },
    xAxis: {
      type: "value",
      name: "Variance (hours)",
      nameLocation: "middle",
      nameGap: 28,
      min: -Math.ceil(maxAbs * 1.1),
      max: Math.ceil(maxAbs * 1.1),
      axisLabel: { formatter: (v: number) => `${v}h` },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    yAxis: {
      type: "category",
      data: [...projects].reverse(),
    },
    series: [
      {
        name: "Variance",
        type: "bar",
        barMaxWidth: 22,
        data: [...sorted].reverse().map((row) => ({
          value: row.variance,
          itemStyle: {
            color: row.variance >= 0 ? positiveColor : negativeColor,
            borderRadius: row.variance >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3],
          },
        })),
        label: {
          show: true,
          position: "right",
          fontSize: 10,
          formatter: (p: unknown) => {
            const v = (p as { value: number }).value
            return `${v >= 0 ? "+" : ""}${v}h`
          },
        },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: "#a3a3a3" },
          label: { show: false },
          data: [{ xAxis: 0 }],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Plan vs Actual Variance"
      description="Diverging bar of hours over/under plan per project — left of zero is under plan, right is over"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
