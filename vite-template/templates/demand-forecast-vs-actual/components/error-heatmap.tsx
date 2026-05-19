import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatSignedPercent } from "./chart-helpers"
import type { ErrorHeatmapCell } from "@/types/demand-forecast-vs-actual"

interface ErrorHeatmapProps {
  data: ErrorHeatmapCell[]
}

const HEATMAP_NEG_STOPS = [0.95, 0.7, 0.4, 0.15]
const HEATMAP_POS_STOPS = [0.15, 0.4, 0.7, 0.95]

export function ErrorHeatmap({ data }: ErrorHeatmapProps) {
  // Diverging palette: --chart-2 (cool) for negative (under-forecast / actual > forecast),
  // --chart-5 (warm) for positive (over-forecast)
  const coolColor = useEChartsContrastColor("--chart-2")
  const warmColor = useEChartsContrastColor("--chart-5")

  const products = Array.from(new Set(data.map((c) => c.productName)))
  const weeks = Array.from(new Set(data.map((c) => c.weekIndex))).sort(
    (a, b) => a - b,
  )
  const weekLabels = weeks.map((w) => `W-${weeks.length - 1 - w}`)

  // x = week index ordered oldest → newest, y = product (top → bottom = first → last)
  const seriesData = data.map((c) => [
    c.weekIndex,
    products.length - 1 - products.indexOf(c.productName),
    c.errorPct,
  ])

  const maxAbs = data.reduce(
    (m, c) => (Math.abs(c.errorPct) > m ? Math.abs(c.errorPct) : m),
    0,
  )

  const gradient =
    coolColor && warmColor
      ? [
          ...HEATMAP_NEG_STOPS.map((a) => withAlpha(coolColor, a)),
          ...HEATMAP_POS_STOPS.map((a) => withAlpha(warmColor, a)),
        ]
      : undefined

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const product = products[products.length - 1 - p.value[1]]
        const weekLabel = weekLabels[p.value[0]]
        const err = p.value[2]
        return [
          `<strong>${product}</strong>`,
          `${weekLabel}`,
          `Error: ${formatSignedPercent(err)}`,
        ].join("<br/>")
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
      data: [...products].reverse(),
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
      text: ["Over", "Under"],
      inRange: gradient ? { color: gradient } : undefined,
    },
    series: [
      {
        name: "Forecast error %",
        type: "heatmap",
        data: seriesData,
        label: {
          show: true,
          formatter: (params: { value: [number, number, number] }) =>
            `${params.value[2] >= 0 ? "+" : ""}${params.value[2].toFixed(0)}%`,
          fontSize: 10,
        },
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
      title="Forecast Error Heatmap (product × week)"
      description="Signed weekly error % — warm = over-forecast, cool = under-forecast"
    >
      <EChart option={option} height={`${Math.max(280, products.length * 36 + 80)}px`} />
    </DashboardCardPreset>
  )
}
