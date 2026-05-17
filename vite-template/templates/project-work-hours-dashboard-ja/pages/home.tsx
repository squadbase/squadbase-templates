import { useState } from "react"
import { subWeeks, startOfWeek, endOfWeek } from "date-fns"
import { Clock, Scale, Activity, UserCheck } from "lucide-react"
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
import { InsightCards } from "@/components/project-work-hours-dashboard/insight-cards"
import { KpiCard } from "@/components/project-work-hours-dashboard/kpi-card"
import { ProjectHoursStack } from "@/components/project-work-hours-dashboard/project-hours-stack"
import { PlanVsActualVariance } from "@/components/project-work-hours-dashboard/plan-vs-actual-variance"
import { UtilizationTrend } from "@/components/project-work-hours-dashboard/utilization-trend"
import {
  headerKpis,
  projectHours,
  utilizationTrend,
  projectOptions,
  memberOptions,
} from "@/lib/project-work-hours-dashboard-mock-data"
import type { DashboardFilters } from "@/types/project-work-hours-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfWeek(subWeeks(today, 11), { weekStartsOn: 1 }),
    to: endOfWeek(today, { weekStartsOn: 1 }),
  },
  project: "all",
  member: "all",
}

const kpiIcons = [Clock, Scale, Activity, UserCheck] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    project: filters.project,
    member: filters.member,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>プロジェクト別工数</PageShellTitle>
          <PageShellDescription>
            計画 vs 実績、メンバー別配賦、週次稼働率トレンドを一覧表示
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
              project: next.project as string | undefined,
              member: next.member as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="project"
            label="プロジェクト"
            options={projectOptions}
          />
          <FilterBarSelect
            filterKey="member"
            label="メンバー"
            options={memberOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <ProjectHoursStack data={projectHours} />

        <PlanVsActualVariance data={projectHours} />

        <UtilizationTrend data={utilizationTrend} />
      </PageShellContent>
    </PageShell>
  )
}
