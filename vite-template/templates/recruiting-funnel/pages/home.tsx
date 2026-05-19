import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Users,
  Filter,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Trophy,
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
import { InsightCards } from "@/components/recruiting-funnel/insight-cards"
import { KpiCard } from "@/components/recruiting-funnel/kpi-card"
import { StageFunnel } from "@/components/recruiting-funnel/stage-funnel"
import { SourceAcquisition } from "@/components/recruiting-funnel/source-acquisition"
import { LeadTimeDistribution } from "@/components/recruiting-funnel/lead-time-distribution"
import {
  headerKpis,
  funnelStats,
  sourceStats,
  leadTimeBins,
  sourceOptions,
  stageOptions,
} from "@/lib/recruiting-funnel-mock-data"
import type { DashboardFilters } from "@/types/recruiting-funnel"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  source: "all",
  stage: "all",
}

const kpiIcons = [
  Users,
  Filter,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Trophy,
] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    source: filters.source,
    stage: filters.stage,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Recruiting Funnel</PageShellTitle>
          <PageShellDescription>
            Track applicant volume through each hiring stage, source
            acquisition with pass-rate, and screening lead-time distribution
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
              stage: next.stage as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="source"
            label="Source"
            options={sourceOptions}
          />
          <FilterBarSelect
            filterKey="stage"
            label="Stage"
            options={stageOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <StageFunnel data={funnelStats} />

        <SourceAcquisition data={sourceStats} />

        <LeadTimeDistribution data={leadTimeBins} />
      </PageShellContent>
    </PageShell>
  )
}
