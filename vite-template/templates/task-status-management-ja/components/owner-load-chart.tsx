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
        name: "未着手",
        type: "bar",
        stack: "load",
        data: [...data].reverse().map((d) => d.notStarted),
        barWidth: "60%",
      },
      {
        name: "進行中",
        type: "bar",
        stack: "load",
        data: [...data].reverse().map((d) => d.inProgress),
      },
      {
        name: "完了",
        type: "bar",
        stack: "load",
        data: [...data].reverse().map((d) => d.completed),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="担当者別タスク件数"
      description="ステータス別に担当者ごとの件数を積み上げ表示"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
