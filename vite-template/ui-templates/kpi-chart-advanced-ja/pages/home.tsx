import { useMemo, useState } from "react"
import { subDays } from "date-fns"
import { DollarSign, Users, Activity, ShoppingCart, MousePointer } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
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
import { InsightCards } from "@/components/ui-template-kpi-chart-advanced/insight-cards"
import { HeroKpiCard } from "@/components/ui-template-kpi-chart-advanced/hero-kpi-card"
import { KpiCard } from "@/components/ui-template-kpi-chart-advanced/kpi-card"
import { ComparisonChart } from "@/components/ui-template-kpi-chart-advanced/comparison-chart"
import { BreakdownChart } from "@/components/ui-template-kpi-chart-advanced/breakdown-chart"
import { TrendChart } from "@/components/ui-template-kpi-chart-advanced/trend-chart"
import { CampaignTable } from "@/components/ui-template-kpi-chart-advanced/campaign-table"
import {
  headerKpis,
  trendSeries,
  comparisonSeries,
  breakdownSlices,
  campaignRows,
} from "@/lib/ui-template-kpi-chart-advanced-mock-data"
import type { DashboardFilters } from "@/types/ui-template-kpi-chart-advanced"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: subDays(today, 29),
    to: today,
  },
}

const smallKpiIcons = [Users, MousePointer, Activity, ShoppingCart] as const

function fmtYenShort(n: number): string {
  if (n >= 100_000_000) return `¥${(n / 100_000_000).toFixed(2)}億`
  if (n >= 10_000) return `¥${Math.round(n / 10_000).toLocaleString("ja-JP")}万`
  return `¥${Math.round(n).toLocaleString("ja-JP")}`
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const heroSubStats = useMemo(() => {
    const total = trendSeries.reduce((s, p) => s + p.value, 0)
    const avg = total / trendSeries.length
    const best = trendSeries.reduce((a, b) => (b.value > a.value ? b : a))
    return [
      { label: "最高日", value: fmtYenShort(best.value) },
      { label: "1日平均", value: fmtYenShort(avg) },
    ]
  }, [])

  const [heroKpi, ...smallKpis] = headerKpis

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[テンプレート] グロース分析</PageShellTitle>
          <PageShellDescription>
            主要KPI・前期比較・チャネル構成・日次トレンド・キャンペーン成果を一画面で確認
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
        <div className="grid gap-4 lg:grid-cols-3">
          <HeroKpiCard
            item={heroKpi}
            icon={DollarSign}
            subStats={heroSubStats}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {smallKpis.map((kpi, i) => (
              <KpiCard key={kpi.id} item={kpi} icon={smallKpiIcons[i]} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ComparisonChart data={comparisonSeries} />
          </div>
          <BreakdownChart data={breakdownSlices} />
        </div>

        <TrendChart data={trendSeries} />

        <CampaignTable data={campaignRows} />
      </PageShellContent>
    </PageShell>
  )
}
