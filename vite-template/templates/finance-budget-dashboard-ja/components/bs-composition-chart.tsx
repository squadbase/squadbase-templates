import { useState } from "react"
import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { SegmentedControl } from "@/components/common/segmented-control"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { BsCompositionItem } from "@/types/finance-budget"

interface BsCompositionChartProps {
  assets: BsCompositionItem[]
  liabilities: BsCompositionItem[]
}

type Side = "asset" | "liability"

const sideOptions = [
  { label: "資産", value: "asset" },
  { label: "負債・純資産", value: "liability" },
]

export function BsCompositionChart({
  assets,
  liabilities,
}: BsCompositionChartProps) {
  const [side, setSide] = useState<Side>("asset")
  const data = side === "asset" ? assets : liabilities
  const total = data.reduce((s, i) => s + i.amount, 0)

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
      bottom: 0,
      type: "scroll",
    },
    series: [
      {
        name: side === "asset" ? "資産" : "負債・純資産",
        type: "pie",
        radius: ["48%", "72%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: (p: { name: string; percent: number }) =>
            `${p.name} ${p.percent.toFixed(1)}%`,
          fontSize: 10,
        },
        labelLine: { length: 6, length2: 4 },
        data: data.map((d) => ({ name: d.label, value: d.amount })),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="BS 構成比"
      description="資産 / 負債・純資産のサイド切替で構成を確認"
      actions={
        <SegmentedControl
          size="sm"
          options={sideOptions}
          value={side}
          onChange={(v) => setSide(v as Side)}
          ariaLabel="BS サイド"
        />
      }
    >
      <EChart option={option} height="300px" />
      <div className="mt-2 flex items-baseline justify-between border-t pt-2 text-xs">
        <span className="text-muted-foreground">合計</span>
        <span className="font-semibold tabular-nums">
          {formatCurrency(total, { short: true })}{" "}
          <span className="text-muted-foreground">
            ({formatPercent(100.0)})
          </span>
        </span>
      </div>
    </DashboardCardPreset>
  )
}
