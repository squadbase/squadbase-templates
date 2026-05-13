import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  UserCheck,
  Percent,
  UserMinus,
  Hourglass,
  Clock,
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
import { InsightCards } from "@/components/offer-acceptance-tracking/insight-cards"
import { KpiCard } from "@/components/offer-acceptance-tracking/kpi-card"
import { StatusFunnel } from "@/components/offer-acceptance-tracking/status-funnel"
import { DeclineReasonsChart } from "@/components/offer-acceptance-tracking/decline-reasons-chart"
import { FollowUpTable } from "@/components/offer-acceptance-tracking/follow-up-table"
import {
  headerKpis,
  statusFunnel,
  declineReasons,
  followUpList,
  departmentOptions,
  recruiterOptions,
} from "@/lib/offer-acceptance-tracking-mock-data"
import type { DashboardFilters } from "@/types/offer-acceptance-tracking"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  department: "all",
  recruiter: "all",
}

const kpiIcons = [UserCheck, Percent, UserMinus, Hourglass, Clock] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    department: filters.department,
    recruiter: filters.recruiter,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Offer Acceptance Tracking</PageShellTitle>
          <PageShellDescription>
            Monitor candidate status, decline drivers, and individual follow-up
            priorities for new-grad recruiting
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
              recruiter: next.recruiter as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="department"
            label="Department"
            options={departmentOptions}
          />
          <FilterBarSelect
            filterKey="recruiter"
            label="Recruiter"
            options={recruiterOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <StatusFunnel data={statusFunnel} />

        <DeclineReasonsChart data={declineReasons} />

        <FollowUpTable data={followUpList} />
      </PageShellContent>
    </PageShell>
  )
}
