import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  MousePointerClick,
  JapaneseYen,
  TrendingUp,
  Sparkles,
  Wallet,
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
import { InsightCards } from "@/components/affiliate-performance-dashboard/insight-cards"
import { KpiCard } from "@/components/affiliate-performance-dashboard/kpi-card"
import { MediaCvRanking } from "@/components/affiliate-performance-dashboard/media-cv-ranking"
import { RoasScatter } from "@/components/affiliate-performance-dashboard/roas-scatter"
import { MonthlyCvTrend } from "@/components/affiliate-performance-dashboard/monthly-cv-trend"
import {
  headerKpis,
  mediaSummaries,
  monthlyCvTrend,
  aspOptions,
  segmentOptions,
} from "@/lib/affiliate-performance-dashboard-mock-data"
import type { DashboardFilters } from "@/types/affiliate-performance-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  asp: "all",
  segment: "all",
}

const kpiIcons = [
  MousePointerClick,
  Wallet,
  TrendingUp,
  Sparkles,
  JapaneseYen,
] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    asp: filters.asp,
    segment: filters.segment,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>アフィリエイト効果ダッシュボード</PageShellTitle>
          <PageShellDescription>
            媒体・ASP別のCV／CPA／ROAS と、新規メディア寄与のモメンタムを一望
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
              asp: next.asp as string | undefined,
              segment: next.segment as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="asp"
            label="ASP"
            options={aspOptions}
          />
          <FilterBarSelect
            filterKey="segment"
            label="セグメント"
            options={segmentOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <MediaCvRanking data={mediaSummaries} />

        <RoasScatter data={mediaSummaries} />

        <MonthlyCvTrend data={monthlyCvTrend} />
      </PageShellContent>
    </PageShell>
  )
}
