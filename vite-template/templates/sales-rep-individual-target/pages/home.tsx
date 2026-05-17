import { useMemo, useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Target,
  DollarSign,
  Gauge,
  TrendingDown,
  CalendarClock,
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
import { InsightCards } from "@/components/sales-rep-individual-target/insight-cards"
import { KpiCard } from "@/components/sales-rep-individual-target/kpi-card"
import { AttainmentBarChart } from "@/components/sales-rep-individual-target/attainment-bar-chart"
import { PaceJudgmentTable } from "@/components/sales-rep-individual-target/pace-judgment-table"
import { MonthlyTrendSmallMultiples } from "@/components/sales-rep-individual-target/monthly-trend-small-multiples"
import {
  headerKpis,
  repAttainments,
  repPaceRows,
  repMonthlyTrends,
  teamOptions,
  repOptions,
} from "@/lib/sales-rep-individual-target-mock-data"
import type { DashboardFilters } from "@/types/sales-rep-individual-target"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  team: "all",
  rep: "all",
}

const kpiIcons = [Target, DollarSign, Gauge, TrendingDown, CalendarClock] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    team: filters.team,
    rep: filters.rep,
  }

  const filteredAttainments = useMemo(() => {
    return repAttainments.filter((r) => {
      if (filters.rep && filters.rep !== "all" && r.salesRep !== filters.rep) {
        return false
      }
      return true
    })
  }, [filters.rep])

  const filteredPaceRows = useMemo(() => {
    return repPaceRows.filter((r) => {
      if (filters.rep && filters.rep !== "all" && r.salesRep !== filters.rep) {
        return false
      }
      return true
    })
  }, [filters.rep])

  const filteredTrends = useMemo(() => {
    return repMonthlyTrends.filter((r) => {
      if (filters.rep && filters.rep !== "all" && r.salesRep !== filters.rep) {
        return false
      }
      return true
    })
  }, [filters.rep])

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Sales Rep Individual Target Tracking</PageShellTitle>
          <PageShellDescription>
            Per-rep attainment, pace judgement, and 12-month trend — so managers can spot who needs coaching before month-end
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
              team: next.team as string | undefined,
              rep: next.rep as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="team"
            label="Team"
            options={teamOptions}
          />
          <FilterBarSelect
            filterKey="rep"
            label="Sales Rep"
            options={repOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <AttainmentBarChart data={filteredAttainments} />

        <PaceJudgmentTable data={filteredPaceRows} />

        <MonthlyTrendSmallMultiples data={filteredTrends} />
      </PageShellContent>
    </PageShell>
  )
}
