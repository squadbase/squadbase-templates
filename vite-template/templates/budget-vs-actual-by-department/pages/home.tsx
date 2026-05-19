import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  Target,
  DollarSign,
  GaugeCircle,
  ChartBar,
  TrendingUp,
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
import { InsightCards } from "@/components/budget-vs-actual-by-department/insight-cards"
import { KpiCard } from "@/components/budget-vs-actual-by-department/kpi-card"
import { DeptBulletBar } from "@/components/budget-vs-actual-by-department/dept-bullet-bar"
import { CumulativeVsBudget } from "@/components/budget-vs-actual-by-department/cumulative-vs-budget"
import { AchievementRanking } from "@/components/budget-vs-actual-by-department/achievement-ranking"
import {
  headerKpis,
  deptTotals,
  cumulative,
  ranking,
  departmentOptions,
} from "@/lib/budget-vs-actual-by-department-mock-data"
import type { DashboardFilters } from "@/types/budget-vs-actual-by-department"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  department: "all",
}

const kpiIcons = [Target, DollarSign, GaugeCircle, ChartBar, TrendingUp] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    department: filters.department,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Budget vs Actual by Department</PageShellTitle>
          <PageShellDescription>
            Annual budget achievement, monthly pace, and year-end forecast by department
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
              department: next.department as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="department"
            label="Department"
            options={departmentOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <DeptBulletBar data={deptTotals} />

        <CumulativeVsBudget data={cumulative} />

        <AchievementRanking data={ranking} />
      </PageShellContent>
    </PageShell>
  )
}
