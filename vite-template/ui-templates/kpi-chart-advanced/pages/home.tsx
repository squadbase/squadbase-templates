import { useState } from "react"
import { subDays } from "date-fns"
import type { EChartsOption } from "echarts"
import {
  DollarSign,
  Users,
  Activity,
  ShoppingCart,
  MousePointer,
  TrendingUp,
  PieChart,
} from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { EChart } from "@/components/data/echart"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellSummary,
  PageShellSummaryCard,
  PageShellContent,
} from "@/components/common/page-shell"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardPreset,
} from "@/components/common/dashboard-card"
import { Placeholder } from "@/components/common/placeholder"
import { Sparkline } from "@/components/data/sparkline"
import { CampaignTable } from "@/templates/kpi-chart-advanced/campaign-table"
import {
  headerKpis,
  trendSeries,
  comparisonSeries,
  breakdownSlices,
  campaignRows,
} from "@/templates/kpi-chart-advanced/mock-data"
import type {
  ComparisonPoint,
  BreakdownSlice,
  TrendPoint,
  DashboardFilters,
} from "@/templates/kpi-chart-advanced/types"

// ── chart helpers ───────────────────────────────────────────────────────────

function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

function getDualAxisGrid() {
  return { left: "3%", right: "6%", bottom: "12%", containLabel: true }
}

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

// ── chart options ────────────────────────────────────────────────────────────

function comparisonOption(data: ComparisonPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.period),
    },
    yAxis: [
      {
        type: "value",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Series A",
        type: "bar",
        data: data.map((d) => d.current),
        barMaxWidth: 28,
      },
      {
        name: "Series B",
        type: "bar",
        data: data.map((d) => d.previous),
        barMaxWidth: 28,
      },
      {
        name: "Series C",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.growth),
      },
    ],
  }
}

function breakdownOption(data: BreakdownSlice[]): EChartsOption {
  return {
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
}

function trendOption(data: TrendPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
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
        data: data.map((d) => d.value),
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

const smallKpiCards = [
  { label: "Metric 2", icon: Users, kpi: headerKpis[1] },
  { label: "Metric 3", icon: MousePointer, kpi: headerKpis[2] },
  { label: "Metric 4", icon: Activity, kpi: headerKpis[3] },
  { label: "Metric 5", icon: ShoppingCart, kpi: headerKpis[4] },
]

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)
  const heroKpi = headerKpis[0]

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Performance dashboard</PageShellTitle>
          <PageShellDescription>
            Headline KPIs, comparisons, and detail for the selected period.
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
        <PageShellSummary>
          <PageShellSummaryCard accent="accent">
            <TrendingUp />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">Growth</p>
              <p className="text-xs text-muted-foreground">
                Overall performance is trending up versus the previous period.
              </p>
            </div>
          </PageShellSummaryCard>
          <PageShellSummaryCard accent="default">
            <PieChart />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">Mix</p>
              <p className="text-xs text-muted-foreground">
                A single segment drives the largest share of the total.
              </p>
            </div>
          </PageShellSummaryCard>
          <PageShellSummaryCard accent="accent">
            <Activity />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">Momentum</p>
              <p className="text-xs text-muted-foreground">
                Recent activity points to a positive shift in the trend.
              </p>
            </div>
          </PageShellSummaryCard>
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="h-full">
            <DashboardCardHeader>
              <DashboardCardTitle className="text-muted-foreground">
                Metric 1
              </DashboardCardTitle>
              <DashboardCardAction>
                <DollarSign className="size-5 text-muted-foreground" />
              </DashboardCardAction>
            </DashboardCardHeader>
            <DashboardCardContent className="flex flex-1 flex-col gap-5">
              <div>
                <Placeholder className="text-4xl font-bold">
                  {heroKpi.value}
                </Placeholder>
                <div className="mt-3">
                  <Placeholder className="text-sm font-medium">
                    {heroKpi.change >= 0
                      ? `+${heroKpi.change}%`
                      : `${heroKpi.change}%`}
                  </Placeholder>
                </div>
              </div>
              <Sparkline
                data={heroKpi.sparklineData.map((v) => ({ value: v }))}
                height={88}
                area
              />
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Metric A</p>
                  <Placeholder className="text-sm font-medium">$0.92M</Placeholder>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Metric B</p>
                  <Placeholder className="text-sm font-medium">+8.4%</Placeholder>
                </div>
              </div>
            </DashboardCardContent>
          </DashboardCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {smallKpiCards.map(({ label, icon: Icon, kpi }) => (
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
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCardPreset
              title="Comparison"
              description="Current vs previous period"
            >
              <EChart option={comparisonOption(comparisonSeries)} height="320px" />
            </DashboardCardPreset>
          </div>
          <DashboardCardPreset title="Breakdown" description="Share by segment">
            <EChart option={breakdownOption(breakdownSlices)} height="320px" />
          </DashboardCardPreset>
        </div>

        <DashboardCardPreset
          title="Trend"
          description="Values over the selected period"
        >
          <EChart option={trendOption(trendSeries)} height="280px" />
        </DashboardCardPreset>

        <DashboardCardPreset title="Campaigns" description="Performance by campaign">
          <CampaignTable data={campaignRows} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
