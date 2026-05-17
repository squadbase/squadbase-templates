import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Users,
  Filter,
  CalendarCheck,
  TrendingUp,
  DollarSign,
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
import { InsightCards } from "@/components/lead-funnel/insight-cards"
import { KpiCard } from "@/components/lead-funnel/kpi-card"
import { LeadFunnelChart } from "@/components/lead-funnel/lead-funnel-chart"
import { ChannelAcquisition } from "@/components/lead-funnel/channel-acquisition"
import { IsRanking } from "@/components/lead-funnel/is-ranking"
import {
  headerKpis,
  funnelStats,
  channelStats,
  ownerRanking,
  sourceOptions,
  ownerOptions,
} from "@/lib/lead-funnel-mock-data"
import type { DashboardFilters } from "@/types/lead-funnel"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  source: "all",
  owner: "all",
}

const kpiIcons = [Users, Filter, CalendarCheck, TrendingUp, DollarSign] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    source: filters.source,
    owner: filters.owner,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Lead Funnel</PageShellTitle>
          <PageShellDescription>
            Track lead volume through each funnel stage, channel acquisition
            with CPL, and inside-sales appointment performance
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
              source: next.source as string | undefined,
              owner: next.owner as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="source"
            label="Channel"
            options={sourceOptions}
          />
          <FilterBarSelect
            filterKey="owner"
            label="Owner"
            options={ownerOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <LeadFunnelChart data={funnelStats} />

        <ChannelAcquisition data={channelStats} />

        <IsRanking data={ownerRanking} />
      </PageShellContent>
    </PageShell>
  )
}
