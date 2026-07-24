import { useState } from "react"
import { subDays } from "date-fns"
import { Activity, DollarSign, ShoppingCart, Users } from "lucide-react"
import { definePage } from "@squadbase/vantage"
import {
  DashboardCard,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardPreset,
  DashboardCardTitle,
  DateRangePicker,
  EChart,
  PageShell,
  PageShellContent,
  PageShellDescription,
  PageShellHeader,
  PageShellHeaderEnd,
  PageShellHeading,
  PageShellTitle,
} from "@squadbase/vantage/components"
import type { EChartsOption } from "@squadbase/vantage/components"

import { Placeholder } from "./components/placeholder.js"
import { Sparkline } from "./components/sparkline.js"
import { TopItemsTable } from "./components/kpi-chart-simple/top-items-table.js"
import {
  headerKpis,
  topItems,
  trendSeries,
} from "./components/kpi-chart-simple/mock-data.js"
import type {
  DashboardFilters,
  KpiItem,
  TrendPoint,
} from "./components/kpi-chart-simple/types.js"

export const page = definePage({
  title: "KPI + Chart (Simple)",
  description:
    "4 KPI cards, a single trend line, and a ranked-items table. The minimal headline-metrics dashboard layout.",
})

// ── chart helpers ───────────────────────────────────────────────────────────

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

// ── chart options ────────────────────────────────────────────────────────────

function trendOption(data: TrendPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: {
        formatter: (value: string) => value.slice(5),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Series A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.revenue),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }
}

// ── page ─────────────────────────────────────────────────────────────────────

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: subDays(today, 29),
    to: today,
  },
}

/** Display labels live here, not in the data layer. */
const KPI_META: Record<KpiItem["id"], { label: string; icon: typeof DollarSign }> = {
  "total-revenue": { label: "Metric 1", icon: DollarSign },
  "active-users": { label: "Metric 2", icon: Users },
  "conversion-rate": { label: "Metric 3", icon: Activity },
  aov: { label: "Metric 4", icon: ShoppingCart },
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Performance overview</PageShellTitle>
          <PageShellDescription>
            Key metrics and trends for the selected period.
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) =>
              setFilters((prev) => ({ ...prev, dateRange: range }))
            }
            maxDate={today}
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi) => {
            const { label, icon: Icon } = KPI_META[kpi.id]
            return (
              <DashboardCard key={kpi.id}>
                <DashboardCardHeader>
                  <DashboardCardTitle className="text-muted-foreground">
                    {label}
                  </DashboardCardTitle>
                  <DashboardCardAction>
                    <Icon className="size-4 text-muted-foreground" />
                  </DashboardCardAction>
                </DashboardCardHeader>
                <DashboardCardContent>
                  <Placeholder className="text-2xl font-bold">
                    {kpi.value}
                  </Placeholder>
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

        <DashboardCardPreset
          title="Trend"
          description="Values over the selected period"
        >
          <EChart option={trendOption(trendSeries)} height="320px" />
        </DashboardCardPreset>

        <DashboardCardPreset title="Top items" description="Ranked by value">
          <TopItemsTable data={topItems} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
