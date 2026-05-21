import { useState } from "react"
import { subDays } from "date-fns"
import { DollarSign, Users, Activity, ShoppingCart } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@/components/common/page-shell"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardPreset,
} from "@/components/common/dashboard-card"
import { Placeholder } from "@/components/common/placeholder"
import { Sparkline } from "@/components/data/sparkline"
import { TrendChart } from "@/components/ui-template-kpi-chart-simple/trend-chart"
import { TopItemsTable } from "@/components/ui-template-kpi-chart-simple/top-items-table"
import {
  headerKpis,
  trendSeries,
  topItems,
} from "@/lib/ui-template-kpi-chart-simple-mock-data"
import type { DashboardFilters } from "@/types/ui-template-kpi-chart-simple"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: subDays(today, 29),
    to: today,
  },
}

const kpiCards = [
  { label: "指標1", icon: DollarSign, kpi: headerKpis[0] },
  { label: "指標2", icon: Users, kpi: headerKpis[1] },
  { label: "指標3", icon: Activity, kpi: headerKpis[2] },
  { label: "指標4", icon: ShoppingCart, kpi: headerKpis[3] },
]

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>パフォーマンス概要</PageShellTitle>
          <PageShellDescription>
            選択期間の主要指標とトレンド。
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
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map(({ label, icon: Icon, kpi }) => (
            <DashboardCard key={kpi.id}>
              <DashboardCardHeader>
                <DashboardCardTitle className="text-muted-foreground">
                  {label}
                </DashboardCardTitle>
                <DashboardCardAction>
                  <Icon className="size-4 text-muted-foreground" />
                </DashboardCardAction>
              </DashboardCardHeader>
              <DashboardCardContent>
                <Placeholder className="text-2xl font-bold">
                  {kpi.value}
                </Placeholder>
                <div className="mt-2">
                  <Placeholder className="text-sm font-medium">
                    {kpi.change >= 0 ? `+${kpi.change}%` : `${kpi.change}%`}
                  </Placeholder>
                </div>
                <Sparkline
                  data={kpi.sparklineData.map((v) => ({ value: v }))}
                  height={32}
                  area
                  className="mt-3"
                />
              </DashboardCardContent>
            </DashboardCard>
          ))}
        </div>

        <DashboardCardPreset
          title="トレンド"
          description="選択期間の値"
        >
          <TrendChart data={trendSeries} />
        </DashboardCardPreset>

        <DashboardCardPreset title="上位項目" description="値で並べ替え">
          <TopItemsTable data={topItems} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
