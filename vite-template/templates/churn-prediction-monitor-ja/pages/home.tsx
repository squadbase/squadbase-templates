import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { AlertTriangle, Users, Gauge, LifeBuoy } from "lucide-react"
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
import { InsightCards } from "@/components/churn-prediction-monitor/insight-cards"
import { KpiCard } from "@/components/churn-prediction-monitor/kpi-card"
import { AtRiskCustomerTable } from "@/components/churn-prediction-monitor/at-risk-customer-table"
import { FrequencyDeclineHeatmap } from "@/components/churn-prediction-monitor/frequency-decline-heatmap"
import { ChurnRateTrendChart } from "@/components/churn-prediction-monitor/churn-rate-trend-chart"
import {
  headerKpis,
  atRiskCustomers,
  frequencyDecline,
  churnRateTrend,
  segmentOptions,
  riskTierOptions,
} from "@/lib/churn-prediction-monitor-mock-data"
import type { DashboardFilters } from "@/types/churn-prediction-monitor"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  segment: "all",
  riskTier: "all",
}

const kpiIcons = [AlertTriangle, Users, Gauge, LifeBuoy] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    segment: filters.segment,
    riskTier: filters.riskTier,
  }

  const filteredByTier =
    filters.riskTier && filters.riskTier !== "all"
      ? atRiskCustomers.filter((c) => c.risk_tier === filters.riskTier)
      : atRiskCustomers
  const finalCustomers =
    filters.segment && filters.segment !== "all"
      ? filteredByTier.filter((c) => c.segment === filters.segment)
      : filteredByTier

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>チャーン／離反予測モニタ</PageShellTitle>
          <PageShellDescription>
            離反シグナルを早期検知 — リスクスコア別の顧客リスト、頻度ダウンのヒートマップ、月次チャーン率トレンドを一画面で確認
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
              segment: next.segment as string | undefined,
              riskTier: next.riskTier as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="segment"
            label="セグメント"
            options={segmentOptions}
          />
          <FilterBarSelect
            filterKey="riskTier"
            label="リスク階層"
            options={riskTierOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <AtRiskCustomerTable data={finalCustomers} />

        <FrequencyDeclineHeatmap data={frequencyDecline} />

        <ChurnRateTrendChart data={churnRateTrend} />
      </PageShellContent>
    </PageShell>
  )
}
