import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  PiggyBank,
  Percent,
} from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { FilterBar, FilterBarSelect } from "@/components/data/filter-bar"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell"
import { PlKpiCard } from "@/components/pl-dashboard/kpi-card"
import { PlWaterfallChart } from "@/components/pl-dashboard/pl-waterfall-chart"
import { ExpenseTrendChart } from "@/components/pl-dashboard/expense-trend-chart"
import { YoyComparisonTable } from "@/components/pl-dashboard/yoy-comparison-table"
import {
  plKpis,
  plWaterfall,
  expenseTrend,
  yoyTable,
  viewOptions,
} from "@/lib/pl-dashboard-mock-data"
import type { DashboardFilters } from "@/types/pl-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  view: "all",
}

const kpiIcons = [
  DollarSign,
  TrendingUp,
  Briefcase,
  PiggyBank,
  Percent,
] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    view: filters.view,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>P&amp;L Dashboard</PageShellTitle>
          <PageShellDescription>
            Monthly review of revenue, gross profit, operating income, ordinary
            income, and key profitability ratios.
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
          {plKpis.map((kpi, i) => (
            <PlKpiCard key={kpi.id} item={kpi} icon={kpiIcons[i]} />
          ))}
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <FilterBar
          value={filterValues}
          onChange={(next) =>
            setFilters((prev) => ({
              ...prev,
              view: next.view as string | undefined,
            }))
          }
        >
          <FilterBarSelect filterKey="view" label="View" options={viewOptions} />
        </FilterBar>

        <PlWaterfallChart data={plWaterfall} />

        <ExpenseTrendChart data={expenseTrend} />

        <YoyComparisonTable data={yoyTable} />
      </PageShellContent>
    </PageShell>
  )
}
