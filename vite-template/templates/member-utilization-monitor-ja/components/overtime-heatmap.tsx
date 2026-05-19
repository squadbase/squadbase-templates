import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import type { OvertimeCell } from "@/types/member-utilization-monitor"
import { members } from "@/lib/member-utilization-monitor-mock-data"

interface OvertimeHeatmapProps {
  data: OvertimeCell[]
}

const ALPHA_STOPS = [0.04, 0.18, 0.34, 0.5, 0.68, 0.84, 1]

export function OvertimeHeatmap({ data }: OvertimeHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-4")
  const gradient = baseColor
    ? ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const memberOrder = members.map((m) => m.memberName)
  const weeks = Array.from(new Set(data.map((c) => c.week))).sort()
  const maxOvertime = data.reduce(
    (m, c) => (c.overtimeHours > m ? c.overtimeHours : m),
    0,
  )

  const seriesData = data.map((c) => [
    weeks.indexOf(c.week),
    memberOrder.length - 1 - memberOrder.indexOf(c.memberName),
    c.overtimeHours,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const memberName = memberOrder[memberOrder.length - 1 - p.value[1]]
        const week = weeks[p.value[0]]
        return [
          `<strong>${memberName}</strong>`,
          `週: ${week}`,
          `残業: ${p.value[2]}h`,
        ].join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "4%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: weeks.map((w) => w.slice(5)),
      splitArea: { show: true },
      axisLabel: { interval: 0, rotate: 30, fontSize: 10 },
    },
    yAxis: {
      type: "category",
      data: [...memberOrder].reverse(),
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    visualMap: {
      min: 0,
      max: maxOvertime,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 12,
      text: ["多い", "少ない"],
      inRange: gradient ? { color: gradient } : undefined,
    },
    series: [
      {
        name: "残業",
        type: "heatmap",
        data: seriesData,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 6, shadowColor: "rgba(0,0,0,0.25)" },
        },
        progressive: 0,
        animation: false,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="残業ヒートマップ (メンバー × 週)"
      description="特定メンバー・週への残業集中を可視化"
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
