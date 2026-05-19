import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { OwnerLoadItem } from "@/types/task-status-management"

interface OwnerLoadChartProps {
  data: OwnerLoadItem[]
}

export function OwnerLoadChart({ data }: OwnerLoadChartProps) {
  const owners = data.map((d) => d.owner)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: { bottom: 0 },
    grid: { ...getBaseGrid(), bottom: "18%" },
    xAxis: {
      type: "value",
      minInterval: 1,
    },
    yAxis: {
      type: "category",
      data: [...owners].reverse(),
    },
    series: [
      {
        name: "Not Started",
        type: "bar",
        stack: "load",
        data: [...data].reverse().map((d) => d.notStarted),
        barWidth: "60%",
      },
      {
        name: "In Progress",
        type: "bar",
        stack: "load",
        data: [...data].reverse().map((d) => d.inProgress),
      },
      {
        name: "Completed",
        type: "bar",
        stack: "load",
        data: [...data].reverse().map((d) => d.completed),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Tasks by Owner"
      description="Stacked count of tasks per assignee across statuses"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
