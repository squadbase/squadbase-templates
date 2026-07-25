import { DollarSign, ShoppingCart, Users, Activity } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardPreset,
  EChart,
  Placeholder,
  Sparkline,
} from "@squadbase/vantage/components"
import type { EChartsOption } from "@squadbase/vantage/components"

import { overviewKpis, trendSeries, categoryRows } from "./mock-data.js"

function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "10%", containLabel: true }
}

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

const kpiMeta = [
  { label: "Metric 1", icon: DollarSign },
  { label: "Metric 2", icon: ShoppingCart },
  { label: "Metric 3", icon: Users },
  { label: "Metric 4", icon: Activity },
]

export function OverviewTab() {
  const trendOption: EChartsOption = {
    tooltip: { trigger: "axis" },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: trendSeries.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
    },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "Series A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: trendSeries.map((d) => d.value),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }

  const categoryOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        data: categoryRows.map((d) => ({ name: d.category, value: d.value })),
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewKpis.map((kpi, index) => {
          const meta = kpiMeta[index]
          if (!meta) return null
          const Icon = meta.icon
          return (
            <DashboardCard key={kpi.id}>
              <DashboardCardHeader>
                <DashboardCardTitle className="text-muted-foreground">
                  {meta.label}
                </DashboardCardTitle>
                <DashboardCardAction>
                  <Icon className="size-4 text-muted-foreground" />
                </DashboardCardAction>
              </DashboardCardHeader>
              <DashboardCardContent>
                <Placeholder className="text-2xl font-bold">{kpi.value}</Placeholder>
                <div className="mt-2">
                  <Placeholder className="text-sm font-medium">
                    {kpi.change >= 0 ? `+${kpi.change}%` : `${kpi.change}%`}
                  </Placeholder>
                </div>
                <Sparkline
                  data={kpi.sparklineData.map((v) => ({ value: v }))}
                  height={32}
                  area
                  className="mt-3"
                />
              </DashboardCardContent>
            </DashboardCard>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCardPreset
            title="Trend"
            description="Values over the selected period"
          >
            <EChart option={trendOption} height="320px" />
          </DashboardCardPreset>
        </div>
        <DashboardCardPreset title="Breakdown" description="Share by category">
          <EChart option={categoryOption} height="320px" />
        </DashboardCardPreset>
      </div>
    </div>
  )
}
