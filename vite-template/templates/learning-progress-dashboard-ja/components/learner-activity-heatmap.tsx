import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import type { LearnerActivityCell } from "@/types/learning-progress-dashboard"

interface LearnerActivityHeatmapProps {
  data: LearnerActivityCell[]
}

const HEATMAP_ALPHA_STOPS = [0.06, 0.18, 0.32, 0.46, 0.6, 0.78, 0.95]

export function LearnerActivityHeatmap({ data }: LearnerActivityHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const learners = Array.from(
    new Map(data.map((c) => [c.learnerIndex, c.learnerName])).entries(),
  ).sort((a, b) => a[0] - b[0])
  const days = Array.from(new Set(data.map((c) => c.dayIndex))).sort(
    (a, b) => a - b,
  )

  // x軸 = 日付 (左=過去, 右=今日), y軸 = 受講者 (先頭を上)
  const dayLabels = days
    .slice()
    .reverse()
    .map((d) => (d === 0 ? "今日" : `${d}日前`))
  const learnerLabels = learners.map((l) => l[1]).reverse()

  const maxDelta = data.reduce(
    (m, c) => (c.progressDelta > m ? c.progressDelta : m),
    0,
  )

  const seriesData = data.map((c) => [
    days.length - 1 - c.dayIndex,
    learners.length - 1 - c.learnerIndex,
    c.progressDelta,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const learnerIdx = learners.length - 1 - p.value[1]
        const dayIdx = days.length - 1 - p.value[0]
        const cell = data.find(
          (c) => c.learnerIndex === learnerIdx && c.dayIndex === dayIdx,
        )
        if (!cell) return "データなし"
        const dayLabel = dayIdx === 0 ? "今日" : `${dayIdx}日前`
        return [
          `<strong>${cell.learnerName}</strong>`,
          `${dayLabel} (${cell.date})`,
          cell.progressDelta > 0
            ? `進捗: +${cell.progressDelta}%`
            : "未受講",
        ].join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "6%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dayLabels,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: learnerLabels,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: Math.max(maxDelta, 1),
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
        name: "日次進捗",
        type: "heatmap",
        data: seriesData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        progressive: 0,
        animation: false,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="受講者別アクティビティ (直近14日)"
      description="受講者ごとの日次進捗 — 停滞している人を一目で把握"
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
