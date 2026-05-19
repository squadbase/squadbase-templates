import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { PieChart, TrendingUp, Sparkles, DollarSign } from "lucide-react"
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
import { InsightCards } from "@/components/product-category-performance/insight-cards"
import { KpiCard } from "@/components/product-category-performance/kpi-card"
import { CategoryStackChart } from "@/components/product-category-performance/category-stack-chart"
import { NewVsExistingDecomp } from "@/components/product-category-performance/new-vs-existing-decomp"
import { CategoryMonthHeatmap } from "@/components/product-category-performance/category-month-heatmap"
import {
  headerKpis,
  categoryMonthly,
  newVsExisting,
  heatmap,
  categoryOptions,
} from "@/lib/product-category-performance-mock-data"
import type { DashboardFilters } from "@/types/product-category-performance"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  category: "all",
}

const kpiIcons = [PieChart, TrendingUp, Sparkles, DollarSign] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Product Category Performance</PageShellTitle>
          <PageShellDescription>
            How each category contributes, how new products lift growth, and where YoY swings concentrate
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
            label="Category"
            options={categoryOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <CategoryStackChart data={categoryMonthly} />

        <NewVsExistingDecomp data={newVsExisting} />

        <CategoryMonthHeatmap data={heatmap} />
      </PageShellContent>
    </PageShell>
  )
}
