import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Footprints,
  Handshake,
  Pill,
  Building2,
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
import { InsightCards } from "@/components/mr-activity-dashboard/insight-cards"
import { KpiCard } from "@/components/mr-activity-dashboard/kpi-card"
import { MrRankingChart } from "@/components/mr-activity-dashboard/mr-ranking-chart"
import { FacilityRxShareChart } from "@/components/mr-activity-dashboard/facility-rx-share-chart"
import { UncoveredFacilitiesTable } from "@/components/mr-activity-dashboard/uncovered-facilities-table"
import {
  headerKpis,
  mrRanking,
  facilityRxSeries,
  uncoveredFacilities,
  territoryOptions,
  segmentOptions,
} from "@/lib/mr-activity-dashboard-mock-data"
import type { DashboardFilters } from "@/types/mr-activity-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  territory: "all",
  segment: "all",
}

const kpiIcons = [Footprints, Handshake, Pill, Building2] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    territory: filters.territory,
    segment: filters.segment,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>MR活動ダッシュボード</PageShellTitle>
          <PageShellDescription>
            訪問件数・面談率・処方シェア・カバレッジを一画面で把握し、MR別ランキングと未カバー施設へのフォローまで一気通貫で確認
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
              territory: next.territory as string | undefined,
              segment: next.segment as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="territory"
            label="エリア"
            options={territoryOptions}
          />
          <FilterBarSelect
            filterKey="segment"
            label="セグメント"
            options={segmentOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <MrRankingChart data={mrRanking} />

        <FacilityRxShareChart data={facilityRxSeries} />

        <UncoveredFacilitiesTable data={uncoveredFacilities} />
      </PageShellContent>
    </PageShell>
  )
}
