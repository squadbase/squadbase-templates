import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  DollarSign,
  ArrowRightLeft,
  CalendarClock,
  CalendarRange,
  Target,
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
import { InsightCards } from "@/components/daily-sales-monitoring/insight-cards"
import { TodaySnapshot } from "@/components/daily-sales-monitoring/today-snapshot"
import { KpiCard } from "@/components/daily-sales-monitoring/kpi-card"
import { SalesTrendChart } from "@/components/daily-sales-monitoring/sales-trend-chart"
import { YoYOverlayChart } from "@/components/daily-sales-monitoring/yoy-overlay-chart"
import { DayOfWeekHeatmap } from "@/components/daily-sales-monitoring/day-of-week-heatmap"
import {
  headerKpis,
  dailySalesTrend,
  yoyOverlay,
  dowHeatmap,
  channelOptions,
  storeOptions,
} from "@/lib/daily-sales-monitoring-mock-data"
import type { DashboardFilters } from "@/types/daily-sales-monitoring"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  channel: "all",
  store: "all",
}

const kpiIcons = [DollarSign, ArrowRightLeft, CalendarClock, CalendarRange, Target] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    channel: filters.channel,
    store: filters.store,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Daily Sales Monitoring</PageShellTitle>
          <PageShellDescription>
            A morning-read view of today&apos;s revenue, day-over-day shifts, and how the month is pacing
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
              store: next.store as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="channel"
            label="Channel"
            options={channelOptions}
          />
          <FilterBarSelect
            filterKey="store"
            label="Store"
            options={storeOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Today&apos;s Snapshot
          </h2>
          <TodaySnapshot />
        </section>

        <SalesTrendChart data={dailySalesTrend} />

        <YoYOverlayChart data={yoyOverlay} />

        <DayOfWeekHeatmap data={dowHeatmap} />
      </PageShellContent>
    </PageShell>
  )
}
