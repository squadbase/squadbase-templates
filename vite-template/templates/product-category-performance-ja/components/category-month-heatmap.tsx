import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatSignedPercent } from "./chart-helpers"
import type { HeatmapCell } from "@/types/product-category-performance"
import { CATEGORY_LIST } from "@/lib/product-category-performance-mock-data"

interface CategoryMonthHeatmapProps {
  data: HeatmapCell[]
}

const NEGATIVE_ALPHA_STOPS = [0.95, 0.65, 0.35, 0.15]
const POSITIVE_ALPHA_STOPS = [0.05, 0.2, 0.4, 0.6, 0.85]

export function CategoryMonthHeatmap({ data }: CategoryMonthHeatmapProps) {
  const positiveColor = useEChartsContrastColor("--chart-2")
  const negativeColor = useEChartsContrastColor("--chart-4")
  const gradient = positiveColor
    ? [
        ...NEGATIVE_ALPHA_STOPS.map((a) => withAlpha(negativeColor, a)),
        ...POSITIVE_ALPHA_STOPS.map((a) => withAlpha(positiveColor, a)),
      ]
    : undefined

  const months = Array.from(new Set(data.map((c) => c.yearMonth))).sort()
  const maxAbs = data.reduce((m, c) => Math.max(m, Math.abs(c.yoyChange)), 0)

  const seriesData = data.map((c) => [
    months.indexOf(c.yearMonth),
    CATEGORY_LIST.length - 1 - CATEGORY_LIST.indexOf(c.category),
    c.yoyChange,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const cat = CATEGORY_LIST[CATEGORY_LIST.length - 1 - p.value[1]]
        const month = months[p.value[0]]
        const cell = data.find(
          (c) => c.category === cat && c.yearMonth === month,
        )
        if (!cell) return ""
        return [
          `<strong>${cat} · ${month}</strong>`,
          `YoY: ${formatSignedPercent(cell.yoyChange)}`,
          `売上: ${formatCurrency(cell.revenue, { short: true })}`,
        ].join("<br/>")
      },
    },
    grid: { left: "4%", right: "4%", top: "6%", bottom: "18%", containLabel: true },
    xAxis: {
      type: "category",
      data: months,
      splitArea: { show: true },
      axisLabel: { interval: 0, rotate: 30, fontSize: 10 },
    },
    yAxis: {
      type: "category",
      data: [...CATEGORY_LIST].reverse(),
      splitArea: { show: true },
    },
    visualMap: {
      min: -maxAbs,
      max: maxAbs,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 12,
      text: ["+%", "-%"],
      inRange: gradient ? { color: gradient } : undefined,
    },
    series: [
      {
        name: "YoY%",
        type: "heatmap",
        data: seriesData,
        label: {
          show: true,
          fontSize: 10,
          formatter: (p: unknown) => {
            const v = (p as { value: [number, number, number] }).value[2]
            return `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 6,
            shadowColor: "rgba(0,0,0,0.25)",
          },
        },
        progressive: 0,
        animation: false,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="カテゴリ × 月の YoY ヒートマップ"
      description="カテゴリと月の YoY 成長率を可視化。外れ値や季節要因を一目で把握"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
