import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
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

export function CostHeatmapChart({ data }: CostHeatmapChartProps) {
  const maxAmount = data.reduce((m, c) => (c.amount > m ? c.amount : m), 0)

  // X軸: 部門, Y軸: 費目 (Y は下→上順に index が増えるので逆順に)
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
          `コスト: ${formatCurrency(p.value[2], { short: true })}`,
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
      text: ["高", "低"],
      inRange: {
        color: [
          "#fef3c7",
          "#fde68a",
          "#fcd34d",
          "#fb923c",
          "#f97316",
          "#ea580c",
          "#c2410c",
        ],
      },
    },
    series: [
      {
        name: "コスト",
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
      title="費目 × 部門 コスト濃淡"
      description="高コスト領域(ホットスポット)を面で検出し、最適化対象を特定"
    >
      <EChart option={option} height="360px" />
    </DashboardCardPreset>
  )
}
