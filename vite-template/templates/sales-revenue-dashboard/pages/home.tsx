import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { Download } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { FilterBar, FilterBarSelect } from "@/components/data/filter-bar"
import { SegmentedControl } from "@/components/common/segmented-control"
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
import { InsightCards } from "@/components/sales-revenue-dashboard/insight-cards"
import { SalesAnalyticsTab } from "@/components/sales-revenue-dashboard/sales-analytics-tab"
import { RealtimeMonitorTab } from "@/components/sales-revenue-dashboard/realtime-monitor-tab"
import {
  channelOptions,
  categoryOptions,
  granularityOptions,
} from "@/lib/sales-revenue-mock-data"
import type { DashboardFilters, Granularity } from "@/types/sales-revenue"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  granularity: "day",
  channel: "all",
  category: "all",
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    channel: filters.channel,
    category: filters.category,
  }

  const handleExport = () => {
    // UI placeholder in the template — users swap in their own implementation
    console.log("Export CSV", filters)
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Sales & Revenue Dashboard</PageShellTitle>
          <PageShellDescription>
            Unified view of core KPIs (GMV, orders, AOV) and realtime monitoring
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
        <Tabs defaultValue="analytics">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
              <TabsTrigger value="realtime">Realtime Monitor</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                size="sm"
                options={granularityOptions}
                value={filters.granularity}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    granularity: v as Granularity,
                  }))
                }
                ariaLabel="Granularity"
              />
              <FilterBar
                value={filterValues}
                onChange={(next) =>
                  setFilters((prev) => ({
                    ...prev,
                    channel: next.channel as string | undefined,
                    category: next.category as string | undefined,
                  }))
                }
              >
                <FilterBarSelect
                  filterKey="channel"
                  label="Channel"
                  options={channelOptions}
                />
                <FilterBarSelect
                  filterKey="category"
                  label="Category"
                  options={categoryOptions}
                />
              </FilterBar>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-1.5"
              >
                <Download className="size-3.5" />
                Export CSV
              </Button>
            </div>
          </div>

          <TabsContent value="analytics" className="mt-6">
            <SalesAnalyticsTab />
          </TabsContent>
          <TabsContent value="realtime" className="mt-6">
            <RealtimeMonitorTab />
          </TabsContent>
        </Tabs>
      </PageShellContent>
    </PageShell>
  )
}
