import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatHours } from "./chart-helpers"
import type { DowntimeHeatmapCell } from "@/types/equipment-maintenance-dashboard"

interface DowntimeHeatmapProps {
  data: DowntimeHeatmapCell[]
  equipmentNames: string[]
}

// --destructive をベースカラーにすることで、ダウンタイムが大きいセルがリスク色で目立つ
const HEATMAP_ALPHA_STOPS = [0.05, 0.16, 0.3, 0.46, 0.62, 0.78, 0.95]

export function DowntimeHeatmap({ data, equipmentNames }: DowntimeHeatmapProps) {
  const baseColor = useEChartsContrastColor("--destructive")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const weeks = Array.from(new Set(data.map((c) => c.weekIndex))).sort(
    (a, b) => a - b,
  )
  // 古い週を左、今週を右
  const weekLabels = weeks
    .slice()
    .reverse()
    .map((w) => (w === 0 ? "今週" : `${w}週前`))

  const maxDowntime = data.reduce(
    (m, c) => (c.downtimeHours > m ? c.downtimeHours : m),
    0,
  )

  // x = 週インデックス (0=最古, 末尾=今週), y = 設備行を反転
  const seriesData = data.map((c) => [
    weeks.length - 1 - c.weekIndex,
    equipmentNames.length - 1 - c.equipmentRow,
    Math.round(c.downtimeHours * 10) / 10,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const eqIdx = equipmentNames.length - 1 - p.value[1]
        const weekIdx = weeks.length - 1 - p.value[0]
        const cell = data.find(
          (c) => c.equipmentRow === eqIdx && c.weekIndex === weekIdx,
        )
        const eqName = equipmentNames[eqIdx]
        const weekLabel = weekIdx === 0 ? "今週" : `${weekIdx}週前`
        return [
          `<strong>${eqName} · ${weekLabel}</strong>`,
          cell ? `ダウンタイム: ${formatHours(cell.downtimeHours)}` : "データなし",
        ]
          .filter(Boolean)
          .join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "6%",
      bottom: "20%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: weekLabels,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: [...equipmentNames].reverse(),
      splitArea: { show: true },
      axisLabel: { fontSize: 11 },
    },
    visualMap: {
      min: 0,
      max: Math.max(1, Math.ceil(maxDowntime)),
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
        name: "ダウンタイム (h)",
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
      title="設備 × 週のダウンタイムヒートマップ"
      description="慢性的に不調な設備と特異な週を一目で発見"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
