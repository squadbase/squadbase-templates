import type { EChartsOption } from "echarts"
import { DollarSign, ShoppingCart, Users, Activity } from "lucide-react"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { KpiCard } from "./kpi-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
import {
  overviewKpis,
  trendSeries,
  categoryRows,
} from "@/lib/ui-template-tabbed-dashboard-mock-data"

const kpiIcons = [DollarSign, ShoppingCart, Users, Activity] as const

export function OverviewTab() {
  const trendOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number, { short: true }),
    },
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
        name: "Revenue",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: trendSeries.map((d) => d.value),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }

  const categoryOption: EChartsOption = {
    tooltip: {
      trigger: "item",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number, { short: true }),
    },
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
          <DashboardCardPreset
            title="Revenue Trend"
            description="Daily revenue across the selected window"
          >
            <EChart option={trendOption} height="320px" />
          </DashboardCardPreset>
        </div>
        <DashboardCardPreset
          title="Category Mix"
          description="Revenue share by category"
        >
          <EChart option={categoryOption} height="320px" />
        </DashboardCardPreset>
      </div>
    </div>
  )
}
