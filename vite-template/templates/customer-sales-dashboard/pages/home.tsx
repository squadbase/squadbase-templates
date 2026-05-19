import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { DollarSign, TrendingUp, Users, AlertTriangle } from "lucide-react"
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
import { InsightCards } from "@/components/customer-sales-dashboard/insight-cards"
import { KpiCard } from "@/components/customer-sales-dashboard/kpi-card"
import { CustomerRankingTable } from "@/components/customer-sales-dashboard/customer-ranking-table"
import { AbcParetoChart } from "@/components/customer-sales-dashboard/abc-pareto-chart"
import { ChurnRiskTable } from "@/components/customer-sales-dashboard/churn-risk-table"
import {
  headerKpis,
  customerRanking,
  paretoSeries,
  churnCandidates,
  segmentOptions,
} from "@/lib/customer-sales-dashboard-mock-data"
import type { DashboardFilters } from "@/types/customer-sales-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  segment: "all",
}

const kpiIcons = [DollarSign, TrendingUp, Users, AlertTriangle] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    segment: filters.segment,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Customer Sales Dashboard</PageShellTitle>
          <PageShellDescription>
            Account-manager view of customer revenue, ABC concentration, and churn-risk candidates
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
          <InsightCards />
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <FilterBar
          value={filterValues}
          onChange={(next) =>
            setFilters((prev) => ({
              ...prev,
              segment: next.segment as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="segment"
            label="Segment"
            options={segmentOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <CustomerRankingTable data={customerRanking} />

        <AbcParetoChart data={paretoSeries} />

        <ChurnRiskTable data={churnCandidates} />
      </PageShellContent>
    </PageShell>
  )
}
