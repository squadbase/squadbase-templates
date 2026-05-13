import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Target,
  Scale,
  PackageCheck,
  PackageX,
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
import { InsightCards } from "@/components/demand-forecast-vs-actual/insight-cards"
import { KpiCard } from "@/components/demand-forecast-vs-actual/kpi-card"
import { ForecastVsActualChart } from "@/components/demand-forecast-vs-actual/forecast-vs-actual-chart"
import { ErrorHeatmap } from "@/components/demand-forecast-vs-actual/error-heatmap"
import { MonthlyAccuracyChart } from "@/components/demand-forecast-vs-actual/monthly-accuracy-chart"
import { ProductAccuracyTable } from "@/components/demand-forecast-vs-actual/product-accuracy-table"
import {
  headerKpis,
  productForecasts,
  errorHeatmap,
  monthlyAccuracy,
  categoryOptions,
  productOptions,
} from "@/lib/demand-forecast-vs-actual-mock-data"
import type { DashboardFilters } from "@/types/demand-forecast-vs-actual"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 83)), to: endOfDay(today) },
  category: "all",
  product: "all",
}

const kpiIcons = [Target, Scale, PackageCheck, PackageX] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
    product: filters.product,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Demand Forecast vs Actual Monitor</PageShellTitle>
          <PageShellDescription>
            Weekly forecast accuracy, signed error patterns, and the service-level impact across SKUs
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
              product: next.product as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="category"
            label="Category"
            options={categoryOptions}
          />
          <FilterBarSelect
            filterKey="product"
            label="Product"
            options={productOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <ForecastVsActualChart data={productForecasts} />

        <ErrorHeatmap data={errorHeatmap} />

        <MonthlyAccuracyChart data={monthlyAccuracy} />

        <ProductAccuracyTable series={productForecasts} cells={errorHeatmap} />
      </PageShellContent>
    </PageShell>
  )
}
