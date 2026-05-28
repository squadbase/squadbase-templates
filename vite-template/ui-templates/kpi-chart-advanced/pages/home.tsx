import { useState } from "react"
import { subDays } from "date-fns"
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
import { ComparisonChart } from "@/components/ui-template-kpi-chart-advanced/comparison-chart"
import { BreakdownChart } from "@/components/ui-template-kpi-chart-advanced/breakdown-chart"
import { TrendChart } from "@/components/ui-template-kpi-chart-advanced/trend-chart"
import { CampaignTable } from "@/components/ui-template-kpi-chart-advanced/campaign-table"
import {
  headerKpis,
  trendSeries,
  comparisonSeries,
  breakdownSlices,
  campaignRows,
} from "@/lib/ui-template-kpi-chart-advanced-mock-data"
import type { DashboardFilters } from "@/types/ui-template-kpi-chart-advanced"

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
              <ComparisonChart data={comparisonSeries} />
            </DashboardCardPreset>
          </div>
          <DashboardCardPreset title="Breakdown" description="Share by segment">
            <BreakdownChart data={breakdownSlices} />
          </DashboardCardPreset>
        </div>

        <DashboardCardPreset
          title="Trend"
          description="Values over the selected period"
        >
          <TrendChart data={trendSeries} />
        </DashboardCardPreset>

        <DashboardCardPreset title="Campaigns" description="Performance by campaign">
          <CampaignTable data={campaignRows} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
