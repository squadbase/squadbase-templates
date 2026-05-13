import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { MemberUtilization } from "@/types/member-utilization-monitor"

interface MemberUtilizationBarProps {
  data: MemberUtilization[]
}

const TARGET_LOW = 65
const TARGET_HIGH = 90

export function MemberUtilizationBar({ data }: MemberUtilizationBarProps) {
  const okColor = useEChartsContrastColor("--chart-1")
  const lowColor = useEChartsContrastColor("--chart-3")
  const highColor = useEChartsContrastColor("--chart-4")

  const sorted = [...data].sort((a, b) => b.utilizationPct - a.utilizationPct)
  const names = sorted.map((m) => m.memberName)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const m = sorted[idx]
        return [
          `<strong>${m.memberName}</strong>`,
          `<span style="color:#737373">${m.team}</span>`,
          `稼働率: ${m.utilizationPct.toFixed(1)}%`,
          `稼働: ${m.workHours}h / ${m.availableHours}h`,
          `残業: ${m.overtimeHours}h`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: names,
      axisLabel: { interval: 0, rotate: 30, fontSize: 10 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 120,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "稼働率",
        type: "bar",
        barMaxWidth: 24,
        data: sorted.map((m) => ({
          value: m.utilizationPct,
          itemStyle: {
            color:
              m.utilizationPct > TARGET_HIGH
                ? highColor
                : m.utilizationPct < TARGET_LOW
                  ? lowColor
                  : okColor,
            borderRadius: [3, 3, 0, 0],
          },
        })),
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { type: "dashed", color: "#a3a3a3" },
          label: { fontSize: 10 },
          data: [
            { yAxis: TARGET_LOW, label: { formatter: `${TARGET_LOW}%` } },
            { yAxis: TARGET_HIGH, label: { formatter: `${TARGET_HIGH}%` } },
          ],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="メンバー別 稼働率"
      description="月次稼働率を高い順に表示。健全レンジ (65–90%) を点線で明示"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
