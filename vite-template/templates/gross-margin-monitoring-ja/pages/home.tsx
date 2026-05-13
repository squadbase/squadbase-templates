import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  JapaneseYen,
  Package,
  Wallet,
  Percent,
  ArrowRightLeft,
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
import { InsightCards } from "@/components/gross-margin-monitoring/insight-cards"
import { KpiCard } from "@/components/gross-margin-monitoring/kpi-card"
import { MarginTrendChart } from "@/components/gross-margin-monitoring/margin-trend-chart"
import { CategoryMarginRanking } from "@/components/gross-margin-monitoring/category-margin-ranking"
import { ProductMarginScatter } from "@/components/gross-margin-monitoring/product-margin-scatter"
import {
  headerKpis,
  marginTrend,
  categoryRanking,
  productScatter,
  categoryOptions,
} from "@/lib/gross-margin-monitoring-mock-data"
import type { DashboardFilters } from "@/types/gross-margin-monitoring"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  category: "all",
}

const kpiIcons = [JapaneseYen, Package, Wallet, Percent, ArrowRightLeft] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>粗利率モニタリング</PageShellTitle>
          <PageShellDescription>
            粗利率の推移・カテゴリ別ランキング・商品別の粗利構造を一覧表示し、収益性を守る
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

        <MarginTrendChart data={marginTrend} />

        <CategoryMarginRanking data={categoryRanking} />

        <ProductMarginScatter data={productScatter} />
      </PageShellContent>
    </PageShell>
  )
}
