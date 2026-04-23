import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber } from "./chart-helpers"
import type { HeatmapCell } from "@/types/web-seo"

interface HourlyHeatmapChartProps {
  data: HeatmapCell[]
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"]
const HOUR_LABELS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}`,
)

export function HourlyHeatmapChart({ data }: HourlyHeatmapChartProps) {
  const maxPv = data.reduce((m, c) => (c.pageviews > m ? c.pageviews : m), 0)

  // echart heatmap の Y 軸は下→上の順で index が増える。
  // 月を上に置きたいので Y を逆順で受ける (日=0, ..., 月=6)
  const seriesData = data.map((c) => [
    c.hour,
    DAY_LABELS.length - 1 - c.dayOfWeek,
    c.pageviews,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const hour = p.value[0]
        const day = DAY_LABELS[DAY_LABELS.length - 1 - p.value[1]]
        const cell = data.find(
          (c) => c.hour === hour && DAY_LABELS[c.dayOfWeek] === day,
        )
        return [
          `<strong>${day}曜 ${String(hour).padStart(2, "0")}:00</strong>`,
          `PV: ${formatNumber(cell?.pageviews ?? 0)}`,
          `UU: ${formatNumber(cell?.uniqueUsers ?? 0)}`,
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
      data: HOUR_LABELS,
      splitArea: { show: true },
      axisLabel: {
        interval: 1,
        formatter: (v: string) => `${v}時`,
      },
    },
    yAxis: {
      type: "category",
      data: [...DAY_LABELS].reverse(),
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxPv,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 12,
      text: ["高", "低"],
      inRange: {
        color: [
          "#eff6ff",
          "#dbeafe",
          "#bfdbfe",
          "#93c5fd",
          "#60a5fa",
          "#3b82f6",
          "#1d4ed8",
        ],
      },
    },
    series: [
      {
        name: "PV",
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
      title="曜日 × 時間帯 トラフィックパターン"
      description="直近30日の平均PVからベストタイムと弱時間帯を可視化"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
