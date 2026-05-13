import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  JapaneseYen,
  Target,
  TrendingDown,
  TrendingUp,
  MousePointerClick,
  Percent,
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
import { InsightCards } from "@/components/ad-roas-cpa-dashboard/insight-cards"
import { KpiCard } from "@/components/ad-roas-cpa-dashboard/kpi-card"
import { ChannelPerformanceTable } from "@/components/ad-roas-cpa-dashboard/channel-performance-table"
import { SpendVsConversionsChart } from "@/components/ad-roas-cpa-dashboard/spend-vs-conversions-chart"
import { BudgetAllocationSankey } from "@/components/ad-roas-cpa-dashboard/budget-allocation-sankey"
import {
  headerKpis,
  channelPerformance,
  dailySpendConv,
  budgetSankey,
  channelOptions,
  objectiveOptions,
} from "@/lib/ad-roas-cpa-dashboard-mock-data"
import type { DashboardFilters } from "@/types/ad-roas-cpa-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  channel: "all",
  objective: "all",
}

const kpiIcons = [
  JapaneseYen,
  Target,
  TrendingDown,
  TrendingUp,
  MousePointerClick,
  Percent,
] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    channel: filters.channel,
    objective: filters.objective,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>広告ROAS／CPAダッシュボード</PageShellTitle>
          <PageShellDescription>
            媒体別のROAS／CPAを比較し、広告費とCV数のペースを追跡。媒体×目的の予算フローも一目で把握
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
              channel: next.channel as string | undefined,
              objective: next.objective as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="channel"
            label="媒体"
            options={channelOptions}
          />
          <FilterBarSelect
            filterKey="objective"
            label="目的"
            options={objectiveOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <ChannelPerformanceTable data={channelPerformance} />

        <SpendVsConversionsChart data={dailySpendConv} />

        <BudgetAllocationSankey
          nodes={budgetSankey.nodes}
          links={budgetSankey.links}
        />
      </PageShellContent>
    </PageShell>
  )
}
