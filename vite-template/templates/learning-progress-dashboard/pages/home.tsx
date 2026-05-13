import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  CheckCircle2,
  Award,
  Clock,
  AlertTriangle,
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
import { InsightCards } from "@/components/learning-progress-dashboard/insight-cards"
import { KpiCard } from "@/components/learning-progress-dashboard/kpi-card"
import { CourseCompletionRanking } from "@/components/learning-progress-dashboard/course-completion-ranking"
import { LearnerActivityHeatmap } from "@/components/learning-progress-dashboard/learner-activity-heatmap"
import { TestScoreDistribution } from "@/components/learning-progress-dashboard/test-score-distribution"
import {
  headerKpis,
  courseCompletions,
  learnerActivity,
  testScoreBins,
  departmentOptions,
  courseCategoryOptions,
} from "@/lib/learning-progress-dashboard-mock-data"
import type { DashboardFilters } from "@/types/learning-progress-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  department: "all",
  courseCategory: "all",
}

const kpiIcons = [CheckCircle2, Award, Clock, AlertTriangle] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    department: filters.department,
    courseCategory: filters.courseCategory,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Learning Progress Dashboard</PageShellTitle>
          <PageShellDescription>
            Track course completion, test performance, and learner engagement across teams
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
              courseCategory: next.courseCategory as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="department"
            label="Department"
            options={departmentOptions}
          />
          <FilterBarSelect
            filterKey="courseCategory"
            label="Course category"
            options={courseCategoryOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <CourseCompletionRanking data={courseCompletions} />

        <LearnerActivityHeatmap data={learnerActivity} />

        <TestScoreDistribution data={testScoreBins} />
      </PageShellContent>
    </PageShell>
  )
}
