import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import type { BreakdownSlice } from "@/types/ui-template-kpi-chart-advanced"

interface BreakdownChartProps {
  data: BreakdownSlice[]
}

export function BreakdownChart({ data }: BreakdownChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        data: data.map((d) => ({ name: d.segment, value: d.value })),
      },
    ],
  }

  return <EChart option={option} height="320px" />
}
