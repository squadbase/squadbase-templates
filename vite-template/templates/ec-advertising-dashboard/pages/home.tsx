import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  DollarSign,
  Target,
  Layers,
  MousePointerClick,
  Sprout,
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
import { InsightCards } from "@/components/ec-advertising-dashboard/insight-cards"
import { KpiCard } from "@/components/ec-advertising-dashboard/kpi-card"
import { CampaignPerformanceTable } from "@/components/ec-advertising-dashboard/campaign-performance-table"
import { AdVsOrganicChart } from "@/components/ec-advertising-dashboard/ad-vs-organic-chart"
import { KeywordRankingTable } from "@/components/ec-advertising-dashboard/keyword-ranking-table"
import {
  headerKpis,
  campaignPerformance,
  adVsOrganic,
  keywordRanking,
  marketplaceOptions,
  campaignOptions,
} from "@/lib/ec-advertising-dashboard-mock-data"
import type { DashboardFilters } from "@/types/ec-advertising-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  marketplace: "all",
  campaign: "all",
}

const kpiIcons = [
  DollarSign,
  Target,
  Layers,
  MousePointerClick,
  Sprout,
] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    marketplace: filters.marketplace,
    campaign: filters.campaign,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>EC Advertising Dashboard (Amazon / Rakuten)</PageShellTitle>
          <PageShellDescription>
            Monitor ad sales, ACoS / TACoS, ad-vs-organic revenue mix, and top-converting keywords across marketplace campaigns
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
              marketplace: next.marketplace as string | undefined,
              campaign: next.campaign as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="marketplace"
            label="Marketplace"
            options={marketplaceOptions}
          />
          <FilterBarSelect
            filterKey="campaign"
            label="Campaign"
            options={campaignOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <CampaignPerformanceTable data={campaignPerformance} />

        <AdVsOrganicChart data={adVsOrganic} />

        <KeywordRankingTable data={keywordRanking} />
      </PageShellContent>
    </PageShell>
  )
}
