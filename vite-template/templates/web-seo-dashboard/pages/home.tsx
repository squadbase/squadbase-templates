import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/data/date-range-picker"
import {
  FilterBar,
  FilterBarSelect,
} from "@/components/data/filter-bar"
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
import { InsightCards } from "@/components/web-seo-dashboard/insight-cards"
import { TrafficOverviewTab } from "@/components/web-seo-dashboard/traffic-overview-tab"
import { ContentAnalysisTab } from "@/components/web-seo-dashboard/content-analysis-tab"
import { SeoAnalysisTab } from "@/components/web-seo-dashboard/seo-analysis-tab"
import {
  deviceOptions,
  channelOptions,
  categoryOptions,
} from "@/lib/web-seo-mock-data"
import type { DashboardFilters } from "@/types/web-seo"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  device: "all",
  channel: "all",
  category: "all",
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    device: filters.device,
    channel: filters.channel,
    category: filters.category,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Web Traffic & SEO Analytics</PageShellTitle>
          <PageShellDescription>
            Unified dashboard for site traffic, content performance, and search engine optimization
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
              device: next.device as string | undefined,
              channel: next.channel as string | undefined,
              category: next.category as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="device"
            label="Device"
            options={deviceOptions}
          />
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

        <Tabs defaultValue="traffic">
          <TabsList>
            <TabsTrigger value="traffic">Traffic Overview</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="traffic">
            <TrafficOverviewTab />
          </TabsContent>
          <TabsContent value="content">
            <ContentAnalysisTab />
          </TabsContent>
          <TabsContent value="seo">
            <SeoAnalysisTab />
          </TabsContent>
        </Tabs>
      </PageShellContent>
    </PageShell>
  )
}
