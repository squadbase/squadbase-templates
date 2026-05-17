import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatNumber } from "./chart-helpers"
import type { LeadTimeBin } from "@/types/recruiting-funnel"

interface LeadTimeDistributionProps {
  data: LeadTimeBin[]
}

export function LeadTimeDistribution({ data }: LeadTimeDistributionProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const bin = data[idx]
        return [
          `<strong>${bin.label}</strong>`,
          `Candidates: ${bin.count.toLocaleString("en-US")}`,
        ].join("<br/>")
      },
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((b) => b.label),
      axisLabel: { interval: 0, fontSize: 11 },
      name: "Lead time",
      nameLocation: "middle",
      nameGap: 32,
    },
    yAxis: {
      type: "value",
      name: "Candidates",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Candidates",
        type: "bar",
        barCategoryGap: "5%",
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((b) => b.count),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Screening Lead Time Distribution"
      description="Distribution of candidates by elapsed days from application to current stage"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
