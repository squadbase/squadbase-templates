import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatPercent } from "./chart-helpers"
import type { CtrPositionPoint } from "@/types/web-seo"

interface CtrPositionScatterProps {
  data: CtrPositionPoint[]
}

export function CtrPositionScatter({ data }: CtrPositionScatterProps) {
  const maxVolume = Math.max(...data.map((d) => d.searchVolume))

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { data: [number, number, number, string] }
        const [pos, ctr, , keyword] = p.data
        return `<strong>${keyword}</strong><br/>Position: ${pos}<br/>CTR: ${formatPercent(ctr)}`
      },
    },
    grid: { left: "12%", right: "8%", bottom: "12%", top: "8%" },
    xAxis: {
      name: "Position",
      type: "value",
      min: 0,
      max: 20,
      inverse: true,
      axisLabel: { formatter: (v: number) => `#${v}` },
    },
    yAxis: {
      name: "CTR",
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatPercent(v) },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (val: number[]) => {
          const volume = val[2]
          return 8 + (volume / maxVolume) * 32
        },
        data: data.map((d) => [
          d.position,
          d.ctr,
          d.searchVolume,
          d.keyword,
        ]),
        itemStyle: { opacity: 0.75 },
      },
    ],
  }

  return (
    <DashboardCardPreset title="CTR vs. Position">
      <EChart option={option} height="300px" />
    </DashboardCardPreset>
  )
}
