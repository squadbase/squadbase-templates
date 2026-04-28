import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { CostCategoryShare } from "@/types/finance-budget"

interface CostCategoryDonutProps {
  data: CostCategoryShare[]
}

export function CostCategoryDonut({ data }: CostCategoryDonutProps) {
  const total = data.reduce((s, d) => s + d.amount, 0)

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return [
          `<strong>${p.name}</strong>`,
          `金額: ${formatCurrency(p.value, { short: true })}`,
          `構成比: ${p.percent.toFixed(1)}%`,
        ].join("<br/>")
      },
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 0,
      top: "middle",
      itemHeight: 10,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        name: "費目別構成",
        type: "pie",
        radius: ["52%", "78%"],
        center: ["36%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 3, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: data.map((d) => ({ name: d.category, value: d.amount })),
      },
    ],
    graphic: [
      {
        type: "text",
        left: "36%",
        top: "44%",
        style: {
          text: `合計\n${formatCurrency(total, { short: true })}`,
          textAlign: "center",
          textVerticalAlign: "middle",
          fontSize: 13,
          fontWeight: "bold",
          fill: "#64748b",
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="費目別 構成比"
      description="当月コストの費目別内訳"
    >
      <EChart option={option} height="300px" />
    </DashboardCardPreset>
  )
}
