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
  const positiveColor = useEChartsContrastColor("--chart-4")
  const negativeColor = useEChartsContrastColor("--chart-2")

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
          `計画: ${formatHours(row.totalPlanned)}`,
          `実績: ${formatHours(row.totalActual)}`,
          `差分: ${row.variance >= 0 ? "+" : ""}${row.variance}h (${formatSignedPercent(row.variancePct)})`,
        ].join("<br/>")
      },
    },
    grid: { left: "3%", right: "4%", bottom: "8%", top: "6%", containLabel: true },
    xAxis: {
      type: "value",
      name: "差分 (時間)",
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
        name: "差分",
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
      title="計画 vs 実績 差分"
      description="プロジェクトごとの計画超過/未達を発散バーで表示。左側=未達, 右側=超過"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
