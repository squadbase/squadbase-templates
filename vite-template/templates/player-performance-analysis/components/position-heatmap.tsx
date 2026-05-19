import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import type { PositionHeatmapCell } from "@/types/player-performance-analysis"

interface PositionHeatmapProps {
  data: PositionHeatmapCell[]
}

const POSITIONS = ["GK", "DF", "MF", "FW"] as const
const METRICS = ["distance", "sprint", "minutes", "condition"] as const
const METRIC_LABELS: Record<(typeof METRICS)[number], string> = {
  distance: "Distance",
  sprint: "Sprints",
  minutes: "Minutes",
  condition: "Condition",
}
const HEATMAP_ALPHA_STOPS = [0.06, 0.18, 0.32, 0.46, 0.6, 0.78, 0.95]

function formatMetricValue(metric: string, value: number): string {
  if (metric === "distance") return `${(value / 1000).toFixed(2)} km`
  if (metric === "sprint") return `${Math.round(value)}`
  if (metric === "minutes") return `${Math.round(value)} min`
  return value.toFixed(1)
}

export function PositionHeatmap({ data }: PositionHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  // x = metric column index, y = position index (FW on top for visual)
  const seriesData = data.map((c) => [
    METRICS.indexOf(c.metric),
    POSITIONS.length - 1 - POSITIONS.indexOf(c.position),
    Math.round(c.normalized * 100),
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const metric = METRICS[p.value[0]]
        const position = POSITIONS[POSITIONS.length - 1 - p.value[1]]
        const cell = data.find(
          (c) => c.metric === metric && c.position === position,
        )
        return [
          `<strong>${position} · ${METRIC_LABELS[metric]}</strong>`,
          cell ? `Value: ${formatMetricValue(metric, cell.value)}` : "",
          cell ? `Rank score: ${Math.round(cell.normalized * 100)}` : "",
        ]
          .filter(Boolean)
          .join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "8%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: METRICS.map((m) => METRIC_LABELS[m]),
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: [...POSITIONS].reverse(),
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 12,
      text: ["High", "Low"],
      inRange: gradient ? { color: gradient } : undefined,
    },
    series: [
      {
        name: "Position score",
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
      title="Performance by Position"
      description="Normalized score for each position across the four performance dimensions"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
