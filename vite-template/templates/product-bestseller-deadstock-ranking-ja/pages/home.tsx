import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { TrendingUp, TrendingDown, RefreshCcw, Layers, Target } from "lucide-react"
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
import { InsightCards } from "@/components/product-bestseller-deadstock-ranking/insight-cards"
import { KpiCard } from "@/components/product-bestseller-deadstock-ranking/kpi-card"
import { ProductRankingTable } from "@/components/product-bestseller-deadstock-ranking/product-ranking-table"
import { AbcParetoChart } from "@/components/product-bestseller-deadstock-ranking/abc-pareto-chart"
import { QuadrantMap } from "@/components/product-bestseller-deadstock-ranking/quadrant-map"
import {
  headerKpis,
  productRanking,
  paretoData,
  quadrantData,
  categoryOptions,
} from "@/lib/product-bestseller-deadstock-ranking-mock-data"
import type { DashboardFilters } from "@/types/product-bestseller-deadstock-ranking"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 2)),
    to: endOfMonth(today),
  },
  category: "all",
}

const kpiIcons = [TrendingUp, TrendingDown, RefreshCcw, Layers, Target] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>売れ筋／死に筋ランキング</PageShellTitle>
          <PageShellDescription>
            売れ筋・死に筋・ABC構成を把握し、MD・バイヤーの判断を支援
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
            }))
          }
        >
          <FilterBarSelect
            filterKey="category"
            label="カテゴリ"
            options={categoryOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <ProductRankingTable data={productRanking} />

        <AbcParetoChart data={paretoData} />

        <QuadrantMap data={quadrantData} />
      </PageShellContent>
    </PageShell>
  )
}
