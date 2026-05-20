import type { EChartsOption } from "echarts"
import { DollarSign, ShoppingCart, Users, Activity } from "lucide-react"
import { EChart } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { KpiCard } from "./kpi-card"
import { formatNumber, getBaseGrid } from "./chart-helpers"
import {
  overviewKpis,
  trendSeries,
  categoryRows,
} from "@/lib/ui-template-tabbed-dashboard-mock-data"

const kpiIcons = [DollarSign, ShoppingCart, Users, Activity] as const

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="space-y-1">
          <DashboardCardTitle>{title}</DashboardCardTitle>
          <DashboardCardDescription>{description}</DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>{children}</DashboardCardContent>
    </DashboardCard>
  )
}

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
        {overviewKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} item={kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Trend" description="Values over the selected period">
            <EChart option={trendOption} height="320px" />
          </ChartCard>
        </div>
        <ChartCard title="Breakdown" description="Share by category">
          <EChart option={categoryOption} height="320px" />
        </ChartCard>
      </div>
    </div>
  )
}
