import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import {
  COST_CATEGORIES,
  DEPARTMENTS,
} from "@/lib/finance-budget-mock-data"
import type { CostHeatmapCell } from "@/types/finance-budget"

interface CostHeatmapChartProps {
  data: CostHeatmapCell[]
}

const HEATMAP_ALPHA_STOPS = [0.08, 0.2, 0.35, 0.5, 0.65, 0.82, 1]

export function CostHeatmapChart({ data }: CostHeatmapChartProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined
  const maxAmount = data.reduce((m, c) => (c.amount > m ? c.amount : m), 0)

  // X axis: department, Y axis: cost category (Y index grows bottom-to-top, so reverse)
  const yAxisCats = [...COST_CATEGORIES].reverse()
  const seriesData = data.map((c) => [
    DEPARTMENTS.indexOf(c.department),
    yAxisCats.indexOf(c.costCategory),
    c.amount,
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const dept = DEPARTMENTS[p.value[0]]
        const cat = yAxisCats[p.value[1]]
        return [
          `<strong>${dept} × ${cat}</strong>`,
          `Cost: ${formatCurrency(p.value[2], { short: true })}`,
        ].join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "4%",
      bottom: "22%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: DEPARTMENTS,
      splitArea: { show: true },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: yAxisCats,
      splitArea: { show: true },
      axisLabel: { fontSize: 11 },
    },
    visualMap: {
      min: 0,
      max: maxAmount,
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
        name: "Cost",
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
      title="Category × Department Cost Heatmap"
      description="Surface high-cost cells (hotspots) to identify optimization targets"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
