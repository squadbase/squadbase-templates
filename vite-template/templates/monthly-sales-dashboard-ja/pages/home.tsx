import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  JapaneseYen,
  Target,
  TrendingUp,
  Percent,
  PieChart,
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
import { InsightCards } from "@/components/monthly-sales-dashboard/insight-cards"
import { KpiCard } from "@/components/monthly-sales-dashboard/kpi-card"
import { MonthlyTrendChart } from "@/components/monthly-sales-dashboard/monthly-trend-chart"
import { BudgetActualWaterfall } from "@/components/monthly-sales-dashboard/budget-actual-waterfall"
import { CategoryStackChart } from "@/components/monthly-sales-dashboard/category-stack-chart"
import { ChannelStackChart } from "@/components/monthly-sales-dashboard/channel-stack-chart"
import {
  headerKpis,
  monthlyTrend,
  budgetWaterfall,
  categoryMonthly,
  channelMonthly,
  categoryOptions,
  channelOptions,
} from "@/lib/monthly-sales-dashboard-mock-data"
import type { DashboardFilters } from "@/types/monthly-sales-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  category: "all",
  channel: "all",
}

const kpiIcons = [JapaneseYen, Target, TrendingUp, Percent, PieChart] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
    channel: filters.channel,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>月次売上ダッシュボード</PageShellTitle>
          <PageShellDescription>
            経営報告用 — 月次推移・予算達成・セグメント寄与度を一覧表示
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
              category: next.category as string | undefined,
              channel: next.channel as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="category"
            label="カテゴリ"
            options={categoryOptions}
          />
          <FilterBarSelect
            filterKey="channel"
            label="チャネル"
            options={channelOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <MonthlyTrendChart data={monthlyTrend} />

        <BudgetActualWaterfall data={budgetWaterfall} />

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryStackChart data={categoryMonthly} />
          <ChannelStackChart data={channelMonthly} />
        </div>
      </PageShellContent>
    </PageShell>
  )
}
