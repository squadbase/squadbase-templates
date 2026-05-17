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
        if (p.seriesName === "Outliers") {
          const [teamIdx, val, name] = p.value as [number, number, string]
          return [
            `<strong>${name}</strong>`,
            `${categories[teamIdx]}`,
            `Utilization: ${val.toFixed(1)}%`,
          ].join("<br/>")
        }
        // Box plot
        const v = p.value as number[]
        return [
          `<strong>${p.name}</strong>`,
          `Min: ${v[1]?.toFixed?.(1) ?? v[1]}%`,
          `Q1: ${v[2]?.toFixed?.(1) ?? v[2]}%`,
          `Median: ${v[3]?.toFixed?.(1) ?? v[3]}%`,
          `Q3: ${v[4]?.toFixed?.(1) ?? v[4]}%`,
          `Max: ${v[5]?.toFixed?.(1) ?? v[5]}%`,
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
      name: "Utilization %",
      min: 30,
      max: 120,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Utilization distribution",
        type: "boxplot",
        data: boxData,
        boxWidth: [16, 50],
        itemStyle: { borderWidth: 1.5 },
      },
      {
        name: "Outliers",
        type: "scatter",
        data: outliers,
        symbolSize: 7,
        itemStyle: { opacity: 0.85 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Team Utilization Distribution (Box Plot)"
      description="Five-number summary per team with outliers highlighted — find teams with wide spread or extreme members"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
