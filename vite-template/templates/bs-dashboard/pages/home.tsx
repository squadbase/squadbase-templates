import { useState } from "react"
import { subMonths, startOfDay, endOfDay } from "date-fns"
import { Landmark, Scale, Activity, Wallet } from "lucide-react"
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
import { InsightCards } from "@/components/bs-dashboard/insight-cards"
import { KpiCard } from "@/components/bs-dashboard/kpi-card"
import { BsStructureChart } from "@/components/bs-dashboard/bs-structure-chart"
import { AccountTrendChart } from "@/components/bs-dashboard/account-trend-chart"
import { RatioTrendChart } from "@/components/bs-dashboard/ratio-trend-chart"
import {
  headerKpis,
  bsStructure,
  accountTrend,
  ratioTrend,
  scopeOptions,
} from "@/lib/bs-dashboard-mock-data"
import type { DashboardFilters } from "@/types/bs-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfDay(subMonths(today, 11)),
    to: endOfDay(today),
  },
  scope: "all",
}

const kpiIcons = [Landmark, Scale, Activity, Wallet] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    scope: filters.scope,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Balance Sheet Dashboard</PageShellTitle>
          <PageShellDescription>
            Read the financial health of the business at a glance — capital structure, account trajectory, and liquidity ratios
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
              scope: next.scope as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="scope"
            label="Scope"
            options={scopeOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <BsStructureChart data={bsStructure} />

        <AccountTrendChart data={accountTrend} />

        <RatioTrendChart data={ratioTrend} />
      </PageShellContent>
    </PageShell>
  )
}
