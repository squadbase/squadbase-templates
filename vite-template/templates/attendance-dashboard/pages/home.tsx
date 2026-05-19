import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Clock, Hourglass, CalendarCheck, Moon } from "lucide-react"
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
import { InsightCards } from "@/components/attendance-dashboard/insight-cards"
import { KpiCard } from "@/components/attendance-dashboard/kpi-card"
import { MemberWorkHoursRanking } from "@/components/attendance-dashboard/member-workhours-ranking"
import { OvertimeTrendChart } from "@/components/attendance-dashboard/overtime-trend-chart"
import { PaidLeaveByDepartment } from "@/components/attendance-dashboard/paid-leave-by-department"
import {
  headerKpis,
  members,
  overtimeTrend,
  paidLeaveByDept,
  departmentOptions,
} from "@/lib/attendance-dashboard-mock-data"
import type { DashboardFilters } from "@/types/attendance-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 2)),
    to: endOfMonth(today),
  },
  department: "all",
}

const kpiIcons = [Clock, Hourglass, CalendarCheck, Moon] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    department: filters.department,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Attendance Dashboard</PageShellTitle>
          <PageShellDescription>
            Monitor monthly workload, overtime spikes, and paid-leave usage to support healthy, compliant working hours
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <MemberWorkHoursRanking data={members} />

        <OvertimeTrendChart data={overtimeTrend} />

        <PaidLeaveByDepartment data={paidLeaveByDept} />
      </PageShellContent>
    </PageShell>
  )
}
