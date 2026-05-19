import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { DowHeatmapCell } from "@/types/daily-sales-monitoring"

interface DayOfWeekHeatmapProps {
  data: DowHeatmapCell[]
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"]
const HEATMAP_ALPHA_STOPS = [0.06, 0.18, 0.32, 0.46, 0.6, 0.78, 0.95]

export function DayOfWeekHeatmap({ data }: DayOfWeekHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const weeks = Array.from(
    new Set(data.map((c) => c.weekIndex)),
  ).sort((a, b) => a - b)
  // 古い週を左、今週を右
  const weekLabels = weeks
    .slice()
    .reverse()
    .map((w) => (w === 0 ? "今週" : `${w}週前`))

  const maxRev = data.reduce((m, c) => (c.revenue > m ? c.revenue : m), 0)

  // x = 週インデックス (0=最古, 末尾=今週), y = 曜日を反転
  const seriesData = data.map((c) => [
    weeks.length - 1 - c.weekIndex,
    DAY_LABELS.length - 1 - c.dayOfWeek,
    c.revenue,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const day = DAY_LABELS[DAY_LABELS.length - 1 - p.value[1]]
        const weekIdx = weeks.length - 1 - p.value[0]
        const cell = data.find(
          (c) => c.weekIndex === weekIdx && c.dayOfWeek === DAY_LABELS.indexOf(day),
        )
        const label = weekIdx === 0 ? "今週" : `${weekIdx}週前`
        return [
          `<strong>${day}曜 · ${label}</strong>`,
          cell ? `売上: ${formatCurrency(cell.revenue)}` : "データなし",
          cell ? `日付: ${cell.date}` : "",
        ]
          .filter(Boolean)
          .join("<br/>")
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
      data: weekLabels,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: [...DAY_LABELS].reverse(),
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxRev,
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
        name: "日次売上",
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
      title="曜日別売上ヒートマップ (直近12週)"
      description="平日と週末の売上パターンを一目で把握"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
