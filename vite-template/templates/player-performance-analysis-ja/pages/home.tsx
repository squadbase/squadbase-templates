import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Footprints,
  Zap,
  Clock,
  HeartPulse,
  Activity,
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
import { InsightCards } from "@/components/player-performance-analysis/insight-cards"
import { ConditionSnapshot } from "@/components/player-performance-analysis/condition-snapshot"
import { KpiCard } from "@/components/player-performance-analysis/kpi-card"
import { PlayerWorkloadChart } from "@/components/player-performance-analysis/player-workload-chart"
import { PositionHeatmap } from "@/components/player-performance-analysis/position-heatmap"
import { MatchTrendChart } from "@/components/player-performance-analysis/match-trend-chart"
import {
  headerKpis,
  playerWorkload,
  positionHeatmap,
  matchTrend,
  positionOptions,
  competitionOptions,
} from "@/lib/player-performance-analysis-mock-data"
import type { DashboardFilters } from "@/types/player-performance-analysis"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  position: "all",
  competition: "all",
}

const kpiIcons = [Footprints, Zap, Clock, HeartPulse, Activity] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    position: filters.position,
    competition: filters.competition,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>選手パフォーマンス分析</PageShellTitle>
          <PageShellDescription>
            コーチ・アナリスト向け — チーム全体のワークロード、ポジション別傾向、試合別パフォーマンス
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
              position: next.position as string | undefined,
              competition: next.competition as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="position"
            label="ポジション"
            options={positionOptions}
          />
          <FilterBarSelect
            filterKey="competition"
            label="大会"
            options={competitionOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            コンディションサマリー
          </h2>
          <ConditionSnapshot />
        </section>

        <PlayerWorkloadChart data={playerWorkload} />

        <PositionHeatmap data={positionHeatmap} />

        <MatchTrendChart data={matchTrend} />
      </PageShellContent>
    </PageShell>
  )
}
