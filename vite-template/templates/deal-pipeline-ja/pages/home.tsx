import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Briefcase, JapaneseYen, Scale, TrendingUp } from "lucide-react"
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
import { InsightCards } from "@/components/deal-pipeline/insight-cards"
import { KpiCard } from "@/components/deal-pipeline/kpi-card"
import { StageFunnel } from "@/components/deal-pipeline/stage-funnel"
import { DealTable } from "@/components/deal-pipeline/deal-table"
import { ForecastTrend } from "@/components/deal-pipeline/forecast-trend"
import {
  headerKpis,
  stageFunnel,
  deals,
  forecastTrend,
  ownerOptions,
  stageOptions,
} from "@/lib/deal-pipeline-mock-data"
import type { DashboardFilters } from "@/types/deal-pipeline"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 2)),
    to: endOfMonth(today),
  },
  owner: "all",
  stage: "all",
}

const kpiIcons = [Briefcase, JapaneseYen, Scale, TrendingUp] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    owner: filters.owner,
    stage: filters.stage,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>案件パイプライン</PageShellTitle>
          <PageShellDescription>
            セールスファネル・要注意案件・受注予測を一覧で把握
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
              owner: next.owner as string | undefined,
              stage: next.stage as string | undefined,
            }))
          }
        >
          <FilterBarSelect filterKey="owner" label="オーナー" options={ownerOptions} />
          <FilterBarSelect filterKey="stage" label="ステージ" options={stageOptions} />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <StageFunnel data={stageFunnel} />

        <DealTable data={deals} />

        <ForecastTrend data={forecastTrend} />
      </PageShellContent>
    </PageShell>
  )
}
