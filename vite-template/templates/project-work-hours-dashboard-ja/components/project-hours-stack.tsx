import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatHours, formatNumber } from "./chart-helpers"
import type { ProjectHoursRow } from "@/types/project-work-hours-dashboard"
import { orderedMembers } from "@/lib/project-work-hours-dashboard-mock-data"

interface ProjectHoursStackProps {
  data: ProjectHoursRow[]
}

export function ProjectHoursStack({ data }: ProjectHoursStackProps) {
  const projects = data.map((d) => d.projectName)

  const topMembers = orderedMembers.slice(0, 8)
  const series = topMembers.map((m) => ({
    name: m.name,
    type: "bar" as const,
    stack: "hours",
    barMaxWidth: 26,
    data: data.map((d) => d.members[m.id] || 0),
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) => formatHours(v as number),
    },
    legend: { bottom: 0, type: "scroll" },
    grid: { left: "3%", right: "4%", bottom: "20%", top: "4%", containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      type: "category",
      data: [...projects].reverse(),
      inverse: false,
    },
    series: series.map((s) => ({
      ...s,
      data: [...s.data].reverse(),
    })),
  }

  return (
    <DashboardCardPreset
      title="プロジェクト別工数 (メンバー別)"
      description="プロジェクト別の投入工数をメンバー単位でスタック表示"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
