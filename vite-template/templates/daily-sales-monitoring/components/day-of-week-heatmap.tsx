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

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HEATMAP_ALPHA_STOPS = [0.06, 0.18, 0.32, 0.46, 0.6, 0.78, 0.95]

export function DayOfWeekHeatmap({ data }: DayOfWeekHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const weeks = Array.from(
    new Set(data.map((c) => c.weekIndex)),
  ).sort((a, b) => a - b)
  // Older weeks on the left, current week on the right
  const weekLabels = weeks
    .slice()
    .reverse()
    .map((w) => (w === 0 ? "This wk" : `-${w}w`))

  const maxRev = data.reduce((m, c) => (c.revenue > m ? c.revenue : m), 0)

  // x = week column index (0 = oldest, last = current), y = dayOfWeek inverted
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
        const label = weekIdx === 0 ? "This week" : `${weekIdx} week(s) ago`
        return [
          `<strong>${day} · ${label}</strong>`,
          cell ? `Revenue: ${formatCurrency(cell.revenue)}` : "No data",
          cell ? `Date: ${cell.date}` : "",
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
      text: ["High", "Low"],
      inRange: gradient ? { color: gradient } : undefined,
    },
    series: [
      {
        name: "Daily revenue",
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
      title="Sales by Day of Week (last 12 weeks)"
      description="Spot recurring weekday vs. weekend patterns at a glance"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
