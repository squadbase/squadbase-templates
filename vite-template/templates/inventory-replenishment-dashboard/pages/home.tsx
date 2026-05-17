import { useState } from "react"
import {
  Boxes,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Truck,
} from "lucide-react"
import { FilterBar, FilterBarSelect } from "@/components/data/filter-bar"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/inventory-replenishment-dashboard/insight-cards"
import { KpiCard } from "@/components/inventory-replenishment-dashboard/kpi-card"
import { StockDaysTable } from "@/components/inventory-replenishment-dashboard/stock-days-table"
import { ShortageRiskList } from "@/components/inventory-replenishment-dashboard/shortage-risk-list"
import { ReplenishmentRecommendation } from "@/components/inventory-replenishment-dashboard/replenishment-recommendation"
import { StockDaysDistributionChart } from "@/components/inventory-replenishment-dashboard/stock-days-distribution-chart"
import {
  headerKpis,
  skuStockItems,
  shortageRisks,
  replenishmentQueue,
  totalRecommendedSpend,
  stockDaysDistribution,
  categoryOptions,
  tierOptions,
} from "@/lib/inventory-replenishment-dashboard-mock-data"
import type { DashboardFilters } from "@/types/inventory-replenishment-dashboard"

const initialFilters: DashboardFilters = {
  category: "all",
  tier: "all",
}

const kpiIcons = [Boxes, AlertTriangle, DollarSign, ShoppingCart, Truck] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
    tier: filters.tier,
  }

  const filteredSkus = skuStockItems.filter((row) => {
    if (filters.category && filters.category !== "all" && row.category !== filters.category)
      return false
    if (filters.tier && filters.tier !== "all" && row.tier !== filters.tier)
      return false
    return true
  })

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Inventory &amp; Replenishment Dashboard</PageShellTitle>
          <PageShellDescription>
            Daily stock posture across SKUs with shortage risk flags and auto-replenishment recommendations
          </PageShellDescription>
        </PageShellHeading>
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
              tier: next.tier as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="category"
            label="Category"
            options={categoryOptions}
          />
          <FilterBarSelect
            filterKey="tier"
            label="Stock tier"
            options={tierOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <StockDaysTable data={filteredSkus} />

        <div className="grid gap-4 lg:grid-cols-2">
          <ShortageRiskList data={shortageRisks} />
          <StockDaysDistributionChart data={stockDaysDistribution} />
        </div>

        <ReplenishmentRecommendation
          data={replenishmentQueue}
          totalSpend={totalRecommendedSpend}
        />
      </PageShellContent>
    </PageShell>
  )
}
