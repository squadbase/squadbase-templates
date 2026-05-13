import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Users,
  Layers,
  DollarSign,
  ShoppingBag,
  UserPlus,
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
import { InsightCards } from "@/components/member-attribute-dashboard/insight-cards"
import { KpiCard } from "@/components/member-attribute-dashboard/kpi-card"
import { AgeGenderHeatmap } from "@/components/member-attribute-dashboard/age-gender-heatmap"
import { AttributeLtvRanking } from "@/components/member-attribute-dashboard/attribute-ltv-ranking"
import { AcquisitionChannelChart } from "@/components/member-attribute-dashboard/acquisition-channel-chart"
import {
  headerKpis,
  ageGenderCrosstab,
  attributeLtvRanking,
  acquisitionChannels,
  genderOptions,
  ageBandOptions,
} from "@/lib/member-attribute-dashboard-mock-data"
import type { DashboardFilters } from "@/types/member-attribute-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  gender: "all",
  ageBand: "all",
}

const kpiIcons = [Users, Layers, DollarSign, ShoppingBag, UserPlus] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    gender: filters.gender,
    ageBand: filters.ageBand,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Member Attribute Dashboard</PageShellTitle>
          <PageShellDescription>
            A demographic view of the member base — composition, LTV by segment, and where new joiners come from
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
              gender: next.gender as string | undefined,
              ageBand: next.ageBand as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="gender"
            label="Gender"
            options={genderOptions}
          />
          <FilterBarSelect
            filterKey="ageBand"
            label="Age band"
            options={ageBandOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <AgeGenderHeatmap data={ageGenderCrosstab} />

        <AttributeLtvRanking data={attributeLtvRanking} />

        <AcquisitionChannelChart data={acquisitionChannels} />
      </PageShellContent>
    </PageShell>
  )
}
