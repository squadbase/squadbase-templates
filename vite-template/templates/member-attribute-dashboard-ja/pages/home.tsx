import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Users,
  Layers,
  JapaneseYen,
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

const kpiIcons = [Users, Layers, JapaneseYen, ShoppingBag, UserPlus] as const

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
          <PageShellTitle>会員属性ダッシュボード</PageShellTitle>
          <PageShellDescription>
            会員ベースを属性別に俯瞰 — 構成比、セグメント別 LTV、新規会員の獲得チャネル
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
            label="性別"
            options={genderOptions}
          />
          <FilterBarSelect
            filterKey="ageBand"
            label="年代"
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
