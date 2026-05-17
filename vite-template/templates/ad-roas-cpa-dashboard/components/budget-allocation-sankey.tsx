import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency } from "./chart-helpers"
import type { SankeyLink, SankeyNode } from "@/types/ad-roas-cpa-dashboard"

interface BudgetAllocationSankeyProps {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export function BudgetAllocationSankey({
  nodes,
  links,
}: BudgetAllocationSankeyProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown): string => {
        const p = params as {
          dataType?: string
          name?: string
          value?: number
          data?: { source?: string; target?: string; value?: number }
        }
        if (p.dataType === "edge" && p.data) {
          return `${p.data.source} → ${p.data.target}: ${formatCurrency(
            p.data.value ?? 0,
            { short: true },
          )}`
        }
        return `${p.name ?? ""}`
      },
    },
    series: [
      {
        type: "sankey",
        emphasis: { focus: "adjacency" },
        nodeAlign: "left",
        layoutIterations: 32,
        left: "2%",
        right: "12%",
        top: "4%",
        bottom: "4%",
        data: nodes,
        links,
        lineStyle: { color: "gradient", curveness: 0.5 },
        label: { fontSize: 12 },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Budget Allocation by Channel & Objective"
      description="How total ad spend flows from budget into each channel and on to objective buckets"
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
