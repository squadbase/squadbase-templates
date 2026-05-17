import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Target,
  MousePointerClick,
  Wallet,
  ShoppingCart,
  GraduationCap,
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
import { InsightCards } from "@/components/campaign-performance-analysis/insight-cards"
import { KpiCard } from "@/components/campaign-performance-analysis/kpi-card"
import { CampaignRoasRanking } from "@/components/campaign-performance-analysis/campaign-roas-ranking"
import { CreativeScatterChart } from "@/components/campaign-performance-analysis/creative-scatter-chart"
import { BudgetPacingBars } from "@/components/campaign-performance-analysis/budget-pacing-bars"
import {
  headerKpis,
  campaignRoas,
  creatives,
  budgetPacing,
  channelOptions,
  objectiveOptions,
} from "@/lib/campaign-performance-analysis-mock-data"
import type { DashboardFilters } from "@/types/campaign-performance-analysis"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 13)), to: endOfDay(today) },
  channel: "all",
  objective: "all",
}

const kpiIcons = [Target, MousePointerClick, Wallet, ShoppingCart, GraduationCap] as const

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
          <PageShellTitle>Campaign Performance Analysis</PageShellTitle>
          <PageShellDescription>
            ROAS leaders, creative quality, and budget pacing across active ad campaigns
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
            label="Channel"
            options={channelOptions}
          />
          <FilterBarSelect
            filterKey="objective"
            label="Objective"
            options={objectiveOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <CampaignRoasRanking data={campaignRoas} />

        <CreativeScatterChart data={creatives} />

        <BudgetPacingBars data={budgetPacing} />
      </PageShellContent>
    </PageShell>
  )
}
