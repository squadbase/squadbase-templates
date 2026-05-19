import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Package,
  Target,
  Activity,
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
import { InsightCards } from "@/components/production-monitor/insight-cards"
import { KpiCard } from "@/components/production-monitor/kpi-card"
import { LineOutputChart } from "@/components/production-monitor/line-output-chart"
import { PlanVsActualChart } from "@/components/production-monitor/plan-vs-actual-chart"
import { DefectRateChart } from "@/components/production-monitor/defect-rate-chart"
import {
  headerKpis,
  lineOutputToday,
  planVsActualSeries,
  defectRateTrend,
  lineOptions,
  shiftOptions,
} from "@/lib/production-monitor-mock-data"
import type { DashboardFilters } from "@/types/production-monitor"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  line: "all",
  shift: "all",
}

const kpiIcons = [Package, Target, Activity, AlertTriangle] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    line: filters.line,
    shift: filters.shift,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>生産実績モニタ</PageShellTitle>
          <PageShellDescription>
            当日の生産数・ライン別の計画達成状況・不良品質の動向を一目で把握する現場ダッシュボード
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
              line: next.line as string | undefined,
              shift: next.shift as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="line"
            label="ライン"
            options={lineOptions}
          />
          <FilterBarSelect
            filterKey="shift"
            label="シフト"
            options={shiftOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <LineOutputChart data={lineOutputToday} />

        <PlanVsActualChart data={planVsActualSeries} />

        <DefectRateChart data={defectRateTrend} />
      </PageShellContent>
    </PageShell>
  )
}
