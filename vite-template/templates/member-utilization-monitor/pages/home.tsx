import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Activity, Flame, UserMinus, BarChart2 } from "lucide-react"
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
import { InsightCards } from "@/components/member-utilization-monitor/insight-cards"
import { KpiCard } from "@/components/member-utilization-monitor/kpi-card"
import { MemberUtilizationBar } from "@/components/member-utilization-monitor/member-utilization-bar"
import { OvertimeHeatmap } from "@/components/member-utilization-monitor/overtime-heatmap"
import { UtilizationBoxPlot } from "@/components/member-utilization-monitor/utilization-boxplot"
import {
  headerKpis,
  members,
  overtimeCells,
  boxPlot,
  teamOptions,
} from "@/lib/member-utilization-monitor-mock-data"
import type { DashboardFilters } from "@/types/member-utilization-monitor"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 2)),
    to: endOfMonth(today),
  },
  team: "all",
}

const kpiIcons = [Activity, Flame, UserMinus, BarChart2] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    team: filters.team,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Member Utilization Monitor</PageShellTitle>
          <PageShellDescription>
            Identify burnout risk, idle capacity, and uneven workload across teams
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
            }))
          }
        >
          <FilterBarSelect filterKey="team" label="Team" options={teamOptions} />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <MemberUtilizationBar data={members} />

        <OvertimeHeatmap data={overtimeCells} />

        <UtilizationBoxPlot data={boxPlot} />
      </PageShellContent>
    </PageShell>
  )
}
