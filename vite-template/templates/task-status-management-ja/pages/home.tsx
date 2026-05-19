import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  ListTodo,
  Loader2,
  AlertTriangle,
  CheckCircle2,
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
import { InsightCards } from "@/components/task-status-management/insight-cards"
import { KpiCard } from "@/components/task-status-management/kpi-card"
import { StatusBoard } from "@/components/task-status-management/status-board"
import { OwnerLoadChart } from "@/components/task-status-management/owner-load-chart"
import { OverdueTaskTable } from "@/components/task-status-management/overdue-task-table"
import {
  headerKpis,
  statusSummary,
  ownerLoad,
  overdueTasks,
  ownerOptions,
  priorityOptions,
} from "@/lib/task-status-management-mock-data"
import type { DashboardFilters } from "@/types/task-status-management"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 13)), to: endOfDay(today) },
  owner: "all",
  priority: "all",
}

const kpiIcons = [ListTodo, Loader2, AlertTriangle, CheckCircle2] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    owner: filters.owner,
    priority: filters.priority,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>タスク／案件ステータス管理</PageShellTitle>
          <PageShellDescription>
            チーム全体のタスクステータスをモニタリング — 未着手・進行中・完了の件数と期日超過案件を一望
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
              owner: next.owner as string | undefined,
              priority: next.priority as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="owner"
            label="担当"
            options={ownerOptions}
          />
          <FilterBarSelect
            filterKey="priority"
            label="優先度"
            options={priorityOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            ステータスボード
          </h2>
          <StatusBoard data={statusSummary} />
        </section>

        <OwnerLoadChart data={ownerLoad} />

        <OverdueTaskTable data={overdueTasks} />
      </PageShellContent>
    </PageShell>
  )
}
