import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { BoxPlotItem } from "@/types/member-utilization-monitor"

interface UtilizationBoxPlotProps {
  data: BoxPlotItem[]
}

export function UtilizationBoxPlot({ data }: UtilizationBoxPlotProps) {
  const categories = data.map((d) => d.team)

  const boxData = data.map((d) => d.values)
  const outliers: Array<[number, number, string]> = []
  data.forEach((d, i) => {
    for (const o of d.outliers) {
      outliers.push([i, o.value, o.memberName])
    }
  })

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          seriesName: string
          value: number[] | [number, number, string]
          name?: string
        }
        if (p.seriesName === "外れ値") {
          const [teamIdx, val, name] = p.value as [number, number, string]
          return [
            `<strong>${name}</strong>`,
            `${categories[teamIdx]}`,
            `稼働率: ${val.toFixed(1)}%`,
          ].join("<br/>")
        }
        const v = p.value as number[]
        return [
          `<strong>${p.name}</strong>`,
          `最小: ${v[1]?.toFixed?.(1) ?? v[1]}%`,
          `Q1: ${v[2]?.toFixed?.(1) ?? v[2]}%`,
          `中央値: ${v[3]?.toFixed?.(1) ?? v[3]}%`,
          `Q3: ${v[4]?.toFixed?.(1) ?? v[4]}%`,
          `最大: ${v[5]?.toFixed?.(1) ?? v[5]}%`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: categories,
      boundaryGap: true,
    },
    yAxis: {
      type: "value",
      name: "稼働率 %",
      min: 30,
      max: 120,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "稼働率分布",
        type: "boxplot",
        data: boxData,
        boxWidth: [16, 50],
        itemStyle: { borderWidth: 1.5 },
      },
      {
        name: "外れ値",
        type: "scatter",
        data: outliers,
        symbolSize: 7,
        itemStyle: { opacity: 0.85 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="チーム別 稼働率分布 (箱ひげ図)"
      description="チームごとの五数要約と外れ値を表示。ばらつきが大きいチーム・極端な個人を把握"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
