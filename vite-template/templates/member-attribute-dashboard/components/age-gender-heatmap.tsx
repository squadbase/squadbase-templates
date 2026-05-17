import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber, formatPercent } from "./chart-helpers"
import {
  ageBandsOrder,
  gendersOrder,
  ageLabelMap,
  genderLabelMap,
} from "@/lib/member-attribute-dashboard-mock-data"
import type { AgeGenderCell } from "@/types/member-attribute-dashboard"

interface AgeGenderHeatmapProps {
  data: AgeGenderCell[]
}

const HEATMAP_ALPHA_STOPS = [0.08, 0.2, 0.34, 0.5, 0.66, 0.82, 0.96]

export function AgeGenderHeatmap({ data }: AgeGenderHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const xLabels = ageBandsOrder.map((band) => ageLabelMap[band])
  const yLabels = gendersOrder.map((g) => genderLabelMap[g])

  const maxCount = data.reduce(
    (m, c) => (c.memberCount > m ? c.memberCount : m),
    0,
  )

  // x = age-band index, y = gender index (reverse so first row is top)
  const seriesData = data.map((c) => {
    const x = ageBandsOrder.indexOf(c.ageBand)
    const y = yLabels.length - 1 - gendersOrder.indexOf(c.gender)
    return [x, y, c.memberCount]
  })

  const lookup = new Map<string, AgeGenderCell>()
  for (const cell of data) {
    lookup.set(`${cell.ageBand}|${cell.gender}`, cell)
  }

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const ageBand = ageBandsOrder[p.value[0]]
        const gender = gendersOrder[yLabels.length - 1 - p.value[1]]
        const cell = lookup.get(`${ageBand}|${gender}`)
        if (!cell) return ""
        return [
          `<strong>${ageLabelMap[ageBand]} - ${genderLabelMap[gender]}</strong>`,
          `Members: ${cell.memberCount.toLocaleString("en-US")} (${formatPercent(cell.share)})`,
          `Avg LTV: $${cell.avgLtv.toLocaleString("en-US")}`,
          `Purchase rate: ${formatPercent(cell.purchaseRate)}`,
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
      data: xLabels,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: [...yLabels].reverse(),
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxCount,
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
        name: "Members",
        type: "heatmap",
        data: seriesData,
        label: {
          show: true,
          formatter: (params: unknown) => {
            const p = params as { value: [number, number, number] }
            return formatNumber(p.value[2])
          },
          color: "#fff",
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
      title="Age x Gender Crosstab"
      description="Member count by age band and gender — cell intensity scales with size"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
