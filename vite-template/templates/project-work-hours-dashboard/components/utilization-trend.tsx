import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatHours } from "./chart-helpers"
import type { UtilizationPoint } from "@/types/project-work-hours-dashboard"

interface UtilizationTrendProps {
  data: UtilizationPoint[]
}

export function UtilizationTrend({ data }: UtilizationTrendProps) {
  const weeks = data.map((d) => d.week.slice(5))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>Week of ${point.week}</strong>`,
          `Utilization: ${point.utilizationPct.toFixed(1)}%`,
          `Billable: ${formatHours(point.billableHours)} / ${formatHours(point.totalCapacityHours)}`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: weeks,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Utilization %",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.18 },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { type: "dashed", color: "#a3a3a3" },
          label: { fontSize: 10 },
          data: [
            { yAxis: 70, label: { formatter: "Healthy 70%" } },
            { yAxis: 90, label: { formatter: "Burnout 90%" } },
          ],
        },
        data: data.map((d) => d.utilizationPct),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Weekly Team Utilization"
      description="Billable hours as % of total capacity; healthy band is roughly 70-90%"
    >
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
