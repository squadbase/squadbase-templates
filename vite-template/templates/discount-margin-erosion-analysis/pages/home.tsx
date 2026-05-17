import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Percent, TrendingDown, Tag, AlertOctagon } from "lucide-react"
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
import { InsightCards } from "@/components/discount-margin-erosion-analysis/insight-cards"
import { KpiCard } from "@/components/discount-margin-erosion-analysis/kpi-card"
import { DiscountHistogram } from "@/components/discount-margin-erosion-analysis/discount-histogram"
import { DiscountVolumeScatter } from "@/components/discount-margin-erosion-analysis/discount-volume-scatter"
import { CustomerDiscountRanking } from "@/components/discount-margin-erosion-analysis/customer-discount-ranking"
import { ChannelDiscountRanking } from "@/components/discount-margin-erosion-analysis/channel-discount-ranking"
import {
  headerKpis,
  discountHistogram,
  transactions,
  customerRanking,
  channelRanking,
  channelOptions,
} from "@/lib/discount-margin-erosion-analysis-mock-data"
import type { DashboardFilters } from "@/types/discount-margin-erosion-analysis"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 2)),
    to: endOfMonth(today),
  },
  channel: "all",
}

const kpiIcons = [Percent, TrendingDown, Tag, AlertOctagon] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    channel: filters.channel,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Discount & Margin Erosion Analysis</PageShellTitle>
          <PageShellDescription>
            Detect where discounting concentrates and recover margin through targeted policy adjustments
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
            }))
          }
        >
          <FilterBarSelect
            filterKey="channel"
            label="Channel"
            options={channelOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <DiscountHistogram data={discountHistogram} />

        <DiscountVolumeScatter data={transactions} />

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerDiscountRanking data={customerRanking} />
          <ChannelDiscountRanking data={channelRanking} />
        </div>
      </PageShellContent>
    </PageShell>
  )
}
