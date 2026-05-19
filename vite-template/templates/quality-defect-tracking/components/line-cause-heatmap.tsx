import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber } from "./chart-helpers"
import type { HeatmapCell } from "@/types/quality-defect-tracking"

interface LineCauseHeatmapProps {
  data: HeatmapCell[]
}

const HEATMAP_ALPHA_STOPS = [0.06, 0.18, 0.32, 0.46, 0.6, 0.78, 0.95]

export function LineCauseHeatmap({ data }: LineCauseHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const lines = Array.from(new Set(data.map((c) => c.line)))
  const causes = Array.from(new Set(data.map((c) => c.cause)))
  const maxQty = data.reduce((m, c) => (c.qty > m ? c.qty : m), 0)

  const seriesData = data.map((c) => [
    causes.indexOf(c.cause),
    lines.indexOf(c.line),
    c.qty,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown): string => {
        const p = params as { value: [number, number, number] }
        const cause = causes[p.value[0]]
        const line = lines[p.value[1]]
        return [
          `<strong>${line} · ${cause}</strong>`,
          `Defects: ${formatNumber(p.value[2])}`,
        ].join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "6%",
      bottom: "22%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: causes,
      axisLabel: { interval: 0, rotate: 25 },
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: lines,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: Math.max(1, maxQty),
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
        name: "Defects",
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
      title="Line × Cause Heatmap"
      description="Defect concentration by production line and cause — find the hottest cells"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
