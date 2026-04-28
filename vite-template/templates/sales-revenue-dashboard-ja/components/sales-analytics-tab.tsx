import { ShoppingCart, Receipt, TrendingUp } from "lucide-react"
import { KpiCard } from "./kpi-card"
import { GoalAchievementCard } from "./goal-achievement-card"
import { SalesTrendChart } from "./sales-trend-chart"
import { ConversionFunnelChart } from "./conversion-funnel-chart"
import { CategoryRankingTable } from "./category-ranking-table"
import {
  salesKpis,
  dailySalesTrend,
  categoryRanking,
  conversionFunnel,
  monthProgress,
  MONTHLY_REVENUE_TARGET,
} from "@/lib/sales-revenue-mock-data"

const kpiIcons = [ShoppingCart, Receipt, TrendingUp] as const

export function SalesAnalyticsTab() {
  const [gmvKpi, ...restKpis] = salesKpis

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GoalAchievementCard
          item={gmvKpi}
          progress={monthProgress}
          target={MONTHLY_REVENUE_TARGET}
        />
        {restKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesTrendChart data={dailySalesTrend} />
        </div>
        <div>
          <ConversionFunnelChart data={conversionFunnel} />
        </div>
      </div>

      <CategoryRankingTable data={categoryRanking} />
    </div>
  )
}
