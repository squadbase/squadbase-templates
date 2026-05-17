import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { Percent, AlertTriangle, Wrench, Repeat } from "lucide-react"
import type { LucideIcon } from "lucide-react"
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
  PageShellSummaryCard,
  PageShellContent,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/quality-defect-tracking/insight-cards"
import { DefectParetoChart } from "@/components/quality-defect-tracking/defect-pareto-chart"
import { LineCauseHeatmap } from "@/components/quality-defect-tracking/line-cause-heatmap"
import { MonthlyTrendChart } from "@/components/quality-defect-tracking/monthly-trend-chart"
import {
  summaryKpis,
  defectPareto,
  lineCauseHeatmap,
  monthlyTrend,
  lineOptions,
} from "@/lib/quality-defect-tracking-mock-data"
import type {
  DashboardFilters,
  SummaryKpi,
} from "@/types/quality-defect-tracking"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  line: "all",
}

const kpiIcons: Record<SummaryKpi["id"], LucideIcon> = {
  "defect-rate": Percent,
  "defect-count": AlertTriangle,
  "top-cause": Wrench,
  "recurrence-rate": Repeat,
}

const accentMap = {
  positive: "accent",
  neutral: "default",
  attention: "amber",
} as const

const valueClassMap = {
  positive: "text-chart-1",
  neutral: "",
  attention: "text-amber-700",
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    line: filters.line,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>品質不良トラッキング</PageShellTitle>
          <PageShellDescription>
            不良の大半を生む少数の要因、ライン×要因のホットスポット、月次トレンドが管理限界内かを一望できるダッシュボード
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
          {summaryKpis.map((kpi) => {
            const Icon = kpiIcons[kpi.id]
            return (
              <PageShellSummaryCard
                key={kpi.id}
                accent={accentMap[kpi.sentiment]}
              >
                <Icon />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    {kpi.label}
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold tabular-nums truncate ${valueClassMap[kpi.sentiment]}`}
                  >
                    {kpi.value}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {kpi.helper}
                  </p>
                </div>
              </PageShellSummaryCard>
            )
          })}
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <FilterBar
          value={filterValues}
          onChange={(next) =>
            setFilters((prev) => ({
              ...prev,
              line: next.line as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="line"
            label="ライン"
            options={lineOptions}
          />
        </FilterBar>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            インサイト
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <InsightCards />
          </div>
        </section>

        <DefectParetoChart data={defectPareto} />

        <LineCauseHeatmap data={lineCauseHeatmap} />

        <MonthlyTrendChart data={monthlyTrend} />
      </PageShellContent>
    </PageShell>
  )
}
