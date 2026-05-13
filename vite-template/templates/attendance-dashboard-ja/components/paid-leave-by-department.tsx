import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { DepartmentPaidLeave } from "@/types/attendance-dashboard"

interface PaidLeaveByDepartmentProps {
  data: DepartmentPaidLeave[]
}

const TARGET_PCT = 70

export function PaidLeaveByDepartment({ data }: PaidLeaveByDepartmentProps) {
  const sorted = [...data].sort((a, b) => b.usageRatePct - a.usageRatePct)
  const labels = sorted.map((d) => d.departmentLabel)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as Array<{ dataIndex: number }>
        const idx = arr[0]?.dataIndex ?? 0
        const d = sorted[idx]
        return [
          `<strong>${d.departmentLabel}</strong>`,
          `取得率: ${d.usageRatePct.toFixed(1)}%`,
          `取得 / 付与: ${d.usedDays.toFixed(1)} / ${d.grantedDays} 日`,
          `人数: ${d.headcount} 名`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { interval: 0, rotate: 20, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "取得率",
      min: 0,
      max: 100,
      axisLabel: { formatter: (v: number): string => `${v}%` },
    },
    series: [
      {
        name: "取得率",
        type: "bar",
        data: sorted.map((d) => Number(d.usageRatePct.toFixed(1))),
        barMaxWidth: 40,
        label: {
          show: true,
          position: "top",
          formatter: (params: { value: number }): string =>
            `${params.value.toFixed(0)}%`,
        },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { type: "dashed", color: "#a3a3a3" },
          label: { fontSize: 10, formatter: `目標 ${TARGET_PCT}%` },
          data: [{ yAxis: TARGET_PCT }],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="部署別 有給取得率"
      description={`部署ごとの年次有給取得率と全社目標 (${TARGET_PCT}%) の比較。`}
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
