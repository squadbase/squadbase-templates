import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  Activity,
  Building2,
  Landmark,
  Wallet,
  Banknote,
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
import { InsightCards } from "@/components/cashflow-monitor/insight-cards"
import { KpiCard } from "@/components/cashflow-monitor/kpi-card"
import { CashflowWaterfallChart } from "@/components/cashflow-monitor/cashflow-waterfall-chart"
import { CashBalanceTrendChart } from "@/components/cashflow-monitor/cash-balance-trend-chart"
import { CashflowCategoryTable } from "@/components/cashflow-monitor/cashflow-category-table"
import {
  headerKpis,
  waterfallSteps,
  cashBalanceTrend,
  categoryRows,
  cfTypeOptions,
  directionOptions,
} from "@/lib/cashflow-monitor-mock-data"
import type { DashboardFilters } from "@/types/cashflow-monitor"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  cfType: "all",
  direction: "all",
}

const kpiIcons = [Activity, Building2, Landmark, Wallet, Banknote] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    cfType: filters.cfType,
    direction: filters.direction,
  }

  const filteredCategoryRows = categoryRows.filter((row) => {
    if (filters.cfType && filters.cfType !== "all" && row.cfType !== filters.cfType) {
      return false
    }
    if (
      filters.direction &&
      filters.direction !== "all" &&
      row.direction !== filters.direction
    ) {
      return false
    }
    return true
  })

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>キャッシュフロー・モニタ</PageShellTitle>
          <PageShellDescription>
            営業・投資・財務CFの動きと月末現金残高、入出金カテゴリ別の増減要因を一画面で把握
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.id} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <CashflowWaterfallChart data={waterfallSteps} />

        <CashBalanceTrendChart data={cashBalanceTrend} />

        <FilterBar
          value={filterValues}
          onChange={(next) =>
            setFilters((prev) => ({
              ...prev,
              cfType: next.cfType as string | undefined,
              direction: next.direction as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="cfType"
            label="CF区分"
            options={cfTypeOptions}
          />
          <FilterBarSelect
            filterKey="direction"
            label="入出金"
            options={directionOptions}
          />
        </FilterBar>

        <CashflowCategoryTable data={filteredCategoryRows} />
      </PageShellContent>
    </PageShell>
  )
}
