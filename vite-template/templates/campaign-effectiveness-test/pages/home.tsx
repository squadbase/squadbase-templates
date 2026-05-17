import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  DollarSign,
  TrendingUp,
  Ticket,
  Target,
  Users,
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
import { InsightCards } from "@/components/campaign-effectiveness-test/insight-cards"
import { KpiCard } from "@/components/campaign-effectiveness-test/kpi-card"
import { PrePostComparisonChart } from "@/components/campaign-effectiveness-test/pre-post-comparison-chart"
import { RoiRankingTable } from "@/components/campaign-effectiveness-test/roi-ranking-table"
import { CouponRedemptionTable } from "@/components/campaign-effectiveness-test/coupon-redemption-table"
import {
  headerKpis,
  prePostSeries,
  campaignRoi,
  couponRedemption,
  channelOptions,
  confidenceOptions,
} from "@/lib/campaign-effectiveness-test-mock-data"
import type { DashboardFilters } from "@/types/campaign-effectiveness-test"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 41)), to: endOfDay(today) },
  channel: "all",
  confidence: "all",
}

const kpiIcons = [DollarSign, TrendingUp, Ticket, Target, Users] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    channel: filters.channel,
    confidence: filters.confidence,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Campaign Effectiveness Test</PageShellTitle>
          <PageShellDescription>
            Quantify campaign lift by comparing exposed (test) vs unexposed (control) customers, then rank campaigns by ROI and coupon performance
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
              confidence: next.confidence as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="channel"
            label="Channel"
            options={channelOptions}
          />
          <FilterBarSelect
            filterKey="confidence"
            label="Confidence"
            options={confidenceOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <PrePostComparisonChart data={prePostSeries} />

        <RoiRankingTable data={campaignRoi} />

        <CouponRedemptionTable data={couponRedemption} />
      </PageShellContent>
    </PageShell>
  )
}
